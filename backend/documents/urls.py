from django.urls import path
from . import views

urlpatterns = [
    # Document management
    path('documents/', views.DocumentListView.as_view(), name='document_list'),
    path('documents/<int:pk>/', views.DocumentDetailView.as_view(), name='document_detail'),
    path('documents/<int:pk>/download/', views.DocumentDownloadView.as_view(), name='document_download'),
    
    # Document statistics
    path('documents/stats/', views.DocumentStatsView.as_view(), name='document_stats'),
    
    # Document tags
    path('tags/', views.DocumentTagListView.as_view(), name='document_tag_list'),
    path('tags/<int:pk>/', views.DocumentTagDetailView.as_view(), name='document_tag_detail'),
    
    # Document sharing
    path('documents/<int:document_id>/share/', views.DocumentShareView.as_view(), name='document_share'),
    path('shares/', views.DocumentShareListView.as_view(), name='document_share_list'),
    
    # Document processing logs
    path('documents/<int:document_id>/logs/', views.DocumentProcessingLogView.as_view(), name='document_processing_log'),
    
    # Public documents
    path('public-documents/', views.PublicDocumentListView.as_view(), name='public_document_list'),
] 