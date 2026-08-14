#Ask user for trip details
destination          = str(input("Enter your destination: "))
country              = str(input("Enter your country: "))
days                 = int(input("Enter your days: "))
budget               = float(input("Enter your budget: "))
currency             = str(input("Enter your currency: "))
travel_month         = str(input("Enter your travel month: "))
hotel_cost           = float(input("Enter hotel cost: "))
food_cost            = float(input("Enter food cost: "))
transportation_cost  = float(input("Enter transportation cost: "))
miscellaneous_cost   = float(input("Enter miscellaneous cost: "))

total_cost = hotel_cost + food_cost + transportation_cost + miscellaneous_cost

#Function to print the trip summary
def print_trip_summary(destination, country, days, budget, currency, travel_month, hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost):

    print("========================")
    print("KelanaAI")
    print("========================")
    print(f"Destination          : {destination}")
    print(f"Country              : {country}")
    print(f"Days                 : {days}")
    print(f"Budget               : {budget} {currency}")
    print(f"Currency             : {currency}")
    print(f"Travel Month         : {travel_month}")
    print(f"Total Estimated Cost : {total_cost} {currency}")
    print("------------------------")
    
    if total_cost > budget:
        print("Status: Over budget!")
    elif total_cost < budget:
        print("Status: Under budget!")
    else:
        print("Status: On budget!")

# Call with user inputs
print_trip_summary(
    destination, country, days, budget, currency, travel_month,
    hotel_cost, food_cost, transportation_cost, miscellaneous_cost, total_cost
)



