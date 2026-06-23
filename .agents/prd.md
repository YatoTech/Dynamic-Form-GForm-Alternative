# Dynamic Form Builder — Product Requirements Document

> **Versi:** 1.0.0 | **Tanggal:** 2026-06-22 | **Status:** Final Draft  
> **Penulis:** AI-assisted PRD | **Dokumen Terkait:** `design.md`

---

## Daftar Isi

1. [Executive Summary](#1-executive-summary)
2. [Objectives & Success Metrics](#2-objectives--success-metrics)
3. [Target Audience & User Personas](#3-target-audience--user-personas)
4. [User Flow & UI/UX Requirements](#4-user-flow--uiux-requirements)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [System & Technical Assumptions](#7-system--technical-assumptions)
8. [Out of Scope](#8-out-of-scope)

---

## 1. Executive Summary

### 1.1 Ringkasan Produk

**Dynamic Form Builder** adalah aplikasi pembuat formulir dinamis berbasis JavaScript murni (Vanilla JS) yang mereplikasi fungsionalitas inti Google Forms secara 1:1. Aplikasi ini dirancang sebagai solusi **client-side first**, ringan, dan **self-hostable** — memungkinkan siapa pun membuat, mendistribusikan, dan mengelola formulir web tanpa bergantung pada layanan pihak ketiga.

### 1.2 Masalah yang Diselesaikan

| # | Masalah | Dampak pada Pengguna |
|---|---------|---------------------|
| 1 | Google Forms mengharuskan akun Google | Membatasi adopsi di organisasi non-Google ecosystem |
| 2 | Tidak ada kontrol penuh atas data respons | Menimbulkan risiko privasi dan kepatuhan regulasi (GDPR, UU PDP) |
| 3 | Kustomisasi UI Google Forms sangat terbatas | Tidak bisa diselaraskan dengan brand identity organisasi |
| 4 | Embed Google Forms menggunakan iframe kaku | Pengalaman responsif yang buruk di mobile |
| 5 | Solusi alternatif (Typeform, Jotform) berbayar mahal | Barrier signifikan untuk individu, freelancer, dan UMKM |

### 1.3 Proposisi Nilai Unik

- **Zero-dependency core** — berjalan tanpa framework atau library eksternal wajib
- **Embeddable by default** — satu baris script untuk menyisipkan form ke halaman web manapun
- **Data sovereignty** — pengguna memiliki kendali penuh atas tujuan penyimpanan data respons (localStorage, webhook, Supabase, Google Sheets)
- **Deploy dalam 5 menit** — tanpa konfigurasi server, database, atau akun pihak ketiga
- **Target bundle < 150 KB gzipped** — performa setara native di jaringan 4G

### 1.4 Visi Produk

> *"Sebuah form builder yang bisa di-deploy dalam 5 menit, berjalan di browser tanpa dependency eksternal wajib, dan memberikan pengalaman yang identik dengan Google Forms dari sisi pembuat maupun pengisi formulir."*

### 1.5 Prinsip Desain

| Prinsip | Penjelasan |
|---------|-----------|
| **Parity First** | Setiap fitur Google Forms harus ada dan berperilaku identik |
| **Zero Dependency Core** | Core engine berjalan tanpa framework eksternal |
| **Progressive Enhancement** | Form tetap readable tanpa JavaScript; kaya fitur dengan JavaScript aktif |
| **Data Sovereignty** | Pengguna menentukan ke mana data respons dikirim |
| **Embeddable by Default** | Bisa ditanamkan ke halaman manapun tanpa konflik CSS/JS |

---

## 2. Objectives & Success Metrics

### 2.1 Tujuan Utama

| # | Objective | Deskripsi |
|---|-----------|-----------|
| O1 | **Feature Parity dengan Google Forms** | Mereplikasi 11 tipe pertanyaan, conditional logic, tema visual, dan alur pengisian yang identik |
| O2 | **Kemudahan Deployment** | Aplikasi dapat di-deploy dan digunakan dalam waktu < 5 menit tanpa setup server |
| O3 | **Performa Optimal** | Bundle < 150 KB gzipped, TTI < 2 detik pada jaringan 4G |
| O4 | **Aksesibilitas Universal** | Dapat digunakan tanpa akun, tanpa login, dan memenuhi standar WCAG 2.1 Level AA |
| O5 | **Embeddability** | Form dapat di-embed ke halaman web manapun via iframe, Web Component, atau JavaScript API |

### 2.2 Key Performance Indicators (KPI)

#### KPI Teknis (Diukur saat development & CI/CD)

| KPI | Target | Metode Pengukuran |
|-----|--------|-------------------|
| Lighthouse Performance Score | ≥ 90 | Lighthouse CI |
| Lighthouse Accessibility Score | ≥ 90 | Lighthouse CI |
| Time to Interactive (TTI) | < 2 detik (4G) | Lighthouse |
| First Contentful Paint (FCP) | < 1 detik | Lighthouse |
| Bundle Size (gzipped) | ≤ 150 KB | Webpack/Vite Bundle Analyzer |
| Form render (100 pertanyaan) | < 300 ms | Chrome DevTools Performance |
| Submit response (lokal) | < 500 ms | Performance API |
| Memory footprint | < 30 MB heap | Chrome Memory Profiler |
| Zero JS errors di console | 100% | Manual + E2E test |
| Cross-browser test pass rate (P0) | 100% | Playwright |
| Unit test coverage (logic + validation) | ≥ 80% | Vitest coverage |

#### KPI Produk (Diukur post-launch)

| KPI | Target | Cara Pengukuran |
|-----|--------|----------------|
| Waktu pembuatan form (5 pertanyaan) | < 3 menit | Usability testing manual |
| Form completion rate | ≥ 85% (diisi hingga submit) | Analytics tracker opsional |
| Error/bug report rate | < 2 per 100 pengguna aktif | Issue tracker |

### 2.3 Kriteria Keberhasilan MVP

MVP dianggap **siap rilis** jika:

- [x] Semua item **P0** dari Functional Requirements terpenuhi
- [x] Form builder dapat membuat form dengan minimal 6 tipe pertanyaan (QT-01 s/d QT-06, QT-12)
- [x] Form renderer menampilkan dan memvalidasi form dengan benar
- [x] Response collector menyimpan respons ke localStorage
- [x] Response viewer menampilkan summary dan individual view
- [x] Export CSV bekerja dengan encoding UTF-8 + BOM
- [x] Form dapat dibagikan via URL unik
- [x] Diuji di Chrome, Firefox, Safari (versi terbaru)
- [x] Responsif di mobile 375px dan desktop 1280px

---

## 3. Target Audience & User Personas

### 3.1 Persona Utama

#### Persona 1: Developer / Freelancer — "Andi"

| Atribut | Detail |
|---------|--------|
| **Nama Fiktif** | Andi, 28 tahun |
| **Profil** | Full-stack developer freelance yang membangun website untuk berbagai klien |
| **Kebutuhan** | Membuat formulir registrasi, survei kepuasan, order form yang bisa di-embed ke website klien |
| **Pain Point** | Klien enggan login Google; Google Forms styling tidak bisa disesuaikan dengan brand klien; butuh data dikirim ke webhook/CRM klien |
| **Skill Level** | Technical — nyaman dengan HTML/JS/API |
| **Skenario Utama** | Embed form via `<dynamic-form>` Web Component ke landing page klien, konfigurasikan webhook untuk mengirim data respons ke server klien |
| **Frekuensi Penggunaan** | 3–5 form baru per bulan |

#### Persona 2: Admin / Operator Non-Technical — "Sari"

| Atribut | Detail |
|---------|--------|
| **Nama Fiktif** | Sari, 35 tahun |
| **Profil** | Staff administrasi di organisasi kecil/menengah |
| **Kebutuhan** | Membuat formulir absensi, pendaftaran acara, kuesioner internal secara mandiri |
| **Pain Point** | Tidak bisa coding; butuh antarmuka drag-and-drop yang intuitif mirip Google Forms |
| **Skill Level** | Non-technical — familiar dengan Google Forms dan spreadsheet |
| **Skenario Utama** | Buka form builder → buat form via drag-and-drop → bagikan link → pantau respons di dashboard |
| **Frekuensi Penggunaan** | 1–2 form per minggu |

#### Persona 3: Peneliti / Akademisi — "Dr. Reza"

| Atribut | Detail |
|---------|--------|
| **Nama Fiktif** | Dr. Reza, 42 tahun |
| **Profil** | Dosen dan peneliti di universitas yang sering melakukan survei kuantitatif |
| **Kebutuhan** | Kuesioner penelitian dengan logika bercabang kompleks, validasi ketat, dan ekspor ke CSV/Excel untuk analisis statistik |
| **Pain Point** | Google Forms memiliki batasan pada validasi custom dan branching kompleks; tidak bisa export dalam format yang bersih untuk SPSS |
| **Skill Level** | Semi-technical — paham konsep logic tapi bukan programmer |
| **Skenario Utama** | Formulir 50+ pertanyaan dengan skip logic multi-cabang, validasi rentang angka, export CSV untuk diproses di SPSS/Excel |
| **Frekuensi Penggunaan** | 2–4 form per semester |

### 3.2 Persona Sekunder

| Persona | Deskripsi | Interaksi dengan Sistem |
|---------|-----------|------------------------|
| **System Integrator** | Developer yang mengintegrasikan form data ke sistem lain (CRM, email marketing, database) | Mengkonfigurasi webhook URL, menggunakan JavaScript API/SDK |
| **Responden (End User)** | Pengguna akhir yang mengisi formulir — **tidak perlu akun** | Mengakses form via URL → mengisi → submit |

### 3.3 Matriks Kebutuhan per Persona

| Kebutuhan | Andi (Dev) | Sari (Admin) | Dr. Reza (Peneliti) |
|-----------|:----------:|:------------:|:-------------------:|
| Drag-and-drop editor | ★★★ | ★★★★★ | ★★★★ |
| Embedding (iframe/SDK) | ★★★★★ | ★ | ★★ |
| Conditional logic | ★★★ | ★★ | ★★★★★ |
| Validasi custom | ★★★ | ★★ | ★★★★★ |
| Tema/branding | ★★★★ | ★★★ | ★★ |
| Export CSV | ★★★ | ★★★★ | ★★★★★ |
| Webhook integration | ★★★★★ | ★ | ★ |
| Kemudahan tanpa coding | ★★ | ★★★★★ | ★★★★ |

---

## 4. User Flow & UI/UX Requirements

### 4.1 Alur Utama: Pembuat Form (Creator Flow)

```
[Buka Aplikasi]
       │
       ▼
┌──────────────────────────┐
│  DASHBOARD: Daftar Form  │
│  ┌─────┐ ┌─────┐ ┌────┐ │
│  │Form1│ │Form2│ │ +  │ │
│  └─────┘ └─────┘ └────┘ │
└──────────┬───────────────┘
           │
     ┌─────┴─────┐
     │           │
[Buat Baru]  [Buka Existing]
     │           │
     └─────┬─────┘
           ▼
┌──────────────────────────────┐
│        FORM EDITOR           │
│  ┌────────────────────────┐  │
│  │ Tab: Questions|Responses│  │
│  │      |Settings          │  │
│  ├────────────────────────┤  │
│  │ [+ Tambah Pertanyaan]  │  │
│  │ [QuestionCard 1]       │  │
│  │ [QuestionCard 2]       │  │
│  │ [QuestionCard N...]    │  │
│  ├────────────────────────┤  │
│  │ [Preview] [Send/Share] │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
[Preview]  [Share]    [Responses]
   │     ┌───┴───┐       │
   │     │  │  │ │       │
   │  [Link][Embed][QR]  │
   │                     │
   │              ┌──────┴──────┐
   │              ▼             ▼
   │         [Summary]    [Individual]
   │              │
   │         [Export CSV/JSON]
   │
   ▼
[Form Renderer — Preview Mode]
```

#### Detail Interaksi per Langkah:

**Langkah 1 — Dashboard (Daftar Form)**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Tombol "+ Buat Form Baru" | Klik → membuat form kosong dan navigasi ke editor | Animasi fade-in form baru |
| Card Form Existing | Klik → buka form di editor | Highlight card, transisi ke editor |
| Menu titik tiga (⋮) per card | Klik → dropdown: Duplikasi, Hapus, Export JSON | Dropdown menu muncul |
| Konfirmasi Hapus | Modal konfirmasi "Apakah Anda yakin?" | Modal overlay dengan tombol "Hapus" (merah) dan "Batal" |

> [!NOTE]
> **[ASUMSI]** Dashboard menampilkan form dalam format **card grid** (mirip Google Forms home). Setiap card menampilkan: judul form, tanggal terakhir diubah, dan jumlah respons. Informasi ini tidak ada di draf — perlu konfirmasi apakah format list atau grid yang diinginkan.

**Langkah 2 — Form Editor**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Judul Form | Klik → inline editable, placeholder "Formulir tanpa judul" | Border bawah muncul saat fokus |
| Deskripsi Form | Klik → inline editable, placeholder "Deskripsi form" | Textarea expand otomatis |
| TabBar (Questions / Responses / Settings) | Klik tab → switch view | Underline animasi pindah tab |
| Floating Action Button / Toolbar Pertanyaan | Klik → sidebar/panel tipe pertanyaan muncul | Panel slide-in dari kanan |
| QuestionCard | Klik → mode edit aktif (expand card) | Card terangkat (shadow), input fields muncul |
| Drag Handle (⠿) | Drag → reorder pertanyaan | Ghost element + drop indicator line |
| Toggle "Required" | Klik toggle → aktif/nonaktif | Toggle berubah warna + asterisk (*) di label |
| Tombol "Duplikasi" pertanyaan | Klik → pertanyaan baru identik muncul di bawah | Animasi slide-down card baru |
| Tombol "Hapus" pertanyaan | Klik → konfirmasi dialog → hapus | Card fade-out + collapse animasi |
| Undo / Redo | Ctrl+Z / Ctrl+Y atau tombol di toolbar | Toast notification "Undo berhasil" |
| Auto-save | Otomatis setiap 30 detik dan saat perubahan | Indikator "Disimpan" / "Menyimpan..." di header |

> [!IMPORTANT]
> **Layout Editor — Desktop (≥1024px):** Dua kolom — kolom kiri untuk daftar pertanyaan (scrollable, drag-droppable), kolom kanan menampilkan toolbar tipe pertanyaan sebagai floating sidebar. **Mobile/Tablet (<1024px):** Layout satu kolom, toolbar menjadi floating action button (FAB) di pojok kanan bawah.

**Langkah 3 — Konfigurasi Pertanyaan (QuestionCard dalam mode edit)**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Dropdown Tipe Pertanyaan | Klik → pilih tipe → UI card berubah sesuai tipe | Transisi smooth antar layout input |
| Input Pertanyaan | Ketik teks pertanyaan | Placeholder "Pertanyaan" |
| Input Deskripsi/Bantuan | Klik "Tambah deskripsi" → input muncul | Collapse/expand animasi |
| Opsi Jawaban (MC/Checkbox/Dropdown) | Ketik opsi, klik "+ Tambah opsi" | Opsi baru muncul dengan animasi |
| Toggle "Tambah opsi 'Lainnya'" | Klik → opsi "Lainnya" muncul di daftar | Opsi italic "Lainnya..." ditambahkan |
| Konfigurasi Validasi | Klik ikon "⋮" → "Validasi respons" | Panel validasi expand di bawah card |
| Konfigurasi Logic (MC only) | Di setiap opsi: dropdown "Lanjut ke seksi..." | Indikator branching icon muncul |

**Langkah 4 — Preview**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Tombol "Pratinjau" | Klik → form renderer terbuka (tab baru atau modal) | Banner "MODE PRATINJAU" di atas |
| Form Renderer (preview) | Pengisian identik dengan mode live, tapi respons **tidak disimpan** | Badge "Preview" persisten |
| Tombol "Kembali ke Editor" | Klik → kembali ke editor | Navigasi balik |

**Langkah 5 — Bagikan (Share)**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Dialog Share | Modal/panel dengan tabs: Link / Embed / QR | Modal overlay |
| "Salin Link" | Klik → URL tersalin ke clipboard | Toast "Link disalin!" + ikon centang |
| "Kode Embed" | Tab → tampilkan kode iframe / Web Component | Code block dengan tombol salin |
| "QR Code" | Tab → QR Code ter-generate untuk URL form | QR Code image + tombol download |
| Toggle "Terima respons" | On/Off → form dibuka/ditutup untuk respons | Status badge berubah (Aktif/Nonaktif) |

**Langkah 6 — Monitor Respons**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Tab "Respons" di editor | Klik → switch ke response viewer | Angka jumlah respons di badge tab |
| Summary View | Default view — chart/statistik agregat per pertanyaan | Pie/bar chart untuk pilihan, list untuk teks |
| Individual View | Klik tab "Individual" → navigasi per respons | Tombol ◀ Sebelumnya / Berikutnya ▶ |
| Export CSV | Klik "Export CSV" → download file | Toast "File CSV berhasil diunduh" |
| Export JSON | Klik "Export JSON" → download file | Toast "File JSON berhasil diunduh" |

---

### 4.2 Alur Utama: Pengisi Form (Responder Flow)

```
[Buka Link Form / Embedded Form]
           │
           ▼
┌──────────────────────────────┐
│   FORM RENDERER: Seksi 1    │
│  ┌────────────────────────┐  │
│  │ 📋 Judul Form          │  │
│  │    Deskripsi Form      │  │
│  ├────────────────────────┤  │
│  │ 1. Pertanyaan 1 *      │  │
│  │    [Input Field]       │  │
│  │    ⚠ Error message     │  │
│  │                        │  │
│  │ 2. Pertanyaan 2        │  │
│  │    ○ Opsi A            │  │
│  │    ○ Opsi B            │  │
│  │    ○ Opsi C            │  │
│  ├────────────────────────┤  │
│  │ ━━━━━━━━━━ 33% ━━━━━━ │  │
│  │         [Berikutnya →] │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │
      [Validasi Real-time]
               │
      [Logic Engine Check]
               │
    ┌──────────┴──────────┐
    ▼                     ▼
[Seksi Berikutnya]    [Skip ke Seksi N]
    │                     │
    └──────────┬──────────┘
               ▼
┌──────────────────────────────┐
│   SEKSI TERAKHIR             │
│  ├────────────────────────┤  │
│  │ ━━━━━━━━━━ 100% ━━━━━ │  │
│  │ [← Kembali]  [Kirim]  │  │
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │
       [Validasi Final]
               │
       [Submit ke Storage]
               │
               ▼
┌──────────────────────────────┐
│   HALAMAN KONFIRMASI         │
│  ┌────────────────────────┐  │
│  │ ✅ Respons Anda telah  │  │
│  │    tercatat.            │  │
│  │                        │  │
│  │ [Kirim respons lain]   │  │
│  │ [Edit respons Anda]    │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

#### Detail Interaksi per Langkah:

**Langkah 1 — Memuat Form**

| Kondisi | Behavior |
|---------|----------|
| Form aktif (accepting responses) | Form dimuat dan ditampilkan normal |
| Form ditutup (not accepting) | Tampilkan pesan "Formulir ini sudah tidak menerima respons" |
| Sesi sebelumnya tersimpan (sessionStorage) | Tampilkan prompt: "Lanjutkan pengisian sebelumnya?" dengan opsi "Lanjutkan" / "Mulai Baru" |
| URL memiliki query parameter prefill | Field otomatis terisi sesuai parameter |

**Langkah 2 — Mengisi Pertanyaan**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Text Input (Short Answer) | Ketik → validasi on-blur | Border hijau (valid) atau merah (error) + pesan error |
| Radio Button (Multiple Choice) | Klik opsi → satu terpilih | Opsi terpilih: filled circle + background highlight |
| Checkbox | Klik → toggle centang | Animasi checkmark |
| Dropdown | Klik → menu terbuka, pilih opsi | Standard select dengan custom styling |
| Linear Scale | Klik angka → terpilih | Angka terpilih: filled circle + warna aksen |
| Grid | Klik cell → radio/checkbox di cell | Cell terpilih: background highlight |
| Date Picker | Klik → native date picker terbuka | Format tanggal sesuai locale |
| Time Picker | Klik → native time picker | Format waktu sesuai konfigurasi (12h/24h) |
| Pertanyaan Wajib (*) | Field kosong saat blur/submit → error | Asterisk merah di label + error message merah |

**Langkah 3 — Validasi Real-time**

| Event | Behavior |
|-------|----------|
| `on-blur` (field kehilangan fokus) | Validasi field → tampilkan error jika invalid |
| `on-input` (saat mengetik, jika error sudah tampil) | Re-validasi → hilangkan error jika sudah valid |
| `on-submit` (klik "Kirim") | Validasi semua field → scroll ke error pertama jika ada |

> [!TIP]
> **Scroll-to-error behavior:** Saat submit gagal, halaman scroll smooth ke pertanyaan pertama yang error, dengan pertanyaan tersebut mendapat flash highlight (background merah pudar selama 1.5 detik).

**Langkah 4 — Navigasi Antar Seksi**

| Elemen UI | Interaksi | Feedback Visual |
|-----------|-----------|----------------|
| Tombol "Berikutnya →" | Validasi seksi aktif → navigasi ke seksi berikutnya (atau sesuai logic) | Progress bar update, scroll ke atas |
| Tombol "← Kembali" | Navigasi ke seksi sebelumnya, jawaban tetap tersimpan | Progress bar update mundur |
| Progress Bar | Visual indikator kemajuan pengisian | Bar horizontal berwarna: persentase seksi yang telah dilalui |

**Langkah 5 — Submit & Konfirmasi**

| Kondisi | Behavior |
|---------|----------|
| Submit berhasil (lokal) | Tampilkan halaman konfirmasi dengan pesan kustom |
| Submit berhasil (webhook) | Kirim POST → tampilkan konfirmasi setelah response 2xx |
| Submit gagal (webhook error) | Retry otomatis 3× → simpan ke antrian lokal → tampilkan pesan "Respons tersimpan, akan dikirim saat koneksi tersedia" |
| Limit 1 respons aktif | Setelah submit, flag localStorage → kunjungan berikutnya menampilkan "Anda sudah mengisi formulir ini" |

---

### 4.3 Panduan Tata Letak & Visual

#### 4.3.1 Breakpoint & Responsive Behavior

| Breakpoint | Lebar Viewport | Perilaku Layout |
|------------|---------------|----------------|
| Mobile S | 320px | Stack vertikal penuh, font 14px, padding 12px |
| Mobile M | 375px | Stack vertikal, font 15px, padding 16px |
| Mobile L | 425px | Stack vertikal, font 15px, padding 16px |
| Tablet | 768px | Sidebar editor tersembunyi, konten terpusat, max-width 600px |
| Desktop | 1024px+ | Layout dua kolom untuk editor (sidebar toolbar + question list) |
| Desktop XL | 1440px | Max-width 720px untuk form renderer, centered |

#### 4.3.2 Layout Editor (Desktop ≥1024px)

```
┌───────────────────────────────────────────────────────┐
│  [Logo]  📋 Judul Form (editable)  [Preview] [Share]  │
│  ─────────────────────────────────────────────────────  │
│  [Questions] [Responses] [Settings]                    │
├──────────────────────────────────┬────────────────────┤
│                                  │  ┌──────────────┐  │
│  ┌────────────────────────────┐  │  │ + Pertanyaan │  │
│  │  Section: Bagian 1         │  │  │──────────────│  │
│  ├────────────────────────────┤  │  │ Aa Teks      │  │
│  │  ⠿ Pertanyaan 1 *          │  │  │ ¶ Paragraf   │  │
│  │    [Short Answer field]    │  │  │ ◉ Pilihan    │  │
│  ├────────────────────────────┤  │  │ ☑ Checkbox   │  │
│  │  ⠿ Pertanyaan 2            │  │  │ ▼ Dropdown   │  │
│  │    ○ Opsi A                │  │  │ ⊕ Skala      │  │
│  │    ○ Opsi B                │  │  │ # Grid       │  │
│  │    ○ Opsi C                │  │  │ 📅 Tanggal   │  │
│  │    + Tambah opsi           │  │  │ ⏰ Waktu     │  │
│  ├────────────────────────────┤  │  │ ── Seksi     │  │
│  │         + Pertanyaan       │  │  └──────────────┘  │
│  └────────────────────────────┘  │                    │
│                                  │  ┌──────────────┐  │
│                                  │  │ 🎨 Tema      │  │
│                                  │  └──────────────┘  │
├──────────────────────────────────┴────────────────────┤
│  Status: Disimpan ✓     │     Undo │ Redo            │
└───────────────────────────────────────────────────────┘
```

#### 4.3.3 Layout Form Renderer (Responden)

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ ▓▓▓▓▓▓▓▓▓ HEADER IMAGE ▓▓▓▓▓▓▓▓ │  │
│  │                                   │  │
│  │  📋 Judul Formulir               │  │
│  │  Deskripsi formulir di sini...   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 1. Nama Lengkap *                │  │
│  │    ┌─────────────────────────┐   │  │
│  │    │ Jawaban Anda            │   │  │
│  │    └─────────────────────────┘   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 2. Jenis Kelamin *               │  │
│  │    ○ Laki-laki                    │  │
│  │    ○ Perempuan                    │  │
│  │    ○ Lainnya: [________]          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ━━━━━━━━━━━━━━ 50% ━━━━━━━━━━━━━━━   │
│                         [Berikutnya →] │
└─────────────────────────────────────────┘
```

#### 4.3.4 Referensi Visual & Gaya

| Aspek | Spesifikasi |
|-------|-------------|
| **Warna Default** | Header: `#4285F4`, Background: `#F0F4F9`, Card: `#FFFFFF` |
| **Font Default** | Sans Serif (Google Sans / system font stack) |
| **Border Radius** | Card: 8px, Input: 4px, Button: 4px |
| **Shadow (Card)** | `0 1px 2px rgba(0,0,0,0.1)` (idle), `0 2px 6px rgba(0,0,0,0.15)` (active/hover) |
| **Spacing** | Antar card: 12px, Padding card: 24px, Padding page: 16px (mobile) / 0 (desktop centered) |
| **Animasi** | Transisi 200ms ease untuk hover/focus, 300ms ease-out untuk drag |
| **Error State** | Warna merah `#D93025`, border bawah merah pada input, pesan error di bawah field |
| **Required Indicator** | Asterisk `*` warna merah setelah label pertanyaan |

#### 4.3.5 Preset Tema (Identik Google Forms)

| Nama Tema | Warna Header | Background |
|-----------|:------------:|:----------:|
| Default | `#4285F4` | `#F0F4F9` |
| Poppy | `#E53935` | `#FBE9E7` |
| Flamingo | `#F06292` | `#FCE4EC` |
| Blueberry | `#3949AB` | `#E8EAF6` |
| Sage | `#558B2F` | `#F1F8E9` |
| Spearmint | `#00897B` | `#E0F2F1` |

---

## 5. Functional Requirements

### 5.1 Arsitektur Modul

```
Dynamic Form Builder
├── [M1] Form Builder (Editor)       — Antarmuka drag-and-drop untuk membuat form
├── [M2] Form Renderer               — Tampilan form untuk pengisi
├── [M3] Response Collector          — Pengumpulan dan penyimpanan jawaban
├── [M4] Response Viewer             — Visualisasi dan manajemen respons
├── [M5] Theme Engine                — Kustomisasi tampilan form
├── [M6] Logic Engine                — Conditional logic & branching
├── [M7] Validation Engine           — Validasi input real-time
├── [M8] Export/Import               — Ekspor form & respons
└── [M9] Sharing & Embedding        — Berbagi link & embed ke website
```

> Prioritas menggunakan skala:
> - **P0** = Wajib untuk MVP (must-have)
> - **P1** = Penting, segera setelah MVP (should-have)
> - **P2** = Diinginkan, bisa ditunda (nice-to-have)

---

### 5.2 [M1] Form Builder — Editor

#### User Stories & Acceptance Criteria

---

**US-001 — Membuat Form Baru** `[P0]`

> Sebagai **pembuat form**, saya ingin **membuat form baru dengan judul dan deskripsi**, sehingga **responden memahami tujuan form saya**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Klik "Buat Form Baru" di dashboard → halaman editor terbuka dengan form kosong |
| AC-2 | Input judul ditampilkan dengan placeholder "Formulir tanpa judul", max 500 karakter |
| AC-3 | Input deskripsi opsional ditampilkan di bawah judul, max 2000 karakter |
| AC-4 | Perubahan judul dan deskripsi tersimpan otomatis ke localStorage (auto-save setiap 30 detik + on-blur) |
| AC-5 | Form mendapat `formId` unik (UUID v4) saat dibuat |
| AC-6 | Timestamp `createdAt` dan `updatedAt` tercatat dalam format ISO-8601 |

---

**US-002 — Menambahkan Pertanyaan** `[P0]`

> Sebagai **pembuat form**, saya ingin **menambahkan berbagai tipe pertanyaan dari toolbar**, sehingga **saya dapat mengumpulkan berbagai jenis data dari responden**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Toolbar/panel menampilkan semua tipe pertanyaan yang tersedia dengan ikon dan label |
| AC-2 | Klik tipe pertanyaan → pertanyaan baru ditambahkan di bawah pertanyaan yang sedang aktif (atau di akhir jika tidak ada yang aktif) |
| AC-3 | Pertanyaan baru langsung masuk mode edit (expanded card) |
| AC-4 | Pertanyaan baru mendapat `questionId` unik (UUID v4) |
| AC-5 | Mendukung minimal 10 tipe pertanyaan inti (QT-01 s/d QT-10) + Section Header (QT-12) |

**Tipe Pertanyaan yang Didukung:**

| ID | Tipe Pertanyaan | Deskripsi | Google Forms Parity | Prioritas |
|----|----------------|-----------|:-------------------:|:---------:|
| QT-01 | Short Answer | Input teks satu baris | ✅ | P0 |
| QT-02 | Paragraph | Textarea multi-baris | ✅ | P0 |
| QT-03 | Multiple Choice | Pilihan radio (satu jawaban) | ✅ | P0 |
| QT-04 | Checkboxes | Pilihan checkbox (multi-jawaban) | ✅ | P0 |
| QT-05 | Dropdown | Select menu dropdown | ✅ | P0 |
| QT-06 | Linear Scale | Skala numerik (mis. 1–5, 1–10) | ✅ | P0 |
| QT-07 | Multiple Choice Grid | Grid baris × kolom, satu per baris | ✅ | P1 |
| QT-08 | Checkbox Grid | Grid baris × kolom, multi per baris | ✅ | P1 |
| QT-09 | Date | Date picker | ✅ | P0 |
| QT-10 | Time | Time picker | ✅ | P0 |
| QT-11 | File Upload | Upload file (disimpan lokal/remote) | ✅ | P2 |
| QT-12 | Section Header | Pembatas antar seksi (bukan pertanyaan) | ✅ | P0 |
| QT-13 | Rating (Bintang) | Skala bintang 1–5 atau 1–10 | ❌ (ekstensi) | P2 |

---

**US-003 — Menyusun Ulang Pertanyaan** `[P0]`

> Sebagai **pembuat form**, saya ingin **menyusun ulang pertanyaan dengan drag-and-drop**, sehingga **urutan pertanyaan sesuai alur yang saya inginkan**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Handle drag (⠿) tersedia di sisi kiri setiap QuestionCard |
| AC-2 | Saat drag dimulai, ghost element muncul mengikuti cursor |
| AC-3 | Drop indicator (garis horizontal biru) muncul di posisi target |
| AC-4 | Animasi smooth (300ms ease-out) saat card berpindah posisi |
| AC-5 | Urutan pertanyaan tersimpan otomatis setelah drop |
| AC-6 | Keyboard alternative: fokus pada card → tekan Alt+↑ / Alt+↓ untuk reorder |
| AC-7 | Touch device: long press → drag mode aktif |

---

**US-004 — Menandai Pertanyaan Wajib** `[P0]`

> Sebagai **pembuat form**, saya ingin **menandai pertanyaan sebagai wajib diisi**, sehingga **responden tidak bisa melewati pertanyaan penting**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Toggle "Required" tersedia di footer setiap QuestionCard |
| AC-2 | Saat aktif, tanda bintang merah `*` muncul di samping label pertanyaan |
| AC-3 | Atribut `aria-required="true"` ditambahkan ke input terkait |
| AC-4 | Validasi required aktif saat form disubmit oleh responden |

---

**US-005 — Preview Form** `[P0]`

> Sebagai **pembuat form**, saya ingin **mempratinjau form sebelum membagikannya**, sehingga **saya bisa memastikan tampilan dan alur sudah benar**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Tombol "Pratinjau" / ikon 👁 tersedia di header editor |
| AC-2 | Klik → form renderer terbuka di tab baru atau modal full-screen |
| AC-3 | Mode pratinjau **tidak** menyimpan respons |
| AC-4 | Banner/badge "MODE PRATINJAU" terlihat jelas di atas form |
| AC-5 | Tombol "Kembali ke Editor" tersedia untuk navigasi balik |

---

**US-006 — Mengelola Form** `[P0/P1]`

> Sebagai **pembuat form**, saya ingin **menyimpan, menduplikasi, dan menghapus form**, sehingga **saya dapat mengelola koleksi formulir saya dengan efisien**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | [P0] Draft form tersimpan otomatis ke localStorage |
| AC-2 | [P0] Tombol "Hapus Form" tersedia dengan dialog konfirmasi |
| AC-3 | [P1] Tombol "Duplikasi Form" membuat salinan dengan judul "[Original] (Salinan)" |
| AC-4 | [P1] Export definisi form sebagai file JSON |
| AC-5 | [P1] Import definisi form dari file JSON |

---

**US-007 — Undo/Redo** `[P1]`

> Sebagai **pembuat form**, saya ingin **membatalkan dan mengulangi perubahan**, sehingga **saya bisa bereksperimen tanpa takut kehilangan konfigurasi sebelumnya**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Ctrl+Z (Undo) dan Ctrl+Y (Redo) berfungsi di editor |
| AC-2 | Tombol Undo/Redo juga tersedia di toolbar editor |
| AC-3 | Riwayat tersimpan hingga 50 langkah |
| AC-4 | Stack undo/redo hanya di memori (tidak persisten) |

---

**US-008 — Konfigurasi Per-Tipe Pertanyaan** `[P0]`

> Sebagai **pembuat form**, saya ingin **mengonfigurasi setiap tipe pertanyaan sesuai kebutuhan**, sehingga **form saya bisa mengumpulkan data dengan format yang tepat**.

| Tipe | Konfigurasi | Prioritas |
|------|-------------|:---------:|
| **MC / Checkbox / Dropdown** | Tambah/ubah/hapus opsi jawaban; opsi "Lainnya" dengan teks bebas; acak urutan opsi; min/max pilihan (Checkbox) | P0 |
| **Linear Scale** | Rentang min (0/1) s/d max (2–10); label ujung kiri & kanan | P0 |
| **Grid (MC/Checkbox)** | Tambah/hapus baris & kolom; acak urutan baris; wajib satu respons per baris | P1 |
| **Date** | Hanya tanggal / tanggal+waktu / tahun-bulan; validasi rentang tanggal (min/max) | P0 |
| **Time** | Format 12h (AM/PM) / 24h; opsi durasi waktu | P0 |

---

**US-009 — Manajemen Seksi/Halaman** `[P0]`

> Sebagai **pembuat form**, saya ingin **membagi form menjadi beberapa seksi/halaman**, sehingga **form panjang lebih mudah diisi oleh responden**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Form dapat dibagi menjadi beberapa seksi menggunakan Section Header (QT-12) |
| AC-2 | Setiap seksi memiliki judul dan deskripsi opsional |
| AC-3 | Navigasi antar seksi: tombol "Berikutnya" dan "Kembali" |
| AC-4 | Progress bar menampilkan kemajuan pengisian (persentase seksi) |
| AC-5 | Seksi dapat dikonfigurasi tujuan navigasi berikutnya (conditional) |
| AC-6 | Seksi terakhir menampilkan tombol "Kirim" sebagai pengganti "Berikutnya" |

---

### 5.3 [M2] Form Renderer

#### User Stories & Acceptance Criteria

---

**US-010 — Mengisi Form Tanpa Login** `[P0]`

> Sebagai **responden**, saya ingin **mengisi formulir di browser tanpa perlu mendaftar atau login**, sehingga **proses pengisian cepat dan tanpa hambatan**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Form dapat diakses via URL unik tanpa login/akun |
| AC-2 | Tidak ada permintaan data personal selain yang ada di form |
| AC-3 | Tombol "Kirim" hanya aktif (clickable) jika semua validasi lolos |
| AC-4 | Form responsif: tampil baik di 375px (mobile) hingga 1440px (desktop) |

---

**US-011 — Validasi Real-time** `[P0]`

> Sebagai **responden**, saya ingin **mendapat feedback langsung jika ada kesalahan input**, sehingga **saya bisa memperbaikinya sebelum submit**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Validasi dijalankan on-blur (field kehilangan fokus) |
| AC-2 | Pesan error muncul tepat di bawah field yang bermasalah, warna merah |
| AC-3 | Error hilang saat field diperbaiki (re-validasi on-input jika error sudah tampil) |
| AC-4 | Submit tidak dapat dilakukan jika ada error yang belum diselesaikan |
| AC-5 | Saat submit gagal validasi, scroll otomatis ke error pertama dengan highlight |
| AC-6 | Error diumumkan ke screen reader via `role="alert"` |

---

**US-012 — Penyimpanan Sesi Pengisian** `[P1]`

> Sebagai **responden**, saya ingin **kemajuan pengisian tersimpan jika saya tidak sengaja menutup tab**, sehingga **saya tidak perlu mengisi ulang dari awal**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Jawaban tersimpan di `sessionStorage` setiap kali ada perubahan input |
| AC-2 | Saat tab dibuka kembali (URL yang sama), prompt muncul: "Lanjutkan pengisian sebelumnya?" |
| AC-3 | Pilihan "Lanjutkan" → jawaban sebelumnya dimuat kembali |
| AC-4 | Pilihan "Mulai baru" → sessionStorage dibersihkan, form kosong |

---

**US-013 — Fitur Renderer Tambahan** `[P0/P1]`

> Sebagai **pembuat form**, saya ingin **mengontrol perilaku form renderer**, sehingga **pengalaman pengisian sesuai kebutuhan**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Form menampilkan judul, deskripsi, dan header image (jika dikonfigurasi) | P0 |
| AC-2 | Setiap pertanyaan menampilkan nomor urut, teks pertanyaan, tanda wajib (*), dan deskripsi | P0 |
| AC-3 | Responden mendapatkan pesan konfirmasi custom setelah submit | P0 |
| AC-4 | Form mendukung mode preview tanpa menyimpan respons | P0 |
| AC-5 | Form dapat di-embed via `<iframe>` atau Web Component | P0 |
| AC-6 | Prefill via URL query parameter (e.g., `?q1=Budi&q2=budi@email.com`) | P1 |
| AC-7 | Opsi "Edit respons Anda" setelah submit | P1 |
| AC-8 | Pembatasan satu respons per sesi via localStorage flag | P1 |
| AC-9 | Pembuat form dapat membuka/menutup penerimaan respons | P1 |

---

### 5.4 [M3] Response Collector

#### User Stories & Acceptance Criteria

---

**US-014 — Pengumpulan Respons** `[P0]`

> Sebagai **sistem**, saya ingin **mencatat dan menyimpan setiap respons yang dikirim**, sehingga **pembuat form dapat menganalisis data yang terkumpul**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Setiap respons mencatat: `responseId` (UUID v4), `formId`, `submittedAt` (ISO-8601), `durationSeconds`, `respondentId` (anonymous hash) |
| AC-2 | Respons disimpan ke localStorage secara default |
| AC-3 | Respons dapat dikonfigurasi untuk dikirim ke webhook URL via HTTP POST JSON |
| AC-4 | Respons parsial (belum submit) **tidak** tersimpan ke response store |
| AC-5 | Payload respons mengikuti format standar yang terdokumentasi (lihat Schema di bawah) |

**Format Payload Respons (Standar):**

```json
{
  "formId": "string",
  "responseId": "uuid-v4",
  "submittedAt": "ISO-8601",
  "durationSeconds": 120,
  "respondentId": "anonymous-hash",
  "answers": [
    {
      "questionId": "string",
      "questionType": "multiple_choice",
      "value": "Option A"
    },
    {
      "questionId": "string",
      "questionType": "checkboxes",
      "value": ["Option A", "Option C"]
    },
    {
      "questionId": "string",
      "questionType": "linear_scale",
      "value": 4
    }
  ]
}
```

---

**US-015 — Integrasi Penyimpanan Eksternal** `[P1]`

> Sebagai **pembuat form / system integrator**, saya ingin **mengirim respons ke layanan eksternal**, sehingga **data terintegrasi dengan workflow yang sudah ada**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Webhook: POST ke URL konfigurasi dengan header `X-Form-Id`, `X-Response-Id`, `X-Signature` (HMAC-SHA256) | P0 |
| AC-2 | Supabase: Insert row via REST API dengan konfigurasi URL + Anon Key | P1 |
| AC-3 | Google Sheets: POST ke Google Apps Script Web App URL | P1 |
| AC-4 | Jika integrasi gagal: retry otomatis 3×, simpan ke antrian lokal | P0 |

---

### 5.5 [M4] Response Viewer

#### User Stories & Acceptance Criteria

---

**US-020 — Melihat Ringkasan Respons** `[P0]`

> Sebagai **pembuat form**, saya ingin **melihat ringkasan statistik dari semua respons**, sehingga **saya mendapat gambaran hasil survei dengan cepat**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Halaman summary menampilkan total jumlah respons dan tanggal respons terakhir |
| AC-2 | Pertanyaan pilihan (MC/Checkbox/Dropdown) menampilkan pie chart atau bar chart distribusi jawaban |
| AC-3 | Pertanyaan teks (Short Answer/Paragraph) menampilkan daftar semua jawaban |
| AC-4 | Linear Scale menampilkan rata-rata skor dan distribusi (bar chart) |
| AC-5 | Grid menampilkan heatmap atau tabel frekuensi |

---

**US-021 — Melihat Respons Individual** `[P0]`

> Sebagai **pembuat form**, saya ingin **melihat respons satu per satu secara detail**, sehingga **saya bisa memeriksa jawaban responden tertentu**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Tab "Individual" menampilkan satu respons lengkap dalam format form |
| AC-2 | Navigasi: tombol "◀ Sebelumnya" dan "Berikutnya ▶" |
| AC-3 | Tampilan menunjukkan nomor respons (e.g., "3 dari 47") |
| AC-4 | [P1] Tombol "Hapus respons ini" dengan konfirmasi |

---

**US-022 — Export Data Respons** `[P0]`

> Sebagai **pembuat form**, saya ingin **mengekspor semua respons ke CSV dan JSON**, sehingga **saya bisa menganalisis data di spreadsheet atau tools analitik**.

| # | Acceptance Criteria |
|---|-------------------|
| AC-1 | Tombol "Export CSV" tersedia di halaman respons |
| AC-2 | File CSV: header kolom = nama pertanyaan, setiap baris = satu respons |
| AC-3 | Encoding UTF-8 dengan BOM untuk kompatibilitas Excel |
| AC-4 | Tombol "Export JSON" mengunduh array of ResponseRecord |
| AC-5 | [P1] Export form + respons sebagai bundle ZIP |
| AC-6 | [P1] Print form sebagai PDF via browser print dialog |

**Format CSV Export:**

```csv
Response ID,Submitted At,Duration (s),Q1: Nama Anda,Q2: Email,Q3: Rating
resp-001,2026-06-22T10:30:00Z,120,Budi Santoso,budi@email.com,4
resp-002,2026-06-22T11:15:00Z,85,Siti Rahayu,siti@email.com,5
```

---

### 5.6 [M5] Theme Engine

#### User Stories & Acceptance Criteria

---

**US-030 — Kustomisasi Tema** `[P0/P1]`

> Sebagai **pembuat form**, saya ingin **mengubah warna, font, dan tampilan visual form**, sehingga **form sesuai dengan identitas brand organisasi saya**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Tema default: putih dengan aksen biru `#4285F4` (identik Google Forms) | P0 |
| AC-2 | Color picker untuk mengubah warna header | P0 |
| AC-3 | Color picker untuk mengubah warna background form | P0 |
| AC-4 | Font selector: minimal 4 pilihan (Sans Serif, Serif, Monospace, Decorative) | P0 |
| AC-5 | Perubahan tema terefleksi secara **real-time** di preview editor | P0 |
| AC-6 | Upload/URL gambar header form | P1 |
| AC-7 | Minimal 6 preset tema siap pakai dengan thumbnail preview | P1 |
| AC-8 | Klik preset langsung menerapkan tema; tema aktif memiliki indikator terpilih | P1 |
| AC-9 | Konfigurasi tema tersimpan sebagai bagian dari form definition JSON | P0 |

---

### 5.7 [M6] Logic Engine (Conditional Logic)

#### User Stories & Acceptance Criteria

---

**US-040 — Branching Logic** `[P0]`

> Sebagai **pembuat form**, saya ingin **mengonfigurasi alur bercabang berdasarkan jawaban responden**, sehingga **form menampilkan pertanyaan yang relevan sesuai konteks jawaban sebelumnya**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Pada pertanyaan Multiple Choice: setiap opsi jawaban bisa dikonfigurasi "Lanjut ke seksi [X]" atau "Kirim formulir" | P0 |
| AC-2 | Dropdown konfigurasi branching muncul di samping setiap opsi (di mode editor) | P0 |
| AC-3 | Saat responden menjawab → navigasi otomatis ke seksi yang dikonfigurasi | P0 |
| AC-4 | [P1] Validasi saat simpan: deteksi loop tak terbatas dan tampilkan warning | P1 |
| AC-5 | [P1] Indikator visual di editor (ikon/badge) pada pertanyaan yang memiliki logic | P1 |
| AC-6 | [P2] Show/hide pertanyaan berdasarkan jawaban (tanpa pindah seksi) | P2 |
| AC-7 | [P2] Pratinjau alur logic dalam bentuk diagram visual sederhana | P2 |

---

### 5.8 [M7] Validation Engine

#### User Stories & Acceptance Criteria

---

**US-050 — Validasi Input** `[P0]`

> Sebagai **pembuat form**, saya ingin **menetapkan aturan validasi pada setiap pertanyaan**, sehingga **data yang terkumpul bersih dan sesuai format yang diharapkan**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Validasi "required": field wajib tidak boleh kosong | P0 |
| AC-2 | Short Answer: validasi panjang min/max karakter | P0 |
| AC-3 | Short Answer: validasi format (email, URL, angka, regex custom) | P0 |
| AC-4 | Paragraph: validasi panjang min/max | P0 |
| AC-5 | Number: validasi rentang min/max, integer only | P0 |
| AC-6 | Checkboxes: validasi jumlah pilihan min/max | P1 |
| AC-7 | Date: validasi rentang tanggal (sebelum/sesudah tanggal tertentu) | P1 |
| AC-8 | Pesan error custom per pertanyaan (override pesan default) | P1 |
| AC-9 | Validasi dijalankan on-blur dan on-submit | P0 |
| AC-10 | Error ditampilkan tepat di bawah pertanyaan yang bermasalah | P0 |
| AC-11 | Form scroll otomatis ke error pertama saat submit gagal | P0 |

**Tabel Validasi Short Answer:**

| Tipe Validasi | Pola | Contoh Pesan Error |
|--------------|------|-------------------|
| Angka | `^\d+(\.\d+)?$` | "Masukkan angka yang valid" |
| Angka bulat | `^\d+$` | "Masukkan bilangan bulat" |
| Angka dalam rentang | `min ≤ value ≤ max` | "Nilai harus antara 1 dan 100" |
| Email | RFC 5322 pattern | "Masukkan alamat email yang valid" |
| URL | URL pattern | "Masukkan URL yang valid" |
| Regex custom | User-defined pattern | Pesan custom dari pembuat form |
| Panjang karakter | `min/max char` | "Terlalu pendek (min. X karakter)" |

---

### 5.9 [M8] Export / Import

*(Sudah dicakup dalam US-006 dan US-022. Requirement tambahan:)*

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| EX-001 | Export respons sebagai CSV | P0 |
| EX-002 | Export respons sebagai JSON | P0 |
| EX-003 | Export definisi form sebagai JSON | P0 |
| EX-004 | Import definisi form dari JSON | P0 |
| EX-005 | Export form + respons sebagai satu bundle ZIP | P1 |
| EX-006 | Import respons dari CSV (untuk migrasi) | P2 |
| EX-007 | Print form sebagai PDF (via browser print dialog) | P1 |

---

### 5.10 [M9] Sharing & Embedding

#### User Stories & Acceptance Criteria

---

**US-060 — Membagikan Form** `[P0]`

> Sebagai **pembuat form**, saya ingin **membagikan form melalui berbagai metode**, sehingga **responden dapat mengakses form dengan mudah**.

| # | Acceptance Criteria | Prioritas |
|---|-------------------|:---------:|
| AC-1 | Setiap form memiliki URL unik yang dapat dibagikan | P0 |
| AC-2 | Tombol "Salin Link" menyalin URL ke clipboard dengan konfirmasi visual (toast "Link disalin!") | P0 |
| AC-3 | Generate kode embed `<iframe>` yang bisa disalin | P0 |
| AC-4 | Generate kode embed Web Component `<dynamic-form id="...">` | P1 |
| AC-5 | QR Code untuk URL form dengan opsi download | P1 |
| AC-6 | Form dapat diakses dalam mode fill-only (tanpa akses editor) | P0 |

**Metode Embedding:**

```html
<!-- Option 1: iframe -->
<iframe 
  src="https://your-app.com/form/form-id?embed=true"
  width="100%" height="600" frameborder="0">
</iframe>

<!-- Option 2: Web Component -->
<script src="https://your-app.com/sdk.js"></script>
<dynamic-form 
  form-id="form-uuid" 
  on-submit="handleFormSubmit">
</dynamic-form>

<!-- Option 3: JavaScript API -->
<div id="form-container"></div>
<script>
  DynamicForm.render({
    target: '#form-container',
    formId: 'form-uuid',
    onSubmit: (response) => console.log(response),
    theme: { primaryColor: '#FF5722' }
  });
</script>
```

---

### 5.11 Daftar Lengkap Functional Requirements (Referensi Cepat)

<details>
<summary><strong>Klik untuk melihat tabel lengkap semua requirement</strong></summary>

#### [M1] Form Builder — Editor

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| FB-001 | Membuat form baru dengan judul dan deskripsi | P0 |
| FB-002 | Menyimpan draft form ke localStorage | P0 |
| FB-003 | Menduplikasi form yang ada | P1 |
| FB-004 | Menghapus form (dengan konfirmasi) | P0 |
| FB-005 | Import definisi form dari file JSON | P1 |
| FB-006 | Export definisi form sebagai JSON | P1 |
| FB-007 | Form mendukung judul (max 500 char) dan deskripsi (max 2000 char) | P0 |
| FB-008 | Form mendukung gambar header (URL atau upload base64) | P1 |
| FB-010 | Menambahkan pertanyaan baru dari toolbar | P0 |
| FB-011 | Mengubah tipe pertanyaan setelah dibuat | P0 |
| FB-012 | Menduplikasi pertanyaan | P0 |
| FB-013 | Menghapus pertanyaan (dengan konfirmasi) | P0 |
| FB-014 | Mengubah urutan pertanyaan via drag-and-drop | P0 |
| FB-015 | Menandai pertanyaan sebagai "wajib diisi" | P0 |
| FB-016 | Pertanyaan mendukung teks bantuan/deskripsi | P0 |
| FB-017 | Pertanyaan mendukung gambar ilustrasi (URL) | P1 |
| FB-018 | Pertanyaan memiliki ID unik yang persisten | P0 |
| FB-019 | Editor mendukung undo/redo (max 50 langkah) | P1 |

#### [M2] Form Renderer

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| FR-001 | Render form di halaman terpisah via URL unik | P0 |
| FR-002 | Embed via `<iframe>` atau Web Component | P0 |
| FR-003 | Responsif di mobile (375px) hingga desktop (1440px) | P0 |
| FR-004 | Menampilkan judul, deskripsi, header image | P0 |
| FR-005 | Menampilkan nomor pertanyaan, teks, tanda wajib (*), deskripsi | P0 |
| FR-006 | State pengisian tersimpan di sessionStorage | P1 |
| FR-007 | Mode preview tanpa menyimpan respons | P0 |
| FR-008 | Prefill via URL query parameter | P1 |
| FR-009 | Pesan konfirmasi setelah submit | P0 |
| FR-010 | Opsi "Edit respons Anda" setelah submit | P1 |
| FR-011 | Pembatasan satu respons per sesi | P1 |
| FR-012 | Buka/tutup penerimaan respons | P1 |

#### [M3] Response Collector

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| RC-001 | Menyimpan timestamp, respondent ID, durasi pengisian | P0 |
| RC-002 | Respons disimpan ke localStorage secara default | P0 |
| RC-003 | Kirim ke URL webhook (HTTP POST JSON) | P0 |
| RC-004 | Integrasi Supabase (Insert Row) | P1 |
| RC-005 | Integrasi Google Sheets via Apps Script URL | P1 |
| RC-006 | Respons parsial tidak tersimpan | P0 |
| RC-007 | Payload respons mengikuti format standar | P0 |

#### [M4] Response Viewer

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| RV-001 | Halaman ringkasan dengan statistik agregat | P0 |
| RV-002 | Chart distribusi untuk pertanyaan pilihan | P0 |
| RV-003 | Daftar jawaban untuk pertanyaan teks | P0 |
| RV-004 | Rata-rata dan distribusi untuk linear scale | P0 |
| RV-005 | Tab respons individual | P0 |
| RV-006 | Navigasi antar respons (Sebelumnya/Berikutnya) | P0 |
| RV-007 | Hapus respons individual | P1 |
| RV-008 | Total jumlah respons dan tanggal terakhir | P0 |
| RV-009 | Filter respons berdasarkan rentang tanggal | P2 |
| RV-010 | Pencarian dalam respons teks | P2 |

#### [M5] Theme Engine

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| TH-001 | Tema default identik Google Forms | P0 |
| TH-002 | Color picker untuk header | P0 |
| TH-003 | Color picker untuk background | P0 |
| TH-004 | Font selector (4 pilihan) | P0 |
| TH-005 | Upload/URL gambar header | P1 |
| TH-006 | Preview tema real-time | P0 |
| TH-007 | Preset tema (min. 6) | P1 |
| TH-008 | Export/import konfigurasi tema JSON | P2 |

#### [M6] Logic Engine

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| LG-001 | "Go to section based on answer" pada MC | P0 |
| LG-002 | Setiap opsi bisa dikonfigurasi ke seksi tertentu | P0 |
| LG-003 | Validasi: tidak ada loop tak terbatas | P1 |
| LG-004 | Indikator visual untuk pertanyaan dengan logic | P1 |
| LG-005 | Show/hide pertanyaan berdasarkan jawaban | P2 |
| LG-006 | Diagram alur logic | P2 |

#### [M7] Validation Engine

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| VL-001 | Validasi "required" | P0 |
| VL-002 | Short Answer: panjang min/max | P0 |
| VL-003 | Short Answer: format (email, URL, angka, regex) | P0 |
| VL-004 | Paragraph: panjang min/max | P0 |
| VL-005 | Number: rentang min/max, integer only | P0 |
| VL-006 | Checkboxes: jumlah pilihan min/max | P1 |
| VL-007 | Date: rentang tanggal | P1 |
| VL-008 | Pesan error custom | P1 |
| VL-009 | Validasi on-blur dan on-submit | P0 |
| VL-010 | Error di bawah pertanyaan | P0 |
| VL-011 | Scroll otomatis ke error pertama | P0 |

#### [M8] Export/Import

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| EX-001 | Export respons CSV | P0 |
| EX-002 | Export respons JSON | P0 |
| EX-003 | Export form definition JSON | P0 |
| EX-004 | Import form definition JSON | P0 |
| EX-005 | Export bundle ZIP | P1 |
| EX-006 | Import respons CSV | P2 |
| EX-007 | Print form PDF | P1 |

#### [M9] Sharing & Embedding

| ID | Requirement | Prioritas |
|----|------------|:---------:|
| SH-001 | URL unik per form | P0 |
| SH-002 | Tombol "Salin Link" | P0 |
| SH-003 | Generate embed `<iframe>` | P0 |
| SH-004 | Generate embed Web Component | P1 |
| SH-005 | QR Code | P1 |
| SH-006 | Buka form di tab baru | P0 |
| SH-007 | Mode fill-only | P0 |

</details>

---

## 6. Non-Functional Requirements

### 6.1 Performa

| Metrik | Target | Metode Pengukuran |
|--------|--------|-------------------|
| Time to Interactive (TTI) | < 2 detik pada 4G | Lighthouse |
| First Contentful Paint (FCP) | < 1 detik | Lighthouse |
| Bundle size (gzipped) | < 150 KB | Vite/Rollup Bundle Analyzer |
| Form render (100 pertanyaan) | < 300 ms | Chrome DevTools Performance |
| Submit response (lokal) | < 500 ms | Performance API |
| Memory footprint | < 30 MB heap | Chrome Memory Profiler |

### 6.2 Kompatibilitas Browser

| Browser | Versi Minimum | Level Dukungan |
|---------|:------------:|:-------------:|
| Chrome / Chromium | 90+ | ✅ Penuh |
| Firefox | 88+ | ✅ Penuh |
| Safari | 14+ | ✅ Penuh |
| Edge | 90+ | ✅ Penuh |
| iOS Safari | 14+ | ✅ Penuh |
| Chrome Android | 90+ | ✅ Penuh |
| IE 11 | — | ❌ Tidak didukung |

### 6.3 Skalabilitas

| Aspek | Target |
|-------|--------|
| Jumlah pertanyaan per form | Hingga 200 tanpa degradasi performa |
| Jumlah respons di viewer | Hingga 10.000 dengan virtualisasi |
| Kapasitas localStorage | ~5 MB (sekitar 2.000–5.000 respons) |

### 6.4 Keandalan

| Aspek | Requirement |
|-------|-------------|
| **Session Recovery** | Tidak ada kerusakan data saat tab ditutup di tengah pengisian — jawaban tersimpan di sessionStorage |
| **Auto-save Editor** | Draft editor tersimpan otomatis setiap 30 detik dan on-blur |
| **Error Handling Submit** | Penanganan error jaringan saat submit: retry otomatis 3×, antrian offline di localStorage |
| **Data Integrity** | Sanitasi semua input sebelum penyimpanan; validasi schema JSON saat import |

### 6.5 Keamanan

| Aspek | Requirement |
|-------|-------------|
| **XSS Prevention** | Semua teks di-render via `textContent` (bukan `innerHTML`). Jika HTML diperlukan, gunakan DOMPurify |
| **CSRF** | Tidak diperlukan untuk client-side only. Webhook menggunakan HMAC-SHA256 signature |
| **CSP Compatible** | Form renderer tidak mengeksekusi inline script dari konten form |
| **Data Privacy** | Tidak ada tracking cookie default; respondent ID = hash anonim (bukan PII) |
| **Webhook Security** | URL webhook divalidasi (harus HTTPS); payload ditandatangani HMAC-SHA256 |
| **No Unauthorized Transmission** | Tidak ada data yang dikirim ke server pihak ketiga tanpa konfigurasi eksplisit pengguna |

### 6.6 Aksesibilitas

| Standar | Requirement |
|---------|-------------|
| **WCAG 2.1 Level AA** | Target kepatuhan minimum |
| **Keyboard Navigation** | Semua elemen interaktif dapat diakses via keyboard (Tab, Enter, Space, Arrow keys) |
| **Screen Reader** | ARIA labels pada semua input, pertanyaan, dan navigasi |
| **Focus Management** | Focus berpindah ke pertanyaan pertama saat seksi berubah |
| **Color Contrast** | Rasio kontras ≥ 4.5:1 untuk teks normal |
| **Error Announcement** | Error diumumkan via `role="alert"` untuk screen reader |
| **Form Labels** | Setiap input memiliki `<label>` yang terhubung via `for`/`id` |
| **Required Fields** | `aria-required="true"` pada field wajib |

### 6.7 Definition of Done (DoD) per Fitur

Sebuah fitur dianggap **selesai** jika:

- [x] Kode terimplementasi dan ter-review
- [x] Unit test lolos (coverage ≥ 80% untuk Logic Engine & Validation Engine)
- [x] Diuji di Chrome, Firefox, Safari (versi terbaru)
- [x] Responsif di mobile 375px dan desktop 1280px
- [x] Tidak ada error di console browser
- [x] Memenuhi semua acceptance criteria dari user story terkait
- [x] Diuji di mode inkognito (tidak bergantung state antar sesi)

---

## 7. System & Technical Assumptions

### 7.1 Arsitektur Tingkat Tinggi

```
┌─────────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                         │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   EDITOR    │  │  RENDERER   │  │  RESPONSE VIEWER    │  │
│  │  (Builder)  │  │  (Filler)   │  │    (Dashboard)      │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │             │
│  ┌──────▼────────────────▼─────────────────────▼──────────┐  │
│  │                  CORE LAYER                             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │  State   │ │  Logic   │ │Validation│ │  Theme   │  │  │
│  │  │ Manager  │ │  Engine  │ │  Engine  │ │  Engine  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  └──────────────────────┬────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────▼────────────────────────────────┐  │
│  │                  STORAGE LAYER                         │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │  │ localStorage │ │sessionStorage│ │  IndexedDB    │  │  │
│  │  └──────────────┘ └──────────────┘ └───────────────┘  │  │
│  └──────────────────────┬────────────────────────────────┘  │
└─────────────────────────┼────────────────────────────────────┘
                          │ HTTP (opsional)
         ┌────────────────┼────────────────────┐
         ▼                ▼                    ▼
  [Webhook Server]  [Supabase REST]  [Google Apps Script]
```

### 7.2 Pemisahan Tanggung Jawab Frontend / Backend

| Layer | Tanggung Jawab | Teknologi |
|-------|---------------|-----------|
| **Frontend (Core — 100% client-side)** | Form editor UI, form rendering, validasi, drag-and-drop, theme engine, logic engine, export/import, state management | Vanilla JS (ES2020+), CSS Custom Properties, Web APIs |
| **Storage Layer (Client-side)** | Persistensi form definition, draft, respons | localStorage, sessionStorage, IndexedDB |
| **Backend (Opsional — tidak wajib)** | Penyimpanan respons remote, webhook relay | Webhook HTTP POST, Supabase REST, Google Apps Script |

> [!IMPORTANT]
> **Backend bersifat 100% opsional.** Aplikasi berfungsi penuh tanpa server. Backend hanya diperlukan jika pengguna ingin mengirim data respons ke layanan eksternal.

### 7.3 Technology Stack

#### Core (Zero External Dependencies)

| Teknologi | Kegunaan |
|-----------|----------|
| JavaScript ES2020+ | Logic, state management, rendering |
| CSS Custom Properties | Theming dinamis |
| HTML5 Semantic Elements | Struktur UI |
| Web APIs | localStorage, sessionStorage, Fetch API, File API, URL API, Drag & Drop API |

#### Optional Dependencies (per fitur)

| Library | Kegunaan | Alternatif Built-in | Kondisi Penggunaan |
|---------|----------|--------------------|--------------------|
| DOMPurify | Sanitasi HTML | `textContent` (lebih aman) | Hanya jika render HTML user-generated |
| Chart.js / Recharts | Visualisasi respons | Canvas 2D API | Response Viewer charts |
| FileSaver.js | Download file | `Blob + <a download>` | Export CSV/JSON |
| QRCode.js | Generate QR Code | — | Sharing feature |
| Sortable.js | Drag-and-drop (polished) | HTML5 Drag & Drop API | Jika DnD native tidak memadai |

#### Build & Dev Tools

| Tool | Kegunaan |
|------|----------|
| Vite atau Rollup | Bundler (target < 150 KB gzipped) |
| Vitest | Unit testing |
| Playwright | E2E / cross-browser testing |
| ESLint + Prettier | Linting & formatting |
| GitHub Actions | CI/CD pipeline |

### 7.4 Data Model (Schema Utama)

#### FormDefinition (JSON)

```json
{
  "formId": "string (uuid-v4)",
  "version": "1",
  "metadata": {
    "title": "string (max 500 char)",
    "description": "string (max 2000 char)",
    "headerImageUrl": "string | null",
    "createdAt": "ISO-8601",
    "updatedAt": "ISO-8601",
    "isAcceptingResponses": true,
    "confirmationMessage": "string",
    "showProgressBar": true,
    "shuffleQuestions": false,
    "limitOneResponse": false
  },
  "theme": {
    "primaryColor": "#4285F4",
    "backgroundColor": "#F0F4F9",
    "questionBackgroundColor": "#FFFFFF",
    "fontFamily": "Sans Serif",
    "fontSize": "medium"
  },
  "sections": [
    {
      "sectionId": "uuid-v4",
      "title": "string",
      "description": "string",
      "order": 0,
      "nextSection": "sectionId | 'submit' | null"
    }
  ],
  "questions": [
    {
      "questionId": "uuid-v4",
      "sectionId": "string | null",
      "type": "short_answer | paragraph | multiple_choice | ...",
      "order": 0,
      "title": "string (max 1000 char)",
      "description": "string | null",
      "imageUrl": "string | null",
      "required": false,
      "options": "QuestionOptions (per tipe)",
      "validation": "ValidationConfig | null",
      "logic": "LogicConfig | null"
    }
  ]
}
```

#### ResponseRecord (JSON)

```json
{
  "responseId": "uuid-v4",
  "formId": "string",
  "formVersion": "1",
  "submittedAt": "ISO-8601",
  "startedAt": "ISO-8601",
  "durationSeconds": 120,
  "respondentId": "anonymous-hash",
  "answers": {
    "<questionId>": {
      "questionType": "string",
      "value": "string | string[] | number | object | null"
    }
  }
}
```

### 7.5 State Management

```
AppState
├── editor
│   ├── formDefinition: FormDefinition
│   ├── activeQuestionId: string | null
│   ├── activeSectionId: string | null
│   ├── isDirty: boolean
│   ├── undoStack: FormDefinition[] (max 50)
│   ├── redoStack: FormDefinition[]
│   └── viewMode: 'editor' | 'preview' | 'theme' | 'settings' | 'responses'
├── renderer
│   ├── currentSectionIndex: number
│   ├── answers: Record<questionId, AnswerValue>
│   ├── errors: Record<questionId, string>
│   ├── isSubmitting: boolean
│   └── isSubmitted: boolean
└── responses
    ├── list: ResponseRecord[]
    ├── currentIndex: number
    └── filter: { startDate, endDate }
```

| State | Storage | TTL |
|-------|---------|-----|
| FormDefinition (draft) | localStorage | Permanen hingga dihapus |
| Editor undo/redo | Memory only | Per sesi |
| Renderer answers (in-progress) | sessionStorage | Hingga tab ditutup |
| Responses | localStorage / remote | Permanen |

### 7.6 Komunikasi Antar Modul

Sistem menggunakan **Event Bus Pattern** (Custom Events) untuk komunikasi antar modul, menghindari coupling langsung:

| Event Name | Payload | Emitter | Listener |
|------------|---------|---------|----------|
| `form:updated` | FormDefinition | Editor | Storage, Preview |
| `question:added` | { question, sectionId } | Editor | State |
| `question:deleted` | { questionId } | Editor | State, Logic |
| `question:reordered` | { fromIndex, toIndex } | DragDrop | State |
| `answer:changed` | { questionId, value } | Renderer | Validator, State |
| `section:navigate` | { direction, targetSectionId } | Renderer | Logic, State |
| `form:submit` | ResponseRecord | Renderer | Storage, Webhook |
| `theme:changed` | ThemeConfig | ThemeEditor | Renderer |
| `validation:result` | { questionId, isValid, error } | Validator | Renderer |

### 7.7 Asumsi Teknis

> [!NOTE]
> **Daftar Asumsi** — Item berikut diasumsikan berdasarkan analisis draf. Harap tinjau dan konfirmasi.

| # | Asumsi | Dampak jika Salah |
|---|--------|-------------------|
| A1 | **Tidak ada backend/server wajib.** Semua fitur inti berjalan di browser. | Perlu desain ulang arsitektur jika backend wajib diperlukan |
| A2 | **Routing menggunakan hash-based routing** (`#/editor`, `#/form/id`, `#/responses`) — bukan server-side routing | Perlu setup web server dengan URL rewrite jika path-based |
| A3 | **Satu pengguna per instance.** Tidak ada multi-user concurrency atau akun login | Multi-tenant support memerlukan backend + auth |
| A4 | **Data form tersimpan di localStorage browser pengguna.** Jika berpindah browser/device, form tidak tersedia | Perlu sync/cloud storage untuk cross-device |
| A5 | **Dashboard menampilkan form dalam format card grid** (mirip Google Forms home) | Perlu desain ulang jika format list yang diinginkan |
| A6 | **Gambar header menggunakan URL eksternal atau base64 inline.** Tidak ada file upload server | Perlu object storage jika file upload hosting diperlukan |
| A7 | **Bahasa UI default: Bahasa Indonesia** — mengikuti konteks pengguna target | Perlu i18n framework jika multi-bahasa diperlukan |
| A8 | **Respons dari responden juga tersimpan di localStorage browser pembuat form** — kecuali webhook dikonfigurasi | Responden di device berbeda hanya bisa mengirim via webhook |

### 7.8 Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|:----------:|:------:|----------|
| localStorage penuh (5 MB limit) | Tinggi | Tinggi | Kompresi data (JSON minify), warning saat mendekati limit, tombol "Export & Bersihkan" |
| Drag-and-drop tidak bekerja di touch device | Sedang | Tinggi | Fallback: tombol panah atas/bawah, gunakan Pointer Events bukan Mouse Events |
| localStorage tidak tersinkron antar tab | Rendah | Sedang | `storage` event listener untuk sinkronisasi antar tab |
| XSS via konten form | Sedang | Tinggi | Sanitasi ketat via `textContent` + DOMPurify, CSP header |
| Rendering lambat untuk 200+ pertanyaan | Sedang | Sedang | Virtual scrolling, lazy rendering, requestAnimationFrame batching |
| Kehilangan data saat submit gagal (webhook error) | Rendah | Tinggi | Queue lokal + retry 3×, simpan ke localStorage sementara |

### 7.9 Integrasi Eksternal

#### Webhook Integration

```
POST https://your-server.com/webhook
Content-Type: application/json
X-Form-Id: form-uuid
X-Response-Id: response-uuid
X-Signature: HMAC-SHA256(payload, secret)

{ ...ResponseRecord }
```

#### Supabase Integration

```
POST https://<project>.supabase.co/rest/v1/responses
Authorization: Bearer <anon_key>
Content-Type: application/json

{ ...ResponseRecord }
```

#### Google Sheets Integration

POST ke Google Apps Script Web App URL → Apps Script memproses dan menyimpan ke Google Sheet.

---

## 8. Out of Scope

Fitur-fitur berikut **tidak termasuk** dalam versi 1.0.0 ini:

| # | Fitur | Alasan Ditunda |
|---|-------|---------------|
| 1 | **Kolaborasi real-time** — Multiple editor bersamaan (seperti Google Docs) | Memerlukan backend WebSocket + conflict resolution (CRDT/OT) |
| 2 | **File upload hosting** — Penyimpanan file yang diupload responden ke server | Memerlukan object storage (S3/GCS) + backend |
| 3 | **Email notification** — Notifikasi email otomatis ke pembuat/responden | Memerlukan email service (SendGrid/SES) |
| 4 | **Quiz mode dengan scoring** — Mode kuis dengan penilaian otomatis | Fitur tersendiri yang cukup kompleks; kandidat v2.0 |
| 5 | **Form analytics lanjutan** — Funnel analysis, drop-off rate per pertanyaan | Memerlukan tracking & analytics pipeline |
| 6 | **SSO / OAuth** — Login via Google/GitHub/dll | Memerlukan auth server + session management |
| 7 | **Multi-language form** — Formulir multi-bahasa otomatis | Memerlukan i18n framework + translation management |
| 8 | **Offline-first sync** — Sinkronisasi saat kembali online (ServiceWorker) | Kompleksitas tinggi; kandidat v2.0 |
| 9 | **Plugin/extension marketplace** — Ekosistem plugin pihak ketiga | Memerlukan API publik, sandboxing, dan review process |
| 10 | **Backend API server** — Server-side rendering atau REST API lengkap | Aplikasi dirancang client-side first |

---

## Lampiran

### Lampiran A: Glosarium

| Istilah | Definisi |
|---------|----------|
| **Form Definition** | Struktur JSON yang mendefinisikan konten, tipe pertanyaan, dan konfigurasi sebuah formulir |
| **Response** | Kumpulan jawaban dari satu sesi pengisian formulir oleh satu responden |
| **Question Type** | Kategori input yang didukung (teks, pilihan, skala, dll) |
| **Section** | Pengelompokan pertanyaan dalam satu halaman/halaman formulir |
| **Conditional Logic** | Aturan yang menentukan alur navigasi berdasarkan jawaban responden |
| **Validation** | Pemeriksaan kebenaran format/nilai input sebelum diterima |
| **Renderer** | Komponen yang menampilkan form untuk diisi oleh responden |
| **Editor** | Antarmuka drag-and-drop untuk membuat dan mengedit form |
| **Webhook** | URL endpoint yang menerima data respons via HTTP POST saat form disubmit |
| **Embed** | Penyisipan form ke halaman web lain via iframe atau Web Component |
| **localStorage** | Storage browser untuk menyimpan data secara persisten di sisi klien |
| **sessionStorage** | Storage browser yang hanya bertahan selama satu tab/sesi aktif |
| **Prefill** | Mengisi nilai awal pertanyaan via URL query parameter |
| **Parity** | Kesetaraan fitur dan perilaku dengan produk referensi (Google Forms) |
| **Event Bus** | Pola komunikasi publish/subscribe antar modul tanpa coupling langsung |

### Lampiran B: Ringkasan Prioritas

| Prioritas | Jumlah Requirements | Definisi |
|:---------:|:-------------------:|----------|
| **P0** | ~45 items | Wajib untuk MVP — must have |
| **P1** | ~25 items | Segera setelah MVP — should have |
| **P2** | ~10 items | Diinginkan, bisa ditunda — nice to have |

### Lampiran C: Daftar Asumsi yang Perlu Direview

> [!WARNING]
> Asumsi berikut ditandai karena **tidak eksplisit** dalam draf kasar. Harap tinjau dan konfirmasi sebelum development dimulai.

1. **[A1]** Aplikasi sepenuhnya client-side, tidak ada backend wajib
2. **[A2]** Routing menggunakan hash-based routing
3. **[A5]** Dashboard menggunakan card grid layout
4. **[A7]** Bahasa UI default: Bahasa Indonesia
5. **[A8]** Respons disimpan di localStorage browser pembuat form (bukan browser responden, kecuali via webhook)
6. **[ASUMSI BARU]** Tidak ada mekanisme autentikasi untuk mengakses editor — siapa pun yang mengakses URL editor dapat mengedit form
7. **[ASUMSI BARU]** Tidak ada versioning form — respons tetap merujuk ke struktur form saat submit
8. **[ASUMSI BARU]** QR Code library (QRCode.js) dimasukkan sebagai dependency opsional, bukan bagian dari bundle core

---

> **Dokumen ini adalah PRD final untuk Dynamic Form Builder v1.0.0 dan menjadi referensi utama bagi tim engineering yang mengimplementasikan sistem ini. Keputusan teknis detail lebih lanjut didokumentasikan di `design.md`.**
