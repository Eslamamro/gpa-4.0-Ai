from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import FlashcardSet, Flashcard, StudySession, CardReview
from .serializers import (
    FlashcardSetSerializer, FlashcardSetListSerializer, FlashcardSerializer,
    StudySessionSerializer, CardReviewSerializer
)

# Create your views here.

class FlashcardSetListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FlashcardSet.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return FlashcardSetListSerializer
        return FlashcardSetSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FlashcardSetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FlashcardSetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FlashcardSet.objects.filter(user=self.request.user)

class FlashcardListCreateView(generics.ListCreateAPIView):
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        set_id = self.kwargs['set_id']
        return Flashcard.objects.filter(
            flashcard_set_id=set_id,
            flashcard_set__user=self.request.user
        )
    
    def perform_create(self, serializer):
        set_id = self.kwargs['set_id']
        try:
            flashcard_set = FlashcardSet.objects.get(id=set_id, user=self.request.user)
            serializer.save(flashcard_set=flashcard_set)
        except FlashcardSet.DoesNotExist:
            return Response({'error': 'Flashcard set not found'}, status=status.HTTP_404_NOT_FOUND)

class FlashcardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FlashcardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Flashcard.objects.filter(flashcard_set__user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_study_session_view(request, set_id):
    """Start a new study session"""
    try:
        flashcard_set = FlashcardSet.objects.get(id=set_id, user=request.user)
        session = StudySession.objects.create(
            user=request.user,
            flashcard_set=flashcard_set
        )
        return Response(StudySessionSerializer(session).data, status=status.HTTP_201_CREATED)
    except FlashcardSet.DoesNotExist:
        return Response({'error': 'Flashcard set not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def review_card_view(request, session_id):
    """Review a flashcard in a study session"""
    try:
        session = StudySession.objects.get(id=session_id, user=request.user)
        flashcard_id = request.data.get('flashcard_id')
        is_correct = request.data.get('is_correct')
        time_spent = request.data.get('time_spent_seconds', 0)
        
        flashcard = Flashcard.objects.get(id=flashcard_id, flashcard_set=session.flashcard_set)
        
        review = CardReview.objects.create(
            study_session=session,
            flashcard=flashcard,
            is_correct=is_correct,
            time_spent_seconds=time_spent
        )
        
        # Update session stats
        session.total_cards_studied += 1
        if is_correct:
            session.correct_answers += 1
        session.save()
        
        return Response(CardReviewSerializer(review).data, status=status.HTTP_201_CREATED)
    except StudySession.DoesNotExist:
        return Response({'error': 'Study session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Flashcard.DoesNotExist:
        return Response({'error': 'Flashcard not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_study_session_view(request, session_id):
    """Complete a study session"""
    try:
        session = StudySession.objects.get(id=session_id, user=request.user)
        duration_minutes = request.data.get('duration_minutes', 0)
        
        session.completed = True
        session.duration_minutes = duration_minutes
        session.completed_at = timezone.now()
        session.save()
        
        return Response(StudySessionSerializer(session).data, status=status.HTTP_200_OK)
    except StudySession.DoesNotExist:
        return Response({'error': 'Study session not found'}, status=status.HTTP_404_NOT_FOUND)
