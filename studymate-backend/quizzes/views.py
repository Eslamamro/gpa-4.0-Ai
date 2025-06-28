from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import Quiz, Question, Answer, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuizListSerializer, QuestionSerializer, 
    QuestionListSerializer, QuizAttemptSerializer, UserAnswerSerializer
)

# Create your views here.

class QuizListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user, is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return QuizListSerializer
        return QuizSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Quiz.objects.filter(user=self.request.user)

class QuestionListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        return Question.objects.filter(
            quiz_id=quiz_id,
            quiz__user=self.request.user
        )
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return QuestionListSerializer
        return QuestionSerializer
    
    def perform_create(self, serializer):
        quiz_id = self.kwargs['quiz_id']
        try:
            quiz = Quiz.objects.get(id=quiz_id, user=self.request.user)
            serializer.save(quiz=quiz)
        except Quiz.DoesNotExist:
            return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Question.objects.filter(quiz__user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_quiz_attempt_view(request, quiz_id):
    """Start a new quiz attempt"""
    try:
        quiz = Quiz.objects.get(id=quiz_id, user=request.user, is_active=True)
        
        # Calculate total points
        total_points = sum(question.points for question in quiz.questions.all())
        
        attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            total_points=total_points
        )
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_answer_view(request, attempt_id):
    """Submit an answer for a quiz question"""
    try:
        attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
        question_id = request.data.get('question_id')
        selected_answer_id = request.data.get('selected_answer_id')
        text_answer = request.data.get('text_answer', '')
        time_spent = request.data.get('time_spent_seconds', 0)
        
        question = Question.objects.get(id=question_id, quiz=attempt.quiz)
        
        # Check if answer already exists for this question
        user_answer, created = UserAnswer.objects.get_or_create(
            quiz_attempt=attempt,
            question=question,
            defaults={
                'time_spent_seconds': time_spent,
                'text_answer': text_answer
            }
        )
        
        if not created:
            # Update existing answer
            user_answer.time_spent_seconds = time_spent
            user_answer.text_answer = text_answer
        
        # Handle selected answer
        if selected_answer_id:
            selected_answer = Answer.objects.get(id=selected_answer_id, question=question)
            user_answer.selected_answer = selected_answer
            user_answer.is_correct = selected_answer.is_correct
        
        user_answer.save()
        
        return Response(UserAnswerSerializer(user_answer).data, status=status.HTTP_200_OK)
    except QuizAttempt.DoesNotExist:
        return Response({'error': 'Quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    except Answer.DoesNotExist:
        return Response({'error': 'Answer not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_quiz_attempt_view(request, attempt_id):
    """Complete a quiz attempt"""
    try:
        attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
        time_taken = request.data.get('time_taken_minutes', 0)
        
        # Calculate score
        correct_answers = attempt.user_answers.filter(is_correct=True)
        attempt.score = sum(answer.question.points for answer in correct_answers)
        attempt.time_taken_minutes = time_taken
        attempt.completed = True
        attempt.completed_at = timezone.now()
        attempt.save()
        
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_200_OK)
    except QuizAttempt.DoesNotExist:
        return Response({'error': 'Quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_results_view(request, attempt_id):
    """Get detailed quiz results"""
    try:
        attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user, completed=True)
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_200_OK)
    except QuizAttempt.DoesNotExist:
        return Response({'error': 'Quiz attempt not found'}, status=status.HTTP_404_NOT_FOUND)
