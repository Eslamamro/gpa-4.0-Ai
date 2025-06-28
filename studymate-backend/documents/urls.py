from django.urls import path
from . import views

app_name = 'documents'

urlpatterns = [
    path('', views.DocumentListCreateView.as_view(), name='document_list'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('<int:pk>/process/', views.process_document_view, name='process_document'),
    path('<int:pk>/summaries/', views.DocumentSummaryListView.as_view(), name='document_summaries'),
    path('<int:pk>/generate-summary/', views.generate_summary_view, name='generate_summary'),
] 