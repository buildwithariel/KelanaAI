# KelanaAI

AI-powered travel planning REST API. Membantu pengguna merencanakan perjalanan berdasarkan destinasi, durasi, dan anggaran — lengkap dengan rekomendasi transportasi, musim perjalanan, dan kategori trip.

---

## Tech Stack

- **Python** — Bahasa pemrograman utama
- **FastAPI** — Web framework untuk REST API
- **SQLAlchemy** — ORM untuk interaksi dengan database
- **PostgreSQL** — Database penyimpanan data trip
- **psycopg2** — Driver koneksi PostgreSQL
- **python-dotenv** — Manajemen environment variable
- **Uvicorn** — ASGI server

---

## Struktur Proyek

```text
KelanaAI/
├── README.md
├── .gitignore
└── backend/
    ├── main.py              # Entry point — routing & endpoint API
    ├── database.py          # Konfigurasi koneksi & inisialisasi database
    ├── seed.sql             # Script untuk mengisi data awal (opsional)
    ├── requirements.txt     # Daftar dependencies Python
    ├── .env                 # Environment variable (tidak di-commit)
    ├── models/
    │   └── trip.py          # ORM model untuk tabel trips
    └── services/
        └── trip_service.py  # Business logic (kategori, budget, rekomendasi)
```

---

## Cara Setup & Menjalankan

### 1. Clone & Masuk ke Folder

```bash
git clone <url-repo>
cd KelanaAI/backend
```

### 2. Buat Virtual Environment

```bash
python -m venv .venv
.venv\Scripts\activate   # Windows
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Buat File `.env`

Buat file `backend/.env` dan isi dengan:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/kelana_db
```

> Pastikan database `kelana_db` sudah dibuat terlebih dahulu di PostgreSQL.

### 5. Jalankan Server

```bash
uvicorn main:app --reload
```

Server berjalan di: `http://localhost:8000`

---

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `/` | Health check |
| `GET` | `/docs` | Swagger UI (dokumentasi interaktif) |
| `POST` | `/api/v1/trips` | Buat trip baru |
| `GET` | `/api/v1/trips` | Ambil semua trip |
| `GET` | `/api/v1/trips/{id}` | Ambil trip berdasarkan ID |
| `PUT` | `/api/v1/trips/{id}` | Update budget trip (recalculate otomatis) |
| `DELETE` | `/api/v1/trips/{id}` | Hapus trip berdasarkan ID |
| `GET` | `/api/v1/recommendations` | Rekomendasi tempat wisata |
| `GET` | `/api/v1/transportations` | Daftar transportasi |
| `GET` | `/api/v1/trip-categories` | Daftar kategori trip |

---

## Contoh Request

**POST `/api/v1/trips`**

```json
{
  "destination": "japan",
  "days": 7,
  "budget": 2500,
  "currency": "USD",
  "travel_month": "december",
  "travel_style": "Standard"
}
```

**Response:**

```json
{
  "id": 1,
  "destination": "japan",
  "days": 7,
  "budget": 2500.0,
  "category": "Standard",
  "daily_budget": 357.143,
  "travel_season": "Peak Season",
  "reccomendation_transport": "Train",
  "created_at": "2026-08-21T22:46:24"
}
```
