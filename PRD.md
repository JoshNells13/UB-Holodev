# 🌾 TANIAMAN — Product Requirements Document

> **Simulasikan Sebelum Menanam**

**Product Type:** Climate-Agricultural Decision Support System (DSS)
**Platform:** Responsive Web Application
**Version:** 1.0 — MVP
**Tech Stack:** Nuxt.js + Supabase
**Status:** Planning

---

# 1. Product Overview

**TANIAMAN** adalah sebuah **Climate-Agricultural Decision Support System (DSS)** berbasis web yang membantu pengguna menentukan **tanaman dan waktu tanam yang lebih tepat berdasarkan kondisi iklim, kebutuhan air, karakteristik tanaman, dan faktor ekonomi.**

TANIAMAN tidak hanya menampilkan informasi cuaca, tetapi mengolah berbagai data menjadi sebuah **rekomendasi keputusan**.

Konsep utama:

```text
DATA
  ↓
ANALYSIS
  ↓
RISK ASSESSMENT
  ↓
SIMULATION
  ↓
COMPARISON
  ↓
RECOMMENDATION
```

### Core Value Proposition

> **"Jangan hanya melihat cuaca. Simulasikan keputusan sebelum menanam."**

Contoh:

> Jika padi ditanam hari ini, risiko kekeringannya tinggi.
> Jika ditunda 2 minggu, risiko lebih rendah dan skor rekomendasi meningkat.

---

# 2. Problem Statement

Perubahan pola iklim menyebabkan keputusan pertanian menjadi semakin tidak pasti.

Petani harus mempertimbangkan berbagai faktor:

* Curah hujan
* Temperatur
* Kelembapan
* Ketersediaan air
* Karakteristik tanaman
* Durasi pertumbuhan
* Waktu tanam
* Risiko kekeringan
* Risiko hujan berlebih
* Harga komoditas

Permasalahan utama adalah data tersebut sering tersedia secara **terpisah-pisah**.

Akibatnya, pengguna harus melakukan analisis secara manual untuk menentukan:

> **Tanaman apa yang cocok?**

> **Kapan waktu tanam yang lebih aman?**

> **Apa risiko jika menanam sekarang?**

> **Bagaimana jika tanggal tanam diubah?**

> **Apakah tanaman lain memiliki risiko lebih rendah?**

TANIAMAN menyatukan informasi tersebut ke dalam satu sistem dan mengubahnya menjadi **simulasi keputusan pertanian.**

---

# 3. Product Vision

Membangun platform pertanian berbasis data yang memungkinkan pengguna:

> **"Simulate → Compare → Decide."**

TANIAMAN diharapkan dapat berkembang dari sekadar aplikasi rekomendasi menjadi **decision-support platform untuk pertanian adaptif terhadap perubahan iklim.**

---

# 4. Product Goals

## Primary Goals

1. Memberikan rekomendasi tanaman berdasarkan kondisi iklim.
2. Memberikan rekomendasi waktu tanam.
3. Mengukur risiko cuaca dan kebutuhan air.
4. Memungkinkan pengguna melakukan simulasi *what-if*.
5. Membandingkan beberapa skenario pertanian.
6. Menghasilkan skor rekomendasi yang mudah dipahami.

## Secondary Goals

1. Mengintegrasikan berbagai sumber data.
2. Menampilkan data secara visual.
3. Membantu pengguna memahami alasan di balik rekomendasi.
4. Menyediakan histori simulasi.
5. Menjadi dasar pengembangan DSS pertanian yang lebih kompleks.

---

# 5. Non-Goals

Untuk versi MVP, TANIAMAN **tidak bertujuan** untuk:

* Mengontrol irigasi otomatis.
* Menggunakan sensor IoT.
* Mendeteksi penyakit tanaman.
* Menjamin hasil panen.
* Memberikan prediksi harga yang pasti.
* Menggantikan keputusan petani.
* Memberikan diagnosis agronomi secara profesional.

TANIAMAN merupakan **decision-support system**, bukan sistem yang mengambil keputusan secara otomatis.

---

# 6. Target Users

## 6.1 Petani

### Needs

* Menentukan tanaman yang sesuai.
* Menentukan waktu tanam.
* Mengurangi risiko gagal panen.
* Mengetahui kondisi iklim.

### Pain Point

> "Kalau saya tanam sekarang, apakah kondisi cuacanya aman?"

---

## 6.2 Penyuluh Pertanian

### Needs

* Membantu memberikan rekomendasi.
* Membandingkan beberapa pilihan tanaman.
* Menjelaskan risiko kepada petani.

---

## 6.3 Mahasiswa / Peneliti

### Needs

* Melakukan simulasi.
* Mempelajari hubungan antara iklim dan pertanian.
* Membandingkan skenario pertanian.

---

# 7. Core Concept

TANIAMAN menggunakan pendekatan:

```text
User Input
    ↓
External Data
    ↓
Crop Database
    ↓
Risk Engine
    ↓
Decision Engine
    ↓
Recommendation
```

Input utama:

```text
Location
Crop
Land Area
Planting Date
```

Output:

```text
Climate Risk
Water Risk
Economic Risk
Crop Suitability
Recommendation Score
```

---

# 8. Core Features

# 8.1 🌍 Location Selection

User dapat memasukkan lokasi lahan.

Contoh:

```text
Sidoarjo
```

Sistem melakukan geocoding:

```text
Sidoarjo
    ↓
Latitude
Longitude
```

Koordinat kemudian digunakan untuk mengambil data cuaca.

### Data

* Location name
* Latitude
* Longitude

### API

**Open-Meteo Geocoding API**

---

# 8.2 🌾 Farm Configuration

User memasukkan informasi lahan.

### Input

| Field         | Type     | Required |
| ------------- | -------- | -------- |
| Location      | Location | Yes      |
| Land Area     | Number   | Yes      |
| Crop          | Select   | Yes      |
| Planting Date | Date     | Yes      |

### Example

```text
Location     : Sidoarjo
Land Area    : 1.000 m²
Crop         : Padi
Planting Date: 15 October 2026
```

---

# 8.3 🌦️ Climate Analysis

Sistem mengambil data cuaca dan iklim.

## Weather Data

* Temperature
* Precipitation
* Humidity
* Wind Speed
* Forecast

## Historical Climate

* Historical precipitation
* Historical temperature
* Solar radiation
* Humidity
* Wind

### Data Sources

* Open-Meteo
* NASA POWER

---

# 8.4 🌱 Crop Database

TANIAMAN memiliki database karakteristik tanaman.

Contoh:

| Crop    | Growth Days | Water Requirement | Optimal Temperature |
| ------- | ----------: | ----------------- | ------------------- |
| Padi    |     100–120 | High              | 20–35°C             |
| Jagung  |      90–120 | Medium            | 21–30°C             |
| Kedelai |      75–100 | Medium            | 20–30°C             |

Data crop disimpan di **Supabase PostgreSQL**.

---

# 8.5 ⚠️ Risk Analysis

Risk Engine menghitung beberapa jenis risiko.

## A. Weather Risk

Mengukur risiko akibat:

* Curah hujan terlalu rendah.
* Curah hujan terlalu tinggi.
* Temperatur ekstrem.
* Kondisi cuaca yang tidak sesuai.

---

## B. Water Risk

Membandingkan:

```text
Water Availability
        VS
Crop Water Requirement
```

Output:

```text
Low Risk
Medium Risk
High Risk
```

---

## C. Crop Suitability Risk

Membandingkan kondisi lingkungan dengan kebutuhan tanaman.

Contoh:

```text
Temperature:
Optimal      → Low Risk
Near Limit   → Medium Risk
Extreme      → High Risk
```

---

## D. Economic Risk

Mempertimbangkan:

* Harga komoditas.
* Perubahan harga.
* Potensi pendapatan.
* Risiko harga.

---

# 8.6 🧠 Risk & Decision Engine

Ini merupakan **core innovation** TANIAMAN.

API hanya menyediakan data.

Decision Engine mengubah data menjadi keputusan.

### Architecture

```text
Weather Data
     │
     ├── Temperature
     ├── Rainfall
     └── Humidity
            │
            ▼
      ┌──────────────┐
      │  RISK ENGINE │
      └──────────────┘
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
   Weather Water Economic
    Risk   Risk    Risk
      │     │      │
      └─────┼──────┘
            ▼
      DECISION ENGINE
            │
            ▼
      RECOMMENDATION
```

---

# 8.7 ⭐ Recommendation Score

Setiap skenario mendapatkan skor:

```text
0 – 100
```

Contoh:

| Factor           | Weight |
| ---------------- | -----: |
| Weather Risk     |    30% |
| Water Risk       |    25% |
| Crop Suitability |    25% |
| Economic Risk    |    20% |

Contoh perhitungan konseptual:

```text
Final Score =
    Weather Score × 0.30
  + Water Score × 0.25
  + Crop Score × 0.25
  + Economic Score × 0.20
```

Semakin tinggi skor:

> Semakin sesuai dan rendah risikonya.

---

# 8.8 🔮 What-If Simulator

### Fitur utama TANIAMAN.

User dapat membuat beberapa skenario.

### Example

#### Scenario A

```text
Crop : Rice
Date : 1 October
```

#### Scenario B

```text
Crop : Rice
Date : 15 October
```

#### Scenario C

```text
Crop : Corn
Date : 1 October
```

Sistem kemudian membandingkan:

| Parameter        | Scenario A | Scenario B | Scenario C |
| ---------------- | ---------: | ---------: | ---------: |
| Weather Risk     |       High |        Low |     Medium |
| Water Risk       |       High |        Low |     Medium |
| Crop Suitability |         78 |         91 |         86 |
| Economic Risk    |     Medium |        Low |        Low |
| **Score**        |     **68** |     **87** |     **79** |

### Output

```text
🏆 Best Scenario

Rice
15 October

Recommendation Score
87 / 100

Weather Risk
Low

Water Risk
Low

Economic Risk
Low
```

---

# 8.9 🌱 Crop Comparison

User dapat membandingkan beberapa tanaman.

Contoh:

```text
Padi
VS
Jagung
VS
Kedelai
```

Parameter:

* Climate suitability
* Water requirement
* Growth duration
* Weather risk
* Economic risk
* Recommendation score

---

# 8.10 📊 Crop Portfolio Simulator

Fitur lanjutan.

User dapat membuat kombinasi tanaman.

Contoh:

```text
Portfolio A
100% Rice

Portfolio B
70% Rice
30% Corn

Portfolio C
50% Rice
50% Corn
```

Sistem menghitung:

* Estimated risk
* Crop diversification
* Economic exposure
* Water requirement

Tujuan:

> Mengurangi ketergantungan terhadap satu komoditas.

---

# 8.11 📈 Dashboard

Dashboard menampilkan:

```text
Current Climate
       ↓
Risk Overview
       ↓
Recommended Crop
       ↓
Optimal Planting Window
       ↓
Scenario Comparison
```

### Components

* Risk score
* Recommendation card
* Weather chart
* Rainfall chart
* Temperature chart
* Crop comparison
* Planting calendar
* Simulation history

---

# 8.12 📅 Planting Window

TANIAMAN dapat memberikan rentang waktu rekomendasi.

Contoh:

```text
Recommended Planting Window

15 – 25 October

Risk:
LOW

Confidence:
HIGH
```

Sistem dapat mengevaluasi beberapa tanggal:

```text
1 Oct
↓
8 Oct
↓
15 Oct
↓
22 Oct
↓
29 Oct
```

Kemudian mencari periode dengan skor terbaik.

---

# 8.13 📝 Simulation History

User dapat menyimpan simulasi.

Contoh:

```text
Simulation #01
Sidoarjo
Rice
15 October 2026
Score: 87
```

Data disimpan ke Supabase.

---

# 9. User Flow

```text
Landing Page
      ↓
Start Simulation
      ↓
Select Location
      ↓
Configure Farm
      ↓
Select Crop
      ↓
Select Planting Date
      ↓
Analyze
      ↓
Fetching Data
      ↓
Risk Engine
      ↓
Recommendation Result
      ↓
┌───────────────────────┐
│ Recommendation        │
│ Risk Analysis         │
│ Climate Analysis      │
│ Planting Window       │
└───────────────────────┘
      ↓
What-If Simulator
      ↓
Compare Scenarios
      ↓
Save Simulation
```

---

# 10. Functional Requirements

## FR-01 — Location

System MUST allow users to search for a location.

System MUST retrieve latitude and longitude.

---

## FR-02 — Weather

System MUST retrieve weather data based on coordinates.

---

## FR-03 — Crop

System MUST provide a list of available crops.

---

## FR-04 — Simulation

System MUST allow users to create agricultural scenarios.

---

## FR-05 — Risk Analysis

System MUST calculate:

* Weather Risk
* Water Risk
* Crop Suitability Risk
* Economic Risk

---

## FR-06 — Recommendation

System MUST generate a score from:

```text
0–100
```

---

## FR-07 — Comparison

System MUST allow users to compare multiple scenarios.

---

## FR-08 — History

Authenticated users SHOULD be able to save simulation history.

---

# 11. Non-Functional Requirements

## Performance

Target:

```text
Initial page load < 3 seconds
```

API request should be cached whenever possible.

---

## Responsive

Application MUST support:

* Desktop
* Tablet
* Mobile

---

## Security

* Supabase Row Level Security.
* Environment variables for API credentials.
* Server-side API handling where necessary.
* Authentication handled by Supabase Auth.

---

## Availability

The system should gracefully handle external API failure.

Example:

```text
Weather API unavailable.

Using latest available climate data.
```

---

# 12. Tech Stack

# Frontend

## Nuxt.js

Framework utama aplikasi.

Digunakan untuk:

* UI
* Routing
* SSR/SSG
* Server API
* SEO
* Application architecture

### Recommended

```text
Nuxt 4
TypeScript
Vue 3
```

---

## UI

Recommended:

```text
Tailwind CSS
```

Untuk:

* Responsive layout
* Dashboard
* Cards
* Forms
* Tables
* Charts

---

## Charts

Recommended:

```text
Apache ECharts
```

Digunakan untuk:

* Rainfall chart
* Temperature chart
* Risk chart
* Scenario comparison
* Score visualization

---

# Backend

TANIAMAN tidak membutuhkan backend server terpisah pada MVP.

Nuxt dapat digunakan sebagai application layer.

```text
Nuxt Server Routes
        ↓
External APIs
        ↓
Supabase
```

---

# Database

## Supabase PostgreSQL

Digunakan sebagai database utama.

Menyimpan:

* Users
* Profiles
* Crops
* Simulations
* Scenarios
* Weather cache
* Market prices

---

# Authentication

## Supabase Auth

Support:

```text
Email
Password
```

Optional:

```text
Google OAuth
```

---

# External APIs

## 1. Open-Meteo

Digunakan untuk:

* Forecast
* Historical weather
* Temperature
* Rainfall
* Humidity
* Wind

---

## 2. Open-Meteo Geocoding

Digunakan untuk:

```text
Location Name
     ↓
Latitude
Longitude
```

---

## 3. NASA POWER

Digunakan untuk data iklim historis.

---

## 4. Harga Komoditas

Sumber yang diprioritaskan:

* Badan Pangan Nasional
* Panel Harga Pangan
* Sumber pemerintah terkait

---

# 13. System Architecture

```text
                    USER
                     │
                     ▼
              ┌─────────────┐
              │   Nuxt.js   │
              │   Frontend  │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │ Nuxt Server │
              │   Routes    │
              └──────┬──────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
    Open-Meteo   NASA POWER   Market API
          │          │          │
          └──────────┼──────────┘
                     ▼
              ┌─────────────┐
              │    Risk     │
              │   Engine    │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Decision   │
              │   Engine    │
              └──────┬──────┘
                     │
                     ▼
              ┌─────────────┐
              │  Supabase   │
              │ PostgreSQL  │
              └─────────────┘
```

---

# 14. Database Schema

## profiles

```text
profiles
├── id
├── full_name
├── avatar_url
├── created_at
└── updated_at
```

---

## crops

```text
crops
├── id
├── name
├── slug
├── description
├── growth_days_min
├── growth_days_max
├── water_requirement
├── optimal_temp_min
├── optimal_temp_max
├── rainfall_min
├── rainfall_max
├── created_at
└── updated_at
```

---

## simulations

```text
simulations
├── id
├── user_id
├── location_name
├── latitude
├── longitude
├── land_area
├── created_at
└── updated_at
```

---

## scenarios

```text
scenarios
├── id
├── simulation_id
├── crop_id
├── planting_date
├── weather_score
├── water_score
├── crop_score
├── economic_score
├── total_score
├── weather_risk
├── water_risk
├── economic_risk
├── recommendation
└── created_at
```

---

## weather_cache

```text
weather_cache
├── id
├── latitude
├── longitude
├── date
├── temperature
├── precipitation
├── humidity
├── wind_speed
└── created_at
```

---

## market_prices

```text
market_prices
├── id
├── crop_id
├── date
├── price
├── market
└── created_at
```

---

# 15. Row Level Security

Supabase RLS digunakan untuk melindungi data user.

Contoh:

```text
User A
   ↓
Only access
   ↓
User A simulations
```

User tidak dapat mengakses simulasi milik user lain.

### Public Data

Dapat diakses:

```text
crops
market_prices
```

### Private Data

Harus dibatasi:

```text
profiles
simulations
scenarios
```

---

# 16. Risk Engine

Risk Engine merupakan bagian terpenting dari sistem.

## Input

```text
Temperature
Rainfall
Humidity
Historical Climate
Crop Requirement
Planting Date
Growth Duration
Market Price
```

---

## Processing

```text
Climate Analysis
      ↓
Crop Compatibility
      ↓
Water Analysis
      ↓
Economic Analysis
      ↓
Risk Calculation
      ↓
Final Score
```

---

# 17. Risk Classification

Setiap risiko menggunakan skala:

```text
0–30   LOW
31–60  MEDIUM
61–100 HIGH
```

Contoh:

```text
Weather Risk
23 → LOW

Water Risk
42 → MEDIUM

Economic Risk
68 → HIGH
```

---

# 18. Recommendation Algorithm

Contoh konsep:

```text
Weather Score
= 100 - Weather Risk

Water Score
= 100 - Water Risk

Economic Score
= 100 - Economic Risk

Final Score =
    Weather Score × 30%
  + Water Score × 25%
  + Crop Suitability × 25%
  + Economic Score × 20%
```

Contoh:

```text
Weather Score       = 90
Water Score         = 85
Crop Suitability    = 92
Economic Score      = 80
```

Maka:

```text
90 × 0.30 = 27
85 × 0.25 = 21.25
92 × 0.25 = 23
80 × 0.20 = 16

Final Score = 87.25
```

Output:

```text
87 / 100
```

---

# 19. Recommendation Logic

```text
IF score >= 80
    Recommendation = "Highly Recommended"

ELSE IF score >= 65
    Recommendation = "Recommended"

ELSE IF score >= 50
    Recommendation = "Consider Carefully"

ELSE
    Recommendation = "High Risk"
```

---

# 20. Example Output

```text
🌾 RECOMMENDATION

Recommended Crop
────────────────────
Corn

Planting Window
15 – 25 October 2026

Recommendation Score
87 / 100

Risk Level
LOW
```

### Risk Breakdown

```text
Weather Risk
████████░░ 20%

Water Risk
████████░░ 25%

Economic Risk
███████░░░ 30%
```

### Explanation

```text
Why?

✓ Temperature is within the optimal range.
✓ Expected rainfall is sufficient.
✓ Water requirement is lower than rice.
✓ Current commodity price presents moderate economic risk.
```

---

# 21. What-If Simulation

User dapat mengubah parameter tanpa membuat ulang seluruh analisis.

Contoh:

```text
BASELINE

Rice
1 October
Score: 68
```

User mengubah:

```text
Planting Date
1 October → 15 October
```

Sistem menghitung ulang:

```text
Rice
15 October
Score: 87
```

Kemudian:

```text
Score Difference

+19 points
```

Output:

> Menunda waktu tanam 14 hari meningkatkan skor rekomendasi sebesar **19 poin** berdasarkan parameter simulasi yang digunakan.

---

# 22. MVP Scope

Untuk lomba, jangan terlalu banyak fitur.

### MVP wajib:

```text
✓ Landing Page
✓ Location Search
✓ Farm Configuration
✓ Crop Database
✓ Weather API
✓ Climate Analysis
✓ Risk Engine
✓ Recommendation Score
✓ What-If Simulator
✓ Crop Comparison
✓ Dashboard
```

### Optional:

```text
○ Authentication
○ Simulation History
○ Market Price
○ Crop Portfolio
○ Export PDF
```

---

# 23. Future Development

## Phase 2

```text
Market Price Prediction
```

Menggunakan historical price data.

---

## Phase 3

```text
Machine Learning
```

Untuk:

* Yield prediction
* Risk prediction
* Crop recommendation

---

## Phase 4

```text
Satellite Data
```

Untuk analisis:

* Vegetation
* Land condition
* Drought
* Soil-related indicators

---

## Phase 5

```text
IoT Integration
```

Jika suatu saat diperlukan:

```text
Soil Sensor
Temperature Sensor
Humidity Sensor
Water Level Sensor
```

Tetapi **tidak diperlukan untuk MVP**.

---

# 24. Project Structure

Recommended Nuxt structure:

```text
taniaman/
│
├── app/
│   ├── components/
│   │   ├── weather/
│   │   ├── crop/
│   │   ├── simulation/
│   │   ├── risk/
│   │   └── dashboard/
│   │
│   ├── pages/
│   │   ├── index.vue
│   │   ├── simulate.vue
│   │   ├── dashboard.vue
│   │   ├── crops/
│   │   └── simulations/
│   │
│   └── layouts/
│
├── server/
│   ├── api/
│   │   ├── weather/
│   │   ├── geocoding/
│   │   ├── climate/
│   │   ├── market/
│   │   └── simulation/
│   │
│   ├── services/
│   │   ├── weather.service.ts
│   │   ├── climate.service.ts
│   │   ├── crop.service.ts
│   │   ├── market.service.ts
│   │   └── risk.service.ts
│   │
│   └── utils/
│
├── composables/
│   ├── useWeather.ts
│   ├── useSimulation.ts
│   ├── useCrop.ts
│   └── useRisk.ts
│
├── types/
│   ├── crop.ts
│   ├── weather.ts
│   ├── simulation.ts
│   └── risk.ts
│
├── utils/
│   ├── scoring.ts
│   └── risk.ts
│
├── public/
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
│
├── nuxt.config.ts
├── package.json
└── README.md
```

---

# 25. Technology Stack Summary

| Layer              | Technology                         |
| ------------------ | ---------------------------------- |
| Frontend           | Nuxt.js                            |
| Framework          | Vue 3                              |
| Language           | TypeScript                         |
| Styling            | Tailwind CSS                       |
| Charts             | Apache ECharts                     |
| Backend            | Nuxt Server Routes                 |
| Database           | PostgreSQL                         |
| Backend Platform   | Supabase                           |
| Authentication     | Supabase Auth                      |
| Security           | Supabase RLS                       |
| Weather            | Open-Meteo                         |
| Geocoding          | Open-Meteo                         |
| Historical Climate | NASA POWER                         |
| Market Data        | Bapanas / Official Government Data |
| Deployment         | Vercel                             |
| Version Control    | GitHub                             |

---

# 26. Environment Variables

Contoh:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=

NASA_POWER_BASE_URL=

OPEN_METEO_BASE_URL=
OPEN_METEO_GEOCODING_URL=
```

Secret/API key yang sensitif **tidak boleh disimpan di frontend**.

---

# 27. Deployment Architecture

```text
                 GitHub
                    │
                    ▼
                 Vercel
                    │
                    ▼
                Nuxt.js
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      Supabase            External APIs
          │                   │
     PostgreSQL        ┌──────┼──────┐
          │            ▼      ▼      ▼
          │         Weather NASA  Market
          │
          ▼
      Application
```

---

# 28. Success Metrics

Untuk MVP:

### Product Metrics

```text
Simulation completion rate > 80%
```

```text
Recommendation generated < 5 seconds
```

```text
API failure gracefully handled
```

### User Experience

Pengguna dapat:

1. Memilih lokasi.
2. Memilih tanaman.
3. Menentukan tanggal tanam.
4. Mendapatkan analisis.
5. Membandingkan minimal 3 skenario.

Dalam waktu kurang dari:

```text
2–3 minutes
```

---

# 29. Competitive Differentiation

TANIAMAN tidak diposisikan sebagai:

> "Website informasi cuaca untuk petani."

Tetapi:

> **"Simulation-based Agricultural Decision Support System."**

### Perbedaan

| Sistem Biasa      | TANIAMAN               |
| ----------------- | ---------------------- |
| Menampilkan cuaca | Menganalisis dampaknya |
| Kalender tanam    | Simulasi waktu tanam   |
| Informasi tanaman | Crop suitability       |
| Harga komoditas   | Economic risk          |
| Satu rekomendasi  | Multiple scenarios     |
| Data              | Decision support       |
| Forecast          | What-if simulation     |

---

# 30. Key Innovation

### Innovation #1 — What-If Agricultural Simulation

Pengguna dapat melihat konsekuensi dari perubahan keputusan.

```text
What if I plant today?
What if I wait 2 weeks?
What if I choose corn instead?
```

---

### Innovation #2 — Multi-Factor Risk Engine

Rekomendasi tidak hanya berdasarkan cuaca.

```text
Climate
+
Water
+
Crop
+
Economics
=
Decision Score
```

---

### Innovation #3 — Scenario Comparison

TANIAMAN tidak hanya berkata:

> "Tanam jagung."

Tetapi:

> "Dari 3 skenario yang disimulasikan, jagung pada periode X memiliki skor tertinggi karena risiko air lebih rendah dan kondisi temperatur lebih sesuai."

Ini membuat keputusan menjadi **explainable**.

---

# 31. Competition Positioning

### One-liner

> **TANIAMAN adalah platform simulasi keputusan pertanian yang membantu pengguna menentukan tanaman dan waktu tanam dengan menganalisis risiko iklim, kebutuhan air, dan faktor ekonomi.**

### Pitch

> **"Petani sering harus mengambil keputusan berdasarkan ketidakpastian. TANIAMAN memungkinkan mereka mencoba keputusan tersebut secara virtual sebelum benar-benar menanam."**

---

# 32. Final Product Flow

```text
                 🌾 TANIAMAN
                      │
                      ▼
              "Simulasikan Sebelum Menanam"
                      │
                      ▼
              📍 Select Location
                      │
                      ▼
               🌱 Select Crop
                      │
                      ▼
               📅 Planting Date
                      │
                      ▼
               📐 Land Area
                      │
                      ▼
             ┌─────────────────┐
             │   DATA LAYER    │
             │                 │
             │ Open-Meteo      │
             │ NASA POWER      │
             │ Market Data     │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │   RISK ENGINE   │
             │                 │
             │ Weather         │
             │ Water           │
             │ Crop            │
             │ Economic        │
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │ DECISION ENGINE │
             └────────┬────────┘
                      │
                      ▼
                ⭐ SCORE 0–100
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       🌾 Crop      📅 Time     ⚠️ Risk
       Choice       Window      Analysis
          │           │           │
          └───────────┼───────────┘
                      ▼
             🔮 WHAT-IF SIMULATOR
                      │
                      ▼
             📊 SCENARIO COMPARISON
                      │
                      ▼
                🏆 BEST DECISION
```

---

# 33. Recommended MVP Priority

Jika waktu development terbatas, prioritaskan:

```text
P0 — MUST HAVE
────────────────────────
1. Location
2. Crop selection
3. Planting date
4. Weather API
5. Crop database
6. Risk Engine
7. Recommendation Score
8. What-If Simulator
9. Scenario Comparison


P1 — SHOULD HAVE
────────────────────────
10. Historical climate
11. Market price
12. Dashboard
13. Authentication
14. Simulation history


P2 — NICE TO HAVE
────────────────────────
15. Crop Portfolio
16. PDF Export
17. ML Prediction
18. Satellite Data
19. IoT
```

---

# 34. Final Tech Stack

```text
┌──────────────────────────────┐
│          FRONTEND            │
│                              │
│ Nuxt 4                       │
│ Vue 3                        │
│ TypeScript                   │
│ Tailwind CSS                 │
│ Apache ECharts               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          BACKEND             │
│                              │
│ Nuxt Server Routes           │
│ TypeScript                   │
│ Risk & Decision Engine       │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐   ┌────────────────┐
│  SUPABASE   │   │ EXTERNAL APIs  │
│             │   │                │
│ PostgreSQL  │   │ Open-Meteo     │
│ Auth        │   │ NASA POWER     │
│ RLS         │   │ Market Data    │
└─────────────┘   └────────────────┘
               │
               ▼
           VERCEL
```

---

# 35. Conclusion

TANIAMAN dirancang bukan sebagai aplikasi pertanian biasa, tetapi sebagai **Climate-Agricultural Decision Support System**.

Kekuatan utamanya berada pada:

```text
Data
 ↓
Risk Analysis
 ↓
What-If Simulation
 ↓
Scenario Comparison
 ↓
Decision
```

Dengan **Nuxt.js + Supabase**, MVP dapat dibuat relatif cepat tanpa harus membangun backend terpisah.

Fokus utama development sebaiknya bukan memperbanyak fitur, tetapi membuat **Risk Engine + What-If Simulator** benar-benar solid, karena bagian tersebut yang paling kuat untuk menjadi pembeda saat presentasi lomba.

> **TANIAMAN — Don't just predict the weather. Simulate the decision.**
