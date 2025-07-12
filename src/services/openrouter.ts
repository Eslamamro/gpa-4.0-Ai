interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private model = 'deepseek/deepseek-r1:free';

  constructor() {
    // Use environment variable if available, otherwise use provided API key
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured');
    }
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'StudyMate AI - Study Companion'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from AI model');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  async generateStudyPrompt(userMessage: string): Promise<string> {
    const systemPrompt = `You are StudyMate AI, an intelligent study companion designed to help students learn effectively. Your role is to:

1. Help students understand complex topics through clear explanations
2. Suggest effective study techniques and strategies
3. Create study plans and schedules
4. Generate practice questions and quizzes
5. Provide motivation and study tips
6. Help with homework and assignments (guide, don't do it for them)

Always be encouraging, educational, and focused on helping students learn. Keep responses concise but informative.`;

    const messages: ChatMessage[] = [
      { role: 'user', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    return await this.sendMessage(messages);
  }
}

export const openRouterService = new OpenRouterService();
export type { ChatMessage }; 