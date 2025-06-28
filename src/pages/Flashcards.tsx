import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Check, Brain } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { apiClient, type Flashcard, type FlashcardSet, type User } from '@/services/api';

const Flashcards = () => {
  const [user, setUser] = useState<User | null>(null);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check authentication and load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/login');
          return;
        }

        const userData = JSON.parse(storedUser);
        setUser(userData);

        // Load flashcard sets
        const sets = await apiClient.getFlashcardSets();
        setFlashcardSets(sets);

        if (sets.length > 0) {
          // Load first set by default
          setCurrentSet(sets[0]);
          const cards = await apiClient.getFlashcards(sets[0].id);
          setFlashcards(cards.map(card => ({ ...card, learned: false })));
        } else {
          // Create sample flashcards if none exist
          setFlashcards([
            {
              id: 1,
              question: "Welcome to StudyMate AI!",
              answer: "Upload your notes to automatically generate flashcards for your studies.",
              difficulty_level: "easy",
              learned: false,
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              question: "How do I create flashcards?",
              answer: "Go to the Dashboard, upload your study materials, and our AI will generate flashcards automatically.",
              difficulty_level: "easy",
              learned: false,
              created_at: new Date().toISOString()
            }
          ]);
        }

      } catch (error) {
        console.error('Failed to load flashcards:', error);
        setError('Failed to load flashcards. Please try again.');
        // If token is invalid, redirect to login
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const currentCard = flashcards[currentIndex];

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsLearned = () => {
    setFlashcards(cards => 
      cards.map(card => 
        card.id === currentCard.id 
          ? { ...card, learned: !card.learned }
          : card
      )
    );
  };

  const resetProgress = () => {
    setFlashcards(cards => 
      cards.map(card => ({ ...card, learned: false }))
    );
  };

  const switchSet = async (set: FlashcardSet) => {
    try {
      setIsLoading(true);
      setCurrentSet(set);
      const cards = await apiClient.getFlashcards(set.id);
      setFlashcards(cards.map(card => ({ ...card, learned: false })));
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to load flashcard set:', error);
      setError('Failed to load flashcard set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const learnedCount = flashcards.filter(card => card.learned).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#000000] flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-12 w-12 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-300">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Flashcards</h1>
            <p className="text-gray-600 dark:text-gray-300">Study with AI-generated flashcards</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Flashcard Set Selector */}
          {flashcardSets.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Select Flashcard Set</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {flashcardSets.map((set) => (
                  <Card 
                    key={set.id} 
                    className={`cursor-pointer transition-all border-0 shadow-lg hover:shadow-xl dark:bg-[#1F1F1F] dark:border-[#1A1A1A] ${
                      currentSet?.id === set.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => switchSet(set)}
                  >
                    <CardContent className="p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{set.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{set.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-500">
                        <span>{set.card_count} cards</span>
                        <span className={`px-2 py-1 rounded ${
                          set.difficulty_level === 'easy' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                          set.difficulty_level === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                          'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        }`}>
                          {set.difficulty_level}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {flashcards.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No flashcards available</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Upload your notes in the Dashboard to generate flashcards automatically.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress: {learnedCount} / {flashcards.length} learned
                  </span>
                  <Button variant="outline" size="sm" onClick={resetProgress} className="dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Progress
                  </Button>
                </div>
                <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${flashcards.length > 0 ? (learnedCount / flashcards.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Flashcard */}
              <div className="mb-8">
                <div className="relative h-80 mx-auto max-w-lg">
                  <div 
                    className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={flipCard}
                  >
                    {/* Front of card */}
                    <Card className={`absolute inset-0 w-full h-full backface-hidden border-0 shadow-xl dark:bg-[#1F1F1F] dark:border-[#1A1A1A] ${
                      currentCard.learned ? 'ring-2 ring-green-400' : ''
                    }`}>
                      <CardContent className="flex items-center justify-center h-full p-8">
                        <div className="text-center">
                          <div className="text-sm text-purple-600 font-medium mb-4">QUESTION</div>
                          <p className="text-xl font-medium text-gray-900 dark:text-white leading-relaxed">
                            {currentCard.question}
                          </p>
                          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            Click to reveal answer
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Back of card */}
                    <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:bg-[#1F1F1F] dark:border-[#1A1A1A] ${
                      currentCard.learned ? 'ring-2 ring-green-400' : ''
                    }`}>
                      <CardContent className="flex items-center justify-center h-full p-8">
                        <div className="text-center">
                          <div className="text-sm text-blue-600 font-medium mb-4">ANSWER</div>
                          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                            {currentCard.answer}
                          </p>
                          <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                            Click to see question
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <Button variant="outline" onClick={prevCard} className="dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
                  {currentIndex + 1} of {flashcards.length}
                </span>
                
                <Button variant="outline" onClick={nextCard} className="dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]">
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Mark as Learned */}
              <div className="text-center">
                <Button
                  onClick={markAsLearned}
                  variant={currentCard.learned ? "default" : "outline"}
                  className={currentCard.learned ? "bg-green-600 hover:bg-green-700" : "border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 dark:border-green-500 dark:text-green-400"}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {currentCard.learned ? "Learned!" : "Mark as Learned"}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Flashcards;
