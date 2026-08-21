list_of_category = [
    "Backpacker",
    "Standard",
    "Luxury"
]

list_of_transportation = [
    "Bus",
    "Train",
    "Flight"
]

def get_list_of_category() -> list[str]:
    return list_of_category

def get_list_of_transportation() -> list[str]:
    return list_of_transportation

def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return list_of_category[0]
    elif budget > 3000:
        return list_of_category[2]
    else:
        return list_of_category[1]

def get_travel_season(month: str) -> str:
    formatted_month = month.strip().lower()
    if formatted_month == "december":
        return "Peak Season"
    elif formatted_month == "june":
        return "Holiday Season"
    else:
        return "Regular Season"

def calculate_daily_budget(budget: float, days: int) -> float:
    if days <= 0:
        return 0.0
    return round(budget / days, 3)

def get_recommended_transportation(category: str) -> str:
    formatted_category = category.strip().lower()
    if formatted_category == "backpacker":
        return list_of_transportation[0]
    elif formatted_category == "standard":
        return list_of_transportation[1]
    else:
        return list_of_transportation[2]

def get_recommended_places(destination: str) -> list[str]:
    recommended_places = {
        "japan": ["Tokyo Tower", "Shibuya", "Mount Fuji"],
        "indonesia": ["Bali", "Yogyakarta", "Raja Ampat"],
        "singapore": ["Marina Bay Sands", "Gardens by the Bay", "Sentosa Island"],
        "korea": ["Namsan Tower", "Myeongdong", "Jeju Island"],
        "thailand": ["Grand Palace", "Wat Arun", "Phuket Beach"],
        "malaysia": ["Petronas Twin Towers", "Batu Caves", "Langkawi"],
        "france": ["Eiffel Tower", "Louvre Museum", "Palace of Versailles"],
        "usa": ["Statue of Liberty", "Central Park", "Grand Canyon"]
    }

    destination_key = destination.strip().lower()
    return recommended_places.get(destination_key, ["City Center", "Local Market", "Popular Landmark"])
