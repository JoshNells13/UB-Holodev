# TANIAMAN — Agricultural Decision Support System (DSS)

> **Repository ini dikembangkan untuk perlombaan HOLOGY 9.0 Fakultas Ilmu Komputer Universitas Brawijaya pada cabang lomba HoloDev (Software Development).**
>
> **Platform Sistem Pendukung Keputusan Pertanian Presisi berbasis Agroklimatologi BMKG, Pedoman Budidaya Kementan RI, Neraca Air FAO-56, dan Visualisasi 3D Digital Twin Lahan.**

---

## Informasi Lomba

- **Kompetisi:** HOLOGY 9.0 (House of Technology 9.0)
- **Penyelenggara:** Fakultas Ilmu Komputer, Universitas Brawijaya (FILKOM UB)
- **Bidang / Cabang Lomba:** HoloDev (Software Development)
- **Karya / Produk:** TANIAMAN — Climate-Agricultural Decision Support System (DSS)
- **Tagline:** *"Simulasikan Sebelum Menanam — Keputusan Presisi untuk Ketahanan Pangan"*

---

## Daftar Isi
1. [Latar Belakang & Urgensi Masalah](#1-latar-belakang--urgensi-masalah)
2. [Tentang TANIAMAN](#2-tentang-taniaman)
3. [Analisis Komparasi: Mengapa TANIAMAN Berbeda?](#3-analisis-komparasi-mengapa-taniaman-berbeda)
4. [Fitur Unggulan & 3D Digital Twin](#4-fitur-unggulan--3d-digital-twin)
5. [Tech Stack](#5-tech-stack)
6. [Arsitektur Sistem & Alur Data](#6-arsitektur-sistem--alur-data)
7. [Struktur Direktori Aplikasi](#7-struktur-direktori-aplikasi)
8. [Sumber Data Resmi & Metodologi Ilmiah](#8-sumber-data-resmi--metodologi-ilmiah)
9. [Panduan Penggunaan Aplikasi](#9-panduan-penggunaan-aplikasi)
10. [Panduan Instalasi & Menjalankan Lokal](#10-panduan-instalasi--menjalankan-lokal)
11. [Skema Basis Data (Supabase PostgreSQL)](#11-skema-basis-data-supabase-postgresql)
12. [Hak Cipta & Pengesahan](#12-hak-cipta--pengesahan)

---

## 1. Latar Belakang & Urgensi Masalah

### 1.1. Krisis Iklim dan Kerentanan Sektor Pertanian Indonesia
Sektor pertanian merupakan tulang punggung kedaulatan pangan dan mata pencaharian bagi lebih dari **28,4 juta jiwa penduduk Indonesia** (BPS, 2023). Namun, sektor vital ini kini menghadapi ancaman paling kritis dalam sejarah modern: **anomali dinamika iklim global (*Global Climate Change*)**.

Fenomena iklim ekstrem seperti **El Niño**, **La Niña**, serta anomali **Indian Ocean Dipole (IOD)** telah merusak pola iklim musiman tradisional di Nusantara. Kalender tradisional Jawa kuno (*Pranata Mangsa*) yang selama ratusan tahun menjadi pedoman waktu tanam petani kini sudah tidak lagi presisi karena awal musim hujan dan puncak kemarau kerap bergeser **30 hingga 60 hari** dari pola klimatologis normal.

```
+-----------------------------------------------------------------------------------------------+
|                                      RANTAI MASALAH NYATA                                     |
|                                                                                               |
|  [Anomali Iklim Global]  ──▶  [Pergeseran Musim Hujan]  ──▶  [Petani Tanam Spekulatif]        |
|  (El Niño / La Niña)          (Pranata Mangsa Rusak)         (Mengikuti Kebiasaan Lama)       |
|                                                                     │                         |
|                                                                     ▼                         |
|  [Inflasi Pangan Nasional] ◀── [Kerugian Finansial Petani] ◀── [Puso / Gagal Panen Masal]     |
|  (Beras, Cabai, Bawang)        (Modal Hangus Rp 10-25 Jt/Ha)   (Kekeringan / Hama / Busuk)    |
+-----------------------------------------------------------------------------------------------+
```

### 1.2. Fakta Empiris, Berita Nasional, dan Data Statistik

Dampak ketidakpastian iklim terhadap pertanian Indonesia tercermin secara nyata dalam data dan laporan resmi:

1. **Penurunan Produksi & Ancaman Puso (Kementerian Pertanian & BPS):**
   - Badan Pusat Statistik (BPS) mencatat produksi beras nasional pada tahun 2023–2024 mengalami **penurunan signifikan sebesar 1,36 juta ton (sekitar 4,3%)** akibat mundurnya musim tanam (*planting delay*) dan kekeringan panjang dampak El Niño.
   - Kementerian Pertanian mencatat lebih dari **120.000 hektar lahan sawah mengalami kekeringan ekstrem dan puso (gagal panen)** di sentra-sentra produksi utama seperti Jawa Timur, Jawa Tengah, Jawa Barat, dan Nusa Tenggara Barat.
2. **Pemberitaan Media Nasional Terkini:**
   - **Kompas.id (2023/2024):** *"Dampak El Niño Ekstrem, Ratusan Ribu Hektar Sawah di Jawa dan NTB Terancam Puso — Petani Mengalami Kerugian Ratusan Juta Rupiah Akibat Salah Prediksi Awal Musim Tanam."*
   - **Antara News (2024):** *"BMKG Ingatkan Perubahan Iklim Nyata Mengancam Ketahanan Pangan: Variabilitas Cuaca Harian Mempersulit Penentuan Awal Musim Tanam."*
   - **Bisnis Indonesia (2024):** *"Mundurnya Musim Tanam Memicu Lonjakan Volatile Food Inflation: Harga Beras dan Cabai Merah Melonjak Hingga Rekor Tertinggi."*
3. **Kerugian Finansial Tingkat Petani:**
   - Biaya investasi budidaya rata-rata berkisar antara **Rp 8.000.000 – Rp 15.000.000 per Hektar untuk Padi** dan mencapai **Rp 25.000.000 – Rp 40.000.000 per Hektar untuk Hortikultura (Cabai & Bawang Merah)**. Ketika keputusan tanam dilakukan secara spekulatif dan tanaman mati akibat kekeringan atau curah hujan ekstrem saat panen, seluruh modal tersebut hangus tanpa sisa, menjerat petani ke dalam lingkaran hutang.

### 1.3. Landasan Riset dan Jurnal Ilmiah Terkait

Pengembangan sistem pendukung keputusan TANIAMAN didasari oleh berbagai literatur ilmiah dan metodologi internasional:

* **Surmaini, E., Runtunuwu, E., & Syahbuddin, H. (2020)** — *Jurnal Sumberdaya Lahan, Balitbangtan Kementan RI*:  
  *"Karakteristik Kejadian Iklim Ekstrem dan Dampaknya terhadap Kerentanan Sektor Pertanian Tanaman Pangan di Indonesia."*  
  Riset ini menegaskan bahwa faktor utama kegagalan panen di Indonesia adalah ketidaksesuaian waktu tanam (*planting window mismatch*) dengan dinamika ketersediaan air tanah dan suhu permukaan.
* **Allen, R. G., Pereira, L. S., Raes, D., & Smith, M. (1998 / 2006)** — *FAO Irrigation and Drainage Paper No. 56*:  
  *"Crop Evapotranspiration - Guidelines for Computing Crop Water Requirements."*  
  Menjadi acuan standar global dalam menghitung neraca air tanah ($ET_c = K_c \times ET_0$) untuk memastikan tanaman tidak mengalami cekaman air (*water stress*) pada fase-fase kritis pembungaan.
* **IPCC (Intergovernmental Panel on Climate Change) Sixth Assessment Report (AR6, 2022)** — *Working Group II: Impacts, Adaptation and Vulnerability*:  
  Menyatakan bahwa kawasan tropis Asia Tenggara memiliki tingkat kerentanan agrikultur tertinggi terhadap variabilitas presipitasi, dan merekomendasikan adopsi **Sistem Pendukung Keputusan (DSS) berbasis Digital Twin & Reanalisis Cuaca** sebagai instrumen adaptasi paling efektif.
* **Boer, R., Subbiah, A. R., & Tamkani, K. (2018)** — *Center for Climate Risk and Opportunity Management (CCROM-SEAP IPB)*:  
  Membuktikan bahwa pemanfaatan prakiraan agroklimat presisi dalam penentuan jadwal tanam mampu **menurunkan risiko kegagalan panen hingga 65%** dan meningkatkan efisiensi penggunaan air irigasi sebesar 30%.

### 1.4. The Missing Gap (Kelemahan Solusi Eksisting)

Meskipun informasi cuaca dan buku pedoman budidaya telah tersedia, petani Indonesia masih kerap mengalami kegagalan panen akibat beberapa *gap* mendasar:
1. **Aplikasi Pertanian Saat Ini Bersifat Reaktif & Pasca-Tanam:** Sebagian besar aplikasi *AgriTech* di Indonesia hanya berfokus pada pencatatan buku kas pengeluaran setelah modal dibelanjakan atau marketplace penjualan pupuk, bukan memitigasi risiko sebelum bibit ditanam.
2. **Ketiadaan Media Simulasi (*What-If Sandbox*):** Petani tidak memiliki sarana untuk menguji *"Bagaimana jika saya tanam mundur 2 minggu?"* atau *"Bagaimana jika saya ganti dari Padi ke Jagung?"* tanpa mempertaruhkan modal nyata.
3. **Data Sulit Dipahami Petani:** Penyajian data agroklimat BMKG seringkali berupa tabel angka dan peta isobar yang abstrak. Diperlukan representasi visual interaktif (**3D Digital Twin**) yang dapat langsung memperlihatkan kondisi kesehatan tanaman, tanah, dan cuaca lahan secara nyata.

### 1.5. Solusi Inovatif TANIAMAN
TANIAMAN hadir sebagai **Climate-Agricultural Decision Support System (DSS)** yang menggabungkan:
1. **Algoritma Analisis 4 Pilar Risiko:** Weather Risk (30%), Water Risk (25%), Crop Suitability (25%), dan Economic Risk (20%).
2. **Mesin Simulasi Digital Twin 3D (Three.js WebGL):** Memvisualisasikan diorama lahan hidup miniatur yang merefleksikan tanaman dan cuaca secara interaktif.
3. **What-If Sandbox & Komparasi Multi-Skenario:** Menguji sensitivitas tanggal tanam secara instan (*Live Re-Calculation*) sebelum komitmen modal dilakukan.

---

## 2. Tentang TANIAMAN

**TANIAMAN** adalah platform *Decision Support System* (DSS) agrikultur modern yang dirancang untuk mengatasi salah satu masalah paling mendasar di sektor pertanian Indonesia: **ketidakpastian iklim dan risiko kegagalan panen akibat salah memilih waktu serta komoditas tanam**.

TANIAMAN menjawab 5 pertanyaan paling krusial bagi petani dan pengelola lahan:
1. **Kapan waktu tanam paling optimal?** (Mendeteksi jendela tanam dengan risiko cuaca ekstrem dan kekeringan terendah dalam rentang +/- 28 hari).
2. **Komoditas apa yang paling adaptif dan menguntungkan?** (Analisis kesesuaian agroklimat dan proyeksi finansial ROI untuk Padi, Jagung, Kedelai, Cabai, Bawang Merah, Tomat, Kentang, Kacang Tanah, dan Tebu).
3. **Berapa kebutuhan air presisi tanaman?** (Kalkulasi neraca air harian $ET_c = K_c \times ET_0$ berdasarkan FAO-56 untuk irigasi hemat air).
4. **Bagaimana kondisi lahan jika keputusan ini diambil?** (Visualisasi diorama **3D Digital Twin Lahan** yang merefleksikan kondisi tanaman, tanah, dan cuaca secara hidup).
5. **Bagaimana membagi lahan untuk mengurangi risiko monokultur?** (Simulasi **Portofolio Lahan Polikultur** dengan kalkulasi indeks ketahanan HHI dan zonasi lahan 3D).

---

## 3. Analisis Komparasi: Mengapa TANIAMAN Berbeda?

Untuk membuktikan kebaruan (*novelty*) dan nilai strategis produk, berikut adalah komparasi mendalam antara **TANIAMAN** dengan **2 solusi agrikultur yang sudah ada**:

1. **Aplikasi A: KATAM Terpadu (Kalender Tanam Kementerian Pertanian RI)** — *Platform Resmi Pemerintah berbasis Makro-Spasial*.
2. **Aplikasi B: Aplikasi Manajemen Pertanian Konvensional (contoh: RiTx Bertani / Petani Digital / Farm Logbook Apps)** — *Aplikasi Catatan Lapangan & Marketplace Saprotan*.

### Matriks Perbandingan Fitur & Kapabilitas

| Kriteria Evaluasi | KATAM Terpadu (Kementan) | Aplikasi Farm Logbook / RiTx | **TANIAMAN (DSS & 3D Digital Twin)** |
|---|---|---|---|
| **Fokus Utama Produk** | Peta rekomendasi statis tingkat kecamatan per musim (6 bulanan). | Pencatatan biaya pasca-tanam & pembelian saprotan/toko tani. | **Decision Support Pra-Tanam Presisi Spasial GPS Titik Lahan.** |
| **Prinsip Keputusan** | Pasif (hanya menampilkan tabel rekomendasi umum per ZOM). | Reaktif (mencatat pengeluaran setelah kegiatan terjadi). | **Prediktif & Preskriptif (*"Simulasikan Sebelum Menanam"*).** |
| **Uji Sensitivitas (*What-If Sandbox*)** | ❌ Tidak Ada (harus membaca tabel statis). | ❌ Tidak Ada. | ✅ **Ada: Slider interaktif geser tanggal tanam dengan pembaruan skor instan.** |
| **Visualisasi 3D Digital Twin** | ❌ Tidak Ada (hanya tabel & peta raster 2D). | ❌ Tidak Ada (teks & grafik dasar). | ✅ **Ada: 3D WebGL Diorama Lahan (Three.js) dengan simulasi cuaca & tanaman hidup.** |
| **Komparasi Skenario Multi-Kriteria** | ❌ Tidak Ada (hanya satu skenario per wilayah). | ❌ Terbatas pada perbandingan historis tahun lalu. | ✅ **Ada: Matriks Side-by-Side dengan *Best Decision Winner Picker*.** |
| **Simulasi Portofolio Diversifikasi** | ❌ Tidak Mendukung (hanya tanaman tunggal per hamparan). | ❌ Tidak Mendukung. | ✅ **Ada: Simulator Polikultur dengan Indeks Diversifikasi HHI & Zonasi 3D.** |
| **Resolusi Titik Lokasi** | Tingkat Kecamatan / Poligon ZOM Makro. | Manual input teks kebun. | **Pinpoint Koordinat GPS Peta Interaktif (Leaflet + Reverse Geocoding).** |
| **Kalkulasi Neraca Air Harian** | Indeks surplus/defisit makro bulanan. | ❌ Tidak Ada. | ✅ **Standar FAO-56 ($ET_c = K_c \times ET_0$) per fase vegetatif (HST).** |
| **Jadwal Budidaya & Kalender Tani** | Petunjuk teknis umum (buku panduan). | Catatan to-do list manual. | **Otomatis generate jadwal -10 s/d Panen Raya + Ekspor Google Calendar (.ics).** |

### Keunggulan Kompetitif Utama TANIAMAN:

1. **Paradigma *Pre-Planting Simulation* (Bukan Sekadar *Post-Planting Record*)**
   Aplikasi yang ada di pasaran umumnya hanya berfokus pada pencatatan buku kas atau e-commerce pupuk. TANIAMAN bertindak sebagai *asisten agronomi cerdas* yang menguji skenario risiko **sebelum modal dan bibit dikeluarkan**, mencegah kerugian gagal panen sejak awal.

2. **Diorama 3D Digital Twin Pertama untuk Edukasi Keputusan Petani**
   Alih-alih menyajikan angka dan tabel mentah yang membingungkan petani, TANIAMAN menyajikan **miniatur 3D interaktif** yang menampilkan visualisasi kesehatan tanaman, kelembapan tanah, dan cuaca dinamis (cerah, hujan, kekeringan) yang mudah dipahami oleh siapa saja.

3. **Multi-Crop Polyculture Portfolio Engine**
   TANIAMAN mengadopsi teori portofolio finansial modern (HHI) ke dalam lahan agrikultur untuk memitigasi bahaya serangan hama massal dan anjloknya harga komoditas monokultur.

---

## 4. Fitur Unggulan & 3D Digital Twin

### 1. 3D Digital Twin Lahan Pertanian (Three.js WebGL)
- **Procedural Stylized Crop Models:** Model 3D tanaman low-poly untuk Padi, Jagung Hibrida, Kedelai, Cabai Merah, Bawang Merah, Tomat, Kentang, Kacang Tanah, dan Tebu.
- **Dynamic Weather System:** Simulasi cuaca 3D (matahari bercahaya lembut, awan berarak, partikel rintik hujan vertikal, dan pencahayaan kekeringan).
- **Responsive & OrbitControls:** Kontrol rotasi 360°, zoom in/out, pan, reset view kamera, auto-rotate orbit, dan isolasi gesture touch pada perangkat mobile.
- **Interactive Raycasting Tooltip:** Hover pada baris tanaman menampilkan fase pertumbuhan, kebutuhan air (mm), luas blok, dan skor kelayakan.

### 2. Studio Simulasi Keputusan DSS (`/simulate`)
- **Pinpoint Location Picker:** Pencarian nama wilayah se-Indonesia atau klik langsung koordinat GPS pada peta interaktif Leaflet.
- **Dekomposisi 4 Pilar Risiko:**
  - *Weather Risk (30%):* Anomali suhu, curah hujan ekstrem BMKG.
  - *Water Risk (25%):* Neraca air FAO-56 dan ketersediaan irigasi teknis.
  - *Crop Suitability (25%):* Kesesuaian agroklimat komoditas Kementan RI.
  - *Economic Risk (20%):* Volatilitas harga pasar dan margin keuntungan.
- **Jendela Tanam Optimal:** Algoritma pemindai 56 hari (+/- 28 hari) untuk merekomendasikan tanggal tanam paling ideal.
- **What-If Sandbox:** Slider tanggal tanam instan tanpa me-refresh form.
- **Detailed Agronomy Card:** Jadwal 4 fase HST, dosis pemupukan berimbang (Urea, NPK, Organik), neraca air, dan kalkulasi proyeksi laba & ROI.

### 3. Matriks Komparasi Multi-Skenario (`/compare`)
- Menjejerkan hingga banyak skenario (misal: Skenario A Padi vs Skenario B Jagung vs Skenario C Tunda 14 Hari).
- Penentuan otomatis *Best Decision Scenario* berbasis skor kelayakan tertinggi.
- **3D Comparison Diorama:** Diorama 3D beralih dan bertransformasi secara mulus saat skenario dipilih.

### 4. Simulator Portofolio Lahan & Diversifikasi (`/portfolio`)
- Menghitung **Indeks Diversifikasi HHI (0-100)** dan keuntungan reduksi risiko monokultur.
- **Auto-Scaling 3D Platform:** Platform 3D otomatis membesar/mengecil dan menyesuaikan kepadatan tanaman sesuai luas lahan (500 m² s/d 50.000 m²).
- **Zonasi Polikultur 3D:** Membagi hamparan tanaman dengan patok batas zonasi sesuai proporsi persentase alokasi tiap komoditas dari database.
- Fitur penyeimbang instan (`⚖️ Seimbangkan 100%`) dan paket preset agroklimat.

### 5. Kalender Tani Terpadu & Ekspor Google Calendar (`/calendar`)
- Konversi hasil simulasi menjadi timeline kegiatan lapangan lengkap (-10 HST hingga Panen Raya).
- Fitur checklist selesai, tambah aktivitas/catatan manual, dan **Ekspor ke format `.ics`** yang dapat langsung diimpor ke Google Calendar / Apple Calendar.

---

## 5. Tech Stack

### Frontend & Visualisasi
- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3, Composition API, `<script setup>`)
- **3D Graphics Engine:** [Three.js](https://threejs.org/) (WebGL, OrbitControls, Procedural Geometries, Lighting & Shadow Mapping)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/) (Strict Typings)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Modern High-Contrast UI & Glassmorphism)
- **Ikonografi:** [Lucide Icons](https://lucide.dev/) (`@lucide/vue`)
- **Peta Interaktif GIS:** [Leaflet.js](https://leafletjs.com/) & OpenStreetMap Tiles

### Backend & Server Engine
- **Server Runtime:** Nuxt Nitro Server (`server/api/*`, `server/services/*`)
- **Klimatologi & Prakiraan Cuaca:** Open-Meteo High-Resolution NWP (ECMWF & GFS)
- **Geocoding & Reverse GPS:** BigDataCloud & OpenStreetMap Nominatim Engine

### Basis Data & Otentikasi
- **Database:** [Supabase](https://supabase.com/) PostgreSQL Serverless
- **Auth:** Supabase Auth + Mock/Local Fallback Session
- **Penyimpanan Lokal:** LocalStorage Persistence untuk state offline

---

## 6. Arsitektur Sistem & Alur Data

```
+-----------------------------------------------------------------------------------------+
|                                     USER INTERFACE                                      |
|  [Simulate Studio]   [3D Digital Twin]   [Multi-Compare Matrix]   [Portfolio Polikultur]|
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼ (Nuxt 4 Composables / Reactive State)
+-----------------------------------------------------------------------------------------+
|                                 CLIENT COMPOSABLES LAYER                                |
|                 useSimulation.ts   •   useAuth.ts   •   useSupabase.ts                  |
+-----------------------------------------------------------------------------------------+
                                             │
                                             ▼ ($fetch / Nitro API Handlers)
+-----------------------------------------------------------------------------------------+
|                                    NITRO SERVER API                                     |
|    /api/simulate   /api/portfolio   /api/weather   /api/crops   /api/simulations/*      |
+-----------------------------------------------------------------------------------------+
                                             │
                  ┌──────────────────────────┼──────────────────────────┐
                  ▼                          ▼                          ▼
+────────────────────────────+ +────────────────────────────+ +────────────────────────────+
|     RISK & DSS ENGINE      | |      AGRONOMY SERVICE      | |     WEATHER & CLIMATE      |
| • Weather Risk (30%)       | | • 4 Growth Phases (HST)    | | • 16-Day NWP Forecast      |
| • Water Risk (25%)         | | • Soil Water Balance FAO-56| | • Monthly Climatology      |
| • Crop Suitability (25%)   | | • Financial & Yield ROI    | | • BMKG ZOM Normals         |
| • Economic Risk (20%)      | | • Precision Fertilizer     | |                            |
+────────────────────────────+ +────────────────────────────+ +────────────────────────────+
                  │                          │                          │
                  └──────────────────────────┼──────────────────────────┘
                                             ▼
+-----------------------------------------------------------------------------------------+
|                                   DATABASE & PERSISTENCE                                |
|                        Supabase PostgreSQL (`simulations`, `scenarios`)                 |
+-----------------------------------------------------------------------------------------+
```

---

## 7. Struktur Direktori Aplikasi

```text
ub_hology2/
├── assets/
│   └── css/
│       └── main.css                  # Custom CSS rules, fonts, and clean utility classes
├── components/
│   ├── auth/
│   │   └── AuthModal.vue             # Modal login & register pengguna
│   ├── digital-twin/                 # Modul 3D Digital Twin (Three.js)
│   │   ├── types.ts                  # Tipe data 3D, visual state, dan helpers
│   │   ├── DigitalTwinField.vue      # Master component 3D field dengan ClientOnly
│   │   ├── DigitalTwinPortfolioField.vue # 3D diorama zonasi portofolio polikultur
│   │   ├── DigitalTwinHUD.vue        # Overlay badge skor, status cuaca, dan tooltip
│   │   ├── DigitalTwinControls.vue   # Toolbar navigasi kamera & selector cuaca
│   │   ├── plants/                   # Procedural low-poly 3D plant generators
│   │   │   ├── PlantFactory.ts       # Factory instansiasi tanaman berdasarkan slug
│   │   │   ├── RicePlant.ts          # Model 3D Padi
│   │   │   ├── CornPlant.ts          # Model 3D Jagung
│   │   │   ├── SoybeanPlant.ts       # Model 3D Kedelai
│   │   │   ├── ChiliPlant.ts         # Model 3D Cabai Merah
│   │   │   └── GenericPlant.ts       # Model 3D Bawang Merah, Tomat, Tebu, Kentang
│   │   └── scene/                    # Scene manager & efek Three.js
│   │       ├── FieldScene.ts         # Core 3D Scene single field & raycaster
│   │       ├── PortfolioFieldScene.ts# Core 3D Scene multi-crop auto-scaling
│   │       └── WeatherEffects.ts     # Sistem cuaca (matahari, awan, hujan rintik)
│   ├── layout/
│   │   ├── AppHeader.vue             # Navbar atas dengan status profil dan navigasi
│   │   └── AppFooter.vue             # Footer resmi dengan sumber data BMKG & Kementan
│   └── simulator/
│       ├── CropSelectModal.vue       # Modal pemilihan varietas komoditas unggulan
│       ├── DetailedAgronomyCard.vue  # Kartu 4-tab: Fase HST, Neraca Air, Finansial, Pupuk
│       ├── FarmMapPicker.vue         # Peta interaktif Leaflet untuk pin koordinat lahan
│       ├── LocationSearch.vue        # Pencarian cepat kota/kabupaten se-Indonesia
│       ├── PlantingWindowCalendar.vue# Visualizer pemindai jendela tanam (+/- 28 hari)
│       ├── RiskBreakdownCard.vue     # Dekomposisi 4 pilar risiko agroklimat
│       ├── RiskScoreGauge.vue        # Gauge visual skor kelayakan DSS (0-100)
│       ├── ScenarioCard.vue          # Kartu ringkasan skenario keputusan
│       ├── WeatherForecastChart.vue  # Grafik suhu & presipitasi 16 hari Open-Meteo
│       └── WhatIfSlider.vue          # Slider sandbox uji tanggal tanam real-time
├── composables/
│   ├── useAuth.ts                    # Manajemen autentikasi pengguna & sesi
│   ├── useSimulation.ts              # State simulasi, komparasi, kalkulasi, & simpan
│   └── useSupabase.ts                # Client Supabase instansiasi
├── pages/
│   ├── index.vue                     # Landing Page & Pengenalan Produk
│   ├── simulate.vue                  # Studio Simulasi Utama + 3D Digital Twin
│   ├── calendar.vue                  # Kalender Tanam & Ekspor Google Calendar (.ics)
│   ├── compare.vue                   # Matriks Komparasi Skenario + 3D Comparison
│   ├── history.vue                   # Riwayat Simulasi Tersimpan Supabase
│   ├── portfolio.vue                 # Simulator Portofolio Lahan + 3D Polikultur
│   ├── crops.vue                     # Ensiklopedia Varietas Komoditas Unggulan
│   ├── login.vue                     # Halaman Masuk
│   └── register.vue                  # Halaman Daftar
├── server/
│   ├── api/                          # REST API Endpoints (Nitro Server)
│   ├── data/
│   │   └── crops.data.ts             # Database katalog agronomis tanaman lengkap
│   └── services/
│       ├── agronomy.service.ts       # Kalkulator neraca air, biaya, ROI, dan fase HST
│       ├── decision.service.ts       # Algoritma pemindai jendela tanam optimal
│       ├── risk.service.ts           # Kalkulator pembobotan risiko 4 pilar DSS
│       └── weather.service.ts        # Agregator cuaca Open-Meteo & iklim BMKG
├── types/                            # Definisi antarmuka TypeScript
└── nuxt.config.ts                    # Konfigurasi Nuxt 4 & dependensi
```

---

## 8. Sumber Data Resmi & Metodologi Ilmiah

TANIAMAN mengacu pada metodologi ilmiah dan standar institusi terpercaya:

| Sumber Resmi | Parameter / Standar | Implementasi di TANIAMAN |
|---|---|---|
| **BMKG** *(Badan Meteorologi, Klimatologi, dan Geofisika)* | Zona Musim (ZOM), Klasifikasi Curah Hujan Bulanan, Ambang Suhu Ekstrem Tropis | Evaluasi `Weather Risk` & anomali iklim di `risk.service.ts` |
| **Kementerian Pertanian RI** *(Balitbangtan)* | Kalender Tanam Terpadu (KATAM), Rekomendasi Jarak Tanam, Dosis Pemupukan Berimbang (Urea, NPK, Organik) | Fase pertumbuhan agronomis di `agronomy.service.ts` & panduan pemupukan |
| **FAO Paper No. 56** *(Food and Agriculture Organization)* | Kebutuhan Air Tanaman & Evapotranspirasi Standar ($ET_c = K_c \times ET_0$) | Perhitungan volume air irigasi presisi ($m^3$) dan neraca air harian |
| **Open-Meteo & ECMWF/GFS** | High-Resolution Reanalysis & Numerical Weather Prediction | Prakiraan cuaca 16 hari (suhu min/max, hujan harian mm, probabilitas hujan, $ET_0$) |

---

## 9. Panduan Penggunaan Aplikasi

### 1. Menjalankan Simulasi Keputusan & Melihat 3D Digital Twin (`/simulate`)
1. Masuk ke menu **Simulasi**.
2. **Pilih Lokasi:** Ketik nama wilayah atau klik langsung pada **Peta Interaktif Leaflet**.
3. **Pilih Komoditas & Parameter:** Pilih jenis tanaman, luas lahan (m²), tanggal tanam, dan akses irigasi.
4. **Interaksi 3D Digital Twin:** Lahan 3D diorama langsung ter-render sesuai jenis tanaman. Lakukan rotasi 360°, zoom, ganti mode cuaca, dan arahkan kursor (*hover*) ke tanaman untuk melihat info detail.
5. **Uji Sandbox What-If:** Buka Tab 4 dan geser slider tanggal tanam untuk melihat perubahan skor dan transformasi 3D secara instan.

### 2. Membandingkan Beberapa Skenario (`/compare`)
1. Klik **"+ Tambah ke Komparasi"** pada beberapa hasil simulasi.
2. Buka menu **Komparasi**.
3. Sistem menyajikan **Matriks Evaluasi Side-by-Side**, memilih *Skenario Terbaik Terpilih*, dan menampilkan **3D Comparison Diorama** yang bertransisi saat tombol skenario diklik.

### 3. Mengoptimasi Portofolio Lahan Polikultur (`/portfolio`)
1. Masuk ke menu **Portofolio**.
2. Atur **Luas Keseluruhan Lahan (m² / Ha)** — perhatikan diorama 3D otomatis membesar/mengecil menyesuaikan luas lahan.
3. Pilih paket preset atau tambahkan komoditas baru dari database (`+ Tambah Komoditas`).
4. Sesuaikan persentase alokasi masing-masing tanaman atau klik `⚖️ Seimbangkan 100%`.
5. Lihat zonasi petak tanaman 3D yang terpartisi secara proporsional.

### 4. Menandai dan Mengekspor Kalender Tani (`/calendar`)
1. Klik **"Tandai di Kalender Tanam"** dari hasil simulasi.
2. Sistem membuat jadwal terstruktur dari persiapan lahan (-10 HST) hingga panen raya.
3. Tandai aktivitas yang sudah selesai (*checklist*) atau tambah catatan baru.
4. Klik **`Ekspor ke Google Calendar (.ics)`** untuk sinkronisasi otomatis ke smartphone Anda.

---

## 10. Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18.x atau lebih baru
- `npm` atau `pnpm`

### Langkah-langkah

1. **Clone Repository:**
   ```bash
   git clone https://github.com/JoshNells13/UB-Holodev.git
   cd UB-Holodev
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable (`.env`):**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-role-key
   NITRO_PORT=3000
   ```

4. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

5. **Build untuk Produksi:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 11. Skema Basis Data (Supabase PostgreSQL)

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

## 12. Hak Cipta & Pengesahan

Dikembangkan untuk perlombaan **HOLOGY 9.0 Fakultas Ilmu Komputer Universitas Brawijaya** dalam cabang lomba **HoloDev (Software Development)** — Platform Sistem Pendukung Keputusan Pertanian Presisi **TANIAMAN** untuk mendukung ketahanan dan kedaulatan pangan berkelanjutan di Indonesia.
