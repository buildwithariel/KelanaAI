from main import print_trip_summary, print_trip_service

def run_test_cases():
    test_cases = [
        {
            "name": "Test Case 1: Standard Trip (Multi Destination)",
            "destination": ["Indonesia", "Japan"],
            "days": 7,
            "budget": 2000.0,
            "currency": "USD",
            "travel_month": "December",
            "hotel_cost": 1000.0,
            "food_cost": 600.0,
            "transportation_cost": 400.0,
            "miscellaneous_cost": 200.0
        },
        {
            "name": "Test Case 2: Backpacker Trip (Under Budget)",
            "destination": ["Thailand"],
            "days": 5,
            "budget": 800.0,
            "currency": "USD",
            "travel_month": "June",
            "hotel_cost": 200.0,
            "food_cost": 150.0,
            "transportation_cost": 100.0,
            "miscellaneous_cost": 50.0
        },
        {
            "name": "Test Case 3: Luxury Trip (On Budget)",
            "destination": ["France"],
            "days": 10,
            "budget": 5000.0,
            "currency": "EUR",
            "travel_month": "March",
            "hotel_cost": 2500.0,
            "food_cost": 1200.0,
            "transportation_cost": 800.0,
            "miscellaneous_cost": 500.0
        }
    ]

    for tc in test_cases:
        print(f">>> {tc['name']} <<<")
        total_cost = (
            tc['hotel_cost']
            + tc['food_cost']
            + tc['transportation_cost']
            + tc['miscellaneous_cost']
        )
        print_trip_summary(
            tc['destination'], tc['days'], tc['budget'], tc['currency'],
            tc['travel_month'], tc['hotel_cost'], tc['food_cost'],
            tc['transportation_cost'], tc['miscellaneous_cost'], total_cost
        )
        print_trip_service(
            tc['budget'], tc['travel_month'], tc['days'],
            tc['currency'], tc['destination']
        )
        print("\n" + "="*40 + "\n")

run_test_cases()
