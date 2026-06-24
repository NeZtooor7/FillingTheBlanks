document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('page-loading-overlay');
  const loadingMessage = document.getElementById('loading-message');

  if (!overlay || !loadingMessage) {
    return;
  }

  function getTranslation(key, fallback) {
    if (window.getCurrentTranslation) {
      return window.getCurrentTranslation(key) || fallback;
    }

    return fallback;
  }

  function showLoading(message) {
    loadingMessage.textContent = message;
    overlay.classList.remove('hidden');
    document.body.classList.add('is-loading');
  }

  function disableSubmitButtons(form) {
    const submitButtons = form.querySelectorAll('button[type="submit"]');

    submitButtons.forEach((button) => {
      button.disabled = true;
      button.dataset.originalText = button.textContent.trim();
      button.textContent = getTranslation('loadingButtonText', 'Loading...');
    });
  }

  function attachLoadingToForm(formId, messageKey, fallbackMessage) {
    const form = document.getElementById(formId);

    if (!form) {
      return;
    }

    form.addEventListener('submit', () => {
      const message = getTranslation(messageKey, fallbackMessage);

      disableSubmitButtons(form);
      showLoading(message);
    });
  }

  attachLoadingToForm(
    'ai-exercise-form',
    'generatingExerciseMessage',
    'Generating exercise...'
  );

  attachLoadingToForm(
    'exercise-form',
    'checkingAnswersMessage',
    'Checking answers...'
  );
});