from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Document, Summary
from .serializers import DocumentSerializer, SummarySerializer

# Create your views here.

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentSummaryListView(generics.ListAPIView):
    serializer_class = SummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        document_id = self.kwargs['pk']
        return Summary.objects.filter(document_id=document_id, document__user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_document_view(request, pk):
    """Process document to extract text"""
    try:
        document = Document.objects.get(pk=pk, user=request.user)
        # TODO: Implement text extraction logic
        document.processed_text = "Placeholder processed text"
        document.is_processed = True
        document.save()
        return Response({'message': 'Document processed successfully'})
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_summary_view(request, pk):
    """Generate AI summary for document"""
    try:
        document = Document.objects.get(pk=pk, user=request.user)
        summary_type = request.data.get('summary_type', 'brief')
        
        # TODO: Implement AI summary generation
        summary_content = f"AI-generated {summary_type} summary of {document.title}"
        
        summary = Summary.objects.create(
            document=document,
            content=summary_content,
            summary_type=summary_type,
            word_count=len(summary_content.split())
        )
        
        return Response(SummarySerializer(summary).data, status=status.HTTP_201_CREATED)
    except Document.DoesNotExist:
        return Response({'error': 'Document not found'}, status=status.HTTP_404_NOT_FOUND)
