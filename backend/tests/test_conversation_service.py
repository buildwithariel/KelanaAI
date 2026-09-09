"""Tests for conversation_service pure helpers — no DB, no Bedrock, no KB."""

import unittest

from services import conversation_service as cs


class DistinctSources(unittest.TestCase):
    def test_dedupes_preserving_order(self):
        passages = [{"source": "b"}, {"source": "a"}, {"source": "b"}, {"source": "a"}]
        self.assertEqual(cs._distinct_sources(passages), ["b", "a"])

    def test_empty(self):
        self.assertEqual(cs._distinct_sources([]), [])

    def test_skips_missing_or_falsy_source(self):
        passages = [{"score": 1}, {"source": None}, {"source": ""}, {"source": "x"}]
        self.assertEqual(cs._distinct_sources(passages), ["x"])


class SystemPrompt(unittest.TestCase):
    def test_contract_markers_present(self):
        for marker in ("```trip", "destination", "days", "budget", "travel_style", "CONTEXT"):
            self.assertIn(marker, cs.CONVERSATION_SYSTEM)


if __name__ == "__main__":
    unittest.main()
