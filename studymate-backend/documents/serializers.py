from rest_framework import serializers
from .models import Document, Summary, KeyTopic

class DocumentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'user', 'title', 'file', 'document_type', 
            'original_text', 'processed_text', 'file_size', 
            'file_size_mb', 'is_processed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'original_text', 'processed_text', 
                           'is_processed', 'created_at', 'updated_at']

    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return None

class SummarySerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = Summary
        fields = [
            'id', 'document', 'document_title', 'content', 
            'summary_type', 'word_count', 'created_at'
        ]
        read_only_fields = ['id', 'word_count', 'created_at']

class KeyTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyTopic
        fields = ['id', 'document', 'topic', 'relevance_score', 'created_at']
        read_only_fields = ['id', 'created_at']

class DocumentUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'file', 'document_type']

    def validate_file(self, value):
        # Validate file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB")
        
        # Validate file type
        allowed_types = ['.pdf', '.txt', '.docx', '.md']
        file_extension = value.name.lower().split('.')[-1]
        if f'.{file_extension}' not in allowed_types:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed types: {', '.join(allowed_types)}"
            )
        
        return value 