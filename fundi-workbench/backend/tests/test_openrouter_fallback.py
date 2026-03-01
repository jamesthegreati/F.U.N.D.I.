"""Tests for OpenRouter fallback LLM provider integration."""

import json
import unittest
from unittest.mock import MagicMock, patch

from app.core.config import Settings
from app.services.ai_generator import (
    _OpenRouterClient,
    _OpenRouterModels,
    _OpenRouterResponse,
    _openrouter_client,
)


class TestOpenRouterResponse(unittest.TestCase):
    def test_text_attribute(self):
        resp = _OpenRouterResponse("hello")
        self.assertEqual(resp.text, "hello")


class TestOpenRouterModels(unittest.TestCase):
    def test_convert_contents_simple_text(self):
        contents = [{"role": "user", "parts": [{"text": "Hello"}]}]
        config = {"system_instruction": "You are a bot", "temperature": 0.5}
        messages = _OpenRouterModels._convert_contents(contents, config)
        self.assertEqual(messages[0], {"role": "system", "content": "You are a bot"})
        self.assertEqual(messages[1], {"role": "user", "content": "Hello"})

    def test_convert_contents_model_role_becomes_assistant(self):
        contents = [{"role": "model", "parts": [{"text": "hi"}]}]
        messages = _OpenRouterModels._convert_contents(contents, {})
        self.assertEqual(messages[0]["role"], "assistant")

    def test_convert_contents_multimodal(self):
        contents = [
            {
                "role": "user",
                "parts": [
                    {"text": "Describe this"},
                    {"inline_data": {"mime_type": "image/png", "data": "abc123"}},
                ],
            }
        ]
        messages = _OpenRouterModels._convert_contents(contents, {})
        content = messages[0]["content"]
        self.assertIsInstance(content, list)
        self.assertEqual(content[0]["type"], "text")
        self.assertEqual(content[1]["type"], "image_url")
        self.assertIn("data:image/png;base64,abc123", content[1]["image_url"]["url"])

    def test_convert_contents_no_system_instruction(self):
        contents = [{"role": "user", "parts": [{"text": "hi"}]}]
        messages = _OpenRouterModels._convert_contents(contents, {})
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0]["role"], "user")


class TestOpenRouterClient(unittest.TestCase):
    def test_client_has_models(self):
        client = _OpenRouterClient(api_key="test-key")
        self.assertIsInstance(client.models, _OpenRouterModels)


class TestOpenRouterClientFactory(unittest.TestCase):
    @patch("app.services.ai_generator.settings")
    def test_returns_none_when_key_missing(self, mock_settings):
        mock_settings.OPENROUTER_API_KEY = None
        self.assertIsNone(_openrouter_client())

    @patch("app.services.ai_generator.settings")
    def test_returns_none_when_key_placeholder(self, mock_settings):
        mock_settings.OPENROUTER_API_KEY = "your_api_key_here"
        self.assertIsNone(_openrouter_client())

    @patch("app.services.ai_generator.settings")
    def test_returns_client_when_key_valid(self, mock_settings):
        mock_settings.OPENROUTER_API_KEY = "sk-or-real-key"
        client = _openrouter_client()
        self.assertIsNotNone(client)
        self.assertIsInstance(client, _OpenRouterClient)


class TestSettingsProviderValidation(unittest.TestCase):
    def test_validate_api_key_with_gemini_only(self):
        s = Settings(GEMINI_API_KEY="real-key", OPENROUTER_API_KEY=None)
        self.assertTrue(s.validate_api_key())
        self.assertTrue(s.validate_gemini_key())
        self.assertFalse(s.validate_openrouter_key())

    def test_validate_api_key_with_openrouter_only(self):
        s = Settings(GEMINI_API_KEY=None, OPENROUTER_API_KEY="sk-or-real-key")
        self.assertTrue(s.validate_api_key())
        self.assertFalse(s.validate_gemini_key())
        self.assertTrue(s.validate_openrouter_key())

    def test_validate_api_key_with_both(self):
        s = Settings(GEMINI_API_KEY="key1", OPENROUTER_API_KEY="key2")
        self.assertTrue(s.validate_api_key())

    def test_validate_api_key_with_neither(self):
        s = Settings(GEMINI_API_KEY=None, OPENROUTER_API_KEY=None)
        self.assertFalse(s.validate_api_key())


class TestGenerateCircuitFallback(unittest.TestCase):
    """Test that generate_circuit falls back to OpenRouter when Gemini is unavailable."""

    def test_raises_when_no_provider(self):
        from app.services.ai_generator import generate_circuit

        with patch("app.services.ai_generator.settings") as mock_settings:
            mock_settings.GEMINI_API_KEY = None
            mock_settings.OPENROUTER_API_KEY = None
            mock_settings.GEMINI_MODEL = ""
            mock_settings.OPENROUTER_MODEL = "google/gemini-2.0-flash-001"

            with self.assertRaises(RuntimeError) as ctx:
                generate_circuit("blink an LED")
            self.assertIn("No LLM provider", str(ctx.exception))


if __name__ == "__main__":
    unittest.main()
