import { FormManager } from '../../core/form/FormManager.js';
import { RendererState } from '../../core/state/RendererState.js';
import {
  validateField,
  validateChoices,
  validateGrid,
} from '../../core/engine/ValidationEngine.js';
import { evaluateBranching } from '../../core/engine/LogicEngine.js';
import { LocalStorageAdapter } from '../../core/storage/LocalStorageAdapter.js';
import { WebhookAdapter } from '../../core/storage/WebhookAdapter.js';
import { ProgressBar } from './ProgressBar.js';
import { SectionView } from './SectionView.js';
import { ConfirmationPage } from './ConfirmationPage.js';
import { QUESTION_TYPES } from '../../core/form/QuestionTypes.js';
import { applyTheme } from '../../core/engine/ThemeEngine.js';

const renderState = new RendererState();

export function render(container, options = {}) {
  container.innerHTML = '';
  container.className = 'gf-page';

  const params = new URLSearchParams(window.location.search);
  const formId = options.formId || params.get('formId');
  const isPreview = options.isPreview != null ? options.isPreview : params.has('preview');

  if (!formId) {
    showClosed(container, 'Form ID tidak ditemukan');
    return;
  }

  const form = FormManager.load(formId);
  if (!form) {
    showClosed(container, 'Form tidak ditemukan');
    return;
  }

  applyTheme(form.theme);

  if (!isPreview) {
    if (!form.metadata.isAcceptingResponses) {
      showClosed(
        container,
        form.metadata.confirmationMessageClosed || 'Formulir ini sudah tidak menerima jawaban',
      );
      return;
    }

    if (form.metadata.limitOneResponse) {
      const existing = (new LocalStorageAdapter().get('responses') || []).filter(
        (r) => r.formId === formId,
      );
      if (existing.length > 0) {
        showClosed(
          container,
          'Anda sudah mengirimkan jawaban. Formulir ini hanya menerima satu jawaban per orang.',
        );
        return;
      }
    }

    if (form.metadata.maxResponses != null) {
      const existingCount = (new LocalStorageAdapter().get('responses') || []).filter(
        (r) => r.formId === formId,
      ).length;
      if (existingCount >= form.metadata.maxResponses) {
        showClosed(
          container,
          'Formulir ini sudah tidak menerima jawaban karena telah mencapai batas maksimal respons.',
        );
        return;
      }
    }

    if (form.metadata.closingDate) {
      const closingTime = new Date(form.metadata.closingDate).getTime();
      if (!isNaN(closingTime) && Date.now() > closingTime) {
        showClosed(
          container,
          'Formulir ini sudah tidak menerima jawaban karena batas waktu pengisian telah berakhir.',
        );
        return;
      }
    }
  }

  const sections = getFormSections(form);

  trySessionRestore(formId, form, renderState);
  applyPrefill(form, renderState, params);

  if (isPreview) {
    const banner = document.createElement('div');
    banner.className = 'gf-page-preview';
    banner.textContent = '\u26A1 MODE PRATINJAU \u2014 Jawaban tidak akan disimpan';
    container.appendChild(banner);
  }

  const main = document.createElement('div');
  main.className = 'gf-container';
  container.appendChild(main);

  function navigateToSection(targetIdx, direction = 'next') {
    const outClass = direction === 'next' ? 'gf-slide-left-out' : 'gf-slide-right-out';
    const inClass = direction === 'next' ? 'gf-slide-left-in' : 'gf-slide-right-in';

    main.classList.add(outClass);

    setTimeout(() => {
      if (direction === 'next') {
        renderState.setSection(targetIdx, false);
      } else {
        renderState.setSection(targetIdx, true);
      }

      renderCurrentSection();

      main.className = `gf-container ${inClass}`;
      // force reflow
      main.offsetHeight;

      main.classList.remove(inClass);
      main.classList.add('gf-container');
    }, 250);
  }

  function renderCurrentSection() {
    const idx = renderState.currentSectionIndex;
    const section = sections[idx];
    let questions = section.questionIds
      .map((qid) => form.questions.find((q) => q.questionId === qid))
      .filter(Boolean);

    // Dynamic Email Collection
    if (idx === 0 && form.metadata.collectEmail) {
      const emailQuestion = {
        questionId: 'email_field',
        type: 'short_answer',
        title: 'Alamat email',
        required: true,
        description: '',
        validation: { required: true, pattern: 'email' },
      };
      questions = [emailQuestion, ...questions];
    }

    main.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'gf-header-card';

    // Header Image
    if (form.metadata.headerImageUrl) {
      header.classList.add('gf-header-card--has-image');
      const imgContainer = document.createElement('div');
      imgContainer.className = 'gf-header-image-container';

      const img = document.createElement('img');
      img.src = form.metadata.headerImageUrl;
      img.className = 'gf-header-image';
      img.alt = 'Form Header';
      img.onerror = () => {
        imgContainer.style.display = 'none';
        header.classList.remove('gf-header-card--has-image');
      };
      imgContainer.appendChild(img);
      header.appendChild(imgContainer);
    }

    if (form.metadata.showProgressBar !== false) {
      header.appendChild(ProgressBar.create(idx, sections.length));
    }

    const body = document.createElement('div');
    body.className = 'gf-header-body';

    const h1 = document.createElement('h1');
    h1.className = 'gf-form-title';
    h1.textContent = form.metadata.title;
    body.appendChild(h1);

    if (form.metadata.description) {
      const desc = document.createElement('div');
      desc.className = 'gf-form-desc';
      desc.textContent = form.metadata.description;
      body.appendChild(desc);
    }

    const note = document.createElement('div');
    note.className = 'gf-required-note';
    const star = document.createElement('span');
    star.className = 'gf-star';
    star.textContent = '*';
    note.appendChild(star);
    note.appendChild(document.createTextNode(' Menunjukkan pertanyaan wajib diisi'));
    body.appendChild(note);

    header.appendChild(body);
    main.appendChild(header);

    const sectionEl = SectionView.create(
      section,
      questions,
      renderState.answers,
      renderState.errors,
    );
    main.appendChild(sectionEl);

    const navRow = document.createElement('div');
    navRow.className = 'gf-nav-row';

    const navActions = document.createElement('div');
    navActions.className = 'gf-nav-actions';

    if (idx > 0) {
      const backBtn = document.createElement('button');
      backBtn.textContent = 'Sebelumnya';
      backBtn.className = 'gf-btn-back';
      backBtn.addEventListener('click', () => {
        saveCurrentAnswers();
        navigateToSection(0, 'back');
        scrollToTop();
      });
      navActions.appendChild(backBtn);
    }

    if (idx === sections.length - 1) {
      const submitBtn = document.createElement('button');
      submitBtn.textContent = 'Kirim';
      submitBtn.className = 'gf-btn-submit';
      submitBtn.addEventListener('click', () => handleSubmit());
      navActions.appendChild(submitBtn);
    } else {
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Berikutnya';
      nextBtn.className = 'gf-btn-next';
      nextBtn.addEventListener('click', () => {
        saveCurrentAnswers();
        const errors = SectionView.validate(main, questions);
        if (Object.keys(errors).length > 0) {
          renderState.errors = { ...renderState.errors, ...errors };
          renderCurrentSection();
          scrollToFirstError(Object.keys(errors));
          return;
        }
        renderState.errors = {};
        const nextIdx = evaluateBranching(renderState.answers, form.questions, sections, idx);
        const targetIdx = nextIdx < sections.length ? nextIdx : idx + 1;
        navigateToSection(Math.min(targetIdx, sections.length - 1), 'next');
        scrollToTop();
      });
      navActions.appendChild(nextBtn);
    }

    navRow.appendChild(navActions);
    main.appendChild(navRow);

    const warning = document.createElement('div');
    warning.className = 'gf-warning-card';
    const warnText = document.createElement('span');
    warnText.className = 'gf-warning-text';
    warnText.textContent = 'Jangan pernah mengirimkan sandi melalui Google Formulir.';
    warning.appendChild(warnText);
    main.appendChild(warning);

    if (idx === 0 && form.questions.length > 0) {
      const heading = sectionEl.firstElementChild;
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  }

  function saveCurrentAnswers() {
    const idx = renderState.currentSectionIndex;
    const section = sections[idx];
    let questions = section.questionIds
      .map((qid) => form.questions.find((q) => q.questionId === qid))
      .filter(Boolean);

    if (idx === 0 && form.metadata.collectEmail) {
      const emailQuestion = {
        questionId: 'email_field',
        type: 'short_answer',
        title: 'Alamat email',
        required: true,
        description: '',
        validation: { required: true, pattern: 'email' },
      };
      questions = [emailQuestion, ...questions];
    }

    const answers = SectionView.collectAnswers(main, questions);
    Object.entries(answers).forEach(([qid, ans]) => {
      renderState.setAnswer(qid, ans.questionType, ans.value);
    });
    if (!isPreview) {
      saveSession(formId, renderState.answers);
    }
  }

  function handleSubmit() {
    saveCurrentAnswers();

    const allQuestions = form.questions.filter((q) => q.type !== 'section_header');
    if (form.metadata.collectEmail) {
      allQuestions.unshift({
        questionId: 'email_field',
        type: 'short_answer',
        title: 'Alamat email',
        required: true,
        description: '',
        validation: { required: true, pattern: 'email' },
      });
    }

    const allErrors = {};

    allQuestions.forEach((q) => {
      const ans = renderState.answers[q.questionId];
      const value = ans ? ans.value : '';
      const validationConfig = Object.assign({ required: q.required }, q.validation);
      const result = validateField(value, validationConfig);
      if (!result.isValid) {
        allErrors[q.questionId] = result.error;
      }
      if (Array.isArray(value) && q.validation?.minSelect != null) {
        const choiceResult = validateChoices(value, validationConfig);
        if (!choiceResult.isValid) {
          allErrors[q.questionId] = choiceResult.error;
        }
      }
      if (
        q.type === QUESTION_TYPES.MULTIPLE_CHOICE_GRID ||
        q.type === QUESTION_TYPES.CHECKBOX_GRID
      ) {
        const gridResult = validateGrid(value, validationConfig, q.options?.rows || [], q.type);
        if (!gridResult.isValid) {
          allErrors[q.questionId] = gridResult.error;
        }
      }
    });

    if (Object.keys(allErrors).length > 0) {
      renderState.errors = allErrors;
      renderCurrentSection();
      scrollToFirstError(Object.keys(allErrors));
      return;
    }

    clearSession(formId);

    if (!isPreview) {
      const response = {
        formId: form.formId,
        responseId:
          'resp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
        submittedAt: new Date().toISOString(),
        startedAt: new Date(Date.now() - 60000).toISOString(),
        durationSeconds: 60,
        respondentId: generateRespondentId(),
        answers: Object.entries(renderState.answers).map(([qid, ans]) => ({
          questionId: qid,
          questionType: ans.questionType,
          value: ans.value,
        })),
      };

      try {
        const storage = new LocalStorageAdapter();
        const existing = storage.get('responses') || [];
        existing.push(response);
        storage.set('responses', existing);
      } catch (e) {
        console.error('[FormRenderer] Gagal menyimpan respons:', e);
      }

      if (form.metadata.webhookUrl) {
        sendToWebhook(response, form);
      }
    }

    renderState.finishSubmit();
    showConfirmation();
  }

  function showConfirmation() {
    main.innerHTML = '';
    const msg = form.metadata.confirmationMessage || 'Jawaban Anda telah tercatat.';
    main.appendChild(ConfirmationPage.create(msg));

    if (!isPreview) {
      const anotherWrap = document.createElement('div');
      anotherWrap.style.cssText = 'text-align:center;margin-top:8px;display:flex;flex-direction:column;gap:8px;align-items:center;';
      
      const another = document.createElement('a');
      another.href = '#';
      another.className = 'gf-another-link';
      another.textContent = 'Kirim jawaban lain';
      another.addEventListener('click', (e) => {
        e.preventDefault();
        renderState.reset();
        render(container, { formId, isPreview });
      });
      anotherWrap.appendChild(another);

      if (form.metadata.showSummaryToRespondents) {
        const summaryLink = document.createElement('a');
        summaryLink.href = `responses.html?formId=${formId}&readOnly=true`;
        summaryLink.target = '_blank';
        summaryLink.className = 'gf-another-link';
        summaryLink.textContent = 'Lihat ringkasan jawaban';
        anotherWrap.appendChild(summaryLink);
      }

      main.appendChild(anotherWrap);
    }
  }

  function scrollToFirstError(errorIds) {
    const firstId = errorIds[0];
    const el = main.querySelector(`#q-card-${firstId}`);
    if (el) {
      el.style.transition = 'background 1500ms ease';
      el.style.background = 'rgba(217,48,37,0.08)';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        el.style.background = '';
      }, 1500);
      const firstInput = el.querySelector('input, textarea, select');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderCurrentSection();
}

function showClosed(container, msg) {
  container.innerHTML = '';
  container.className = 'gf-page';
  const wrapper = document.createElement('div');
  wrapper.className = 'gf-container';
  const card = document.createElement('div');
  card.className = 'gf-closed-card';
  const p = document.createElement('p');
  p.textContent = msg;
  card.appendChild(p);
  wrapper.appendChild(card);
  container.appendChild(wrapper);
}

function getFormSections(form) {
  const hasSectionHeader = form.questions.some((q) => q.type === 'section_header');
  if (!hasSectionHeader && form.sections && form.sections.length > 0) {
    return form.sections;
  }

  const sections = [];
  let currentSection = {
    sectionId: 'default',
    title: '',
    description: '',
    questionIds: [],
  };

  form.questions.forEach((q) => {
    if (q.type === 'section_header') {
      if (currentSection.questionIds.length > 0 || sections.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        sectionId: q.questionId,
        title: q.title || 'Tanpa Judul',
        description: q.description || '',
        questionIds: [],
      };
    } else {
      currentSection.questionIds.push(q.questionId);
    }
  });

  sections.push(currentSection);
  return sections;
}

function generateRespondentId() {
  const ua = navigator.userAgent || '';
  const ts = Date.now();
  let hash = 0;
  const s = ua + ts;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return 'anon-' + Math.abs(hash).toString(36);
}

async function sendToWebhook(response, form) {
  if (!form || !form.metadata.webhookUrl) return;
  const webhook = new WebhookAdapter(form.metadata.webhookUrl, form.metadata.webhookSecret || '');
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await webhook.set('response', response);
      return;
    } catch (e) {
      lastError = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  console.warn(
    '[FormRenderer] Webhook gagal setelah 3 percobaan, respons tetap tersimpan di lokal:',
    lastError,
  );
}

function applyPrefill(form, state, params) {
  form.questions.forEach((q) => {
    const val = params.get(`q_${q.questionId}`);
    if (val != null) {
      state.setAnswer(q.questionId, q.type, val);
    }
  });
}

function trySessionRestore(formId, form, state) {
  const sessionKey = `dfb_session_${formId}`;
  try {
    const saved = sessionStorage.getItem(sessionKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      const hasAnswers = Object.keys(parsed.answers || {}).length > 0;
      if (hasAnswers && !state.isSubmitted) {
        if (confirm('Lanjutkan pengisian sebelumnya?')) {
          Object.entries(parsed.answers).forEach(([qid, ans]) => {
            state.setAnswer(qid, ans.questionType, ans.value);
          });
        } else {
          sessionStorage.removeItem(sessionKey);
        }
      }
    }
  } catch (e) {
    console.warn('[FormRenderer] Gagal restore session:', e);
  }
}

function saveSession(formId, answers) {
  const sessionKey = `dfb_session_${formId}`;
  try {
    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({ answers, savedAt: new Date().toISOString() }),
    );
  } catch (e) {
    console.warn('[FormRenderer] Gagal save session:', e);
  }
}

function clearSession(formId) {
  sessionStorage.removeItem(`dfb_session_${formId}`);
}
