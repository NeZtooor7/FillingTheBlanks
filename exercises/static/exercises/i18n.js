document.addEventListener('DOMContentLoaded', () => {
  const languageToggle = document.getElementById('language-toggle');
  const languageMenu = document.getElementById('language-menu');
  const selectedLanguageFlag = document.getElementById('selected-language-flag');
  const selectedLanguageLabel = document.getElementById('selected-language-label');
  const languageOptions = document.querySelectorAll('.language-option');

  const translations = {
    es: {
      homeTitle: 'Ejercicios para completar espacios',
      homeIntro: 'Pega oraciones con guiones bajos. Cada guion bajo se convertirá en un campo de texto.',
      textareaLabel: 'Tus oraciones',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Crear ejercicio',
      exerciseTitle: 'Completa las oraciones',
      exerciseIntro: 'Rellena las palabras faltantes y luego copia el texto completo.',
      copyButton: 'Copiar al portapapeles',
      copiedMessage: 'Copiado al portapapeles.',
      backLink: 'Crear otro ejercicio',
      textareaHelp: 'Escribe una oración por línea. Cada línea debe comenzar con "- " y contener al menos un guion bajo "_".',
      exampleLabel: 'Ejemplo:',
    },
    en: {
      homeTitle: 'Fill-in-the-Blanks Exercises',
      homeIntro: 'Paste sentences with underscores. Each underscore becomes an input.',
      textareaLabel: 'Your sentences',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Create exercise',
      exerciseTitle: 'Complete the sentences',
      exerciseIntro: 'Fill in the missing words, then copy the completed text.',
      copyButton: 'Copy to clipboard',
      copiedMessage: 'Copied to clipboard.',
      backLink: 'Create another exercise',
      textareaHelp: 'Write one sentence per line. Each line should start with "- " and contain at least one underscore "_".',
      exampleLabel: 'Example:',
    },
    de: {
      homeTitle: 'Lückentext-Übungen',
      homeIntro: 'Füge Sätze mit Unterstrichen ein. Jeder Unterstrich wird zu einem Eingabefeld.',
      textareaLabel: 'Deine Sätze',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Übung erstellen',
      exerciseTitle: 'Vervollständige die Sätze',
      exerciseIntro: 'Fülle die fehlenden Wörter aus und kopiere dann den vollständigen Text.',
      copyButton: 'In die Zwischenablage kopieren',
      copiedMessage: 'In die Zwischenablage kopiert.',
      backLink: 'Eine neue Übung erstellen',
      textareaHelp: 'Schreibe einen Satz pro Zeile. Jede Zeile sollte mit "- " beginnen und mindestens einen Unterstrich "_" enthalten.',
      exampleLabel: 'Beispiel:',
    },
    ja: {
      homeTitle: '穴埋め練習',
      homeIntro: 'アンダースコア付きの文を貼り付けてください。各アンダースコアは入力欄になります。',
      textareaLabel: 'あなたの文',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: '練習を作成',
      exerciseTitle: '文を完成させましょう',
      exerciseIntro: '足りない単語を入力して、完成した文をコピーしてください。',
      copyButton: 'クリップボードにコピー',
      copiedMessage: 'クリップボードにコピーしました。',
      backLink: '別の練習を作成',
      textareaHelp: '1行に1文を書いてください。各行は「- 」で始まり、少なくとも1つのアンダースコア「_」を含めてください。',
      exampleLabel: '例:',
    },
    hi: {
      homeTitle: 'रिक्त स्थान भरने के अभ्यास',
      homeIntro: 'अंडरस्कोर वाली पंक्तियाँ चिपकाएँ। हर अंडरस्कोर एक इनपुट फ़ील्ड बनेगा।',
      textareaLabel: 'आपके वाक्य',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'अभ्यास बनाएँ',
      exerciseTitle: 'वाक्य पूरे करें',
      exerciseIntro: 'छूटे हुए शब्द भरें और फिर पूरा टेक्स्ट कॉपी करें।',
      copyButton: 'क्लिपबोर्ड में कॉपी करें',
      copiedMessage: 'क्लिपबोर्ड में कॉपी हो गया।',
      backLink: 'दूसरा अभ्यास बनाएँ',
      textareaHelp: 'हर पंक्ति में एक वाक्य लिखें। हर पंक्ति "- " से शुरू होनी चाहिए और उसमें कम से कम एक अंडरस्कोर "_" होना चाहिए।',
      exampleLabel: 'उदाहरण:',
    },
    ro: {
      homeTitle: 'Exerciții de completare',
      homeIntro: 'Lipește propoziții cu underscore. Fiecare underscore va deveni un câmp de text.',
      textareaLabel: 'Propozițiile tale',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Creează exercițiul',
      exerciseTitle: 'Completează propozițiile',
      exerciseIntro: 'Completează cuvintele lipsă, apoi copiază textul complet.',
      copyButton: 'Copiază în clipboard',
      copiedMessage: 'Copiat în clipboard.',
      backLink: 'Creează alt exercițiu',
      textareaHelp: 'Scrie o propoziție pe fiecare linie. Fiecare linie trebuie să înceapă cu "- " și să conțină cel puțin un underscore "_".',
      exampleLabel: 'Exemplu:',
    },
    it: {
      homeTitle: 'Esercizi di completamento',
      homeIntro: 'Incolla frasi con underscore. Ogni underscore diventerà un campo di testo.',
      textareaLabel: 'Le tue frasi',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Crea esercizio',
      exerciseTitle: 'Completa le frasi',
      exerciseIntro: 'Inserisci le parole mancanti e poi copia il testo completo.',
      copyButton: 'Copia negli appunti',
      copiedMessage: 'Copiato negli appunti.',
      backLink: 'Crea un altro esercizio',
      textareaHelp: 'Scrivi una frase per riga. Ogni riga deve iniziare con "- " e contenere almeno un underscore "_".',
      exampleLabel: 'Esempio:'
    },
    pt: {
      homeTitle: 'Exercícios de completar lacunas',
      homeIntro: 'Cole frases com underscores. Cada underscore se tornará um campo de texto.',
      textareaLabel: 'Suas frases',
      textareaPlaceholder: '- Ich _ müde.\n- Du _ glücklich.',
      createButton: 'Criar exercício',
      exerciseTitle: 'Complete as frases',
      exerciseIntro: 'Preencha as palavras faltantes e depois copie o texto completo.',
      copyButton: 'Copiar para a área de transferência',
      copiedMessage: 'Copiado para a área de transferência.',
      backLink: 'Criar outro exercício',
      textareaHelp: 'Escreva uma frase por linha. Cada linha deve começar com "- " e conter pelo menos um underscore "_".',
      exampleLabel: 'Exemplo:',
    }
  };

  function applyLanguage(language) {
    const dictionary = translations[language] || translations.en;

    document.documentElement.lang = language;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (dictionary[key]) {
        element.textContent = dictionary[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
      const key = element.getAttribute('data-i18n-placeholder');
      if (dictionary[key]) {
        element.placeholder = dictionary[key];
      }
    });

    const textarea = document.querySelector('.sentence-textarea');

    if (textarea && dictionary.textareaPlaceholder) {
      textarea.placeholder = dictionary.textareaPlaceholder;
    }

    localStorage.setItem('language', language);
    updateSelectedLanguageUI(language);
  }

  const savedLanguage = localStorage.getItem('language') || 'en';
  applyLanguage(savedLanguage);

  languageToggle.addEventListener('click', () => {
    const isHidden = languageMenu.classList.contains('hidden');

    languageMenu.classList.toggle('hidden', !isHidden);
    languageToggle.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
  });

  languageOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const language = option.dataset.lang;
      applyLanguage(language);
      languageMenu.classList.add('hidden');
      languageToggle.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.language-dropdown')) {
      languageMenu.classList.add('hidden');
      languageToggle.setAttribute('aria-expanded', 'false');
    }
  });

  window.getCurrentTranslation = function (key) {
    const currentLanguage = localStorage.getItem('language') || 'en';
    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  };

  function updateSelectedLanguageUI(language) {
    const selectedOption = document.querySelector(`.language-option[data-lang="${language}"]`);

    if (selectedOption) {
      selectedLanguageFlag.src = selectedOption.dataset.flag;
      selectedLanguageFlag.alt = selectedOption.dataset.label;
      selectedLanguageLabel.textContent = selectedOption.dataset.label;
    }
  }
});