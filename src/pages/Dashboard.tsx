
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, RefreshCw, Download, BookOpen, Brain, Target } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const Dashboard = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Here you would typically read the file content
      console.log('File selected:', file.name);
    }
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedContent({
        summary: "This is a sample AI-generated summary of your notes. The key concepts include data structures, algorithms, and time complexity analysis.",
        flashcards: [
          { question: "What is Big O notation?", answer: "A mathematical notation used to describe the computational complexity of algorithms." },
          { question: "What is a binary tree?", answer: "A tree data structure where each node has at most two children." }
        ],
        quiz: [
          {
            question: "Which sorting algorithm has the best average-case time complexity?",
            options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
            correct: 1
          }
        ]
      });
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Upload your notes and let AI transform your study experience</p>
          </div>

          {/* Upload Section */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2 text-purple-600" />
                Upload Notes
              </CardTitle>
              <CardDescription>
                Upload a PDF, TXT file, or paste your notes directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:border-purple-300 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {selectedFile ? selectedFile.name : 'Drop your files here or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">Supports PDF and TXT files up to 10MB</p>
                </label>
              </div>

              <div className="text-center text-gray-500">or</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your notes
                </label>
                <Textarea
                  placeholder="Paste your study notes here..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[120px]"
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{generatedContent.summary}</p>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </CardContent>
              </Card>

              {/* Flashcards Preview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Target className="h-5 w-5 mr-2 text-blue-600" />
                    Flashcards
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Generated {generatedContent.flashcards.length} flashcards
                  </p>
                  <div className="space-y-2">
                    {generatedContent.flashcards.slice(0, 2).map((card: any, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{card.question}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    View All Flashcards
                  </Button>
                </CardContent>
              </Card>

              {/* Quiz Preview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Brain className="h-5 w-5 mr-2 text-purple-600" />
                    Quiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Generated {generatedContent.quiz.length} questions
                  </p>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">
                      {generatedContent.quiz[0].question}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4">
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
