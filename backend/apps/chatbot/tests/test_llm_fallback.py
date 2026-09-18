"""
Verifies the OpenRouter fallback behavior in llm_client.py without
making real network calls — the primary model is mocked to fail, and
the test asserts the client moves on to the next configured model.

Run: docker compose exec backend python manage.py test apps.chatbot.tests.test_llm_fallback
"""
from unittest.mock import Mock, patch

from django.test import TestCase, override_settings

from apps.chatbot.llm_client import AllModelsFailedError, chat_with_fallback


def _mock_response(status_code=200, json_data=None):
    resp = Mock()
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    if status_code >= 400:
        import requests

        resp.raise_for_status.side_effect = requests.HTTPError(f"HTTP {status_code}")
    else:
        resp.raise_for_status.side_effect = None
    return resp


@override_settings(
    OPENROUTER_API_KEY="test-key",
    OPENROUTER_PRIMARY_MODEL="vendor/primary-model",
    OPENROUTER_FALLBACK_MODELS=["vendor/fallback-model"],
    OPENROUTER_FREE_FALLBACK_MODEL="vendor/free-model",
)
class ChatWithFallbackTests(TestCase):
    @patch("apps.chatbot.llm_client.requests.post")
    def test_falls_back_when_primary_is_rate_limited(self, mock_post):
        rate_limited = _mock_response(status_code=429)
        success = _mock_response(
            status_code=200,
            json_data={"choices": [{"message": {"content": "Whey Protein is our best seller."}}]},
        )
        mock_post.side_effect = [rate_limited, success]

        answer, model_used = chat_with_fallback([{"role": "user", "content": "hi"}])

        self.assertEqual(answer, "Whey Protein is our best seller.")
        self.assertEqual(model_used, "vendor/fallback-model")
        self.assertEqual(mock_post.call_count, 2)

    @patch("apps.chatbot.llm_client.requests.post")
    def test_falls_through_to_free_model_when_primary_and_fallback_fail(self, mock_post):
        unavailable = _mock_response(status_code=503)
        success = _mock_response(
            status_code=200,
            json_data={"choices": [{"message": {"content": "answer from free model"}}]},
        )
        mock_post.side_effect = [unavailable, unavailable, success]

        answer, model_used = chat_with_fallback([{"role": "user", "content": "hi"}])

        self.assertEqual(model_used, "vendor/free-model")
        self.assertEqual(answer, "answer from free model")

    @patch("apps.chatbot.llm_client.requests.post")
    def test_raises_when_every_model_fails(self, mock_post):
        mock_post.return_value = _mock_response(status_code=429)

        with self.assertRaises(AllModelsFailedError):
            chat_with_fallback([{"role": "user", "content": "hi"}])
