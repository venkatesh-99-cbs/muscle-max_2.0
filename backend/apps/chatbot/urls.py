from django.urls import path

from apps.chatbot.views import AskChatbotView

urlpatterns = [
    path("ask/", AskChatbotView.as_view(), name="chatbot-ask"),
]
