import unittest
from unittest.mock import patch

from backend.app import create_app


class AppTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    def test_homepage_renders(self):
        response = self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn("AI Study Assistant", response.get_data(as_text=True))

    def test_health_route(self):
        response = self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "ok")

    @patch("backend.app.generate_summary")
    def test_summary_endpoint_returns_json(self, mock_generate_summary):
        mock_generate_summary.return_value = {
            "summary": "Mock summary",
            "key_points": ["Point one", "Point two"],
            "keywords": ["machine learning"],
        }

        response = self.client.post(
            "/generate-summary",
            json={"text": "A short sample chapter about machine learning."},
        )

        data = response.get_json()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(data["summary"], "Mock summary")


if __name__ == "__main__":
    unittest.main()