# StudyMate AI - Backend Integration Guide

This guide shows how to connect your React frontend with the new Django REST Framework backend.

## 🚀 Quick Start

### 1. Backend Setup (Already Done!)
Your Django backend is now running on `http://localhost:8000` with the following features:
- ✅ User authentication and registration
- ✅ Document upload and processing
- ✅ Flashcard management
- ✅ Quiz creation and attempts
- ✅ CORS configured for React frontend
- ✅ RESTful API endpoints

### 2. Frontend Integration

I've created an API service (`src/services/api.ts`) that provides easy methods to interact with the backend.

## 📋 Example Usage

### Authentication
```typescript
import { apiClient } from '@/services/api';

// Register a new user
const registerUser = async () => {
  try {
    const response = await apiClient.register({
      email: 'user@example.com',
      username: 'username',
      first_name: 'John',
      last_name: 'Doe',
      password: 'securepassword',
      password_confirm: 'securepassword'
    });
    
    console.log('User registered:', response.user);
    // Token is automatically stored in localStorage
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Login user
const loginUser = async () => {
  try {
    const response = await apiClient.login({
      email: 'user@example.com',
      password: 'securepassword'
    });
    
    console.log('Login successful:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Logout user
const logoutUser = async () => {
  try {
    await apiClient.logout();
    console.log('Logged out successfully');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

### Document Management
```typescript
// Upload a document
const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name);
  formData.append('document_type', file.name.split('.').pop() || 'txt');

  try {
    const document = await apiClient.uploadDocument(formData);
    console.log('Document uploaded:', document);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};

// Get all documents
const fetchDocuments = async () => {
  try {
    const documents = await apiClient.getDocuments();
    console.log('Documents:', documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
  }
};

// Generate summary
const generateSummary = async (documentId: number) => {
  try {
    const summary = await apiClient.generateSummary(documentId, 'brief');
    console.log('Summary generated:', summary);
  } catch (error) {
    console.error('Failed to generate summary:', error);
  }
};
```

### Flashcards
```typescript
// Create flashcard set
const createFlashcardSet = async () => {
  try {
    const flashcardSet = await apiClient.createFlashcardSet({
      title: 'My Flashcard Set',
      description: 'A set of study cards',
      difficulty_level: 'intermediate',
      color_theme: '#8B5CF6'
    });
    console.log('Flashcard set created:', flashcardSet);
  } catch (error) {
    console.error('Failed to create flashcard set:', error);
  }
};

// Get all flashcard sets
const fetchFlashcardSets = async () => {
  try {
    const sets = await apiClient.getFlashcardSets();
    console.log('Flashcard sets:', sets);
  } catch (error) {
    console.error('Failed to fetch flashcard sets:', error);
  }
};
```

### Quizzes
```typescript
// Create quiz
const createQuiz = async () => {
  try {
    const quiz = await apiClient.createQuiz({
      title: 'My Quiz',
      description: 'A practice quiz',
      difficulty_level: 'intermediate',
      time_limit_minutes: 30
    });
    console.log('Quiz created:', quiz);
  } catch (error) {
    console.error('Failed to create quiz:', error);
  }
};

// Get all quizzes
const fetchQuizzes = async () => {
  try {
    const quizzes = await apiClient.getQuizzes();
    console.log('Quizzes:', quizzes);
  } catch (error) {
    console.error('Failed to fetch quizzes:', error);
  }
};
```

## 🔗 Updating Your Existing Pages

### Login Page (`src/pages/Login.tsx`)
Replace the existing form submission with:

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await apiClient.login({
      email: email,
      password: password
    });
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### Register Page (`src/pages/Register.tsx`)
Update registration form:

```typescript
const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await apiClient.register({
      email,
      username,
      first_name: firstName,
      last_name: lastName,
      password,
      password_confirm: confirmPassword
    });
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError('Registration failed');
  }
};
```

### Dashboard Page (`src/pages/Dashboard.tsx`)
Load real data from the backend:

```typescript
import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, docsData, cardsData, quizzesData] = await Promise.all([
          apiClient.getUserStats(),
          apiClient.getDocuments(),
          apiClient.getFlashcardSets(),
          apiClient.getQuizzes()
        ]);
        
        setStats(statsData);
        setDocuments(docsData);
        setFlashcardSets(cardsData);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadData();
  }, []);

  // Use real data in your dashboard components
};
```

## 🛡️ Authentication Context

Create an authentication context to manage user state:

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (apiClient.isAuthenticated()) {
        try {
          const userData = await apiClient.getProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          apiClient.clearToken();
        }
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login({ email, password });
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (userData: any) => {
    const response = await apiClient.register(userData);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## 🔧 Next Steps

1. **Update your pages** to use the API client instead of mock data
2. **Add authentication context** to manage user state globally
3. **Implement file upload** for documents
4. **Add error handling** and loading states
5. **Test the integration** between frontend and backend

## 📚 Available Endpoints

### Django Admin
- Access: `http://localhost:8000/admin/`
- Credentials: Use the superuser you created
- Manage users, documents, flashcards, and quizzes

### API Root
- Visit: `http://localhost:8000/api/`
- Browse all available endpoints
- Test endpoints directly in the browser

### API Documentation
All endpoints are documented in the backend README at `studymate-backend/README.md`

## 🎯 Benefits of This Integration

- **Real Data Persistence**: All data is stored in a database
- **User Authentication**: Secure login/logout with token-based auth
- **File Uploads**: Handle document uploads and processing
- **Scalable Architecture**: Easy to extend with new features
- **API-First Design**: Backend can support mobile apps in the future
- **Admin Interface**: Manage all data through Django admin

Your StudyMate AI application is now a full-stack application with a powerful Django backend! 🚀 