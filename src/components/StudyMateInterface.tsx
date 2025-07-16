import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import jsPDF from 'jspdf';
import { 
  Upload, 
  FileText, 
  RefreshCw, 
  BookOpen, 
  Target, 
  Brain,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Download,
  Send,
  User,
  Bot,
  MessageCircle,
  BookmarkPlus,
  Lightbulb,
  HelpCircle,
  Calculator,
  List,
  Layers
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { openRouterService, type StudySummary, type FlashcardData, type QuizQuestion } from '@/services/openrouter';

interface StudyMateInterfaceProps {
  onFlashcardsGenerated?: (flashcards: FlashcardData[]) => void;
  onQuizGenerated?: (quiz: QuizQuestion[]) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'document_analysis' | 'summary';
  studySummary?: StudySummary;
  attachedFile?: File;
}

const StudyMateInterface: React.FC<StudyMateInterfaceProps> = ({ 
  onFlashcardsGenerated,
  onQuizGenerated 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your StudyMate AI. You can upload documents (PDF, images, etc.) for analysis, or just chat with me about your studies. I\'ll help you understand complex topics and create study materials.',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [error, setError] = useState('');
  const [currentStudySummary, setCurrentStudySummary] = useState<StudySummary | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, JPG, PNG, or GIF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() && !selectedFile) return;
    if (isAnalyzing) return;

    setError('');
    setIsAnalyzing(true);

    try {
      if (selectedFile) {
        await handleDocumentAnalysis();
      } else {
        await handleChatMessage();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to process your request');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleChatMessage = async () => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await openRouterService.generateStudyPrompt(userMessage.content);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleDocumentAnalysis = async () => {
    if (!selectedFile) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim() || `Please analyze this document: ${selectedFile.name}`,
      timestamp: new Date(),
      type: 'text',
      attachedFile: selectedFile
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      // Upload to backend
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', selectedFile.name);
      await apiClient.uploadDocument(formData);

      // Analyze document
      const summary = await openRouterService.analyzeDocument(selectedFile);
      setCurrentStudySummary(summary);
      
      // Create formatted response
      const analysisResponse = formatStudySummaryForChat(summary);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: analysisResponse,
        timestamp: new Date(),
        type: 'document_analysis',
        studySummary: summary
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear file selection
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err: any) {
      console.error('Document analysis error:', err);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'I encountered an error while analyzing your document. Please try again or contact support if the issue persists.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatStudySummaryForChat = (summary: StudySummary): string => {
    let response = `# 📄 ${summary.title}\n\n`;
    response += `**Overview:** ${summary.overview}\n\n`;
    
    response += `## 📚 Main Sections\n`;
    summary.main_sections.forEach((section, index) => {
      response += `\n### ${index + 1}. ${section.heading}\n`;
      section.bullet_points.forEach(point => {
        response += `• ${point}\n`;
      });
      
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach(sub => {
          response += `\n**${sub.subheading}:**\n`;
          sub.points.forEach(point => {
            response += `  ◦ ${point}\n`;
          });
        });
      }
      
      if (section.key_concepts.length > 0) {
        response += `\n**Key Concepts:** ${section.key_concepts.join(', ')}\n`;
      }
    });

    if (summary.definitions && summary.definitions.length > 0) {
      response += `\n## 📖 Key Definitions\n`;
      summary.definitions.forEach(def => {
        response += `• **${def.term}**: ${def.definition}\n`;
      });
    }

    if (summary.important_formulas && summary.important_formulas.length > 0) {
      response += `\n## 🧮 Important Formulas\n`;
      summary.important_formulas.forEach(formula => {
        response += `• ${formula}\n`;
      });
    }

    response += `\n## 🎯 Key Takeaways\n`;
    summary.key_takeaways.forEach(takeaway => {
      response += `• ${takeaway}\n`;
    });

    if (summary.memory_aids && summary.memory_aids.length > 0) {
      response += `\n## 💡 Memory Aids\n`;
      summary.memory_aids.forEach(aid => {
        response += `• ${aid}\n`;
      });
    }

    if (summary.practice_questions && summary.practice_questions.length > 0) {
      response += `\n## ❓ Practice Questions\n`;
      summary.practice_questions.forEach((question, index) => {
        response += `${index + 1}. ${question}\n`;
      });
    }

    response += `\n## 📝 Study Tips\n`;
    summary.study_tips.forEach(tip => {
      response += `• ${tip}\n`;
    });

    response += `\n---\n`;
    response += `**Difficulty Level:** ${summary.difficulty_level} | **Study Time:** ${summary.estimated_study_time}\n`;
    response += `**Related Topics:** ${summary.related_topics.join(', ')}\n\n`;
    response += `Feel free to ask me any questions about this content or request flashcards and quizzes!`;

    return response;
  };

  const handleGenerateFlashcards = async () => {
    if (!currentStudySummary) {
      setError('Please analyze a document first');
      return;
    }

    setIsGeneratingFlashcards(true);
    setError('');

    try {
      const documentContent = formatStudySummaryForGeneration(currentStudySummary);
      const flashcards = await openRouterService.generateFlashcards(documentContent, 15);
      
      if (onFlashcardsGenerated) {
        onFlashcardsGenerated(flashcards);
      }
      
      const flashcardMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ I've generated ${flashcards.length} flashcards for you! They're now available in the Flashcards section. The flashcards cover key concepts with a mix of difficulty levels to help you study effectively.`,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, flashcardMessage]);
      
    } catch (error: any) {
      console.error('Failed to generate flashcards:', error);
      setError(error.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!currentStudySummary) {
      setError('Please analyze a document first');
      return;
    }

    setIsGeneratingQuiz(true);
    setError('');

    try {
      const documentContent = formatStudySummaryForGeneration(currentStudySummary);
      const quiz = await openRouterService.generateQuiz(documentContent, 10);
      
      if (onQuizGenerated) {
        onQuizGenerated(quiz);
      }
      
      const quizMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ I've generated ${quiz.length} quiz questions for you! They're now available in the Quiz section. The questions test different levels of understanding to help assess your knowledge.`,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, quizMessage]);
      
    } catch (error: any) {
      console.error('Failed to generate quiz:', error);
      setError(error.message || 'Failed to generate quiz. Please try again.');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const formatStudySummaryForGeneration = (summary: StudySummary): string => {
    return `
Title: ${summary.title}
Overview: ${summary.overview}

Main Sections:
${summary.main_sections.map(section => `
${section.heading}:
- ${section.bullet_points.join('\n- ')}
Key Concepts: ${section.key_concepts.join(', ')}
${section.subsections ? section.subsections.map(sub => `
  ${sub.subheading}:
  - ${sub.points.join('\n  - ')}
`).join('') : ''}
`).join('\n')}

Key Takeaways:
- ${summary.key_takeaways.join('\n- ')}

${summary.definitions ? `
Definitions:
${summary.definitions.map(def => `${def.term}: ${def.definition}`).join('\n')}
` : ''}

${summary.important_formulas ? `
Important Formulas:
- ${summary.important_formulas.join('\n- ')}
` : ''}
    `.trim();
  };

  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = doc.internal.pageSize.width - 2 * margin;

    // Title
    doc.setFontSize(18);
    doc.text('StudyMate AI Chat Session', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 20;

    // Process each message
    messages.forEach((message, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Message header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      const role = message.role === 'user' ? 'You' : 'StudyMate AI';
      const timestamp = message.timestamp.toLocaleString();
      doc.text(`${role} - ${timestamp}`, margin, yPosition);
      yPosition += 8;

      // File attachment indicator
      if (message.attachedFile) {
        doc.setFont(undefined, 'italic');
        doc.text(`📎 Attached: ${message.attachedFile.name}`, margin, yPosition);
        yPosition += 8;
      }

      // Message content
      doc.setFont(undefined, 'normal');
      const lines = doc.splitTextToSize(message.content, maxWidth);
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      yPosition += 10; // Space between messages

      // Add separator line
      if (index < messages.length - 1) {
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, maxWidth + margin, yPosition);
        yPosition += 10;
      }
    });

    // Save the PDF
    doc.save(`StudyMate_Chat_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Chat Interface */}
      <Card className="border-0 shadow-lg dark:bg-[#1F1F1F] dark:border-[#1A1A1A]">
        <CardHeader>
          <CardTitle className="flex items-center justify-between dark:text-white">
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-purple-600" />
              StudyMate AI Chat
            </div>
            <Button
              onClick={downloadChatAsPDF}
              variant="outline"
              size="sm"
              className="text-gray-600 dark:text-gray-300"
            >
              <Download className="h-4 w-4 mr-1" />
              Download Chat
            </Button>
          </CardTitle>
          <CardDescription className="dark:text-gray-300">
            Chat with AI, upload documents for analysis, and get interactive study help
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Messages */}
          {error && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600 dark:text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Messages */}
          <ScrollArea className="h-[400px] w-full border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-purple-500 text-white'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-[#2C2C2C] text-gray-900 dark:text-gray-100'
                    }`}>
                      {message.attachedFile && (
                        <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
                          <FileText className="h-4 w-4" />
                          <span>{message.attachedFile.name}</span>
                        </div>
                      )}
                      
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      <div className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isAnalyzing && (
                <div className="flex gap-3 justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-purple-500 text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg p-3 bg-gray-100 dark:bg-[#2C2C2C]">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Analyzing...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleSubmitMessage} className="space-y-3">
            {/* File Upload */}
            {selectedFile && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-300">{selectedFile.name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {selectedFile.type} • {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="text-blue-600 dark:text-blue-400"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={selectedFile ? "Add a message about your document..." : "Ask me anything or upload a document..."}
                  className="pr-12 dark:bg-[#2C2C2C] dark:border-[#1A1A1A]"
                  disabled={isAnalyzing}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  disabled={isAnalyzing}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={isAnalyzing || (!inputMessage.trim() && !selectedFile)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isAnalyzing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>

          {/* Action Buttons */}
          {currentStudySummary && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGeneratingFlashcards ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isGeneratingQuiz ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Quiz
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyMateInterface; 