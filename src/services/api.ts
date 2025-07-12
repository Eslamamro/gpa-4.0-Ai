const API_BASE_URL = 'http://localhost:8000/api';

// Types for API responses
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  student_id?: string;
  phone_number?: string;
  date_of_birth?: string;
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
  description?: string;
  file: string;
  document_type: 'PDF' | 'IMAGE' | 'TEXT';
  file_size: number;
  file_size_mb: number;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  is_public: boolean;
  tags?: string;
  extracted_text?: string;
  page_count?: number;
  file_extension?: string;
  is_image: boolean;
  is_pdf: boolean;
  user_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentTag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface DocumentShare {
  id: number;
  document: number;
  document_title?: string;
  shared_by_name?: string;
  shared_with: number;
  shared_with_name?: string;
  shared_with_email?: string;
  can_edit: boolean;
  message?: string;
  created_at: string;
}

export interface DocumentStats {
  total_documents: number;
  pdf_documents: number;
  image_documents: number;
  text_documents: number;
  total_size_mb: number;
  public_documents: number;
  private_documents: number;
  documents_by_type: { [key: string]: number };
  recent_uploads: Document[];
}

export interface DashboardStats {
  total_documents: number;
  pdf_documents: number;
  image_documents: number;
  text_documents: number;
  total_size_mb: number;
  public_documents: number;
  private_documents: number;
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

  private getFileHeaders(): HeadersInit {
    const headers: HeadersInit = {};

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
    student_id?: string;
    phone_number?: string;
    date_of_birth?: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register/', {
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
    const response = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout/', {
      method: 'POST',
    });
    
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async getProfile(): Promise<User> {
    return this.request<User>('/auth/profile/');
  }

  async updateProfile(userData: Partial<User>): Promise<{ user: User; message: string }> {
    return this.request(`/auth/profile/update/`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async changePassword(passwordData: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<{ message: string; token: string }> {
    const response = await this.request<{ message: string; token: string }>('/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
    
    this.token = response.token;
    localStorage.setItem('auth_token', response.token);
    
    return response;
  }

  async getDashboard(): Promise<{ user: User; stats: DashboardStats }> {
    return this.request('/auth/dashboard/');
  }

  // Document endpoints
  async getDocuments(params?: {
    type?: string;
    status?: string;
    public?: boolean;
    search?: string;
  }): Promise<Document[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.public !== undefined) queryParams.append('public', params.public.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return this.request<Document[]>(`/documents/${queryString ? `?${queryString}` : ''}`);
  }

  async uploadDocument(formData: FormData): Promise<Document> {
    const response = await fetch(`${this.baseURL}/documents/`, {
      method: 'POST',
      headers: this.getFileHeaders(),
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to upload document');
    }

    return response.json();
  }

  async getDocument(id: number): Promise<Document> {
    return this.request<Document>(`/documents/${id}/`);
  }

  async updateDocument(id: number, documentData: {
    title?: string;
    description?: string;
    is_public?: boolean;
    tags?: string;
  }): Promise<Document> {
    return this.request(`/documents/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  }

  async deleteDocument(id: number): Promise<void> {
    await this.request(`/documents/${id}/`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(id: number): Promise<{
    download_url: string;
    filename: string;
    file_size_mb: number;
  }> {
    return this.request(`/documents/${id}/download/`);
  }

  // Document statistics
  async getDocumentStats(): Promise<DocumentStats> {
    return this.request<DocumentStats>('/documents/stats/');
  }

  // Document tags
  async getDocumentTags(): Promise<DocumentTag[]> {
    return this.request<DocumentTag[]>('/tags/');
  }

  async createDocumentTag(tagData: {
    name: string;
    color?: string;
  }): Promise<DocumentTag> {
    return this.request('/tags/', {
      method: 'POST',
      body: JSON.stringify(tagData),
    });
  }

  async updateDocumentTag(id: number, tagData: {
    name?: string;
    color?: string;
  }): Promise<DocumentTag> {
    return this.request(`/tags/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(tagData),
    });
  }

  async deleteDocumentTag(id: number): Promise<void> {
    await this.request(`/tags/${id}/`, {
      method: 'DELETE',
    });
  }

  // Document sharing
  async shareDocument(documentId: number, shareData: {
    shared_with_email: string;
    can_edit?: boolean;
    message?: string;
  }): Promise<DocumentShare> {
    return this.request(`/documents/${documentId}/share/`, {
      method: 'POST',
      body: JSON.stringify(shareData),
    });
  }

  async getDocumentShares(type: 'sent' | 'received' = 'received'): Promise<DocumentShare[]> {
    return this.request<DocumentShare[]>(`/shares/?type=${type}`);
  }

  // Public documents
  async getPublicDocuments(params?: {
    type?: string;
    search?: string;
  }): Promise<Document[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    return this.request<Document[]>(`/public-documents/${queryString ? `?${queryString}` : ''}`);
  }

  // Utility methods
  isAuthenticated(): boolean {
    return this.token !== null;
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