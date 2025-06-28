from django.urls import path
from . import views

app_name = 'flashcards'

urlpatterns = [
    path('sets/', views.FlashcardSetListCreateView.as_view(), name='flashcard_set_list'),
    path('sets/<int:pk>/', views.FlashcardSetDetailView.as_view(), name='flashcard_set_detail'),
    path('sets/<int:set_id>/cards/', views.FlashcardListCreateView.as_view(), name='flashcard_list'),
    path('cards/<int:pk>/', views.FlashcardDetailView.as_view(), name='flashcard_detail'),
    path('sets/<int:set_id>/study/', views.start_study_session_view, name='start_study_session'),
    path('sessions/<int:session_id>/review/', views.review_card_view, name='review_card'),
    path('sessions/<int:session_id>/complete/', views.complete_study_session_view, name='complete_study_session'),
] 