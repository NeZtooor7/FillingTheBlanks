document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('learning-language-toggle');
  const menu = document.getElementById('learning-language-menu');
  const options = document.querySelectorAll('.learning-language-option');
  const selectedFlag = document.getElementById('selected-learning-language-flag');
  const selectedLabel = document.getElementById('selected-learning-language-label');
  const learningLanguageInput = document.getElementById('learning-language-input');
  const spokenLanguageInput = document.getElementById('spoken-language-input');

  function updateSpokenLanguageInput() {
    if (!spokenLanguageInput) {
      return;
    }

    spokenLanguageInput.value = localStorage.getItem('language') || 'en';
  }

  function closeLearningLanguageMenu() {
    if (!menu || !toggle) {
      return;
    }

    menu.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function applyLearningLanguage(option) {
    if (!option || !selectedFlag || !selectedLabel || !learningLanguageInput) {
      return;
    }

    const language = option.dataset.lang;

    learningLanguageInput.value = language;
    selectedFlag.src = option.dataset.flag;
    selectedFlag.alt = option.dataset.label;
    selectedLabel.textContent = option.dataset.label;

    localStorage.setItem('learningLanguage', language);
  }

  if (toggle && menu) {
    toggle.addEventListener('click', (event) => {
      event.stopPropagation();

      const isHidden = menu.classList.contains('hidden');

      menu.classList.toggle('hidden', !isHidden);
      toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  options.forEach((option) => {
    option.addEventListener('click', (event) => {
      event.stopPropagation();

      applyLearningLanguage(option);
      closeLearningLanguageMenu();
    });
  });

  document.addEventListener('click', () => {
    closeLearningLanguageMenu();
  });

  document.addEventListener('languageChanged', () => {
    updateSpokenLanguageInput();
  });

  const savedLearningLanguage = localStorage.getItem('learningLanguage') || 'de';
  const savedOption = document.querySelector(`.learning-language-option[data-lang="${savedLearningLanguage}"]`);

  applyLearningLanguage(savedOption);
  updateSpokenLanguageInput();
});