
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Brain, Upload, FileText, Sparkles, ArrowRight, BookOpen, Target, Star } from 'lucide-react';

const Home = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleProcessNotes = () => {
    setIsProcessing(true);
    // TODO: Process notes with AI
    console.log('Processing notes:', { file: uploadedFile, text: noteText });
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-purple-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StudyMate AI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-purple-600">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Brain className="relative h-16 w-16 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Study Companion
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your study sessions with AI. Upload your notes and get instant summaries, 
            interactive flashcards, and personalized quizzes to ace your exams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Try It Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Link to="/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
            </Link>
          </div>
          
          {/* Feature Icons */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Smart Summaries</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Target className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flashcards</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Quizzes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Notes Section */}
      <section id="upload-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Your Notes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get started by uploading your study materials or pasting your notes directly
            </p>
          </div>

          <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-900 dark:text-white flex items-center justify-center">
                <Sparkles className="h-6 w-6 mr-2 text-purple-600" />
                Transform Your Notes with AI
              </CardTitle>
              <CardDescription className="text-center text-gray-600 dark:text-gray-400">
                Upload PDFs, text files, or paste your notes directly to get AI-powered study materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <Label className="text-lg font-medium text-gray-700 dark:text-gray-300">Upload File</Label>
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      PDF, TXT, DOC files (Max 10MB)
                    </p>
                  </label>
                </div>
                {uploadedFile && (
                  <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                    <FileText className="h-4 w-4" />
                    <span>Uploaded: {uploadedFile.name}</span>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div className="space-y-4">
                <Label htmlFor="note-text" className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Or Paste Your Notes
                </Label>
                <Textarea
                  id="note-text"
                  placeholder="Paste your notes here... The more detailed your notes, the better the AI can help you study!"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-[200px] bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                />
              </div>

              {/* Process Button */}
              <Button
                onClick={handleProcessNotes}
                disabled={!uploadedFile && !noteText.trim() || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Study Materials
                  </>
                )}
              </Button>

              {/* Sign up CTA */}
              <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Want to save your progress and unlock unlimited features?
                </p>
                <Link to="/register">
                  <Button variant="outline" className="border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                    <Star className="h-4 w-4 mr-2" />
                    Create Free Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
