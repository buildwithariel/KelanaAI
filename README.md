# KelanaAI

AI-native travel planning app. Isi destinasi, durasi, dan anggaran — Amazon Bedrock menyusun itinerary harian (morning/afternoon/evening, situs budaya, dinner spot, nightlife), disimpan ke PostgreSQL lewat FastAPI, dan ditampilkan di dashboard Next.js dengan riwayat trip yang bisa dibuka satu per satu.

---

## Tech Stack

**Backend**
- **Python** + **FastAPI** — REST API
- **SQLAlchemy** + **PostgreSQL** (`psycopg2`) — persistence
- **boto3** — Amazon Bedrock (Converse API) untuk generate itinerary
- **python-dotenv**, **Uvicorn**

**Frontend**
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**

---

## Struktur Proyek

```text
KelanaAI/
├── README.md
├── .gitignore
├── backend/
│   ├── main.py                    # Entry point — routing & endpoint API
│   ├── database.py                # Konfigurasi koneksi & inisialisasi database
│   ├── requirements.txt
│   ├── .env                       # Environment variable (tidak di-commit)
│   ├── models/
│   │   └── trip.py                # ORM model tabel `trips`
│   └── services/
│       ├── trip_service.py        # Business logic (kategori, budget, rekomendasi)
│       └── bedrock_service.py     # Prompt & panggilan Amazon Bedrock
└── frontend/
    ├── app/
    │   ├── page.tsx                # Halaman utama — form & hasil itinerary
    │   ├── trips/page.tsx          # Trip History Dashboard (paginated)
    │   ├── trips/[id]/page.tsx     # Detail satu trip
    │   └── lib/                    # API base URL, tipe Trip, parser itinerary
    └── components/                 # Nav, TripCard, Board, ItineraryDays
```

---

## Cara Setup & Menjalankan

Backend dan frontend jalan sebagai dua proses terpisah — buka 2 terminal.

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Buat `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/kelana_db

AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0
AWS_BEARER_TOKEN_BEDROCK=<bedrock-api-key-kamu>
```

> Pastikan database `kelana_db` sudah dibuat di PostgreSQL, dan kamu punya Bedrock API key (atau kredensial AWS biasa) dengan akses ke model di atas.

Jalankan:

```bash
uvicorn main:app --reload
```

Server: `http://localhost:8000` — Swagger UI di `http://localhost:8000/docs`.

### 2. Frontend (Next.js)

Di terminal lain:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000`. Frontend memanggil backend di `http://localhost:8000` secara default (override lewat `NEXT_PUBLIC_API_URL` kalau perlu).

---

## Halaman Frontend

| Route | Isi |
|-------|-----|
| `/` | Form rencana trip + hasil itinerary yang baru dibuat |
| `/trips` | Trip History Dashboard — semua trip sebagai kartu, 10 per halaman |
| `/trips/{id}` | Detail satu trip: stats + itinerary harian lengkap |

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
| `POST` | `/api/v1/trips/{id}/generate` | Generate itinerary via Amazon Bedrock, simpan ke `ai_recommendation` |
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
  "travel_style": "Solo"
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
  "travel_style": "Solo",
  "ai_recommendation": null,
  "created_at": "2026-08-21T22:46:24"
}
```

**POST `/api/v1/trips/1/generate`** mengisi `ai_recommendation` dengan itinerary markdown per hari (Morning/Afternoon/Evening) dan menyimpannya ke database.
