(() => {
  'use strict';

  const form = document.querySelector('#command-form');
  const input = document.querySelector('#command-input');
  const output = document.querySelector('#terminal-output');
  const feedback = document.querySelector('#command-feedback');
  const path = document.querySelector('#current-path');
  const navLinks = [...document.querySelectorAll('.section-nav a')];
  const sections = ['about', 'projects', 'contact'];
  const projects = ['acic_v2', 'ludwig_v2', 'pyzork1', 'pyzork2', 'pyzork3'];
  const profile = 'https://github.com/Pedroxhrq';
  const linkedin = 'https://www.linkedin.com/in/pedroxhenrique/';
  const englishCommands = [
    'help', 'whoami', 'about', 'projects', 'ls', 'contact', 'github',
    'linkedin', 'clear', 'theme', 'pwd', 'date', 'cat about.md',
    'cd about', 'cd projects', 'cd contact', 'cd ~',
  ];
  const portugueseCommands = [
    'ajuda', 'whoami', 'sobre', 'projetos', 'ls', 'contato', 'github',
    'linkedin', 'limpar', 'tema', 'pwd', 'data', 'cat sobre.md',
    'cd sobre', 'cd projetos', 'cd contato', 'cd ~',
  ];
  const aliases = new Map([
    ['ajuda', 'help'], ['sobre', 'about'], ['projetos', 'projects'],
    ['contato', 'contact'], ['limpar', 'clear'], ['tema', 'theme'],
    ['data', 'date'], ['cat sobre.md', 'cat about.md'],
    ['cd sobre', 'cd about'], ['cd projetos', 'cd projects'], ['cd contato', 'cd contact'],
  ]);
  const messages = {
    en: {
      cleared: 'Terminal output cleared.',
      helpHeading: 'A few things you can try:',
      helpAbout: 'a little about Pedro',
      helpProjects: 'explore the pinned repositories',
      helpContact: 'find me online',
      helpTheme: 'the colors behind this terminal',
      helpClear: 'clear this terminal',
      helpMore: 'Also: ls, github, linkedin, pwd, date, cat about.md, cd about, cd projects, cd contact, cd ~. Use ↑/↓ for history and Tab to complete.',
      about: 'Pedro Henrique — software developer in Brazil. Passionately curious.',
      aboutLink: 'Read about Pedro ↗',
      pinned: 'Pinned on GitHub:',
      contact: 'Find me here:',
      theme: 'Catppuccin Frappé — a little pastel in the terminal.',
      colors: 'Base #303446 · Text #c6d0f5 · Green #a6d189 · Mauve #ca9ee6 · Blue #8caaee · Peach #ef9f76',
      themeLink: 'Explore Catppuccin ↗',
      opening: 'Opening {section}…',
      sectionAbout: 'about',
      sectionProjects: 'projects',
      sectionContact: 'contact',
      unknown: 'Command not found: {command}',
      suggestionBefore: 'Try ',
      suggestionAfter: ' to see the available commands.',
      helpCommand: 'help',
      completed: 'Completed: {command}',
      matches: 'Matches: {commands}',
    },
    'pt-BR': {
      cleared: 'Saída do terminal limpa.',
      helpHeading: 'Alguns comandos para experimentar:',
      helpAbout: 'um pouco sobre o Pedro',
      helpProjects: 'explore os repositórios fixados',
      helpContact: 'onde me encontrar',
      helpTheme: 'as cores deste terminal',
      helpClear: 'limpar este terminal',
      helpMore: 'Também: ls, github, linkedin, pwd, data, cat sobre.md, cd sobre, cd projetos, cd contato, cd ~. Use ↑/↓ para navegar pelo histórico e Tab para completar. Os comandos em inglês também funcionam.',
      about: 'Pedro Henrique — desenvolvedor de software no Brasil. Movido pela curiosidade.',
      aboutLink: 'Saiba mais sobre o Pedro ↗',
      pinned: 'Repositórios fixados no GitHub:',
      contact: 'Você me encontra aqui:',
      theme: 'Catppuccin Frappé — um toque pastel no terminal.',
      colors: 'Base #303446 · Texto #c6d0f5 · Verde #a6d189 · Malva #ca9ee6 · Azul #8caaee · Pêssego #ef9f76',
      themeLink: 'Conheça o Catppuccin ↗',
      opening: 'Abrindo {section}…',
      sectionAbout: 'sobre',
      sectionProjects: 'projetos',
      sectionContact: 'contato',
      unknown: 'Comando não encontrado: {command}',
      suggestionBefore: 'Digite ',
      suggestionAfter: ' para ver os comandos disponíveis.',
      helpCommand: 'ajuda',
      completed: 'Completado: {command}',
      matches: 'Opções: {commands}',
    },
  };
  const commandHistory = [];
  const entries = [];
  let historyIndex = 0;
  let draft = '';
  let currentSection = 'about';
  let feedbackMessage;

  if (!form || !input || !output) return;

  const locale = () => window.portfolioI18n?.getLocale() === 'pt-BR' ? 'pt-BR' : 'en';
  const t = (key, values = {}) => messages[locale()][key].replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');

  document.querySelectorAll('.js-only').forEach((node) => {
    node.hidden = false;
  });

  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const link = (label, href) => {
    const anchor = element('a', '', label);
    anchor.href = href;
    return anchor;
  };

  const announce = (key, values = {}) => {
    feedbackMessage = key ? { key, values } : undefined;
    if (feedback) feedback.textContent = key ? t(key, values) : '';
  };

  const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto' : 'smooth';

  const focusInput = () => {
    input.focus({ preventScroll: true });
    input.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
  };

  const updateSection = (id) => {
    if (!sections.includes(id)) return;
    currentSection = id;
    if (path) path.textContent = id === 'about' ? '~' : `~/${id}`;
    navLinks.forEach((anchor) => {
      const active = anchor.getAttribute('href') === `#${id}`;
      anchor.classList.toggle('is-active', active);
      if (active) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    });
  };

  const navigate = (id) => {
    const section = document.getElementById(id);
    if (!section) return;
    updateSection(id);
    const heading = section.querySelector('h1, h2, h3') || section;
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
  };

  const clearOutput = () => {
    entries.length = 0;
    output.replaceChildren();
    announce('cleared');
  };

  const addLinks = (result, items) => {
    const list = element('ul', 'terminal-links');
    items.forEach(([label, href]) => {
      const item = element('li');
      item.append(link(label, href));
      list.append(item);
    });
    result.append(list);
  };

  // Render saved results without running their commands again when the language changes.
  const renderResult = (record) => {
    const { command, result } = record;
    result.replaceChildren();
    result.classList.remove('terminal-error');

    switch (command) {
      case 'help': {
        result.append(element('p', '', t('helpHeading')));
        const list = element('ul', 'terminal-links');
        [
          ['whoami', 'sobre', 'helpAbout'],
          ['projects', 'projetos', 'helpProjects'],
          ['contact', 'contato', 'helpContact'],
          ['theme', 'tema', 'helpTheme'],
          ['clear', 'limpar', 'helpClear'],
        ].forEach(([english, portuguese, descriptionKey]) => {
          const name = locale() === 'pt-BR' ? portuguese : english;
          const item = element('li');
          const button = element('button', 'terminal-command', name);
          button.type = 'button';
          button.dataset.command = name;
          item.append(button, document.createTextNode(` — ${t(descriptionKey)}`));
          list.append(item);
        });
        result.append(list, element('p', '', t('helpMore')));
        break;
      }
      case 'whoami':
      case 'about':
      case 'cat about.md':
        result.append(element('p', '', t('about')));
        addLinks(result, [[t('aboutLink'), '#about']]);
        break;
      case 'projects':
      case 'ls':
        result.append(element('p', '', t('pinned')));
        addLinks(result, projects.map((name) => [name, `${profile}/${name}`]));
        break;
      case 'contact':
        result.append(element('p', '', t('contact')));
        addLinks(result, [['GitHub · @Pedroxhrq ↗', profile], ['LinkedIn · Pedro Henrique ↗', linkedin]]);
        break;
      case 'github':
        addLinks(result, [['GitHub · @Pedroxhrq ↗', profile]]);
        break;
      case 'linkedin':
        addLinks(result, [['LinkedIn · Pedro Henrique ↗', linkedin]]);
        break;
      case 'theme':
        result.append(element('p', '', t('theme')), element('p', '', t('colors')));
        addLinks(result, [[t('themeLink'), 'https://github.com/catppuccin/catppuccin']]);
        break;
      case 'pwd':
        result.append(element('p', '', `/home/pedro${record.section === 'about' ? '' : `/${record.section}`}`));
        break;
      case 'date':
        result.append(element('p', '', new Intl.DateTimeFormat(locale(), {
          dateStyle: 'full', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
        }).format(record.timestamp) + ' · São Paulo'));
        break;
      case 'cd about':
      case 'cd projects':
      case 'cd contact':
      case 'cd ~':
      case 'cd': {
        const sectionKey = `section${record.destination[0].toUpperCase()}${record.destination.slice(1)}`;
        result.append(element('p', '', t('opening', { section: t(sectionKey) })));
        break;
      }
      default: {
        result.classList.add('terminal-error');
        result.append(element('p', '', t('unknown', { command: record.value })));
        const suggestion = element('p');
        const button = element('button', 'terminal-command', t('helpCommand'));
        button.type = 'button';
        button.dataset.command = t('helpCommand');
        suggestion.append(document.createTextNode(t('suggestionBefore')), button, document.createTextNode(t('suggestionAfter')));
        result.append(suggestion);
      }
    }
  };

  const run = (rawValue, { remember = true } = {}) => {
    const value = rawValue.trim();
    if (!value) return;

    if (remember && commandHistory.at(-1) !== value) {
      commandHistory.push(value);
      if (commandHistory.length > 100) commandHistory.shift();
    }
    historyIndex = commandHistory.length;
    draft = '';
    input.value = '';
    const normalized = value.toLowerCase().replace(/\s+/g, ' ');
    const command = aliases.get(normalized) || normalized;

    if (command === 'clear') {
      clearOutput();
      focusInput();
      return;
    }

    const entry = element('div', 'terminal-entry');
    const echo = element('p', 'terminal-echo', `visitor@pedro ~ $ ${value}`);
    const result = element('div', 'terminal-result');
    const record = { value, command, timestamp: Date.now(), section: currentSection, entry, result };
    if (['cd', 'cd ~', 'cd about', 'cd projects', 'cd contact'].includes(command)) {
      record.destination = sections.includes(command.slice(3)) ? command.slice(3) : 'about';
    }
    entry.append(echo, result);
    renderResult(record);
    entries.push(record);
    output.append(entry);
    while (entries.length > 25) entries.shift().entry.remove();
    output.scrollTop = output.scrollHeight;
    announce();
    if (record.destination) navigate(record.destination);
    else focusInput();
  };

  document.addEventListener('portfolio:languagechange', () => {
    const previousScroll = output.scrollTop;
    const focusedElement = document.activeElement;
    const focusedRecord = entries.find((record) => record.result.contains(focusedElement));
    const focusIndex = focusedRecord
      ? [...focusedRecord.result.querySelectorAll('a, button')].indexOf(focusedElement) : -1;
    entries.forEach(renderResult);
    if (focusedRecord && focusIndex !== -1) {
      focusedRecord.result.querySelectorAll('a, button')[focusIndex]?.focus({ preventScroll: true });
    }
    output.scrollTop = previousScroll;
    if (feedbackMessage) announce(feedbackMessage.key, feedbackMessage.values);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
  });

  document.querySelector('#help-button')?.addEventListener('click', () => run(t('helpCommand')));
  document.querySelector('#clear-terminal')?.addEventListener('click', () => {
    clearOutput();
    focusInput();
  });

  document.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-command]');
    if (button?.closest('.interactive-terminal')) run(button.dataset.command);
  });

  input.addEventListener('input', () => {
    if (historyIndex === commandHistory.length) draft = input.value;
    announce();
  });

  input.addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'ArrowUp' && commandHistory.length) {
      event.preventDefault();
      if (historyIndex === commandHistory.length) draft = input.value;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = commandHistory[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === 'ArrowDown' && historyIndex < commandHistory.length) {
      event.preventDefault();
      historyIndex += 1;
      input.value = commandHistory[historyIndex] ?? draft;
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      const prefix = input.value.trim().toLowerCase();
      const preferredCommands = locale() === 'pt-BR' ? portugueseCommands : englishCommands;
      let matches = preferredCommands.filter((command) => command.startsWith(prefix));
      if (!matches.length) {
        matches = [...new Set([...englishCommands, ...portugueseCommands])]
          .filter((command) => command.startsWith(prefix));
      }
      // Complete in the current language, while preserving normal Tab navigation.
      if (matches.length === 1 && matches[0] !== prefix) {
        event.preventDefault();
        input.value = matches[0];
        announce('completed', { command: matches[0] });
      } else if (matches.length > 1) {
        const common = matches.reduce((prefixValue, match) => {
          while (!match.startsWith(prefixValue)) prefixValue = prefixValue.slice(0, -1);
          return prefixValue;
        });
        if (common.length > prefix.length) {
          event.preventDefault();
          input.value = common;
        }
        announce('matches', { commands: matches.join(', ') });
      }
    } else if (event.key === 'Escape') {
      input.blur();
    }
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const editable = target instanceof Element && target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
    if (['/', '?'].includes(event.key) && !editable && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
      event.preventDefault();
      if (event.key === '?') run(t('helpCommand'));
      else focusInput();
    }
  });

  navLinks.forEach((anchor) => {
    anchor.addEventListener('click', () => updateSection(anchor.hash.slice(1)));
  });
  window.addEventListener('hashchange', () => updateSection(location.hash.slice(1)));
  updateSection(sections.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'about');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateSection(entry.target.id);
      });
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    sections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }
})();
