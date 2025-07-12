import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, RefreshCw, Download, BookOpen, Brain, Target, MessageSquare } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, type User, type Document } from '@/services/api';
import ChatBox from '@/components/ChatBox';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Load user's documents when component mounts
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const userDocuments = await apiClient.getDocuments();
        setDocuments(userDocuments);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    };

    if (user) {
      loadDocuments();
    }
  }, [user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log('File selected:', file.name);
    }
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let document: Document;
      
      if (selectedFile) {
        // Upload file
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', selectedFile.name);
        document = await apiClient.uploadDocument(formData);
      } else if (noteText.trim()) {
        // Create text document
        const blob = new Blob([noteText], { type: 'text/plain' });
        const textFile = new File([blob], 'pasted-notes.txt', { type: 'text/plain' });
        const formData = new FormData();
        formData.append('file', textFile);
        formData.append('title', 'Pasted Notes');
        
        document = await apiClient.uploadDocument(formData);
      } else {
        setError('Please select a file or enter some text');
        return;
      }

      // Generate content from the document
      const summary = `AI summary for "${document.title}" will be generated shortly. The document has been successfully uploaded and is being processed.`;
      
      // For now, show some sample generated content
      // TODO: Implement actual AI generation endpoints
      setGeneratedContent({
        summary,
        document,
        flashcards: [
          { 
            id: 1,
            question: "Key concept from uploaded content", 
            answer: "AI-generated answer based on your notes" 
          }
        ],
        quiz: [
          {
            question: "What is the main topic discussed in your notes?",
            options: ["Topic A", "Topic B", "Topic C", "Topic D"],
            correct: 0
          }
        ]
      });

      // Refresh documents list
      const updatedDocuments = await apiClient.getDocuments();
      setDocuments(updatedDocuments);
      
      // Clear form
      setSelectedFile(null);
      setNoteText('');
      
    } catch (error: any) {
      console.error('Failed to generate content:', error);
      setError(error.message || 'Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user.first_name || user.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Upload your notes and chat with AI for a complete study experience</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
              {error}
            </div>
          )}

          {/* Recent Documents */}
          {documents.length > 0 && (
            <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
              <CardHeader>
                <CardTitle className="flex items-center dark:text-white">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Documents
                </CardTitle>
                <CardDescription className="dark:text-gray-300">
                  Your uploaded study materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#2C2C2C] rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{doc.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="dark:border-[#1A1A1A] dark:text-gray-300">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section */}
          <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Upload className="h-5 w-5 mr-2 text-purple-600" />
                Upload Notes
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Upload a PDF, TXT file, or paste your notes directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-purple-200 dark:border-purple-600/50 rounded-lg p-8 text-center hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                    {selectedFile ? selectedFile.name : 'Drop your files here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supports PDF and TXT files up to 10MB</p>
                </label>
              </div>

              <div className="text-center text-gray-500 dark:text-gray-400">or</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste your notes
                </label>
                <Textarea
                  placeholder="Paste your study notes here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[120px] dark:bg-[#2C2C2C] dark:border-[#1A1A1A] dark:text-white"
                />
              </div>

              <Button
                onClick={handleGenerateContent}
                disabled={!selectedFile && !noteText.trim() || isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating AI Content...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate AI Content
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {generatedContent && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary */}
              <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg dark:text-white">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{generatedContent.summary}</p>
                  <Button variant="outline" size="sm" className="dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Flashcards Preview */}
              <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg dark:text-white">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generated {generatedContent.flashcards.length} flashcards
                  </p>
                  <div className="space-y-2">
                    {generatedContent.flashcards.slice(0, 2).map((card: any, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{card.question}</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]"
                    onClick={() => navigate('/flashcards')}
                  >
                    View All Flashcards
                  </Button>
                </CardContent>
              </Card>

              {/* Quiz Preview */}
              <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg dark:text-white">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Generated {generatedContent.quiz.length} questions
                  </p>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-300">
                      {generatedContent.quiz[0].question}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]"
                    onClick={() => navigate('/quiz')}
                  >
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* AI Chat Section */}
          <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                AI Study Assistant
              </CardTitle>
              <CardDescription className="dark:text-gray-300">
                Chat with StudyMate AI powered by DeepSeek R1 for personalized study help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatBox />
            </CardContent>
          </Card>


        </div>
      </main>
    </div>
  );
};

export default Dashboard;
