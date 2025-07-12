from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.db.models import Sum, Count, Q
from .models import Document, DocumentTag, DocumentShare, DocumentProcessingLog
from .serializers import (
    DocumentSerializer, DocumentUploadSerializer, DocumentListSerializer,
    DocumentUpdateSerializer, DocumentTagSerializer, DocumentShareSerializer,
    DocumentProcessingLogSerializer, DocumentStatsSerializer
)

class DocumentListView(APIView):
    """
    List all documents or upload a new document
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get(self, request):
        """Get list of user's documents"""
        documents = Document.objects.filter(user=request.user)
        
        # Filter parameters
        document_type = request.query_params.get('type')
        status_filter = request.query_params.get('status')
        is_public = request.query_params.get('public')
        search = request.query_params.get('search')
        
        if document_type:
            documents = documents.filter(document_type=document_type.upper())
        if status_filter:
            documents = documents.filter(status=status_filter.upper())
        if is_public is not None:
            documents = documents.filter(is_public=is_public.lower() == 'true')
        if search:
            documents = documents.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Upload a new document"""
        serializer = DocumentUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            document = serializer.save()
            # Update status to completed after successful upload
            document.status = 'COMPLETED'
            document.save()
            
            return Response(
                DocumentSerializer(document).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentDetailView(APIView):
    """
    Retrieve, update or delete a document
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk, user):
        return get_object_or_404(Document, pk=pk, user=user)
    
    def get(self, request, pk):
        """Get document details"""
        document = self.get_object(pk, request.user)
        serializer = DocumentSerializer(document)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update document"""
        document = self.get_object(pk, request.user)
        serializer = DocumentUpdateSerializer(document, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(DocumentSerializer(document).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        """Partially update document"""
        document = self.get_object(pk, request.user)
        serializer = DocumentUpdateSerializer(document, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(DocumentSerializer(document).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete document"""
        document = self.get_object(pk, request.user)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentStatsView(APIView):
    """
    Get document statistics for the user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user's document statistics"""
        user = request.user
        documents = Document.objects.filter(user=user)
        
        # Basic counts
        total_documents = documents.count()
        pdf_documents = documents.filter(document_type='PDF').count()
        image_documents = documents.filter(document_type='IMAGE').count()
        text_documents = documents.filter(document_type='TEXT').count()
        
        # Size calculations
        total_size_mb = documents.aggregate(
            total_size=Sum('file_size_mb')
        )['total_size'] or 0
        
        # Public/Private counts
        public_documents = documents.filter(is_public=True).count()
        private_documents = documents.filter(is_public=False).count()
        
        # Documents by type
        documents_by_type = {
            'PDF': pdf_documents,
            'IMAGE': image_documents,
            'TEXT': text_documents
        }
        
        # Recent uploads (last 5)
        recent_uploads = documents.order_by('-created_at')[:5]
        recent_uploads_data = DocumentListSerializer(recent_uploads, many=True).data
        
        stats = {
            'total_documents': total_documents,
            'pdf_documents': pdf_documents,
            'image_documents': image_documents,
            'text_documents': text_documents,
            'total_size_mb': round(total_size_mb, 2),
            'public_documents': public_documents,
            'private_documents': private_documents,
            'documents_by_type': documents_by_type,
            'recent_uploads': recent_uploads_data
        }
        
        return Response(stats)


class DocumentTagListView(APIView):
    """
    List all document tags or create a new tag
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get all document tags"""
        tags = DocumentTag.objects.all()
        serializer = DocumentTagSerializer(tags, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new document tag"""
        serializer = DocumentTagSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentTagDetailView(APIView):
    """
    Retrieve, update or delete a document tag
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self, pk):
        return get_object_or_404(DocumentTag, pk=pk)
    
    def get(self, request, pk):
        """Get tag details"""
        tag = self.get_object(pk)
        serializer = DocumentTagSerializer(tag)
        return Response(serializer.data)
    
    def put(self, request, pk):
        """Update tag"""
        tag = self.get_object(pk)
        serializer = DocumentTagSerializer(tag, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        """Delete tag"""
        tag = self.get_object(pk)
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentShareView(APIView):
    """
    Share a document with another user
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, document_id):
        """Share a document"""
        document = get_object_or_404(Document, pk=document_id, user=request.user)
        
        # Add document to request data
        data = request.data.copy()
        data['document'] = document.id
        
        serializer = DocumentShareSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DocumentShareListView(APIView):
    """
    List shared documents (sent and received)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get shared documents"""
        user = request.user
        share_type = request.query_params.get('type', 'received')
        
        if share_type == 'sent':
            shares = DocumentShare.objects.filter(shared_by=user)
        else:  # received
            shares = DocumentShare.objects.filter(shared_with=user)
        
        serializer = DocumentShareSerializer(shares, many=True)
        return Response(serializer.data)


class DocumentProcessingLogView(APIView):
    """
    Get processing logs for a document
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, document_id):
        """Get processing logs for a document"""
        document = get_object_or_404(Document, pk=document_id, user=request.user)
        logs = DocumentProcessingLog.objects.filter(document=document)
        serializer = DocumentProcessingLogSerializer(logs, many=True)
        return Response(serializer.data)


class PublicDocumentListView(APIView):
    """
    List public documents (no authentication required)
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        """Get public documents"""
        documents = Document.objects.filter(is_public=True, status='COMPLETED')
        
        # Filter parameters
        document_type = request.query_params.get('type')
        search = request.query_params.get('search')
        
        if document_type:
            documents = documents.filter(document_type=document_type.upper())
        if search:
            documents = documents.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        serializer = DocumentListSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentDownloadView(APIView):
    """
    Download a document file
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, pk):
        """Download document file"""
        document = get_object_or_404(Document, pk=pk)
        
        # Check if user has access to the document
        if document.user != request.user and not document.is_public:
            # Check if document is shared with user
            shared = DocumentShare.objects.filter(
                document=document,
                shared_with=request.user
            ).exists()
            
            if not shared:
                return Response(
                    {'error': 'You do not have permission to download this document'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Return file URL for download
        if document.file:
            return Response({
                'download_url': request.build_absolute_uri(document.file.url),
                'filename': document.file.name.split('/')[-1],
                'file_size_mb': document.file_size_mb
            })
        else:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )
