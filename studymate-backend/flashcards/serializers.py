from rest_framework import serializers
from .models import FlashcardSet, Flashcard, StudySession, CardReview

class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ['id', 'question', 'answer', 'hint', 'difficulty', 'order_index', 'created_at']
        read_only_fields = ['id', 'created_at']

class FlashcardSetSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)
    card_count = serializers.ReadOnlyField()
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FlashcardSet
        fields = [
            'id', 'user', 'title', 'description', 'document', 
            'is_public', 'difficulty_level', 'color_theme', 
            'card_count', 'flashcards', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'card_count', 'created_at', 'updated_at']

class FlashcardSetListSerializer(serializers.ModelSerializer):
    card_count = serializers.ReadOnlyField()
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = FlashcardSet
        fields = [
            'id', 'user', 'title', 'description', 'difficulty_level', 
            'color_theme', 'card_count', 'created_at'
        ]

class StudySessionSerializer(serializers.ModelSerializer):
    flashcard_set_title = serializers.CharField(source='flashcard_set.title', read_only=True)
    accuracy_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = StudySession
        fields = [
            'id', 'flashcard_set', 'flashcard_set_title', 'total_cards_studied', 
            'correct_answers', 'duration_minutes', 'accuracy_percentage', 
            'completed', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'accuracy_percentage']

class CardReviewSerializer(serializers.ModelSerializer):
    flashcard_question = serializers.CharField(source='flashcard.question', read_only=True)
    
    class Meta:
        model = CardReview
        fields = [
            'id', 'flashcard', 'flashcard_question', 'is_correct', 
            'time_spent_seconds', 'reviewed_at'
        ]
        read_only_fields = ['id', 'reviewed_at'] 