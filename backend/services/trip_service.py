def get_trip_category (budget:float) -> str :
    if budget < 1000:
        return "Backpacker"
    elif budget > 3000:
        return "Luxury"
    else:
        return "Standard"

def get_travel_season (month:str) ->str:
    formatted_month = month.strip().lower()
    if formatted_month == "december":
        return "Peak Season"
    elif formatted_month == "june":
        return "Holiday Season"
    else:
        return "Regular Season" 

def calculate_daily_budget (budget:float, days:int) -> float:
    if days <=0:
        return 0.0
    return budget / days

def get_recommended_transportation(category:str) -> str:
    formatted_category = category.strip().lower()
    if formatted_category == "backpacker":
        return "Bus"
    elif formatted_category == "standard":
        return "Train"
    else:
        return "Flight"

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
