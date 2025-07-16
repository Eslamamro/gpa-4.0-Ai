interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  model?: string;
}

interface StudySummary {
  title: string;
  overview: string;
  main_sections: Array<{
    heading: string;
    bullet_points: string[];
    key_concepts: string[];
    subsections?: Array<{
      subheading: string;
      points: string[];
    }>;
  }>;
  key_takeaways: string[];
  study_tips: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_study_time: string;
  related_topics: string[];
  important_formulas?: string[];
  definitions?: Array<{
    term: string;
    definition: string;
  }>;
  practice_questions?: string[];
  memory_aids?: string[];
}

interface FlashcardData {
  question: string;
  answer: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  category: string;
  tags?: string[];
}

interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correct_answer: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  explanation: string;
  category?: string;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private chatModel = 'deepseek/deepseek-r1:free';
  private documentModel = 'openai/gpt-4o'; // Better for document analysis with vision
  private autoModel = 'openrouter/auto'; // Auto-routing for optimal results
  private analysisModel = 'anthropic/claude-3.5-sonnet'; // Excellent for structured analysis

  constructor() {
    // Use environment variable if available, otherwise use provided API key
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }
  }

  private async makeRequest(payload: any): Promise<OpenRouterResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StudyMate AI - Advanced Study Companion'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const data = await this.makeRequest({
        model: this.chatModel,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      });
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async analyzeDocument(file: File): Promise<StudySummary> {
    try {
      // Convert file to base64 for API
      const base64 = await this.fileToBase64(file);
      const mimeType = file.type;
      const isPDF = file.type === 'application/pdf';

      // Enhanced structured output schema for comprehensive study analysis
      const schema = {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "A clear, descriptive title for the document content"
          },
          overview: {
            type: "string",
            description: "A comprehensive overview of the document's main purpose, scope, and key themes"
          },
          main_sections: {
            type: "array",
            description: "Detailed breakdown of main sections with comprehensive information",
            items: {
              type: "object",
              properties: {
                heading: {
                  type: "string",
                  description: "Clear, descriptive section heading"
                },
                bullet_points: {
                  type: "array",
                  description: "Detailed key points in this section (aim for 5-8 points)",
                  items: { type: "string" }
                },
                key_concepts: {
                  type: "array",
                  description: "Important concepts, terms, or principles from this section",
                  items: { type: "string" }
                },
                subsections: {
                  type: "array",
                  description: "Optional subsections for complex topics",
                  items: {
                    type: "object",
                    properties: {
                      subheading: { type: "string" },
                      points: {
                        type: "array",
                        items: { type: "string" }
                      }
                    },
                    required: ["subheading", "points"]
                  }
                }
              },
              required: ["heading", "bullet_points", "key_concepts"],
              additionalProperties: false
            }
          },
          key_takeaways: {
            type: "array",
            description: "5-10 most important points to remember from the entire document",
            items: { type: "string" }
          },
          study_tips: {
            type: "array",
            description: "Specific, actionable study recommendations for this material",
            items: { type: "string" }
          },
          difficulty_level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "Overall difficulty level of the content"
          },
          estimated_study_time: {
            type: "string",
            description: "Realistic time estimate for studying this material (e.g., '2-3 hours', '45 minutes')"
          },
          related_topics: {
            type: "array",
            description: "Topics related to this content that students should also study",
            items: { type: "string" }
          },
          important_formulas: {
            type: "array",
            description: "Key formulas, equations, or mathematical expressions (if applicable)",
            items: { type: "string" }
          },
          definitions: {
            type: "array",
            description: "Important terms and their definitions",
            items: {
              type: "object",
              properties: {
                term: { type: "string" },
                definition: { type: "string" }
              },
              required: ["term", "definition"]
            }
          },
          practice_questions: {
            type: "array",
            description: "Sample questions students should be able to answer after studying",
            items: { type: "string" }
          },
          memory_aids: {
            type: "array",
            description: "Mnemonics, acronyms, or memory techniques for key information",
            items: { type: "string" }
          }
        },
        required: ["title", "overview", "main_sections", "key_takeaways", "study_tips", "difficulty_level", "estimated_study_time", "related_topics"],
        additionalProperties: false
      };

      // Create specialized prompt for PDF analysis
      const pdfAnalysisPrompt = `Please analyze this ${isPDF ? 'PDF document' : 'document'} and create a comprehensive study summary. ${isPDF ? 'Focus on extracting the hierarchical structure, headings, and content organization from the PDF.' : ''} I need you to:

1. **Extract Document Structure**: 
   - Identify main headings and chapter titles
   - Recognize subheadings and section divisions
   - Understand the document's organizational hierarchy

2. **Create Detailed Bullet Points**: 
   - Extract 5-8 key points per section
   - Convert paragraphs into concise bullet points
   - Maintain logical flow and connections between points

3. **Identify Key Information**:
   - Extract important concepts and terminology
   - Identify formulas, equations, or procedures
   - Note definitions and explanations
   - Recognize examples and case studies

4. **Enhance Learning**:
   - Suggest memory aids and mnemonics
   - Create practice questions
   - Provide study strategies specific to this content

${isPDF ? 'Pay special attention to:' : 'Focus on:'}
- Document headings and chapter structure
- Bullet points and numbered lists
- Key concepts and definitions
- Important formulas or procedures
- Visual elements (diagrams, charts, tables)
- Summary sections and conclusions

Make this material as digestible and study-friendly as possible. Use clear, concise language and organize information hierarchically for effective learning.`;

      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: pdfAnalysisPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ];

      // Use model routing for optimal results
      const data = await this.makeRequest({
        models: [this.documentModel, this.analysisModel, this.autoModel], // Prioritize GPT-4o for PDF/image analysis
        messages: messages,
        temperature: 0.15, // Even lower temperature for more consistent extraction
        max_tokens: 4000, // Increased for comprehensive analysis
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "comprehensive_study_summary",
            strict: true,
            schema: schema
          }
        }
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      const result = JSON.parse(data.choices[0].message.content);
      
      // Post-process to ensure quality bullet points
      if (result.main_sections) {
        result.main_sections = result.main_sections.map((section: any) => ({
          ...section,
          bullet_points: section.bullet_points.map((point: string) => 
            point.startsWith('• ') ? point.substring(2) : point
          ).filter((point: string) => point.trim().length > 0)
        }));
      }

      return result;
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  }

  async generateFlashcards(documentContent: string, count: number = 15): Promise<FlashcardData[]> {
    try {
      const schema = {
        type: "object",
        properties: {
          flashcards: {
            type: "array",
            description: "Generated flashcards for studying with variety and depth",
            items: {
              type: "object",
              properties: {
                question: {
                  type: "string",
                  description: "Clear, specific question or prompt for the flashcard"
                },
                answer: {
                  type: "string",
                  description: "Complete, accurate answer with explanation when needed"
                },
                difficulty_level: {
                  type: "string",
                  enum: ["easy", "medium", "hard"],
                  description: "Difficulty level of this flashcard"
                },
                category: {
                  type: "string",
                  description: "Subject category or topic area"
                },
                tags: {
                  type: "array",
                  description: "Optional tags for organization",
                  items: { type: "string" }
                }
              },
              required: ["question", "answer", "difficulty_level", "category"],
              additionalProperties: false
            }
          }
        },
        required: ["flashcards"],
        additionalProperties: false
      };

      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: `Based on the following document content, generate ${count} high-quality flashcards for studying. Create a strategic mix that covers:

1. **Basic recall** (30% - definitions, facts)
2. **Comprehension** (40% - understanding concepts)
3. **Application** (30% - applying knowledge)

Requirements:
- Clear, specific questions that test understanding
- Complete, accurate answers with context when needed
- Good distribution across difficulty levels
- Variety in question types (What is...?, How does...?, Why...?, When...?)
- Focus on the most important concepts

Document content:
${documentContent}

Make each flashcard educational and effective for spaced repetition learning.`
        }
      ];

      const data = await this.makeRequest({
        models: [this.autoModel, this.analysisModel], // Use auto-routing with fallback
        messages: messages,
        temperature: 0.4,
        max_tokens: 2000,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "study_flashcards",
            strict: true,
            schema: schema
          }
        }
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      const result = JSON.parse(data.choices[0].message.content);
      return result.flashcards;
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw error;
    }
  }

  async generateQuiz(documentContent: string, count: number = 10): Promise<QuizQuestion[]> {
    try {
      const schema = {
        type: "object",
        properties: {
          quiz_questions: {
            type: "array",
            description: "Generated quiz questions with strategic variety",
            items: {
              type: "object",
              properties: {
                question: {
                  type: "string",
                  description: "Clear, well-constructed quiz question"
                },
                options: {
                  type: "array",
                  description: "Four plausible answer options",
                  items: { type: "string" },
                  minItems: 4,
                  maxItems: 4
                },
                correct_answer: {
                  type: "number",
                  description: "Index of the correct answer (0-3)",
                  minimum: 0,
                  maximum: 3
                },
                difficulty_level: {
                  type: "string",
                  enum: ["easy", "medium", "hard"],
                  description: "Difficulty level of this question"
                },
                explanation: {
                  type: "string",
                  description: "Clear explanation of why the correct answer is right and why others are wrong"
                },
                category: {
                  type: "string",
                  description: "Topic category for this question"
                }
              },
              required: ["question", "options", "correct_answer", "difficulty_level", "explanation"],
              additionalProperties: false
            }
          }
        },
        required: ["quiz_questions"],
        additionalProperties: false
      };

      const messages: ChatMessage[] = [
        {
          role: 'user',
          content: `Based on the following document content, generate ${count} high-quality multiple-choice quiz questions. Create questions that:

1. **Test different levels of understanding**:
   - Knowledge recall (25%)
   - Comprehension (40%)
   - Application/Analysis (35%)

2. **Have strategic difficulty distribution**:
   - Easy: 30% (basic facts, definitions)
   - Medium: 50% (understanding, connections)
   - Hard: 20% (application, analysis)

3. **Include plausible distractors** (wrong answers that seem reasonable)
4. **Provide comprehensive explanations** for learning

Document content:
${documentContent}

Focus on the most important concepts and ensure each question is educational and fair.`
        }
      ];

      const data = await this.makeRequest({
        models: [this.autoModel, this.analysisModel],
        messages: messages,
        temperature: 0.3,
        max_tokens: 2500,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "comprehensive_quiz",
            strict: true,
            schema: schema
          }
        }
      });

      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      const result = JSON.parse(data.choices[0].message.content);
      return result.quiz_questions;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw error;
    }
  }

  async generateStudyPrompt(userMessage: string): Promise<string> {
    const systemPrompt = `You are StudyMate AI, an advanced study companion designed to help students learn effectively. Your expertise includes:

1. **Learning Science**: Understanding how memory, retention, and comprehension work
2. **Study Strategies**: Recommending effective techniques like spaced repetition, active recall, and interleaving
3. **Subject Matter**: Providing clear explanations across various academic disciplines
4. **Personalization**: Adapting to different learning styles and difficulty levels
5. **Motivation**: Encouraging students and helping them overcome study challenges

Always provide:
- Clear, actionable advice
- Evidence-based study techniques
- Encouraging, supportive tone
- Structured information with bullet points when helpful
- Specific examples when possible

Keep responses concise but comprehensive, focusing on practical help.`;

    const messages: ChatMessage[] = [
      { role: 'user', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return await this.sendMessage(messages);
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix
        const base64 = base64String.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const openRouterService = new OpenRouterService();
export type { ChatMessage, StudySummary, FlashcardData, QuizQuestion }; 