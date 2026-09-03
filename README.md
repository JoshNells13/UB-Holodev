# 🌱 TANIAMAN — Agricultural Decision Support System (DSS)

> **Platform Sistem Pendukung Keputusan Pertanian Presisi berbasis Agroklimatologi BMKG, Pedoman Budidaya Kementan RI, dan Neraca Air FAO-56.**

---

## 📌 Daftar Isi
1. [Tentang TANIAMAN](#-tentang-taniaman)
2. [Tech Stack](#-tech-stack)
3. [Arsitektur Sistem & Alur Data](#-arsitektur-sistem--alur-data)
4. [Struktur Direktori Aplikasi](#-struktur-direktori-aplikasi)
5. [Sumber Data Resmi & Metodologi Ilmiah](#-sumber-data-resmi--metodologi-ilmiah)
6. [Panduan Penggunaan Aplikasi](#-panduan-penggunaan-aplikasi)
7. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
8. [Skema Basis Data (Supabase PostgreSQL)](#-skema-basis-data-supabase-postgresql)

---

## 📖 Tentang TANIAMAN

**TANIAMAN** adalah platform *Decision Support System* (DSS) agrikultur modern yang dirancang untuk membantu petani, agronomis, dan pengelola lahan pertanian dalam mengambil keputusan strategis:
- **Kapan waktu terbaik untuk menanam?** (Meminimalkan risiko cuaca ekstrem dan kekeringan).
- **Komoditas apa yang paling cocok dan menguntungkan?** (Padi, Jagung Hibrida, Kedelai, Bawang Merah, Cabai Merah, Kentang).
- **Berapa kebutuhan air dan pupuk presisi yang dibutuhkan?** (Neraca air harian, jadwal irigasi, dan estimasi biaya operasional).
- **Bagaimana memantau dan menandai aktivitas di kalender?** (Sinkronisasi jadwal budidaya, penandaan kegiatan lapangan, checklist selesai, dan ekspor ke Google Calendar).

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework:** [Nuxt 3](https://nuxt.com/) (Vue 3, Composition API, `<script setup>`)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Sleek High-Contrast Design System)
- **Ikonografi:** [Lucide Icons](https://lucide.dev/) (`@lucide/vue`)
- **Peta Interaktif GIS:** [Leaflet.js](https://leafletjs.com/) & OpenStreetMap Tiles

### Backend & Server Engine
- **Server Engine:** Nuxt Nitro Server (`server/api/*`, `server/services/*`)
- **Klimatologi & Prakiraan Cuaca:** Open-Meteo High-Resolution Numerical Weather Prediction (ECMWF & GFS)
- **Geocoding & Reverse GPS:** BigDataCloud & OpenStreetMap Nominatim Engine

### Basis Data & Otentikasi
- **Database:** [Supabase](https://supabase.com/) PostgreSQL Serverless
- **Auth:** Supabase Auth + Mock/Local Fallback Session
- **Penyimpanan Lokal:** LocalStorage Persistence untuk state offline

---

## 🏛️ Arsitektur Sistem & Alur Data

```
+---------------------------------------------------------------------------------+
|                                 USER INTERFACE                                  |
|  [Simulate Studio]   [Multi-Compare Matrix]   [Agri Calendar]   [Farm Portfolio]|
+---------------------------------------------------------------------------------+
                                        │
                                        ▼ (Nuxt 3 Composables / Reactive State)
+---------------------------------------------------------------------------------+
|                             CLIENT COMPOSABLES LAYER                            |
|             useSimulation.ts   •   useAuth.ts   •   useSupabase.ts              |
+---------------------------------------------------------------------------------+
                                        │
                                        ▼ ($fetch / Nitro API Handlers)
+---------------------------------------------------------------------------------+
|                                NITRO SERVER API                                 |
|   /api/simulate   /api/weather   /api/crops   /api/simulations/*   /api/geocoding|
+---------------------------------------------------------------------------------+
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
+────────────────────────+ +────────────────────────+ +────────────────────────+
|   RISK & DSS ENGINE    | |    AGRONOMY SERVICE    | |   WEATHER & CLIMATE    |
| • Weather Risk (30%)   | | • 4 Growth Phases (HST)| | • 16-Day Forecast      |
| • Water Risk (25%)     | | • Soil Water Balance   | | • Monthly Climatology  |
| • Crop Suitability(25%)| | • Financial & Yield ROI| | • BMKG ZOM Normals     |
| • Economic Risk (20%)  | | • Precision Fertilizer | |                        |
+────────────────────────+ +────────────────────────+ +────────────────────────+
             │                          │                          │
             └──────────────────────────┼──────────────────────────┘
                                        ▼
+---------------------------------------------------------------------------------+
|                               DATABASE & PERSISTENCE                            |
|                     Supabase PostgreSQL (`simulations`, `scenarios`)            |
+---------------------------------------------------------------------------------+
```

---

## 📂 Struktur Direktori Aplikasi

```text
ub_hology2/
├── assets/
│   └── css/
│       └── main.css              # Custom CSS rules, fonts, and clean utility classes
├── components/
│   ├── auth/                     # Form login, register, dan modal autentikasi
│   ├── layout/
│   │   ├── AppHeader.vue         # Navbar atas dengan status profil dan navigasi
│   │   └── AppFooter.vue         # Footer resmi dengan sumber data BMKG & Kementan
│   └── simulator/
│       ├── CropSelectModal.vue   # Modal pemilihan varietas komoditas unggulan
│       ├── DetailedAgronomyCard.vue # Kartu 4-tab: Fase HST, Neraca Air, Finansial, Pupuk
│       ├── FarmMapPicker.vue     # Peta interaktif Leaflet untuk pin lokasi koordinat lahan
│       ├── LocationSearch.vue    # Pencarian cepat kota/kabupaten se-Indonesia
│       ├── PlantingWindowCalendar.vue # Visualizer pemindai jendela tanam terbaik (±28 hari)
│       ├── RiskBreakdownCard.vue # Dekomposisi 4 pilar risiko agroklimat
│       ├── RiskScoreGauge.vue    # Gauge visual skor kelayakan DSS (0–100)
│       ├── ScenarioCard.vue      # Kartu ringkasan skenario keputusan
│       ├── WeatherForecastChart.vue # Grafik suhu dan presipitasi 16 hari Open-Meteo
│       └── WhatIfSlider.vue      # Slider sandbox uji tanggal tanam real-time
├── composables/
│   ├── useAuth.ts                # Manajemen autentikasi pengguna & sesi
│   ├── useSimulation.ts          # State simulasi, komparasi, kalkulasi, & simpan
│   └── useSupabase.ts            # Client Supabase instansiasi
├── pages/
│   ├── index.vue                 # Halaman Beranda (Landing Page & Fitur Unggulan)
│   ├── simulate.vue              # Studio Simulasi Keputusan Pertanian Utama
│   ├── calendar.vue              # Kalender Tanam, Penandaan Kegiatan & Ekspor iCal
│   ├── compare.vue               # Matriks Komparasi Multi-Skenario Side-by-Side
│   ├── history.vue               # Riwayat Simulasi Tersimpan & Fitur Muat Ulang
│   ├── portfolio.vue             # Dashboard Portofolio Aset Lahan Terpadu
│   ├── crops.vue                 # Ensiklopedia Varietas Komoditas Unggulan
│   ├── login.vue                 # Halaman Masuk
│   └── register.vue              # Halaman Daftar
├── server/
│   ├── api/
│   │   ├── auth/                 # Endpoint autentikasi API
│   │   ├── crops/                # Endpoint katalog data tanaman
│   │   ├── geocoding/            # Endpoint pencarian koordinat dan nama lokasi
│   │   ├── simulate/             # Endpoint eksekusi kalkulasi DSS multi-kriteria
│   │   ├── simulations/          # Endpoint CRUD riwayat simulasi Supabase
│   │   └── weather/              # Endpoint pengambilan data cuaca & klimatologi
│   ├── data/
│   │   └── crops.data.ts         # Data agronomis tanaman (Padi, Jagung, Cabai, dll.)
│   └── services/
│       ├── agronomy.service.ts   # Kalkulator neraca air, biaya, ROI, dan fase HST
│       ├── decision.service.ts   # Algoritma pemindai jendela tanam optimal
│       ├── risk.service.ts       # Kalkulator pembobotan risiko 4 pilar DSS
│       └── weather.service.ts    # Service agregator Open-Meteo & profil iklim BMKG
├── supabase/
│   └── schema.sql                # Skema DDL tabel PostgreSQL untuk Supabase
├── types/                        # Definisi antarmuka TypeScript
├── nuxt.config.ts                # Konfigurasi Nuxt 3 & modul Tailwind CSS
└── tailwind.config.ts            # Konfigurasi token desain Tailwind
```

---

## 🔬 Sumber Data Resmi & Metodologi Ilmiah

TANIAMAN tidak menggunakan data acak, melainkan mengacu pada standar resmi institusi klimatologi dan pertanian terpercaya:

| Sumber Resmi | Standar / Parameter yang Digunakan | Implementasi di TANIAMAN |
|---|---|---|
| **BMKG** *(Badan Meteorologi, Klimatologi, dan Geofisika)* | Zona Musim (ZOM), Curah Hujan Bulanan (Rendah <100mm, Menengah 100–300mm, Tinggi >300mm), Ambang Suhu Ekstrem Tropis | Analisis `Weather Risk` & evaluasi anomali suhu bulanan di `risk.service.ts` |
| **Kementerian Pertanian RI** *(Balitbangtan & Balittanah)* | Kalender Tanam Terpadu (KATAM), Rekomendasi Jarak Tanam, Dosis Pemupukan Berimbang (Urea, NPK Phonska, Organik) per Varietas | Panduan teknis fase pertumbuhan di `agronomy.service.ts` & rekomendasi pemupukan |
| **FAO Paper No. 56** *(Food and Agriculture Organization)* | Kebutuhan Air Tanaman & Evapotranspirasi Standar ($ET_c = K_c \times ET_0$) per fase vegetatif hingga panen | Perhitungan defisit air, kebutuhan volume kubik irigasi, dan neraca air mingguan |
| **Open-Meteo & NASA POWER** | Global Forecast System (GFS) & ECMWF Reanalysis High-Resolution Models | Prakiraan cuaca 16 hari ke depan (suhu max/min, curah hujan harian mm, probabilitas hujan, $ET_0$) |

### Rumus Pembobotan Skor DSS (Decision Support System)

$$\text{Total Skor DSS} = (S_{\text{Cuaca}} \times 30\%) + (S_{\text{Air}} \times 25\%) + (S_{\text{Kesesuaian Tanaman}} \times 25\%) + (S_{\text{Ekonomi}} \times 20\%)$$

- **80 – 100:** *Highly Recommended* (Sangat Direkomendasikan)
- **65 – 79.9:** *Recommended* (Direkomendasikan dengan Pemantauan Standar)
- **50 – 64.9:** *Consider Carefully* (Perlu Mitigasi Irigasi & Drainase Ketat)
- **< 50:** *High Risk* (Risiko Gagal Panen Tinggi / Hindari Tanggal Tersebut)

---

## 🚀 Panduan Penggunaan Aplikasi

### 1. Menjalankan Simulasi Keputusan Pertanian (`/simulate`)
1. Masuk ke menu **Simulasi**.
2. **Pilih Lokasi Lahan:** Ketik nama kecamatan/kabupaten pada kotak pencarian, atau klik langsung pada **Peta Interaktif** untuk mendapatkan titik koordinat GPS presisi.
3. **Pilih Komoditas:** Klik tombol komoditas untuk memilih varietas (Padi, Jagung, Kedelai, Bawang Merah, Cabai Merah, atau Kentang).
4. **Atur Luas Lahan & Tanggal Tanam:** Masukkan luas area (m²) dan tanggal rencana tanam.
5. **Pilih Akses Irigasi:** Aktifkan tombol jika lahan memiliki irigasi teknis/pompa air, atau nonaktifkan untuk lahan tadah hujan.
6. **Baca Hasil Rekomendasi:**
   - **Executive Summary:** Melihat skor kelayakan, estimasi tonase panen, proyeksi laba bersih, dan kebutuhan air.
   - **Tab 1 (Skor & Risiko):** Memahami alasan ilmiah di balik setiap indikator risiko.
   - **Tab 2 (Agronomi & Finansial):** Memeriksa jadwal pemupukan, neraca air, dan rincian biaya operasional.
   - **Tab 3 (Cuaca & Jendela Tanam):** Memeriksa grafik hujan 16 hari dan jendela tanggal paling aman.
   - **Tab 4 (What-If Sandbox):** Menggeser tanggal tanam maju/mundur $\pm 14$ hari secara interaktif.

### 2. Menandai dan Mengatur Kalender Tanam (`/calendar`)
1. Setelah melakukan simulasi, klik tombol **"Tandai di Kalender Tanam"**.
2. Sistem otomatis membuat jadwal siklus lengkap:
   - **-10 HST:** Pengolahan Tanah & Tebar Dolomit
   - **0 HST:** Hari Tanam Bibit
   - **+7 HST:** Pemupukan Dasar & Penyulaman Bibit
   - **+21 HST:** Pemupukan Susulan I (Urea + NPK)
   - **+35 HST:** Pengendalian Hama & Penyiangan Gulma
   - **+45 HST:** Pemupukan Susulan II (Fase Bunga)
   - **+60 HST:** Monitoring Irigasi Kritis
   - **+80 HST:** Pengisian Bulir
   - **Panen Raya:** Estimasi waktu panen optimal
3. **Tambah Catatan / Aktivitas Lapangan Manual:** Klik tombol `+ Tandai Aktivitas / Catatan Baru` untuk menambahkan jadwal khusus (misal: "Beli pupuk hayati", "Perbaikan pematang").
4. **Tandai Selesai (Checklist):** Klik kotak centang pada setiap kegiatan untuk melacak progres tugas lapangan.
5. **Ekspor ke Google Calendar:** Klik tombol `Ekspor ke Google Calendar (.ics)` untuk mengunduh file kalender yang dapat langsung di-import ke Google Calendar pada smartphone atau komputer Anda.

### 3. Membandingkan Skenario Keputusan (`/compare`)
1. Dari halaman simulasi, klik **"+ Tambah ke Komparasi"**.
2. Buka menu **Komparasi**.
3. Sistem menyajikan **Matriks Evaluasi Side-by-Side** dan secara otomatis memilih skenario terbaik (*Best Decision*) dengan skor DSS tertinggi.

### 4. Menyimpan dan Memuat Riwayat Simulasi (`/history`)
1. Klik **"Simpan Simulasi"** pada halaman simulasi untuk menyimpan hasil ke Supabase PostgreSQL.
2. Buka menu **Riwayat** untuk melihat arsip simulasi terdahulu.
3. Klik **"Muat ke Studio"** untuk mengisi otomatis form parameter sesuai data riwayat yang dipilih.

---

## 💻 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau lebih baru
- `npm` atau `pnpm`

### Langkah-langkah

1. **Clone Repository & Buka Direktori:**
   ```bash
   cd d:/my-project-programming/ub_hology2
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`):**
   Buat atau pastikan file `.env` memiliki konfigurasi berikut:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-role-key
   NITRO_PORT=3000
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Build untuk Produksi:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🗄️ Skema Basis Data (Supabase PostgreSQL)

```sql
-- 1. Tabel Profil Pengguna
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Simulasi Lahan
CREATE TABLE simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  location_name TEXT NOT NULL,
  latitude NUMERIC(10, 6) NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  land_area INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Skenario Keputusan
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID REFERENCES simulations(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  crop_slug TEXT NOT NULL,
  planting_date DATE NOT NULL,
  weather_score NUMERIC(5, 2),
  water_score NUMERIC(5, 2),
  crop_score NUMERIC(5, 2),
  economic_score NUMERIC(5, 2),
  total_score NUMERIC(5, 2),
  weather_risk TEXT,
  water_risk TEXT,
  economic_risk TEXT,
  recommendation TEXT,
  reasons JSONB,
  metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk platform pertanian presisi **TANIAMAN** — Mendukung kedaulatan pangan berkelanjutan di Indonesia.
