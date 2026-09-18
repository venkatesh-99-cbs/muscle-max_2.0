from django.contrib import admin

from apps.chatbot.models import BusinessInfo, KnowledgeChunk


@admin.register(BusinessInfo)
class BusinessInfoAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "updated_at")
    list_filter = ("category",)
    search_fields = ("title", "content")


@admin.register(KnowledgeChunk)
class KnowledgeChunkAdmin(admin.ModelAdmin):
    list_display = ("source_type", "source_id", "updated_at")
    list_filter = ("source_type",)
    search_fields = ("text",)
    readonly_fields = ("embedding",)
