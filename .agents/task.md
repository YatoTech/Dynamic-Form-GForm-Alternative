# Task List — Dynamic Form Builder 1:1 Google Forms Parity
> **Sumber:** Audit Report 23 Juni 2026 vs Google Forms (Juni 2026)
> **Target:** ≥ 95% parity dengan Google Forms terbaru
> **Update terakhir:** 23 Juni 2026

---

## EPIC 1 — Editor: Fitur Pertanyaan yang Hilang

### P0 — Kritis
- `[ ]` **E1-01** — Tambahkan opsi **"Tambahkan 'Lainnya'" (Other option)** di Multiple Choice editor
  - Di `MultipleChoiceEditor.js`: tombol "Tambah 'Lainnya'" di bawah daftar opsi
  - Saat diklik, tambahkan opsi spesial `{value: '__other__', label: 'Lainnya...'}`
  - Opsi "Lainnya" ditampilkan italic dengan text input di sebelahnya di renderer
- `[ ]` **E1-02** — Tambahkan opsi **"Tambahkan 'Lainnya'"** di Checkboxes editor
  - Di `CheckboxesEditor.js`: sama seperti E1-01 untuk multi-select
- `[ ]` **E1-03** — Render **"Lainnya"** di `MultipleChoiceField.js` (renderer)
  - Tampilkan radio "Lainnya: [____]" dengan text input saat dipilih
  - Simpan value sebagai `{isOther: true, text: "..."}`
- `[ ]` **E1-04** — Render **"Lainnya"** di `CheckboxesField.js` (renderer)
  - Tampilkan checkbox "Lainnya: [____]" dengan text input saat dicentang

### P1 — Penting
- `[ ]` **E1-05** — **Tambah gambar per pertanyaan** (image attachment)
  - Di `QuestionCard.js`: tombol tambah gambar (ikon kamera)
  - Simpan `question.imageUrl` (base64 atau URL)
  - Tampilkan gambar di atas teks pertanyaan di renderer
- `[ ]` **E1-06** — **Duplikasi Section** (section header)
  - Di `SectionDivider.js`: tambah tombol duplikasi section beserta pertanyaan di dalamnya
- `[ ]` **E1-07** — **Tambah deskripsi per pertanyaan** via klik (collapsible)
  - Tombol "Tambah deskripsi" di QuestionCard yang menampilkan textarea deskripsi

---

## EPIC 2 — Editor: UI/UX Polish (Google Forms Look & Feel)

### P0 — Kritis
- `[ ]` **E2-01** — **Ripple effect** Material 3 pada semua button dan interactive elements
  - Implementasi `createRipple()` helper di CSS (`dfb-ripple`) + JS event listener
  - Terapkan pada: tombol add question, question card click, toggle, tab click
- `[ ]` **E2-02** — **Animasi transisi tab** yang smooth (underline slide)
  - Tab bar editor: underline indicator yang bergerak smooth dengan `translateX`
- `[ ]` **E2-03** — **Floating toolbar tambah pertanyaan** refactor
  - Toolbar vertikal kanan harus muncul dengan smooth animation
  - Ikon harus identik dengan Google Forms: Aa, ¶, ⊙, ☑, ▼, ━, ⊞, 📅, ⏱, ⬆, ═

### P1 — Penting
- `[ ]` **E2-04** — **Keyboard shortcuts** editor
  - `Ctrl+Z` = Undo, `Ctrl+Shift+Z` = Redo
  - `Ctrl+D` = Duplikasi pertanyaan aktif
  - `Ctrl+Delete` = Hapus pertanyaan aktif
- `[ ]` **E2-05** — **Indikator branching logic** di QuestionCard
  - Badge/icon yang muncul jika pertanyaan memiliki branching logic aktif
- `[ ]` **E2-06** — **"Import pertanyaan"** dari form lain
  - Dialog yang menampilkan daftar form yang ada
  - Pilih pertanyaan dari form lain untuk diimpor ke form saat ini

---

## EPIC 3 — Renderer: Fitur yang Hilang

### P0 — Kritis
- `[ ]` **E3-01** — **Back button** antar section
  - Tombol "← Kembali" di renderer yang sudah ada di desain tapi perlu diverifikasi fungsinya
  - Pastikan state jawaban tetap tersimpan saat kembali ke section sebelumnya
  - Pastikan branching logic tidak dilangkahi saat navigasi mundur
- `[ ]` **E3-02** — **Header Image** rendering di form renderer
  - `headerImageUrl` sudah ada di model `FormDefinition`
  - Tampilkan gambar header di atas judul form di `FormRenderer.js`
  - Support URL gambar eksternal dan base64 data URL
  - Fallback: jika URL error, tampilkan placeholder berwarna tema
- `[ ]` **E3-03** — **Animasi transisi** antar section
  - Slide-in dari kanan saat "Berikutnya", slide-in dari kiri saat "Kembali"
  - Implementasi dengan CSS `transform: translateX()` + `transition`
  - Harus mendukung `prefers-reduced-motion`

### P1 — Penting
- `[ ]` **E3-04** — **Pre-fill form via URL parameter**
  - Support `?entry.QUESTION_ID=value` (Google Forms style) atau `?qID=value`
  - Parse URL params di `FormRenderer.js` saat inisialisasi
  - Pre-populate field sesuai parameter
- `[ ]` **E3-05** — **Enforce "Batasi 1 Jawaban"** di form renderer
  - Saat form dibuka, cek localStorage untuk flag respons sebelumnya
  - Jika sudah ada, tampilkan pesan "Anda sudah mengisi formulir ini"
  - Tombol "Edit respons Anda" (link ke respons sebelumnya)
- `[ ]` **E3-06** — **Session persistence prompt**
  - Jika ada jawaban parsial di sessionStorage, tampilkan prompt "Lanjutkan pengisian sebelumnya?"
  - Tombol "Lanjutkan" dan "Mulai Baru"
- `[ ]` **E3-07** — **"Kirim respons lain"** di confirmation page
  - Setelah submit, tombol "Kirim respons lain" yang me-reset form
  - Sesuai dengan Google Forms behavior

---

## EPIC 4 — Settings: Fitur Baru Google Forms 2026

### P0 — Kritis
- `[ ]` **E4-01** — **Response Cap** (Batas jumlah respons)
  - Tambahkan field `maxResponses: number | null` ke `FormMetadata`
  - Di `SettingsPanel.js`: input number "Batas maksimal respons"
  - Di `FormRenderer.js`: cek jumlah respons yang ada; jika sudah mencapai batas, tampilkan form tertutup
  - Di `FormManager.js`: tambah method `isResponseCapReached(formId)`
- `[ ]` **E4-02** — **Closing Date/Time** (Tanggal tutup otomatis)
  - Tambahkan field `closingDate: string | null` (ISO-8601) ke `FormMetadata`
  - Di `SettingsPanel.js`: datetime-local input "Tutup otomatis pada"
  - Di `FormRenderer.js`: cek tanggal saat ini vs `closingDate`; jika sudah lewat, form tertutup
- `[ ]` **E4-03** — **Update FormDefinition schema** di `prd.md` dan `AGENTS.md`
  - Tambahkan `maxResponses` dan `closingDate` ke typedef `FormMetadata`

### P1 — Penting
- `[ ]` **E4-04** — **Filter UI di Response Dashboard**
  - Tampilkan date-range filter di tab Ringkasan/Individual
  - Wire ke `ResponseState.setFilter()` yang sudah ada
  - Tombol "Reset Filter"
- `[ ]` **E4-05** — **"Kumpulkan alamat email"** setting
  - Tambah field `collectEmail: boolean` ke `FormMetadata`
  - Jika aktif: tambahkan field email wajib di awal form secara otomatis
- `[ ]` **E4-06** — **Pesan untuk responden setelah submit**
  - Setting: tampilkan/sembunyikan chart summary untuk responden setelah submit
  - Field `showSummaryToRespondents: boolean`

---

## EPIC 5 — Tema: Fitur yang Hilang

### P0 — Kritis
- `[ ]` **E5-01** — **Upload/Set Header Image** dari ThemePanel
  - Input file (PNG/JPG/GIF) di ThemePanel
  - Convert ke base64 dan simpan di `form.metadata.headerImageUrl`
  - Preview langsung di panel
  - Tombol "Hapus Gambar" 
- `[ ]` **E5-02** — **Custom warna Background Pertanyaan**
  - `questionBackgroundColor` sudah ada di `ThemeConfig` model
  - Tambahkan `ColorPicker` untuk warna ini di `ThemePanel.js`

### P1 — Penting  
- `[ ]` **E5-03** — **Tambahkan preset tema** (dari 6 menjadi 10+)
  - Tambah: Sunset, Ocean, Forest, Night, Grape
  - Update `PRESET_THEMES` di `ThemeEngine.js`
  - Pastikan setiap preset punya warna header, background, dan question background

---

## EPIC 6 — Sharing: Fix & Enhancement

### P0 — CRITICAL BUG FIX
- `[ ]` **E6-01** — **Fix QR Code dependency violation**
  - Hapus penggunaan `https://api.qrserver.com/...` dari `ShareDialog.js`
  - Implementasi QR Code generator **vanilla JS murni** (tanpa library eksternal)
  - Algoritma: implementasi QR Code Level M dengan data URL canvas
  - Atau: lazy-load library `qrcode.js` (189 KB) hanya saat tab QR diklik
  - **Pilihan yang direkomendasikan:** lazy-load `qrcode` dari CDN hanya saat dibutuhkan
  - File baru: `src/ui/sharing/QRCodeGenerator.js`

### P1 — Penting
- `[ ]` **E6-02** — **Shorten/simplify form URL** display
  - Tampilkan URL yang lebih bersih di share dialog
- `[ ]` **E6-03** — **Share via Email** (menggunakan `mailto:`)
  - Tombol "Kirim via Email" yang membuka email client dengan link form

---

## EPIC 7 — Response Dashboard: Fitur yang Hilang

### P0 — Kritis
- `[ ]` **E7-01** — **Hapus semua jawaban** dengan konfirmasi
  - Tombol "Hapus semua jawaban" di toolbar response dashboard
  - Dialog konfirmasi dengan warning merah
  - Setelah hapus, tampilkan empty state
- `[ ]` **E7-02** — **Hapus respons individual** dengan konfirmasi
  - Tombol "Hapus respons ini" di Individual View
  - Verifikasi fungsi sudah ada di `IndividualView.js` dan bekerja benar

### P1 — Penting
- `[ ]` **E7-03** — **Tampilan "Pertanyaan" view** yang lebih baik
  - Tab "Pertanyaan" di response dashboard
  - Satu pertanyaan per layar dengan navigasi ◀▶
  - Lebih rinci dari Summary (tampilkan semua jawaban individual per pertanyaan)
- `[ ]` **E7-04** — **Print/Export respons ke PDF**
  - Tombol "Print" yang memicu `window.print()` dengan CSS print-friendly
  - `@media print` styles untuk Response Dashboard

---

## EPIC 8 — Dashboard: UI/UX Polish

### P1 — Penting
- `[ ]` **E8-01** — **Search/Filter form** di Dashboard
  - Input pencarian "Cari formulir..." di header dashboard
  - Filter real-time berdasarkan judul form
- `[ ]` **E8-02** — **Sort form** by name / by date
  - Dropdown sort: "Terbaru", "Terlama", "A-Z", "Z-A"
- `[ ]` **E8-03** — **Template gallery** awal
  - Minimal 3 template siap pakai: Kontak Sederhana, Survei Kepuasan, Registrasi Acara
  - Tombol "Dari template" di samping "Buat form baru"
- `[ ]` **E8-04** — **Badge jumlah respons** di card form
  - Tampilkan angka respons di setiap card form di dashboard
  - Update realtime dari localStorage

---

## EPIC 9 — Data Model & Schema Updates

- `[ ]` **E9-01** — Update `FormMetadata` typedef di `AGENTS.md`
  ```javascript
  // Tambahkan:
  maxResponses: number | null,       // Batas respons (null = unlimited)
  closingDate: string | null,        // ISO-8601 tanggal tutup
  collectEmail: boolean,             // Kumpulkan email responden
  showSummaryToRespondents: boolean, // Tampilkan hasil ke responden
  ```
- `[ ]` **E9-02** — Update `FormDefinition` schema di `prd.md` (Section 5.1)
- `[ ]` **E9-03** — Update `FormFactory.js` — tambahkan default values untuk field baru
- `[ ]` **E9-04** — Update `LocalStorageAdapter.js` — pastikan backward compatibility dengan form lama

---

## EPIC 10 — Testing & Quality

- `[ ]` **E10-01** — Update unit tests untuk ValidationEngine (other option)
- `[ ]` **E10-02** — Update unit tests untuk FormDefinition (schema baru)
- `[ ]` **E10-03** — Tambah E2E test untuk "Other" option flow
- `[ ]` **E10-04** — Tambah E2E test untuk Response Cap dan Closing Date
- `[ ]` **E10-05** — Tambah E2E test untuk Back button navigation
- `[ ]` **E10-06** — Visual regression test (screenshot comparison) untuk UI parity

---

## Ringkasan Prioritas

| Priority | Jumlah Task | Epic Terkait |
|----------|------------|--------------|
| **P0 (Kritis)** | 14 task | E1-01~04, E2-01~03, E3-01~03, E4-01~03, E6-01, E7-01~02 |
| **P1 (Penting)** | 20 task | E1-05~07, E2-04~06, E3-04~07, E4-04~06, E5-01~03, E6-02~03, E7-03~04, E8-01~04 |
| **P2 (Nice to Have)** | ~10 task | E9-01~04, E10-01~06 |

### Urutan Pengerjaan yang Disarankan:
1. **E6-01** (QR fix) — bug violation dulu
2. **E1-01~04** (Other option) — fitur paling sering dipakai
3. **E3-01** (Back button) — UX critical
4. **E3-02** (Header image) — visual impact tinggi
5. **E4-01~02** (Response cap + closing date) — fitur baru 2026
6. **E2-01~03** (UI polish)
7. **E5-01** (Header image upload)
8. Sisanya sesuai kapasitas sprint
