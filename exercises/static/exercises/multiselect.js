document.addEventListener('DOMContentLoaded', () => {
  const multiselect = document.getElementById('focus-multiselect');
  const toggle = document.getElementById('focus-toggle');
  const menu = document.getElementById('focus-menu');
  const selectedOptions = document.getElementById('focus-selected-options');
  const placeholder = document.getElementById('focus-placeholder');

  if (!multiselect || !toggle || !menu || !selectedOptions || !placeholder) {
    return;
  }

  const checkboxes = menu.querySelectorAll('input[type="checkbox"]');

  function getTranslation(key) {
    if (window.getCurrentTranslation) {
      return window.getCurrentTranslation(key);
    }

    return key;
  }

  function renderSelectedOptions() {
    selectedOptions.innerHTML = '';

    const checkedBoxes = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

    placeholder.style.display = checkedBoxes.length === 0 ? 'inline' : 'none';

    checkedBoxes.forEach((checkbox) => {
      const labelKey = checkbox.dataset.labelKey;
      const label = getTranslation(labelKey);

      const pill = document.createElement('span');
      pill.className = 'selected-pill';
      pill.textContent = label;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = '×';
      removeButton.setAttribute('aria-label', `Remove ${label}`);

      removeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        checkbox.checked = false;
        renderSelectedOptions();
      });

      pill.appendChild(removeButton);
      selectedOptions.appendChild(pill);
    });
  }

  toggle.addEventListener('click', () => {
    const isHidden = menu.classList.contains('hidden');

    menu.classList.toggle('hidden', !isHidden);
    toggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', renderSelectedOptions);
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('#focus-multiselect')) {
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('languageChanged', renderSelectedOptions);

  renderSelectedOptions();
});