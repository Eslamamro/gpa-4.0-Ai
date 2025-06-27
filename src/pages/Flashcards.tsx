
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Check } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const sampleFlashcards = [
  {
    id: 1,
    question: "What is the time complexity of binary search?",
    answer: "O(log n) - Binary search eliminates half of the remaining elements with each comparison.",
    learned: false
  },
  {
    id: 2,
    question: "What is a hash table?",
    answer: "A data structure that implements an associative array using a hash function to compute an index.",
    learned: false
  },
  {
    id: 3,
    question: "What is the difference between a stack and a queue?",
    answer: "Stack follows LIFO (Last In, First Out) principle, while Queue follows FIFO (First In, First Out) principle.",
    learned: true
  }
];

const Flashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState(sampleFlashcards);

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

  const learnedCount = flashcards.filter(card => card.learned).length;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Flashcards</h1>
            <p className="text-gray-600 dark:text-gray-400">Study with AI-generated flashcards</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progress: {learnedCount} / {flashcards.length} learned
              </span>
              <Button variant="outline" size="sm" onClick={resetProgress} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </Button>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(learnedCount / flashcards.length) * 100}%` }}
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
                <Card className={`absolute inset-0 w-full h-full backface-hidden border-0 shadow-xl dark:bg-gray-800 ${
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
                <Card className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:bg-gray-800 ${
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
            <Button variant="outline" onClick={prevCard} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
              {currentIndex + 1} of {flashcards.length}
            </span>
            
            <Button variant="outline" onClick={nextCard} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
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
        </div>
      </main>
    </div>
  );
};

export default Flashcards;
