"""Tests for kb_service helpers - no network, no Bedrock."""

import unittest

from services import kb_service as kb


class SourceName(unittest.TestCase):
    def test_each_location_type(self):
        self.assertEqual(
            kb._source_name({"s3Location": {"uri": "s3://bucket/docs/Japan-Packing-List.pdf"}}),
            "Japan-Packing-List.pdf",
        )
        self.assertEqual(
            kb._source_name({"webLocation": {"url": "https://example.com/a/guide.html"}}),
            "guide.html",
        )
        self.assertEqual(
            kb._source_name({"confluenceLocation": {"url": "https://x/wiki/KyotoGuide"}}),
            "KyotoGuide",
        )
        self.assertEqual(
            kb._source_name({"sharePointLocation": {"url": "https://x/sites/Trip.docx"}}),
            "Trip.docx",
        )

    def test_missing_and_none(self):
        self.assertEqual(kb._source_name({}), "unknown source")
        self.assertEqual(kb._source_name(None), "unknown source")
        self.assertEqual(kb._source_name({"s3Location": {}}), "unknown source")

    def test_trailing_slash_falls_back_to_full_uri(self):
        self.assertEqual(
            kb._source_name({"s3Location": {"uri": "s3://bucket/"}}),
            "s3://bucket/",
        )


class GroundedPrompt(unittest.TestCase):
    def test_has_placeholders(self):
        self.assertIn("{context}", kb._GROUNDED_PROMPT)
        self.assertIn("{question}", kb._GROUNDED_PROMPT)


if __name__ == "__main__":
    unittest.main()
