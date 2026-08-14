from services.trip_service import (
    get_trip_category,
    get_travel_season,
    get_recommended_places,
    get_recommended_transportation,
    calculate_daily_budget
)

def get_user_destination():
    size = int(input("How many destinations do you want to visit: "))
    all_destination = []
    for i in range (size):
        destination_places = input(f"Destination-{i + 1} : ")
        all_destination.append(destination_places)
    return all_destination

def print_user_destinations(destination):
    print("Destination List: ")
    for i in range(len(destination)):
        print(f"Destination {i+1} : {destination[i]}")

def get_user_inputs():
    destination          = get_user_destination()
    days                 = int(input("Enter your days: "))
    budget               = float(input("Enter your budget: "))
    currency             = str(input("Enter your currency: "))
    travel_month         = str(input("Enter your travel month: "))
    hotel_cost           = float(input("Enter hotel cost: "))
    food_cost            = float(input("Enter food cost: "))
    transportation_cost  = float(input("Enter transportation cost: "))
    miscellaneous_cost   = float(input("Enter miscellaneous cost: "))
    total_cost = hotel_cost + food_cost + transportation_cost + miscellaneous_cost
    return destination, days, budget, currency, travel_month, hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost

#Function to print the trip summary
def print_trip_summary(destination, days, budget, currency, travel_month, hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost):

    print("========================")
    print("KelanaAI")
    print("========================\n")

    print_user_destinations(destination)
    print(f"Days                 : {days}")
    print(f"Budget               : {budget} {currency}")
    print(f"Currency             : {currency}")
    print(f"Travel Month         : {travel_month}")
    print(f"Total Estimated Cost : {total_cost} {currency}")
    
    if total_cost > budget:
        print("Status: Over budget!")
    elif total_cost < budget:
        print("Status: Under budget!")
    else:
        print("Status: On budget!")
    
    print("------------------------\n")

# Function that prints the trip service
def print_trip_service(budget, travel_month, days, currency, destination):
    category = get_trip_category(budget)
    season = get_travel_season(travel_month)
    daily_budget = calculate_daily_budget(budget, days)
    recommended_transportation = get_recommended_transportation(category)

    print(f"Trip Category: {category}")
    print(f"Travel Season: {season}")
    print(f"Daily Budget: {daily_budget:.2f} {currency}")
    print(f"Recommended Transportation: {recommended_transportation}")
    print("Recommended Places:")
    for dest in destination:
        print(f"{dest} :")
        places = get_recommended_places(dest)
        for place in places:
            print(f" - {place}")

def main():
    destination, days, budget, currency, travel_month, hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost = get_user_inputs()
    print_trip_summary(destination, days, budget, currency, travel_month, hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost)
    print_trip_service(budget, travel_month, days, currency, destination)

main()
