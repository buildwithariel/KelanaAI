# KelanaAI

Aplikasi perencana perjalanan berbasis AI. Buka asisten chat, sebutkan
destinasi, durasi, dan anggaran; Amazon Bedrock menyusun itinerary harian
(pagi, siang, malam, dengan tempat nyata), lalu satu klik menyimpannya sebagai
trip di PostgreSQL. Jawaban asisten juga di-*ground* ke dokumen perjalanan di
Amazon Bedrock Knowledge Base dan menyebutkan sumbernya.

Berjalan sama di Windows, macOS, dan Linux.

## Tech stack

**Backend**
* Python 3.11+ dengan FastAPI (REST API)
* SQLAlchemy + PostgreSQL lewat `psycopg2`
* `boto3` untuk Amazon Bedrock (Converse API + Knowledge Base retrieval)
* PyJWT + bcrypt untuk autentikasi
* Runner migrasi SQL kecil (`migrate.py`), tanpa Alembic

**Frontend**
* Next.js 16 (App Router) + React 19 + TypeScript
* Tailwind CSS 4

## Fitur

* **Auth**: register / login, JWT bearer token (berlaku 7 hari), setiap data trip
  dan percakapan di-*scope* ke pemiliknya.
* **Asisten** (`/chat`): satu percakapan chat dengan memori (seluruh riwayat
  dikirim tiap giliran) plus grounding ke Knowledge Base. Jawaban dirender
  sebagai markdown, ada tombol salin, dan menampilkan dokumen sumber.
* **Chat ke trip**: saat asisten mengusulkan rencana konkret, muncul kartu
  "Save as trip" yang membuat row `Trip` + itinerary tanpa mengisi ulang form.
* **Sidebar percakapan**: daftar semua percakapan lama, ganti-ganti percakapan,
  buat baru tanpa menghapus yang lama, hapus percakapan.
* **Dashboard** (`/`): ringkasan + trip terbaru. Form perencanaan manual di
  `/plan`.
* **Riwayat trip** (`/trips`, `/trips/{id}`): daftar berpaginasi + detail.
* **Profil** (`/profile`): identitas, "member since", statistik perjalanan
  (jumlah trip, total anggaran, total hari, jumlah destinasi), rincian per
  kategori dan gaya perjalanan.

## Struktur proyek

```text
KelanaAI/
  backend/
    main.py                     # semua route FastAPI
    database.py                  # engine + SessionLocal + init_db
    migrate.py                   # jalankan migrations/*.sql sekali, urut
    migrations/                  # 001 users, 002 trips.user_id, 003 messages.sources
    models/                      # ORM: user, trip, conversation + message
    services/
      auth_service.py            # hash password, JWT, cek kepemilikan
      trip_service.py            # kategori, musim, budget harian, rekomendasi
      bedrock_service.py         # prompt + panggilan Bedrock Converse
      kb_service.py              # retrieval Knowledge Base (RAG)
      conversation_service.py    # orkestrasi memori + grounding
    tests/                       # unittest: pure functions + API (SQLite terisolasi)
  frontend/
    app/
      page.tsx                   # dashboard
      plan/page.tsx              # form perencanaan
      chat/page.tsx              # asisten + sidebar percakapan
      trips/, profile/, login/, register/
      lib/                       # api base, auth fetch, tipe, parser itinerary + markdown
    components/                  # Nav, ChatSidebar, Markdown, TripProposalCard, ...
```

## Prasyarat

* PostgreSQL berjalan, dengan database kosong bernama `kelana_db`
* Python 3.11 atau lebih baru
* Node.js 22 LTS (Next.js 16 butuh minimal 20.9; `npm test` butuh 22.6+)
* Kredensial AWS dengan akses Bedrock (Nova Lite) dan, untuk chat yang
  ter-*ground*, sebuah Bedrock Knowledge Base

## Setup dan menjalankan

Backend dan frontend adalah dua proses; buka dua terminal.

### 1. Backend

```bash
cd backend
python -m venv .venv
```

Aktifkan virtualenv:

```bash
# macOS / Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (cmd)
.venv\Scripts\activate.bat
```

```bash
pip install -r requirements.txt
```

Buat `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kelana_db

# minimal 32 karakter; server menolak start kalau kosong
JWT_SECRET_KEY=ganti-dengan-string-acak-panjang-minimal-32-char

AWS_REGION=ap-southeast-2
MODEL_ID=amazon.nova-lite-v1:0

# salah satu: bearer token Bedrock ATAU pasangan access key biasa
AWS_BEARER_TOKEN_BEDROCK=...
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...

# untuk chat yang ter-ground; tanpa ini chat tetap jalan tapi tidak mengutip dokumen
KNOWLEDGE_BASE_ID=...
```

Jalankan migrasi lalu server:

```bash
python migrate.py
uvicorn main:app --reload
```

API di `http://localhost:8000`, Swagger UI di `http://localhost:8000/docs`.

### 2. Frontend

Di terminal lain:

```bash
cd frontend
npm install
npm run dev
```

Buka `http://localhost:3000`. Frontend memanggil `http://localhost:8000` secara
default; override dengan `NEXT_PUBLIC_API_URL`.

## Tes

```bash
# backend (dari backend/, venv aktif)
python -m unittest discover -s tests

# frontend (dari frontend/)
npm test
```

Tes backend memakai SQLite sementara di direktori temp OS, jadi database
`kelana_db` tidak tersentuh. Panggilan Bedrock nyata (generate itinerary, kirim
pesan chat) dan retrieval Knowledge Base tidak ikut dites.

## Route frontend

| Route | Isi |
|---|---|
| `/` | Dashboard: ringkasan + trip terbaru |
| `/plan` | Form perencanaan trip manual |
| `/chat` | Asisten (memori + grounding) dengan sidebar percakapan |
| `/trips`, `/trips/{id}` | Riwayat trip berpaginasi + detail |
| `/profile` | Akun + statistik perjalanan |
| `/login`, `/register` | Autentikasi |
| `/assistant` | Redirect ke `/chat` (kompatibilitas link lama) |

## API endpoints

Semua route `/api/v1/...` selain auth butuh header `Authorization: Bearer <token>`.

| Method | Endpoint | Fungsi |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/v1/auth/register` | Buat akun (password 8 sampai 72 karakter) |
| `POST` | `/api/v1/auth/login` | Tukar email + password dengan bearer token |
| `GET` | `/api/v1/auth/me` | Profil ringkas: id, nama, email, jumlah trip, tanggal daftar |
| `POST` | `/api/v1/trips` | Buat trip baru (kategori, musim, budget harian dihitung) |
| `GET` | `/api/v1/trips` | Semua trip milik user |
| `GET` | `/api/v1/trips/{id}` | Satu trip (404 kalau tak ada, 403 kalau bukan milik user) |
| `PUT` | `/api/v1/trips/{id}` | Ubah budget, kategori dan budget harian dihitung ulang |
| `POST` | `/api/v1/trips/{id}/generate` | Isi `ai_recommendation` lewat Bedrock |
| `DELETE` | `/api/v1/trips/{id}` | Hapus trip |
| `POST` | `/api/v1/conversations` | Mulai percakapan baru |
| `GET` | `/api/v1/conversations` | Daftar percakapan user, terbaru dulu |
| `DELETE` | `/api/v1/conversations/{id}` | Hapus percakapan dan semua pesannya |
| `GET` | `/api/v1/conversations/{id}/messages` | Muat riwayat satu percakapan |
| `POST` | `/api/v1/conversations/{id}/messages` | Kirim pesan: simpan, retrieve KB, panggil Bedrock, simpan + balas |
| `GET` | `/api/v1/recommendations?destination=...` | Rekomendasi tempat wisata |
| `GET` | `/api/v1/transportations` | Daftar moda transportasi |
| `GET` | `/api/v1/trip-categories` | Daftar kategori trip |

## Contoh

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

**Response**

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

Lalu **POST `/api/v1/trips/1/generate`** mengisi `ai_recommendation` dengan
itinerary markdown per hari dan menyimpannya.

Untuk chat: **POST `/api/v1/conversations`** untuk dapat `conversation_id`, lalu
**POST `/api/v1/conversations/{id}/messages`** dengan `{"content": "..."}`. Balasan
asisten membawa `sources` (daftar nama dokumen) dan, kalau rencananya sudah
konkret, sebuah blok ```` ```trip ```` di akhir teks yang dipakai frontend untuk
kartu "Save as trip".
