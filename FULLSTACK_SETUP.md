# 🚀 StudyMate AI Full-Stack Setup Guide

This guide will help you run both the React frontend and Django backend together to have a fully functional StudyMate AI application.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🏗️ Architecture Overview

```
StudyMate AI Full-Stack
├── Frontend (React + TypeScript + Vite)
│   ├── Port: 3000
│   ├── Authentication System
│   ├── Document Upload
│   ├── Flashcards Interface
│   └── Dashboard
└── Backend (Django + DRF)
    ├── Port: 8000
    ├── REST API Endpoints
    ├── User Authentication
    ├── File Processing
    └── Database (SQLite)
```

## 🔧 Step 1: Backend Setup (Django)

### 1. Navigate to Backend Directory
```bash
cd studymate-backend
```

### 2. Create Virtual Environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run Database Migrations
```bash
python manage.py migrate
```

### 5. Create Superuser (Optional)
```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 6. Start Django Server
```bash
python manage.py runserver 8000
```

✅ **Backend is now running at: http://localhost:8000**

## 🎨 Step 2: Frontend Setup (React)

### 1. Open New Terminal Window
Keep the Django server running and open a new terminal.

### 2. Navigate to Project Root
```bash
cd ..  # Go back to project root if you were in studymate-backend
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

✅ **Frontend is now running at: http://localhost:3000**

## 🔗 Step 3: Verify Connection

### Test Authentication Flow
1. **Register New Account**
   - Go to http://localhost:3000/register
   - Fill out the registration form
   - You should be redirected to the dashboard

2. **Upload Document**
   - Go to the Dashboard
   - Upload a PDF or text file
   - Verify it appears in your documents list

3. **Check API Connection**
   - Open browser dev tools (F12)
   - Check Network tab for API calls to localhost:8000

## 📡 API Endpoints Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register/` | POST | User registration |
| `/api/users/login/` | POST | User login |
| `/api/users/profile/` | GET | Get user profile |
| `/api/documents/` | GET/POST | List/Upload documents |
| `/api/flashcards/sets/` | GET/POST | Flashcard sets |
| `/api/quizzes/` | GET/POST | Quiz management |

## 🔐 Authentication Flow

1. **User Registration/Login** → Get auth token
2. **Token Storage** → localStorage + API client headers
3. **Protected Routes** → Automatic redirect if not authenticated
4. **API Calls** → Token included in Authorization header

## 📁 Key Files for Integration

### Frontend
- `src/services/api.ts` - API client and endpoints
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/pages/Login.tsx` - Login functionality
- `src/pages/Register.tsx` - Registration functionality
- `src/pages/Dashboard.tsx` - Document upload and management

### Backend
- `studymate_backend/settings.py` - Django configuration
- `*/urls.py` - API route definitions
- `*/views.py` - API endpoint logic
- `*/serializers.py` - Data serialization

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors
If you see CORS errors in the browser console:
```python
# In studymate-backend/studymate_backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

#### 2. Module Not Found Error
```bash
# Make sure virtual environment is activated
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Reinstall requirements
pip install -r requirements.txt
```

#### 3. Port Already in Use
```bash
# Frontend (if port 3000 is busy)
npm run dev -- --port 3001

# Backend (if port 8000 is busy)
python manage.py runserver 8001
```

#### 4. Authentication Issues
- Clear browser localStorage: Dev Tools → Application → Local Storage → Clear
- Check if Django server is running on port 8000
- Verify API_BASE_URL in `src/services/api.ts`

## 🔄 Development Workflow

### Daily Development
1. **Start Backend**: `cd studymate-backend && python manage.py runserver`
2. **Start Frontend**: `npm run dev`
3. **Both should auto-reload** on file changes

### Making Changes
- **Frontend changes**: Auto-reload in browser
- **Backend changes**: Django dev server auto-reloads
- **Database changes**: Run `python manage.py migrate`

## 🌐 Production Deployment

### Frontend Build
```bash
npm run build
# Generates dist/ folder for deployment
```

### Backend Production
```bash
# Install production requirements
pip install gunicorn

# Run with Gunicorn
gunicorn studymate_backend.wsgi:application
```

## 📊 Database Management

### View Data
```bash
# Django Admin (create superuser first)
http://localhost:8000/admin/

# Django Shell
python manage.py shell
```

### Reset Database
```bash
# Delete migrations (keep __init__.py files)
# Delete db.sqlite3
python manage.py makemigrations
python manage.py migrate
```

## 🎯 Next Steps

1. **Test the complete user flow**:
   - Register → Login → Upload Document → View Flashcards
   
2. **Customize features**:
   - Add more document types
   - Enhance AI processing
   - Improve UI/UX

3. **Scale the application**:
   - Add PostgreSQL database
   - Implement Redis caching
   - Add file storage (AWS S3)

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify both servers are running
3. Check browser console for errors
4. Review Django server logs

**Happy coding! 🚀** 