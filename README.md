# KelanaAI - 

## Struktur Proyek

```text
KelanaAI/
├── README.md
└── backend/
    ├── main.py                # Presentation Layer (Input/Output Interaktif)
    ├── test_main.py           # Script Pengujian Otomatis
    └── services/
        └── trip_service.py    # Business Logic Layer (Kategori & Rekomendasi)
```

---

## Cara Menjalankan

### 1. Mode Interaktif
Jalankan program utama untuk memasukkan data perjalanan secara interaktif:
```bash
python backend/main.py
```

### 2. Mode Testing (Pengujian Otomatis)
Jalankan pengujian untuk menguji berbagai skenario trip tanpa input manual:
```bash
python backend/test_main.py
```

---

## Contoh Output

```text
========================
KelanaAI
========================

Destination List: 
Destination 1 : Indonesia
Destination 2 : Japan
Days                 : 7
Budget               : 2000.0 USD
Currency             : USD
Travel Month         : December
Total Estimated Cost : 2200.0 USD

Status: Over budget!
------------------------

Trip Category: Standard
Travel Season: Peak Season
Daily Budget: 285.71 USD
Recommended Transportation: Train
Recommended Places:
Indonesia :
 - Bali
 - Yogyakarta
 - Raja Ampat
Japan :
 - Tokyo Tower
 - Shibuya
 - Mount Fuji
```
