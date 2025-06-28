
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy, RotateCcw } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';

const sampleQuiz = [
  {
    id: 1,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort O(n²)", "Quick Sort O(n log n)", "Insertion Sort O(n²)", "Selection Sort O(n²)"],
    correct: 1,
    explanation: "Quick Sort has an average-case time complexity of O(n log n), making it more efficient than the other options for large datasets."
  },
  {
    id: 2,
    question: "What data structure uses LIFO (Last In, First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correct: 1,
    explanation: "A Stack follows the LIFO principle where the last element added is the first one to be removed."
  },
  {
    id: 3,
    question: "What is the space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    correct: 2,
    explanation: "Merge sort requires O(n) additional space to store the temporary arrays during the merge process."
  }
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      const newAnswers = [...selectedAnswers];
      newAnswers[currentQuestion] = selectedOption;
      setSelectedAnswers(newAnswers);

      if (currentQuestion < sampleQuiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
      } else {
        setShowResults(true);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(selectedAnswers[currentQuestion - 1] || null);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setSelectedOption(null);
  };

  const score = selectedAnswers.reduce((acc, answer, index) => {
    return acc + (answer === sampleQuiz[index].correct ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / sampleQuiz.length) * 100);

  if (showResults) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000]">
        <Sidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz Complete!</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                You scored {score} out of {sampleQuiz.length} ({percentage}%)
              </p>
            </div>

            <div className="grid gap-6 mb-8">
              {sampleQuiz.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct;
                
                return (
                  <Card key={question.id} className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg dark:text-white">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                        )}
                        Question {index + 1}
                      </CardTitle>
                      <CardDescription className="dark:text-gray-300">{question.question}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-3 rounded-lg border ${
                              optionIndex === question.correct
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-300'
                                : optionIndex === userAnswer && !isCorrect
                                ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-800 dark:text-red-300'
                                : 'bg-gray-50 dark:bg-[#2C2C2C] border-gray-200 dark:border-[#1A1A1A] text-gray-900 dark:text-white'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correct && (
                              <span className="ml-2 text-green-600 dark:text-green-300 font-medium">✓ Correct</span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-600 dark:text-red-300 font-medium">✗ Your answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Explanation:</strong> {question.explanation}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center">
              <Button onClick={restartQuiz} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQ = sampleQuiz[currentQuestion];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#000000]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quiz</h1>
            <p className="text-gray-600 dark:text-gray-300">Test your knowledge with AI-generated questions</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Question {currentQuestion + 1} of {sampleQuiz.length}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(((currentQuestion + 1) / sampleQuiz.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 dark:bg-purple-500"
                style={{ width: `${((currentQuestion + 1) / sampleQuiz.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <Card className="border-0 shadow-lg mb-8 dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
            <CardHeader>
              <CardTitle className="text-xl dark:text-white">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-300'
                        : 'border-gray-200 dark:border-[#1A1A1A] bg-white dark:bg-[#2C2C2C] hover:border-purple-200 dark:hover:border-purple-600 hover:bg-purple-25 dark:hover:bg-purple-900/20 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 mr-3 flex-shrink-0 ${
                        selectedOption === index
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedOption === index && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
              className="dark:border-[#1A1A1A] dark:text-gray-300 dark:hover:bg-[#2C2C2C]"
            >
              Previous
            </Button>
            
            <Button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {currentQuestion === sampleQuiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Quiz;
