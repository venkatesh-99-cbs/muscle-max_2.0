"""Tests for the local Ollama chat client; no real HTTP requests are made."""
from unittest.mock import Mock, patch

from django.test import TestCase

from apps.chatbot.llm_client import AllModelsFailedError, chat_with_fallback


def _mock_response(status_code=200, json_data=None):
    response = Mock()
    response.status_code = status_code
    response.text = "model unavailable" if status_code >= 400 else ""
    response.json.return_value = json_data or {}
    return response


class ChatWithFallbackTests(TestCase):
    @patch("apps.chatbot.llm_client.requests.post")
    def test_returns_ollama_answer_and_model_name(self, mock_post):
        mock_post.return_value = _mock_response(
            json_data={"message": {"content": "Whey Protein is our best seller."}}
        )

        answer, model_used = chat_with_fallback([{"role": "user", "content": "hi"}])

        self.assertEqual(answer, "Whey Protein is our best seller.")
        self.assertEqual(model_used, "qwen2.5:3b")
        self.assertEqual(mock_post.call_count, 1)

    @patch("apps.chatbot.llm_client.requests.post")
    def test_raises_when_ollama_returns_an_error(self, mock_post):
        mock_post.return_value = _mock_response(status_code=503)

        with self.assertRaises(AllModelsFailedError):
            chat_with_fallback([{"role": "user", "content": "hi"}])

    @patch("apps.chatbot.llm_client.requests.post")
    def test_raises_when_ollama_response_is_invalid(self, mock_post):
        mock_post.return_value = _mock_response(json_data={})

        with self.assertRaises(AllModelsFailedError):
            chat_with_fallback([{"role": "user", "content": "hi"}])
