from rest_framework import serializers
from .models import Quiz, Question, Answer, QuizAttempt, UserAnswer

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'order_index']
        read_only_fields = ['id']

class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'question_type', 'explanation', 'difficulty', 
            'points', 'order_index', 'answers', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class QuestionListSerializer(serializers.ModelSerializer):
    answer_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'question_type', 'difficulty', 
            'points', 'order_index', 'answer_count'
        ]
    
    def get_answer_count(self, obj):
        return obj.answers.count()

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.ReadOnlyField()
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'user', 'title', 'description', 'document', 
            'difficulty_level', 'time_limit_minutes', 'is_public', 
            'is_active', 'question_count', 'questions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'question_count', 'created_at', 'updated_at']

class QuizListSerializer(serializers.ModelSerializer):
    question_count = serializers.ReadOnlyField()
    user = serializers.StringRelatedField(read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'user', 'title', 'description', 'difficulty_level', 
            'time_limit_minutes', 'question_count', 'created_at'
        ]

class UserAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    selected_answer_text = serializers.CharField(source='selected_answer.text', read_only=True)
    
    class Meta:
        model = UserAnswer
        fields = [
            'id', 'question', 'question_text', 'selected_answer', 
            'selected_answer_text', 'text_answer', 'is_correct', 
            'time_spent_seconds', 'answered_at'
        ]
        read_only_fields = ['id', 'answered_at']

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    user_answers = UserAnswerSerializer(many=True, read_only=True)
    percentage_score = serializers.ReadOnlyField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'score', 'total_points', 
            'time_taken_minutes', 'percentage_score', 'completed', 
            'user_answers', 'started_at', 'completed_at'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'percentage_score']

class QuizAttemptListSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    percentage_score = serializers.ReadOnlyField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'score', 'total_points', 
            'percentage_score', 'completed', 'started_at', 'completed_at'
        ] 