from rest_framework import serializers
from .models import Document, DocumentTag, DocumentShare, DocumentProcessingLog

class DocumentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTag
        fields = ['id', 'name', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

class DocumentUploadSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    file_extension = serializers.CharField(read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'file_size', 'file_size_mb', 
                 'document_type', 'status', 'is_public', 'tags', 'file_extension']
        read_only_fields = ['id', 'document_type', 'status', 'file_size', 'file_size_mb', 'file_extension']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        
        # Calculate file size
        if 'file' in validated_data and validated_data['file']:
            file_obj = validated_data['file']
            # Get file size
            file_obj.seek(0, 2)  # Seek to end
            file_size = file_obj.tell()
            file_obj.seek(0)  # Seek back to start
            validated_data['file_size'] = file_size
        
        return super().create(validated_data)

class DocumentSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    file_extension = serializers.CharField(read_only=True)
    is_image = serializers.BooleanField(read_only=True)
    is_pdf = serializers.BooleanField(read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'description', 'file', 'document_type', 
                 'file_size', 'file_size_mb', 'status', 'is_public', 'tags',
                 'extracted_text', 'page_count', 'file_extension', 'is_image', 
                 'is_pdf', 'user_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'file_size', 'file_size_mb', 'document_type', 
                           'status', 'extracted_text', 'page_count', 'file_extension',
                           'is_image', 'is_pdf', 'user_name', 'created_at', 'updated_at']

class DocumentListSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    file_extension = serializers.CharField(read_only=True)
    is_image = serializers.BooleanField(read_only=True)
    is_pdf = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Document
        fields = ['id', 'title', 'document_type', 'file_size_mb', 'status', 
                 'is_public', 'file_extension', 'is_image', 'is_pdf', 'created_at']

class DocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'description', 'is_public', 'tags']

class DocumentShareSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    shared_by_name = serializers.CharField(source='shared_by.get_full_name', read_only=True)
    shared_with_name = serializers.CharField(source='shared_with.get_full_name', read_only=True)
    shared_with_email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = DocumentShare
        fields = ['id', 'document', 'document_title', 'shared_by_name', 
                 'shared_with', 'shared_with_name', 'shared_with_email', 
                 'can_edit', 'message', 'created_at']
        read_only_fields = ['id', 'shared_by', 'document_title', 'shared_by_name', 
                           'shared_with_name', 'created_at']
    
    def create(self, validated_data):
        validated_data['shared_by'] = self.context['request'].user
        
        # Get user by email
        shared_with_email = validated_data.pop('shared_with_email')
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            shared_with_user = User.objects.get(email=shared_with_email)
            validated_data['shared_with'] = shared_with_user
        except User.DoesNotExist:
            raise serializers.ValidationError({'shared_with_email': 'User with this email does not exist'})
        
        return super().create(validated_data)

class DocumentProcessingLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentProcessingLog
        fields = ['id', 'operation', 'status', 'message', 'created_at']

class DocumentStatsSerializer(serializers.Serializer):
    total_documents = serializers.IntegerField()
    pdf_documents = serializers.IntegerField()
    image_documents = serializers.IntegerField()
    text_documents = serializers.IntegerField()
    total_size_mb = serializers.DecimalField(max_digits=10, decimal_places=2)
    public_documents = serializers.IntegerField()
    private_documents = serializers.IntegerField()
    documents_by_type = serializers.DictField()
    recent_uploads = serializers.ListField() 