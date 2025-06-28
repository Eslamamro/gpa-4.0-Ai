from django.urls import path
from . import views

app_name = 'quizzes'

urlpatterns = [
    path('', views.QuizListCreateView.as_view(), name='quiz_list'),
    path('<int:pk>/', views.QuizDetailView.as_view(), name='quiz_detail'),
    path('<int:quiz_id>/questions/', views.QuestionListCreateView.as_view(), name='question_list'),
    path('questions/<int:pk>/', views.QuestionDetailView.as_view(), name='question_detail'),
    path('<int:quiz_id>/start/', views.start_quiz_attempt_view, name='start_quiz_attempt'),
    path('attempts/<int:attempt_id>/answer/', views.submit_answer_view, name='submit_answer'),
    path('attempts/<int:attempt_id>/complete/', views.complete_quiz_attempt_view, name='complete_quiz_attempt'),
    path('attempts/<int:attempt_id>/results/', views.quiz_results_view, name='quiz_results'),
] 