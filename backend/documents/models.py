import os
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import FileExtensionValidator

User = get_user_model()

def upload_path(instance, filename):
    """Generate upload path for documents"""
    # Get file extension
    ext = filename.split('.')[-1]
    # Create path: documents/user_id/filename
    return f'documents/{instance.user.id}/{filename}'

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('PDF', 'PDF Document'),
        ('IMAGE', 'Image File'),
        ('TEXT', 'Text Document'),
    ]
    
    STATUS_CHOICES = [
        ('UPLOADING', 'Uploading'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to=upload_path,
        validators=[
            FileExtensionValidator(
                allowed_extensions=['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'doc', 'docx']
            )
        ]
    )
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPES)
    file_size = models.IntegerField(help_text="File size in bytes")
    file_size_mb = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UPLOADING')
    
    # Metadata
    is_public = models.BooleanField(default=False)
    tags = models.CharField(max_length=500, blank=True, help_text="Comma-separated tags")
    
    # Processing results
    extracted_text = models.TextField(blank=True, help_text="Extracted text from document")
    page_count = models.IntegerField(null=True, blank=True, help_text="Number of pages for PDF")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        # Calculate file size in MB
        if self.file and self.file_size:
            self.file_size_mb = self.file_size / (1024 * 1024)
        
        # Determine document type based on file extension
        if self.file:
            ext = self.file.name.split('.')[-1].lower()
            if ext == 'pdf':
                self.document_type = 'PDF'
            elif ext in ['jpg', 'jpeg', 'png', 'gif']:
                self.document_type = 'IMAGE'
            else:
                self.document_type = 'TEXT'
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Delete file from storage when deleting the model
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
    
    @property
    def file_extension(self):
        """Get file extension"""
        if self.file:
            return self.file.name.split('.')[-1].lower()
        return None
    
    @property
    def is_image(self):
        """Check if document is an image"""
        return self.document_type == 'IMAGE'
    
    @property
    def is_pdf(self):
        """Check if document is a PDF"""
        return self.document_type == 'PDF'


class DocumentTag(models.Model):
    """Model for document tags"""
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6', help_text="Hex color code")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class DocumentShare(models.Model):
    """Model for sharing documents with other users"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='shares')
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_documents')
    shared_with = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_documents')
    can_edit = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['document', 'shared_with']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.document.title} shared with {self.shared_with.username}"


class DocumentProcessingLog(models.Model):
    """Model for tracking document processing operations"""
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='processing_logs')
    operation = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=[
        ('STARTED', 'Started'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ])
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.document.title} - {self.operation} - {self.status}"
