/**
 * LogicEngine — menangani conditional branching / skip logic.
 * HARUS mendeteksi infinite loop.
 */

/**
 * Menentukan index seksi tujuan berdasarkan jawaban responden.
 * @param {Object} answers - { questionId: { value } }
 * @param {import('../form/Question.js').Question[]} questions
 * @param {import('../form/Section.js').Section[]} sections
 * @param {number} currentSectionIndex
 * @returns {number} Index seksi tujuan
 */
export function evaluateBranching(answers, questions, sections, currentSectionIndex) {
  const visited = new Set();
  let idx = currentSectionIndex;

  for (let iter = 0; iter < sections.length * 2; iter++) {
    if (visited.has(idx)) {
      console.warn('[LogicEngine] Infinite loop detected, fallback ke section berikutnya');
      return Math.min(idx + 1, sections.length - 1);
    }
    visited.add(idx);

    const section = sections[idx];
    if (!section) break;

    let nextSection = null;

    for (const qid of section.questionIds) {
      const q = questions.find((qq) => qq.questionId === qid);
      if (!q || q.type !== 'multiple_choice') continue;

      const answer = answers[qid];
      if (!answer) continue;

      const choiceConfig = q.options?.branching?.[answer.value];
      if (choiceConfig) {
        if (choiceConfig === '__submit__') {
          return sections.length;
        }
        if (choiceConfig === '__next__') {
          nextSection = Math.min(idx + 1, sections.length - 1);
          break;
        }
        const targetIdx = sections.findIndex((s) => s.sectionId === choiceConfig);
        if (targetIdx !== -1) {
          nextSection = targetIdx;
          break;
        }
      }
    }

    if (nextSection !== null) {
      idx = nextSection;
    } else {
      idx = Math.min(idx + 1, sections.length - 1);
    }

    break;
  }

  return Math.min(idx, sections.length - 1);
}

/**
 * Memvalidasi konfigurasi branching — deteksi infinite loop.
 * @param {import('../form/Section.js').Section[]} sections
 * @param {import('../form/Question.js').Question[]} questions
 * @returns {boolean} true jika valid
 */
export function validateBranching(sections, questions) {
  const branchingQuestions = questions.filter((q) => q.options?.branching);

  for (const q of branchingQuestions) {
    const branchConfig = q.options.branching;
    for (const [, target] of Object.entries(branchConfig)) {
      if (target === '__submit__' || target === '__next__') continue;
      if (!sections.some((s) => s.sectionId === target)) {
        return false;
      }
    }
  }
  return true;
}
