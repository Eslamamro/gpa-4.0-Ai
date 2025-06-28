from django.db import models
from django.conf import settings

class Document(models.Model):
    DOCUMENT_TYPES = [
        ('pdf', 'PDF'),
        ('txt', 'Text File'),
        ('docx', 'Word Document'),
        ('md', 'Markdown'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=10, choices=DOCUMENT_TYPES)
    original_text = models.TextField(blank=True)
    processed_text = models.TextField(blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)  # in bytes
    is_processed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"

    class Meta:
        ordering = ['-created_at']

class Summary(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='summaries')
    content = models.TextField()
    summary_type = models.CharField(
        max_length=20,
        choices=[
            ('brief', 'Brief Summary'),
            ('detailed', 'Detailed Summary'),
            ('key_points', 'Key Points'),
        ],
        default='brief'
    )
    word_count = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Summary of {self.document.title} ({self.summary_type})"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Summaries"

class KeyTopic(models.Model):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='key_topics')
    topic = models.CharField(max_length=100)
    relevance_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.topic} - {self.document.title}"

    class Meta:
        ordering = ['-relevance_score']
