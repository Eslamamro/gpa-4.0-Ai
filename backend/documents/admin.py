from django.contrib import admin
from .models import Document, DocumentTag, DocumentShare, DocumentProcessingLog

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'document_type', 'file_size_mb', 'status', 'is_public', 'created_at')
    list_filter = ('document_type', 'status', 'is_public', 'created_at')
    search_fields = ('title', 'description', 'tags', 'user__email', 'user__username')
    ordering = ('-created_at',)
    readonly_fields = ('file_size', 'file_size_mb', 'document_type', 'file_extension', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'title', 'description', 'file')
        }),
        ('File Information', {
            'fields': ('document_type', 'file_size', 'file_size_mb', 'file_extension')
        }),
        ('Status & Visibility', {
            'fields': ('status', 'is_public')
        }),
        ('Metadata', {
            'fields': ('tags', 'extracted_text', 'page_count')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def file_extension(self, obj):
        return obj.file_extension
    file_extension.short_description = 'File Extension'


@admin.register(DocumentTag)
class DocumentTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'created_at')
    search_fields = ('name',)
    ordering = ('name',)
    
    fieldsets = (
        ('Tag Information', {
            'fields': ('name', 'color')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ('created_at',)


@admin.register(DocumentShare)
class DocumentShareAdmin(admin.ModelAdmin):
    list_display = ('document', 'shared_by', 'shared_with', 'can_edit', 'created_at')
    list_filter = ('can_edit', 'created_at')
    search_fields = ('document__title', 'shared_by__email', 'shared_with__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Share Information', {
            'fields': ('document', 'shared_by', 'shared_with')
        }),
        ('Permissions', {
            'fields': ('can_edit', 'message')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(DocumentProcessingLog)
class DocumentProcessingLogAdmin(admin.ModelAdmin):
    list_display = ('document', 'operation', 'status', 'created_at')
    list_filter = ('operation', 'status', 'created_at')
    search_fields = ('document__title', 'operation', 'message')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Processing Information', {
            'fields': ('document', 'operation', 'status')
        }),
        ('Details', {
            'fields': ('message',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


# Customize the admin interface
admin.site.site_header = 'GPA Document Management'
admin.site.site_title = 'GPA Admin'
admin.site.index_title = 'Welcome to GPA Document Management'
