# AGENTS.md — Dynamic Form Builder

> **Source of Truth** untuk seluruh AI Agent yang bekerja pada proyek ini.
> Dokumen ini WAJIB dibaca dan dipatuhi sebelum menulis kode apapun.
> Terakhir diperbarui: 2026-06-22

---

## 0. Hierarki Dokumen

Urutan otoritas keputusan — jika terjadi konflik, dokumen yang lebih tinggi menang:

1. **`AGENTS.md`** (dokumen ini) — Aturan eksekusi, konvensi kode, batasan teknis
2. **`prd.md`** — Spesifikasi produk, user stories, acceptance criteria, data schema
3. **`design.md`** (jika ada) — Detail arsitektur komponen, diagram, dan pola implementasi
4. **Komentar inline di kode** — Konteks spesifik per file/fungsi

> **Aturan Emas:** Jika ragu tentang *apa* yang harus dibangun, baca `prd.md`. Jika ragu tentang *bagaimana* membangunnya, baca `AGENTS.md` ini.

---

## 1. Identitas Proyek

| Atribut | Nilai |
|---------|-------|
| **Nama** | Dynamic Form Builder |
| **Tipe** | Client-side web application (SPA) |
| **Versi** | 1.0.0 (MVP) |
| **Bahasa** | JavaScript ES2020+ |
| **Bundler** | Vite |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Linting** | ESLint + Prettier |
| **Target Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Target Bundle** | < 150 KB gzipped (core, tanpa optional deps) |
| **Bahasa UI** | Bahasa Indonesia |
| **Referensi Visual** | Google Forms (parity 1:1) |

---

## 2. Prinsip Arsitektur — WAJIB DIPATUHI

### 2.1 Core Principles

```
JANGAN LANGGAR PRINSIP BERIKUT:

1. ZERO DEPENDENCY CORE
   - Core engine (state, validation, logic, theme, export) TIDAK BOLEH
     mengimpor library eksternal apapun.
   - Semua logika inti HARUS ditulis dengan Vanilla JS murni.
   - Library opsional (Chart.js, DOMPurify, QRCode.js, Sortable.js)
     HANYA boleh digunakan di layer UI dan HARUS lazy-loaded.

2. CLIENT-SIDE FIRST
   - Aplikasi HARUS berfungsi 100% tanpa backend/server.
   - Tidak boleh ada fitur yang GAGAL jika tidak ada koneksi internet,
     kecuali fitur yang secara eksplisit membutuhkan network (webhook, Supabase, Google Sheets).

3. DATA SOVEREIGNTY
   - TIDAK BOLEH mengirim data apapun ke server manapun tanpa konfigurasi
     EKSPLISIT dari pengguna.
   - Default storage = localStorage. Titik.

4. EMBEDDABLE BY DEFAULT
   - Semua CSS HARUS di-scope/namespace agar tidak konflik dengan host page.
   - Tidak boleh ada global CSS pollution.
   - Prefix CSS: `.dfb-` untuk semua class names.
   - Web Component menggunakan Shadow DOM.
```

### 2.2 Layered Architecture

```
┌─────────────────────────────────────────────┐
│           PRESENTATION LAYER (UI)            │
│  src/ui/**                                   │
│  - DOM manipulation, event listeners         │
│  - Komponen visual (editor, renderer, dll)   │
│  - TIDAK BOLEH berisi business logic         │
├─────────────────────────────────────────────┤
│           CORE / BUSINESS LAYER              │
│  src/core/**                                 │
│  - State management, validation, logic       │
│  - TIDAK BOLEH mengakses DOM                 │
│  - TIDAK BOLEH mengimpor dari src/ui/        │
│  - HARUS pure functions sejauh mungkin       │
├─────────────────────────────────────────────┤
│           STORAGE LAYER                      │
│  src/core/storage/**                         │
│  - localStorage, sessionStorage, IndexedDB   │
│  - Webhook, Supabase, Google Sheets adapter  │
│  - HARUS menggunakan adapter pattern         │
└─────────────────────────────────────────────┘
```

**ATURAN DEPENDENCY ANTAR LAYER:**

```
UI Layer      → BOLEH import dari Core Layer
Core Layer    → TIDAK BOLEH import dari UI Layer
Storage Layer → TIDAK BOLEH import dari UI Layer
Komunikasi    → Via EventBus (src/core/utils/eventBus.js) SAJA
```

### 2.3 Event Bus — Satu-satunya Pola Komunikasi Antar Modul

Semua komunikasi antar modul HARUS menggunakan EventBus. **DILARANG:**
- Import langsung antar modul yang tidak terkait layer
- Callback chaining antar komponen
- Global mutable state selain melalui State Manager

Event yang terdaftar (referensi lengkap di `prd.md` § 7.6):

| Event | Emitter | Listener |
|-------|---------|----------|
| `form:loaded` | EditorState.setForm() | Editor |
| `form:updated` | Editor, EditorState(undo/redo) | Storage, Preview, SettingsPanel |
| `question:added` | Editor | State |
| `question:deleted` | Editor | State, Logic |
| `question:reordered` | DragDrop | State |
| `answer:changed` | RendererState.setAnswer() | Validator, State |
| `section:navigate` | RendererState.setSection() | Logic, State |
| `form:submit` | RendererState.finishSubmit() | Storage, Webhook |
| `theme:changed` | ThemePanel | Renderer |
| `validation:result` | Validator | Renderer |
| `view:changed` | EditorState.setViewMode() | Editor |
| `responses:loaded` | ResponseState.loadFromStorage() | ResponseDashboard |
| `response:added` | ResponseState.addResponse() | SummaryView |
| `response:deleted` | ResponseState.removeResponse() | ResponseDashboard |
| `responses:filtered` | ResponseState.setFilter() | ResponseDashboard |

**Menambah event baru:** Boleh, tapi HARUS didokumentasikan di tabel ini via komentar di `eventBus.js` dan di-update di `AGENTS.md`.

---

## 3. Struktur Direktori — WAJIB DIIKUTI

```
dynamic-form-builder/                  (root = c:\laragon\www\Application\DynamicForm)
│
├── .agents/
│   └── AGENTS.md                      ← DOKUMEN INI
│
├── src/
│   ├── core/                          # Business logic murni (NO DOM!)
│   │   ├── form/
│   │   │   ├── FormDefinition.js      # Model utama form
│   │   │   ├── FormFactory.js         # Factory: instance kosong
│   │   │   ├── FormManager.js         # CRUD manager via StorageAdapter
│   │   │   ├── Question.js            # Model pertanyaan
│   │   │   ├── QuestionTypes.js       # Enum tipe pertanyaan + label
│   │   │   └── Section.js             # Model seksi
│   │   ├── engine/
│   │   │   ├── ValidationEngine.js    # Semua logika validasi
│   │   │   ├── LogicEngine.js         # Conditional logic / branching
│   │   │   ├── ThemeEngine.js         # CSS variable management
│   │   │   └── ExportEngine.js        # CSV/JSON export logic
│   │   ├── state/
│   │   │   ├── EditorState.js         # State editor + undo/redo
│   │   │   ├── RendererState.js       # State renderer (answers, errors)
│   │   │   └── ResponseState.js       # State manajemen respons
│   │   ├── storage/
│   │   │   ├── StorageAdapter.js      # Abstract adapter interface
│   │   │   ├── LocalStorageAdapter.js # Implementasi localStorage
│   │   │   ├── IndexedDBAdapter.js    # Implementasi IndexedDB
│   │   │   └── WebhookAdapter.js      # Kirim ke remote webhook
│   │   └── utils/
│   │       ├── uuid.js                # UUID v4 generator (built-in, no lib)
│   │       ├── sanitize.js            # HTML sanitizer (textContent-based)
│   │       ├── debounce.js            # Debounce/throttle utilities
│   │       └── eventBus.js            # Event bus singleton
│   │
│   ├── ui/                            # DOM components
│   │   ├── Dashboard.js               # Halaman daftar form
│   │   ├── editor/
│   │   │   ├── DragHandle.js          # Handle drag-and-drop
│   │   │   ├── FormEditor.js          # Root editor component
│   │   │   ├── QuestionCard.js        # Card per pertanyaan
│   │   │   ├── QuestionToolbar.js     # Toolbar tipe pertanyaan
│   │   │   ├── SectionDivider.js      # Divider seksi
│   │   │   ├── SettingsPanel.js       # Panel setelan form (webhook, dll)
│   │   │   └── editors/               # Editor spesifik per question type
│   │   │       ├── ShortAnswerEditor.js
│   │   │       ├── ParagraphEditor.js
│   │   │       ├── MultipleChoiceEditor.js
│   │   │       ├── CheckboxesEditor.js
│   │   │       ├── DropdownEditor.js
│   │   │       ├── LinearScaleEditor.js
│   │   │       ├── GridEditor.js       # mc_grid + checkbox_grid
│   │   │       ├── DateEditor.js
│   │   │       └── TimeEditor.js
│   │   ├── renderer/
│   │   │   ├── FormRenderer.js        # Root renderer component
│   │   │   ├── SectionView.js         # View per seksi
│   │   │   ├── ProgressBar.js         # Progress indicator
│   │   │   ├── ConfirmationPage.js    # Halaman setelah submit
│   │   │   └── questions/             # Field spesifik per question type
│   │   │       ├── ShortAnswerField.js
│   │   │       ├── ParagraphField.js
│   │   │       ├── MultipleChoiceField.js
│   │   │       ├── CheckboxesField.js
│   │   │       ├── DropdownField.js
│   │   │       ├── LinearScaleField.js
│   │   │       ├── McGridField.js     # Multiple choice grid
│   │   │       ├── CheckboxGridField.js # Checkbox grid
│   │   │       ├── DateField.js
│   │   │       └── TimeField.js
│   │   ├── responses/
│   │   │   ├── ResponseDashboard.js
│   │   │   ├── SummaryView.js
│   │   │   ├── IndividualView.js
│   │   │   └── charts/
│   │   │       ├── PieChart.js
│   │   │       ├── BarChart.js
│   │   │       └── ScaleChart.js
│   │   ├── theme/
│   │   │   ├── ThemePanel.js
│   │   │   ├── ColorPicker.js
│   │   │   └── FontSelector.js
│   │   ├── sharing/
│   │   │   └── ShareDialog.js
│   │   └── common/                    # Komponen UI reusable
│   │       ├── ConfirmDialog.js
│   │       ├── FileDownloader.js      # Trigger download file di browser
│   │       ├── Modal.js
│   │       └── Toast.js
│   │
│   ├── styles/
│   │   ├── base/
│   │   │   ├── reset.css              # CSS reset minimal
│   │   │   ├── variables.css          # CSS Custom Properties (design tokens)
│   │   │   └── typography.css         # Font stacks & type scale
│   │   ├── components/
│   │   │   ├── editor.css
│   │   │   ├── field-types.css        # Field type-specific styles
│   │   │   ├── question-card.css
│   │   │   ├── renderer.css
│   │   │   ├── responses.css
│   │   │   └── theme.css              # Theme panel styles
│   │   └── themes/
│   │       └── presets.css            # 6 preset tema (CSS vars)
│   │
│   ├── sdk/
│   │   ├── sdk.js                     # Entry point SDK untuk embed
│   │   └── web-component.js           # Custom Element <dynamic-form>
│   │
│   └── main.js                        # Entry point aplikasi utama
│
├── index.html                         # Entry point / Dashboard
├── editor.html                        # Halaman editor
├── form.html                          # Halaman pengisian form (renderer)
├── responses.html                     # Halaman respons
│
├── tests/
│   ├── unit/                          # Vitest unit tests
│   │   ├── ExportEngine.test.js
│   │   ├── FormDefinition.test.js
│   │   ├── LogicEngine.test.js
│   │   ├── StorageAdapter.test.js
│   │   ├── utils.test.js
│   │   └── ValidationEngine.test.js
│
├── e2e/                               # Playwright E2E tests
│   ├── editor.spec.js
│   ├── helpers.js
│   ├── renderer.spec.js
│   └── responses.spec.js
│
├── public/
│   ├── icons/                         # SVG icons saja
│   └── fonts/                         # Web fonts (opsional)
│
├── prd.md                             # Product Requirements Document
├── design.md                          # Technical Design Document (jika ada)
├── vite.config.js
├── package.json
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

**ATURAN STRUKTUR:**

- **DILARANG** membuat file di luar struktur di atas tanpa konfirmasi pengguna.
- **DILARANG** membuat folder baru di `src/` selain yang terdaftar.
- Jika butuh file baru, letakkan di folder yang paling relevan dari struktur di atas.
- Satu file = satu class/komponen/modul. Tidak boleh file dengan multiple exported classes.
- Nama file menggunakan **PascalCase** untuk class/komponen, **camelCase** untuk utility.
- Halaman HTML (index.html, editor.html, form.html, responses.html) berada di **root proyek**, bukan di `src/pages/`.
- E2E test berada di **root** `e2e/`, bukan di `tests/e2e/`.
- `src/core/form/` memiliki tambahan `FormManager.js` (CRUD) dan `QuestionTypes.js` (enum).

---

## 4. Konvensi Kode — WAJIB DIIKUTI

### 4.1 JavaScript

```javascript
// ═══════════════════════════════════════════════════
// ATURAN UMUM
// ═══════════════════════════════════════════════════

// 1. GUNAKAN ES2020+ features:
//    - Optional chaining (?.)
//    - Nullish coalescing (??)
//    - Private class fields (#)
//    - Dynamic import()
//    - Array.at()

// 2. GUNAKAN `const` secara default. `let` hanya jika harus di-reassign.
//    DILARANG menggunakan `var`.

// 3. DILARANG menggunakan `any` jika menggunakan JSDoc type hints.

// 4. Semua fungsi HARUS memiliki JSDoc comment:
/**
 * Memvalidasi nilai input berdasarkan konfigurasi validasi.
 * @param {string|number|string[]} value - Nilai yang akan divalidasi
 * @param {ValidationConfig} config - Konfigurasi aturan validasi
 * @returns {{ isValid: boolean, error: string|null }}
 */
function validate(value, config) { /* ... */ }

// 5. Error handling: SELALU gunakan try-catch di boundary functions.
//    JANGAN biarkan error tidak tertangkap.

// 6. DILARANG menggunakan innerHTML. Gunakan textContent atau DOM API.
//    Satu-satunya pengecualian: jika menggunakan DOMPurify, dan HARUS
//    ada komentar yang menjelaskan alasannya.

// 7. Console statements:
//    - console.error() → BOLEH untuk error yang perlu di-debug
//    - console.warn()  → BOLEH untuk deprecation/warning
//    - console.log()   → DILARANG di production code.
//      Gunakan hanya saat development, hapus sebelum commit.
```

### 4.2 Naming Conventions

| Konteks | Konvensi | Contoh |
|---------|----------|--------|
| File komponen/class | PascalCase | `QuestionCard.js`, `ValidationEngine.js` |
| File utility | camelCase | `uuid.js`, `debounce.js`, `eventBus.js` |
| File CSS | kebab-case | `question-card.css`, `variables.css` |
| File test | Match source + `.test.js` / `.spec.js` | `ValidationEngine.test.js` |
| Class | PascalCase | `class FormDefinition {}` |
| Function / method | camelCase | `validateField()`, `getNextSection()` |
| Constant | UPPER_SNAKE_CASE | `const MAX_QUESTIONS = 200` |
| Private field/method | `#` prefix | `#handlers`, `#validateInternal()` |
| CSS class | `dfb-` prefix + kebab-case | `.dfb-question-card`, `.dfb-editor-header` |
| CSS variable | `--dfb-` prefix | `--dfb-primary-color`, `--dfb-font-family` |
| Event name | `namespace:action` | `form:updated`, `question:added` |
| DOM id | `dfb-` prefix + kebab-case | `id="dfb-form-title"` |
| Data attribute | `data-dfb-*` | `data-dfb-question-id="uuid"` |

### 4.3 CSS

```css
/* ═══════════════════════════════════════════════════
   ATURAN CSS
   ═══════════════════════════════════════════════════ */

/* 1. SEMUA class HARUS diawali prefix .dfb- untuk menghindari
      konflik saat embed ke halaman lain. */
.dfb-question-card { /* ... */ }

/* 2. GUNAKAN CSS Custom Properties untuk semua nilai yang bisa berubah
      (warna, font, spacing, border-radius). */
.dfb-question-card {
  background: var(--dfb-card-bg, #ffffff);
  border-radius: var(--dfb-border-radius, 8px);
  font-family: var(--dfb-font-family, 'Google Sans', sans-serif);
}

/* 3. DILARANG menggunakan !important kecuali untuk override
      spesifik dalam konteks embed (dan HARUS ada komentar). */

/* 4. Breakpoint menggunakan mobile-first approach: */
/* Mobile (default) → Tablet (768px) → Desktop (1024px) → XL (1440px) */

/* 5. DILARANG menggunakan px untuk font-size di komponen yang
      bisa di-embed. Gunakan rem atau em. */

/* 6. Animasi dan transisi HARUS menggunakan durasi standar: */
/* --dfb-transition-fast: 150ms */
/* --dfb-transition-normal: 200ms */
/* --dfb-transition-slow: 300ms */
/* Timing function default: ease atau ease-out */

/* 7. WAJIB mendukung prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .dfb-* {
    animation: none !important;  /* Pengecualian !important yang sah */
    transition-duration: 0.01ms !important;
  }
}
```

### 4.4 HTML & Aksesibilitas

```
ATURAN AKSESIBILITAS — NON-NEGOTIABLE:

1. Setiap <input>, <select>, <textarea> HARUS punya <label> yang terhubung via for/id.
2. Field wajib HARUS memiliki aria-required="true".
3. Pesan error HARUS menggunakan role="alert" agar diumumkan screen reader.
4. Focus order HARUS logis (tab order mengikuti visual order).
5. Semua interactive elements HARUS bisa dioperasikan via keyboard.
6. Kontras warna minimum 4.5:1 untuk teks normal.
7. Drag-and-drop HARUS punya keyboard alternative (Alt+↑ / Alt+↓).
8. DILARANG menggunakan <div> atau <span> sebagai pengganti elemen semantik
   (<button>, <nav>, <main>, <section>, <article>, <header>, <footer>).
9. Setiap ikon interaktif HARUS punya aria-label deskriptif.
```

---

## 5. Data Model & Schema — Source of Truth

Semua data HARUS mengikuti schema berikut. **DILARANG** menambah/mengubah field tanpa mendokumentasikannya di `prd.md` dan `AGENTS.md`.

### 5.1 FormDefinition

```javascript
/**
 * @typedef {Object} FormDefinition
 * @property {string} formId - UUID v4
 * @property {string} version - "1"
 * @property {FormMetadata} metadata
 * @property {ThemeConfig} theme
 * @property {Section[]} sections
 * @property {Question[]} questions
 */

/**
 * @typedef {Object} FormMetadata
 * @property {string} title - Max 500 char
 * @property {string} description - Max 2000 char
 * @property {string|null} headerImageUrl
 * @property {string} createdAt - ISO-8601
 * @property {string} updatedAt - ISO-8601
 * @property {boolean} isAcceptingResponses
 * @property {string} confirmationMessage
 * @property {boolean} showProgressBar
 * @property {boolean} shuffleQuestions
 * @property {boolean} limitOneResponse
 * @property {string|null} webhookUrl - URL webhook (HTTPS only)
 * @property {string|null} webhookSecret - HMAC signing secret
 */

/**
 * @typedef {Object} ThemeConfig
 * @property {string} primaryColor - Hex color
 * @property {string} backgroundColor - Hex color
 * @property {string} questionBackgroundColor - Hex color
 * @property {'Sans Serif'|'Serif'|'Monospace'|'Decorative'} fontFamily
 * @property {'small'|'medium'|'large'} fontSize
 */
```

### 5.2 Question Types Enum

```javascript
/**
 * Tipe pertanyaan yang didukung.
 * DILARANG menambah tipe baru tanpa update di:
 * 1. AGENTS.md (di sini)
 * 2. prd.md (Functional Requirements)
 * 3. Editor (src/ui/editor/editors/)
 * 4. Renderer (src/ui/renderer/questions/)
 * 5. ValidationEngine (jika ada validasi khusus)
 */
const QUESTION_TYPES = {
  SHORT_ANSWER: 'short_answer',       // QT-01 [P0]
  PARAGRAPH: 'paragraph',             // QT-02 [P0]
  MULTIPLE_CHOICE: 'multiple_choice', // QT-03 [P0]
  CHECKBOXES: 'checkboxes',           // QT-04 [P0]
  DROPDOWN: 'dropdown',               // QT-05 [P0]
  LINEAR_SCALE: 'linear_scale',       // QT-06 [P0]
  MULTIPLE_CHOICE_GRID: 'mc_grid',   // QT-07 [P1]
  CHECKBOX_GRID: 'checkbox_grid',     // QT-08 [P1]
  DATE: 'date',                       // QT-09 [P0]
  TIME: 'time',                       // QT-10 [P0]
  FILE_UPLOAD: 'file_upload',         // QT-11 [P2]
  SECTION_HEADER: 'section_header',   // QT-12 [P0]
  RATING: 'rating',                   // QT-13 [P2]
};
```

### 5.3 ResponseRecord

```javascript
/**
 * @typedef {Object} ResponseRecord
 * @property {string} responseId - UUID v4
 * @property {string} formId
 * @property {string} formVersion
 * @property {string} submittedAt - ISO-8601
 * @property {string} startedAt - ISO-8601
 * @property {number} durationSeconds
 * @property {string} respondentId - Anonymous hash (BUKAN PII)
 * @property {Record<string, AnswerValue>} answers - Key = questionId
 */

/**
 * @typedef {Object} AnswerValue
 * @property {string} questionType
 * @property {string|string[]|number|Object|null} value
 */
```

### 5.4 Validasi Schema

Sebelum menyimpan FormDefinition atau ResponseRecord ke storage:
- **HARUS** memvalidasi required fields (formId, version, metadata.title)
- **HARUS** memvalidasi tipe data (string, boolean, number, array)
- **HARUS** memvalidasi batas karakter (title ≤ 500, description ≤ 2000)
- **HARUS** memastikan semua questionId unik dalam satu form
- **HARUS** memastikan semua sectionId unik dalam satu form

---

## 6. State Management — Aturan Ketat

### 6.1 State Tree

```
AppState (SATU GLOBAL STATE — immutable updates)
├── editor
│   ├── formDefinition: FormDefinition
│   ├── activeQuestionId: string | null
│   ├── activeSectionId: string | null
│   ├── isDirty: boolean
│   ├── undoStack: FormDefinition[]     ← max 50 entries
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

### 6.2 Aturan Mutasi State

```
1. DILARANG mutasi state secara langsung (direct mutation).
   HARUS menggunakan method di State class yang mengembalikan state baru.

2. Setiap perubahan state HARUS memicu event via EventBus.

3. Auto-save ke localStorage:
   - FormDefinition → setiap 30 detik DAN setiap on-blur dari editor
   - Renderer answers → setiap perubahan input (ke sessionStorage)

4. Undo/Redo:
   - Simpan snapshot FormDefinition SEBELUM setiap perubahan signifikan
   - Max 50 langkah
   - Undo/redo stack di MEMORY SAJA (tidak disimpan ke storage)
```

### 6.3 Storage Mapping

| Data | Storage | TTL | Kapan Ditulis |
|------|---------|-----|--------------|
| FormDefinition (draft) | localStorage | Permanen | Auto-save 30s + on-blur |
| FormDefinition (published) | localStorage / remote | Permanen | Manual "Simpan" |
| Editor undo/redo | Memory | Per sesi | Setiap mutasi form |
| Renderer answers (in-progress) | sessionStorage | Sampai tab ditutup | Setiap input change |
| ResponseRecord[] | localStorage / remote | Permanen | Setiap form submit |

---

## 7. Modul Sistem — Batasan & Tanggung Jawab

### Peta Modul

| ID | Modul | Direktori | Tanggung Jawab | Batasan |
|----|-------|-----------|---------------|---------|
| M1 | Form Builder (Editor) | `src/ui/editor/` | UI editor drag-and-drop | TIDAK BOLEH mengakses storage langsung. Gunakan EventBus. |
| M2 | Form Renderer | `src/ui/renderer/` | Tampilan form untuk responden | TIDAK BOLEH mengakses EditorState |
| M3 | Response Collector | `src/core/storage/` | Pengumpulan & penyimpanan jawaban | HARUS menggunakan StorageAdapter pattern |
| M4 | Response Viewer | `src/ui/responses/` | Visualisasi & dashboard respons | BOLEH import dari ResponseState saja |
| M5 | Theme Engine | `src/core/engine/ThemeEngine.js` | Manajemen CSS Variables | TIDAK BOLEH hardcode warna. Semua via CSS vars. |
| M6 | Logic Engine | `src/core/engine/LogicEngine.js` | Conditional branching | HARUS mendeteksi infinite loop. |
| M7 | Validation Engine | `src/core/engine/ValidationEngine.js` | Validasi input real-time | HARUS pure function. Tidak boleh side effects. |
| M8 | Export/Import | `src/core/engine/ExportEngine.js` | CSV/JSON/ZIP export | CSV HARUS UTF-8 + BOM. |
| M9 | Sharing & Embedding | `src/ui/sharing/` + `src/sdk/` | Link, embed, QR | SDK entry point terpisah dari main app. |

---

## 8. UI/UX Rules — Standar Interaksi

### 8.1 Google Forms Parity Checklist

Saat mengimplementasikan UI, SELALU rujuk ke Google Forms sebagai referensi visual:

```
✅ YANG HARUS SAMA dengan Google Forms:
   - Tata letak question card (rounded card, shadow, spacing)
   - Warna default (#4285F4 header, #F0F4F9 background)
   - Perilaku inline editing judul/deskripsi
   - Toggle required di footer card
   - Progress bar saat multi-section
   - Halaman konfirmasi setelah submit
   - 6 preset tema warna

❌ YANG BOLEH BERBEDA:
   - Branding / logo (gunakan branding sendiri atau tanpa branding)
   - Fitur yang ada di out-of-scope (quiz mode, collab, dll)
   - Internal implementation details
```

### 8.2 Responsive Design Rules

| Breakpoint | Viewport | Layout Editor | Layout Renderer |
|------------|----------|--------------|----------------|
| Mobile S | 320px | 1 kolom, toolbar FAB | 1 kolom, full width |
| Mobile M/L | 375–425px | 1 kolom, toolbar FAB | 1 kolom, padding 16px |
| Tablet | 768px | 1 kolom, sidebar hidden | 1 kolom, max-width 600px, centered |
| Desktop | 1024px+ | 2 kolom (questions + sidebar toolbar) | 1 kolom, max-width 720px, centered |
| Desktop XL | 1440px | 2 kolom, wider sidebar | 1 kolom, max-width 720px, centered |

### 8.3 Animasi & Transisi Standar

| Konteks | Durasi | Timing | CSS Var |
|---------|--------|--------|---------|
| Hover / focus | 150ms | ease | `--dfb-transition-fast` |
| Card expand / collapse | 200ms | ease-out | `--dfb-transition-normal` |
| Drag & drop | 300ms | ease-out | `--dfb-transition-slow` |
| Toast notification | 3000ms visible, 300ms fade-out | — | — |
| Error flash highlight | 1500ms fade | ease | — |
| Page/section transition | 200ms | ease | `--dfb-transition-normal` |

### 8.4 Warna & Design Tokens

```css
/* Wajib didefinisikan di src/styles/base/variables.css */
:root {
  /* Brand / Theme (dapat diubah user) */
  --dfb-primary-color: #4285F4;
  --dfb-bg-color: #F0F4F9;
  --dfb-card-bg: #FFFFFF;
  --dfb-font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Fixed / System (TIDAK boleh diubah user) */
  --dfb-error-color: #D93025;
  --dfb-success-color: #188038;
  --dfb-warning-color: #F9AB00;
  --dfb-text-primary: #202124;
  --dfb-text-secondary: #5F6368;
  --dfb-border-color: #DADCE0;
  --dfb-border-radius: 8px;
  --dfb-border-radius-sm: 4px;

  /* Spacing scale */
  --dfb-space-xs: 4px;
  --dfb-space-sm: 8px;
  --dfb-space-md: 16px;
  --dfb-space-lg: 24px;
  --dfb-space-xl: 32px;
  --dfb-space-2xl: 48px;

  /* Transitions */
  --dfb-transition-fast: 150ms;
  --dfb-transition-normal: 200ms;
  --dfb-transition-slow: 300ms;

  /* Shadows */
  --dfb-shadow-idle: 0 1px 2px rgba(0,0,0,0.1);
  --dfb-shadow-hover: 0 2px 6px rgba(0,0,0,0.15);
  --dfb-shadow-active: 0 1px 3px rgba(0,0,0,0.2);
}
```

---

## 9. Keamanan — Aturan Non-Negotiable

```
1. XSS PREVENTION
   - DILARANG menggunakan innerHTML, outerHTML, atau insertAdjacentHTML
     dengan data user-generated.
   - Gunakan textContent untuk teks biasa.
   - Jika HARUS render HTML → gunakan DOMPurify → HARUS ada komentar
     yang menjelaskan MENGAPA innerHTML diperlukan di situ.

2. NO UNAUTHORIZED DATA TRANSMISSION
   - Default = localStorage. TIDAK ADA data yang dikirim ke server manapun
     tanpa konfigurasi eksplisit pengguna.
   - Tidak ada tracking cookies, analytics, atau beacons secara default.

3. WEBHOOK SECURITY
   - URL webhook HARUS divalidasi (HARUS HTTPS).
   - Payload HARUS ditandatangani dengan HMAC-SHA256.
   - Header: X-Form-Id, X-Response-Id, X-Signature

4. RESPONDENT PRIVACY
   - respondentId = hash anonim dari User-Agent + timestamp.
   - BUKAN PII (Personally Identifiable Information).
   - DILARANG menyimpan IP address, cookies, atau fingerprinting.

5. CSP COMPATIBILITY
   - Kode HARUS compatible dengan Content Security Policy.
   - DILARANG menggunakan eval(), Function(), atau inline event handlers.
   - DILARANG menggunakan inline <script> atau inline style di HTML.
```

---

## 10. Testing — Standar Minimum

### 10.1 Cakupan Wajib

| Layer | Tool | Coverage Target | Fokus |
|-------|------|:---------------:|-------|
| Core Logic | Vitest | **≥ 80%** | ValidationEngine, LogicEngine, ExportEngine, FormDefinition |
| Integration | Vitest | — | Form create → save → load, Submit → storage |
| E2E | Playwright | Semua P0 flows | Editor flow, Renderer flow, Response view, Export |
| Cross-Browser | Playwright | Chrome, Firefox, Safari | Semua P0 features |

### 10.2 Aturan Test

```
1. Setiap file di src/core/engine/ HARUS punya file test terkait.
2. Setiap bug fix HARUS disertai regression test.
3. Test HARUS bisa berjalan tanpa network (mock semua HTTP calls).
4. Test TIDAK BOLEH bergantung pada urutan eksekusi.
5. E2E test HARUS dijalankan di mode incognito (tanpa state antar sesi).
6. DILARANG skip test tanpa komentar yang menjelaskan alasannya.
```

### 10.3 Cara Menjalankan Test

```bash
# Unit tests
npm run test              # Vitest — jalankan semua
npm run test:watch        # Vitest — watch mode
npm run test:coverage     # Vitest — dengan coverage report

# E2E tests
npm run test:e2e          # Playwright — semua browser
npm run test:e2e:chrome   # Playwright — Chrome saja

# Linting
npm run lint              # ESLint
npm run format            # Prettier
```

---

## 11. Build & Deployment

### 11.1 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "lint": "eslint src/",
    "format": "prettier --write src/"
  }
}
```

### 11.2 Build Targets

| Output | Deskripsi | Entry Point |
|--------|-----------|-------------|
| Main App | Aplikasi utama (dashboard + editor + renderer + responses) | `src/main.js` |
| SDK Bundle | Versi ringan untuk embed (renderer only) | `src/sdk/sdk.js` |

### 11.3 Performance Budget

```
GAGAL BUILD jika:
- Bundle main > 150 KB gzipped
- Bundle SDK > 80 KB gzipped
- Lighthouse Performance < 90
- Lighthouse Accessibility < 90
```

---

## 12. Workflow Agent — Urutan Eksekusi

### 12.1 Sebelum Menulis Kode

```
CHECKLIST PRA-KODING:

□ Baca AGENTS.md (dokumen ini)
□ Baca prd.md → pahami user story & acceptance criteria terkait
□ Identifikasi modul mana yang terdampak
□ Pastikan file baru sesuai dengan struktur direktori di §3
□ Pastikan naming sesuai konvensi di §4.2
```

### 12.2 Saat Menulis Kode

```
CHECKLIST SELAMA KODING:

□ Setiap fungsi punya JSDoc comment
□ Core layer TIDAK mengakses DOM
□ UI layer TIDAK berisi business logic
□ CSS class menggunakan prefix dfb-
□ Tidak ada innerHTML dengan data user
□ Tidak ada console.log (gunakan console.error/warn jika perlu)
□ Setiap input punya <label> yang terhubung
□ Setiap field required punya aria-required="true"
□ Error messages punya role="alert"
□ Kode bisa berjalan tanpa network/server
```

### 12.3 Setelah Menulis Kode

```
CHECKLIST PASCA-KODING:

□ Tulis unit test untuk semua logic baru di src/core/
□ Pastikan ESLint & Prettier tidak ada error
□ Test di mobile viewport (375px) dan desktop (1280px)
□ Test keyboard navigation (Tab, Enter, Arrow keys)
□ Tidak ada error baru di browser console
□ Acceptance criteria dari user story terpenuhi
□ Update AGENTS.md jika ada event bus baru atau schema change
```

### 12.4 Prioritas Implementasi

Kerjakan dalam urutan prioritas berikut:

```
FASE 1 — Foundation (P0 Core)
  1. Project setup (Vite, ESLint, Prettier, Vitest)
  2. CSS design system (variables.css, reset.css, typography.css)
  3. Core utilities (uuid.js, eventBus.js, sanitize.js, debounce.js)
  4. Core models (FormDefinition, Question, Section, FormFactory)
  5. Storage layer (StorageAdapter, LocalStorageAdapter)
  6. State management (EditorState, RendererState, ResponseState)

FASE 2 — Editor (P0)
  7. Dashboard (daftar form, buat baru, hapus)
  8. Form Editor shell (header, tab bar, question list)
  9. QuestionCard + 6 tipe pertanyaan P0 (QT-01~06)
  10. Section Header (QT-12) + section navigation
  11. Drag-and-drop reordering
  12. Auto-save + undo/redo

FASE 3 — Renderer & Validation (P0)
  13. Form Renderer shell (judul, deskripsi, progress bar)
  14. 6 tipe pertanyaan renderer fields (QT-01~06)
  15. ValidationEngine (required, length, format, on-blur, on-submit)
  16. Section navigation + Logic Engine (branching)
  17. Submit flow + confirmation page

FASE 4 — Responses & Export (P0)
  18. Response Collector (save ke localStorage)
  19. Response Viewer — Summary (charts)
  20. Response Viewer — Individual (navigasi)
  21. Export CSV (UTF-8 + BOM) & JSON

FASE 5 — Sharing & Theme (P0/P1)
  22. Theme Engine + default theme + color picker + font selector
  23. Preset themes (6 tema)
  24. Share dialog (copy link, embed code)
  25. Preview mode

FASE 6 — Polish & P1 Features
  26. Date (QT-09) & Time (QT-10) pertanyaan
  27. Webhook integration
  28. Prefill via URL params
  29. Session recovery (sessionStorage)
  30. QR Code generation
  31. Grid question types (QT-07, QT-08)
  32. Web Component SDK
  33. E2E tests (Playwright)
```

---

## 13. Aturan Khusus Agent

### 13.1 JANGAN LAKUKAN (Hard Rules)

```
🚫 DILARANG menambah dependency npm ke core bundle tanpa konfirmasi pengguna.
🚫 DILARANG mengubah schema FormDefinition atau ResponseRecord tanpa update prd.md.
🚫 DILARANG membuat backend/server — aplikasi ini client-side only.
🚫 DILARANG menggunakan framework (React, Vue, Svelte, Angular) — ini Vanilla JS.
🚫 DILARANG menggunakan TypeScript — proyek ini JavaScript murni (JSDoc for types).
🚫 DILARANG menggunakan Tailwind CSS — gunakan Vanilla CSS + CSS Custom Properties.
🚫 DILARANG hardcode string warna di JavaScript. Semua via CSS variables.
🚫 DILARANG menulis code yang hanya berjalan di satu browser.
🚫 DILARANG membuat global variables. Gunakan module scope atau class.
🚫 DILARANG memodifikasi file di luar workspace root tanpa konfirmasi.
```

### 13.2 SELALU LAKUKAN (Soft Rules)

```
✅ SELALU baca prd.md untuk acceptance criteria sebelum implementasi fitur.
✅ SELALU tulis JSDoc comment untuk setiap fungsi publik.
✅ SELALU gunakan semantic HTML elements.
✅ SELALU test di minimal 2 viewport (375px mobile, 1280px desktop).
✅ SELALU sanitasi user input sebelum render.
✅ SELALU gunakan EventBus untuk komunikasi antar modul.
✅ SELALU handle error dengan try-catch di boundary.
✅ SELALU preserve existing comments & docstrings saat editing code.
✅ SELALU perbarui AGENTS.md jika menambah event baru atau mengubah schema.
✅ SELALU implementasikan keyboard alternative untuk interaksi mouse.
```

### 13.3 Resolusi Konflik

Jika menemukan konflik antara aturan di `AGENTS.md` dan instruksi pengguna:

1. **Instruksi pengguna langsung** menang atas aturan default di `AGENTS.md`.
2. Namun, jika instruksi pengguna berpotensi melanggar keamanan (XSS, data leak), agent HARUS memperingatkan pengguna terlebih dahulu sebelum eksekusi.
3. Jika ragu, **tanyakan** — lebih baik bertanya daripada mengasumsikan.

---

## 14. Referensi Cepat

### File Kunci

| File | Fungsi |
|------|--------|
| File | Fungsi |
|------|--------|
| `.agents/AGENTS.md` | Aturan eksekusi agent (dokumen ini) |
| `.agents/prd.md` | Spesifikasi produk lengkap |
| `src/core/utils/eventBus.js` | Event bus — jantung komunikasi antar modul |
| `src/core/form/FormDefinition.js` | Model utama — schema sumber kebenaran |
| `src/core/form/FormManager.js` | CRUD operations untuk form |
| `src/core/form/QuestionTypes.js` | Enum tipe pertanyaan + label |
| `src/core/engine/ValidationEngine.js` | Semua logika validasi |
| `src/core/engine/LogicEngine.js` | Conditional logic & branching |
| `src/core/engine/ExportEngine.js` | Export CSV (UTF-8+BOM) & JSON |
| `src/styles/base/variables.css` | Design tokens / CSS custom properties |

### Perintah Penting

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Check linting
```

---

> **Dokumen ini adalah source of truth untuk seluruh AI Agent. Jika dokumen ini tidak menjawab pertanyaan, eskalasi ke pengguna.**
