
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, BookOpen, Target, FileText } from 'lucide-react';
import Threads from '@/components/Threads';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';
import { NavbarDemo } from '@/components/NavbarDemo';

const Home = () => {
  const words = [
    {
      text: "Your",
    },
    {
      text: "AI-Powered",
    },
    {
      text: "Study",
      className: "text-purple-600 dark:text-purple-400",
    },
    {
      text: "Companion",
      className: "bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:bg-[#000000] dark:from-[#000000] dark:via-[#000000] dark:to-[#000000]">
      {/* Navigation */}
      <NavbarDemo />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-transparent dark:bg-[#000000]">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <Brain className="relative h-16 w-16 text-purple-600" />
            </div>
          </div>
          
          <TypewriterEffectSmooth 
            words={words} 
            className="text-4xl md:text-6xl mb-6"
            cursorClassName="bg-purple-600"
          />
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your study sessions with AI. Upload your notes and get instant summaries, 
            interactive flashcards, and personalized quizzes to ace your exams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                Try It Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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

      {/* Threads Background - Bottom of Page */}
      <div style={{ width: '100%', height: '500px', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1 }}>
        <Threads
          color={[0.5, 0.3, 0.8]}
          darkColor={[0.75, 0.52, 0.99]}
          amplitude={2}
          distance={0.3}
          enableMouseInteraction={true}
        />
      </div>
    </div>
  );
};

export default Home;
