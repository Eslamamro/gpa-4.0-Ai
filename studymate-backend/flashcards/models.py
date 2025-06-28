from django.db import models
from django.conf import settings

class FlashcardSet(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flashcard_sets')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    document = models.ForeignKey('documents.Document', on_delete=models.SET_NULL, null=True, blank=True, related_name='flashcard_sets')
    is_public = models.BooleanField(default=False)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )
    color_theme = models.CharField(max_length=7, default='#8B5CF6')  # Purple default
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.email}"

    @property
    def card_count(self):
        return self.flashcards.count()

    class Meta:
        ordering = ['-created_at']

class Flashcard(models.Model):
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='flashcards')
    question = models.TextField()
    answer = models.TextField()
    hint = models.TextField(blank=True)
    difficulty = models.IntegerField(
        choices=[(1, 'Easy'), (2, 'Medium'), (3, 'Hard')],
        default=2
    )
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.question[:50]}... - {self.flashcard_set.title}"

    class Meta:
        ordering = ['order_index', 'created_at']

class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_sessions')
    flashcard_set = models.ForeignKey(FlashcardSet, on_delete=models.CASCADE, related_name='study_sessions')
    total_cards_studied = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    duration_minutes = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Study session: {self.flashcard_set.title} - {self.user.email}"

    @property
    def accuracy_percentage(self):
        if self.total_cards_studied == 0:
            return 0
        return round((self.correct_answers / self.total_cards_studied) * 100, 2)

    class Meta:
        ordering = ['-started_at']

class CardReview(models.Model):
    study_session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='card_reviews')
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='reviews')
    is_correct = models.BooleanField()
    time_spent_seconds = models.PositiveIntegerField(default=0)
    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "Correct" if self.is_correct else "Incorrect"
        return f"{self.flashcard.question[:30]}... - {status}"

    class Meta:
        ordering = ['-reviewed_at']
