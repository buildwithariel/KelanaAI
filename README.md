# KelanaAI -  Trip Summary Generator

KelanaAI is a Python console application designed to help users plan, estimate costs, and view their travel trip summaries with budget status indicators.

---

## Project Structure

```text
.
├── README.md
├── backend/
│   └── main.py
└── frontend/
    └── .gitkeep
```

---

## How to Run

Run the main backend script using Python:

```bash
python backend/main.py
```

---

## Test Cases Examples

Below are example calls for testing different budget statuses in `backend/main.py`:

```python
# Case 1: Under budget 
print_trip_summary("Tokyo", "Japan", 5, 1000.0, "USD", "October", 300.0, 200.0, 100.0, 50.0, 650.0)

# Case 2: Over budget
print_trip_summary("Paris", "France", 3, 500.0, "EUR", "July", 400.0, 150.0, 100.0, 50.0, 700.0)

# Case 3: On budget
print_trip_summary("Bali", "Indonesia", 4, 300.0, "USD", "August", 100.0, 100.0, 50.0, 50.0, 300.0)
```
