const API_BASE_URL = 'http://localhost:8000/api';

// Types for API responses
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  date_of_birth?: string;
  study_goal?: string;
  preferred_study_time?: string;
  is_premium: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface Document {
  id: number;
  title: string;
  file: string;
  document_type: string;
  file_size_mb?: number;
  is_processed: boolean;
  created_at: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  color_theme: string;
  card_count: number;
  created_at: string;
}

export interface Flashcard {
  id: number;
  question: string;
  answer: string;
  difficulty_level: string;
  learned?: boolean;
  created_at: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty_level: string;
  time_limit_minutes?: number;
  question_count: number;
  created_at: string;
}

// API Client class
class APIClient {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle validation errors (400)
        if (response.status === 400) {
          let errorMessage = 'Validation failed:\n';
          
          // Format field-specific errors
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              errorMessage += `• ${field}: ${errors.join(', ')}\n`;
            } else if (typeof errors === 'string') {
              errorMessage += `• ${field}: ${errors}\n`;
            }
          }
          
          throw new Error(errorMessage.trim());
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    
    return response;
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/users/logout/', {
      method: 'POST',
    });
    
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile/');
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request(`/users/profile/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getUserStats(): Promise<{
    total_documents: number;
    total_flashcard_sets: number;
    total_quizzes: number;
    total_study_sessions: number;
    total_quiz_attempts: number;
    avg_quiz_score: number;
    total_study_time_minutes: number;
  }> {
    return this.request('/users/stats/');
  }

  // Documents endpoints
  async getDocuments(): Promise<Document[]> {
    return this.request<Document[]>('/documents/');
  }

  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await fetch(`${this.baseURL}/documents/`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Token ${this.token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    return response.json();
  }

  async deleteDocument(id: number): Promise<void> {
    await this.request(`/documents/${id}/`, {
      method: 'DELETE',
    });
  }

  async generateSummary(documentId: number, summaryType: string = 'brief'): Promise<any> {
    return this.request(`/documents/${documentId}/generate-summary/`, {
      method: 'POST',
      body: JSON.stringify({ summary_type: summaryType }),
    });
  }

  // Flashcards endpoints
  async getFlashcardSets(): Promise<FlashcardSet[]> {
    return this.request<FlashcardSet[]>('/flashcards/sets/');
  }

  async createFlashcardSet(setData: {
    title: string;
    description: string;
    difficulty_level: string;
    color_theme?: string;
  }): Promise<FlashcardSet> {
    return this.request('/flashcards/sets/', {
      method: 'POST',
      body: JSON.stringify(setData),
    });
  }

  async deleteFlashcardSet(id: number): Promise<void> {
    await this.request(`/flashcards/sets/${id}/`, {
      method: 'DELETE',
    });
  }

  async getFlashcards(setId?: number): Promise<Flashcard[]> {
    const endpoint = setId ? `/flashcards/sets/${setId}/cards/` : '/flashcards/cards/';
    return this.request<Flashcard[]>(endpoint);
  }

  async createFlashcard(setId: number, cardData: {
    question: string;
    answer: string;
    difficulty_level?: string;
  }): Promise<Flashcard> {
    return this.request(`/flashcards/sets/${setId}/cards/`, {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  }

  // Quizzes endpoints
  async getQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/quizzes/');
  }

  async createQuiz(quizData: {
    title: string;
    description: string;
    difficulty_level: string;
    time_limit_minutes?: number;
  }): Promise<Quiz> {
    return this.request('/quizzes/', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id: number): Promise<void> {
    await this.request(`/quizzes/${id}/`, {
      method: 'DELETE',
    });
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }
}

// Export a singleton instance
export const apiClient = new APIClient(API_BASE_URL);
export default apiClient; 