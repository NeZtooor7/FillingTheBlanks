function normalizeSpaces(text) {
  return text.replace(/\s+/g, ' ').trim();
}

const blankInputs = document.querySelectorAll('.blank-input');
const copyButton = document.getElementById('copy-button');

function updateCopyButtonState() {
  const allInputsHaveText = Array.from(blankInputs).every((input) => {
    return input.value.trim() !== '';
  });

  copyButton.disabled = !allInputsHaveText;
}

blankInputs.forEach((input) => {
  input.addEventListener('input', updateCopyButtonState);
});

updateCopyButtonState();

function buildCompletedSentence(row) {
  const number = row.dataset.number;
  let sentence = '';

  row.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (node.classList.contains('sentence-number')) {
      return;
    }

    if (node.classList.contains('sentence-part')) {
      sentence += node.textContent;
      return;
    }

    if (node.classList.contains('blank-input')) {
      sentence += node.value.trim();
    }
  });

  return `${number}. ${normalizeSpaces(sentence)}`;
}

async function copyCompletedSentences() {
  const rows = document.querySelectorAll('.sentence-row');
  const status = document.getElementById('copy-status');
  const finalText = Array.from(rows).map(buildCompletedSentence).join('\n');

  try {
    await navigator.clipboard.writeText(finalText);
    status.textContent = window.getCurrentTranslation('copiedMessage');
  } catch (error) {
    status.textContent = 'Clipboard copy failed. Select and copy this text manually: ' + finalText;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const copyButton = document.getElementById('copy-button');
  copyButton.addEventListener('click', copyCompletedSentences);
});
