# StudyMate AI Backend

Django REST Framework backend for the StudyMate AI application.

## Features

- **User Management**: Custom user model with authentication, registration, and profile management
- **Document Processing**: File upload, text extraction, and AI-powered summarization
- **Flashcards**: Create, manage, and study with interactive flashcard sets
- **Quizzes**: AI-generated quizzes with detailed analytics and progress tracking
- **RESTful API**: Comprehensive API endpoints for all features

## Technology Stack

- Django 5.2.3
- Django REST Framework 3.16.0
- Django CORS Headers (for React frontend integration)
- SQLite (development database)
- Python 3.13+

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd studymate-backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\Activate.ps1  # Windows PowerShell
   # source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start development server**
   ```bash
   python manage.py runserver 8000
   ```

## API Endpoints

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - User logout
- `GET/PUT /api/users/profile/` - Get/Update user profile
- `POST /api/users/change-password/` - Change password
- `GET /api/users/stats/` - User statistics

### Documents
- `GET/POST /api/documents/` - List/Create documents
- `GET/PUT/DELETE /api/documents/{id}/` - Document detail operations
- `POST /api/documents/{id}/process/` - Process document text
- `GET /api/documents/{id}/summaries/` - Get document summaries
- `POST /api/documents/{id}/generate-summary/` - Generate AI summary

### Flashcards
- `GET/POST /api/flashcards/sets/` - List/Create flashcard sets
- `GET/PUT/DELETE /api/flashcards/sets/{id}/` - Flashcard set operations
- `GET/POST /api/flashcards/sets/{id}/cards/` - List/Create cards in set
- `GET/PUT/DELETE /api/flashcards/cards/{id}/` - Individual card operations
- `POST /api/flashcards/sets/{id}/study/` - Start study session
- `POST /api/flashcards/sessions/{id}/review/` - Review card
- `POST /api/flashcards/sessions/{id}/complete/` - Complete session

### Quizzes
- `GET/POST /api/quizzes/` - List/Create quizzes
- `GET/PUT/DELETE /api/quizzes/{id}/` - Quiz operations
- `GET/POST /api/quizzes/{id}/questions/` - List/Create questions
- `GET/PUT/DELETE /api/quizzes/questions/{id}/` - Question operations
- `POST /api/quizzes/{id}/start/` - Start quiz attempt
- `POST /api/quizzes/attempts/{id}/answer/` - Submit answer
- `POST /api/quizzes/attempts/{id}/complete/` - Complete quiz
- `GET /api/quizzes/attempts/{id}/results/` - Get results

## Frontend Integration

The backend is configured with CORS to work with React frontends running on:
- `http://localhost:3000`
- `http://localhost:5173`

## Development

### Project Structure
```
studymate-backend/
├── studymate_backend/      # Main Django project
├── users/                  # User management app
├── documents/              # Document processing app
├── flashcards/             # Flashcard management app
├── quizzes/                # Quiz and assessment app
├── manage.py
├── requirements.txt
└── README.md
```

### Adding New Features
1. Create models in the appropriate app
2. Create serializers for API data validation
3. Create views using Django REST Framework
4. Add URL patterns
5. Run migrations

## Environment Variables

Create a `.env` file in the project root:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
```

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/` with your superuser credentials.

## API Documentation

Visit `http://localhost:8000/api/` for the API root with available endpoints. 