"""Pure-function tests for trip_service — no DB, no network."""

import unittest

from services import trip_service as svc


class TripCategory(unittest.TestCase):
    def test_boundaries(self):
        self.assertEqual(svc.get_trip_category(999), "Backpacker")
        self.assertEqual(svc.get_trip_category(1000), "Standard")   # not < 1000
        self.assertEqual(svc.get_trip_category(3000), "Standard")   # not > 3000
        self.assertEqual(svc.get_trip_category(3001), "Luxury")
        self.assertEqual(svc.get_trip_category(0), "Backpacker")


class TravelSeason(unittest.TestCase):
    def test_known_and_casing(self):
        self.assertEqual(svc.get_travel_season("december"), "Peak Season")
        self.assertEqual(svc.get_travel_season("  DECEMBER  "), "Peak Season")
        self.assertEqual(svc.get_travel_season("June"), "Holiday Season")
        self.assertEqual(svc.get_travel_season("march"), "Regular Season")
        self.assertEqual(svc.get_travel_season(""), "Regular Season")


class DailyBudget(unittest.TestCase):
    def test_normal_and_edges(self):
        self.assertEqual(svc.calculate_daily_budget(2500, 7), round(2500 / 7, 3))
        self.assertEqual(svc.calculate_daily_budget(1000, 0), 0.0)
        self.assertEqual(svc.calculate_daily_budget(1000, -5), 0.0)
        self.assertEqual(svc.calculate_daily_budget(100, 3), 33.333)


class RecommendedTransport(unittest.TestCase):
    def test_mapping_and_casing(self):
        self.assertEqual(svc.get_recommended_transportation("Backpacker"), "Bus")
        self.assertEqual(svc.get_recommended_transportation("  standard "), "Train")
        self.assertEqual(svc.get_recommended_transportation("Luxury"), "Flight")
        self.assertEqual(svc.get_recommended_transportation("anything else"), "Flight")


class RecommendedPlaces(unittest.TestCase):
    def test_known_unknown_casing(self):
        self.assertEqual(len(svc.get_recommended_places("japan")), 3)
        self.assertEqual(svc.get_recommended_places("  JAPAN "), svc.get_recommended_places("japan"))
        self.assertEqual(
            svc.get_recommended_places("narnia"),
            ["City Center", "Local Market", "Popular Landmark"],
        )


class Lists(unittest.TestCase):
    def test_static_lists(self):
        self.assertEqual(svc.get_list_of_category(), ["Backpacker", "Standard", "Luxury"])
        self.assertEqual(svc.get_list_of_transportation(), ["Bus", "Train", "Flight"])


if __name__ == "__main__":
    unittest.main()
