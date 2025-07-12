# Document Management Backend API

This is the Django REST API backend for the Document Management System.

## Features

- **User Authentication**: Registration, login, logout with token-based authentication
- **Document Management**: Upload, view, edit, and delete documents (PDF, Images, Text)
- **File Support**: PDF, JPG, JPEG, PNG, GIF, TXT, DOC, DOCX files
- **Document Sharing**: Share documents with other users
- **Document Tags**: Organize documents with custom tags
- **Public Documents**: Make documents publicly accessible
- **Statistics**: Track document usage and statistics
- **Processing Logs**: Monitor document processing operations

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials in `.env`

4. Create MySQL database:
   ```sql
   CREATE DATABASE gpa_database;
   ```

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Run the server:
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Authentication (APIView Classes)
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/update/` - Update user profile
- `POST /api/auth/change-password/` - Change password
- `GET /api/auth/dashboard/` - User dashboard with document stats

### Documents (APIView Classes)
- `GET /api/documents/` - List user documents (with filters)
- `POST /api/documents/` - Upload new document
- `GET /api/documents/{id}/` - Get document details
- `PUT /api/documents/{id}/` - Update document
- `PATCH /api/documents/{id}/` - Partially update document
- `DELETE /api/documents/{id}/` - Delete document
- `GET /api/documents/{id}/download/` - Download document
- `GET /api/documents/stats/` - Get document statistics

### Document Tags (APIView Classes)
- `GET /api/tags/` - List all document tags
- `POST /api/tags/` - Create new tag
- `GET /api/tags/{id}/` - Get tag details
- `PUT /api/tags/{id}/` - Update tag
- `DELETE /api/tags/{id}/` - Delete tag

### Document Sharing (APIView Classes)
- `POST /api/documents/{id}/share/` - Share document with user
- `GET /api/shares/` - Get shared documents (sent/received)

### Public Documents (APIView Classes)
- `GET /api/public-documents/` - List public documents

### Processing Logs (APIView Classes)
- `GET /api/documents/{id}/logs/` - Get document processing logs

## Query Parameters

### Document List (`/api/documents/`)
- `type` - Filter by document type (PDF, IMAGE, TEXT)
- `status` - Filter by status (UPLOADING, PROCESSING, COMPLETED, FAILED)
- `public` - Filter by public status (true/false)
- `search` - Search in title, description, and tags

### Document Shares (`/api/shares/`)
- `type` - Filter by share type (sent/received)

### Public Documents (`/api/public-documents/`)
- `type` - Filter by document type
- `search` - Search in title, description, and tags

## File Upload

### Supported File Types
- **PDF**: `.pdf`
- **Images**: `.jpg`, `.jpeg`, `.png`, `.gif`
- **Documents**: `.txt`, `.doc`, `.docx`

### Upload Process
1. Use `multipart/form-data` content type
2. Include `file` field with the file
3. Include `title` field (required)
4. Optionally include `description`, `tags`, `is_public`
5. File size and type are automatically detected

## Environment Variables

```env
# Database Configuration
DB_NAME=gpa_database
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=3306

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

## Models

### User (Custom User Model)
- Extended Django User with additional fields
- Student ID, phone number, date of birth

### Document
- File upload with metadata
- Document type detection
- Status tracking
- Public/private visibility
- Tag support

### DocumentTag
- Custom tags for organization
- Color coding support

### DocumentShare
- Share documents between users
- Permission control (view/edit)
- Share messages

### DocumentProcessingLog
- Track document processing operations
- Status monitoring
- Error logging

## File Storage

Files are stored in the `media/documents/{user_id}/` directory structure. The file paths are automatically generated based on the user ID to organize files per user.

## Security

- Token-based authentication
- User isolation (users can only access their own documents)
- File access control
- Secure file upload validation
- Permission-based document sharing

## Development

### Running Tests
```bash
python manage.py test
```

### Creating Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Accessing Admin Panel
Navigate to `http://localhost:8000/admin/` and use your superuser credentials. 