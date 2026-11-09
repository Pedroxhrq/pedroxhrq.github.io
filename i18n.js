(() => {
  'use strict';

  const messages = {
    en: {
      'meta.title': 'Pedro Henrique | ~/portfolio',
      'meta.description': 'Pedro Henrique — a passionately curious software developer in Brazil. Explore mobile apps, Python tools, and text adventures in a terminal-inspired portfolio.',
      'meta.socialDescription': 'Passionately curious. Software, small experiments, and a few text adventures.',
      skip: 'Skip to content',
      'desktop.workspace': "pedro's workspace",
      'desktop.context': 'personal / portfolio',
      'language.label': 'Language',
      'language.changed': 'Language changed to English.',
      'nav.label': 'Main navigation',
      'nav.about': 'about',
      'nav.projects': 'projects',
      'nav.contact': 'contact',
      'nav.help': 'help',
      'command.whoami': 'Command: whoami',
      'command.projects': 'Command: ls projects',
      'command.contact': 'Command: cat contact.sh',
      'intro.hello': 'HELLO, FRIEND',
      'intro.role': 'Software developer',
      country: 'Brazil',
      'intro.curious': 'Passionately curious.',
      'intro.description1': 'I build mobile experiences, practical tools,',
      'intro.description2': 'and worlds you explore one command at a time.',
      'intro.explore': 'explore projects',
      'external.newTab': '(opens in a new tab)',
      'profile.label': 'Profile at a glance',
      'profile.readonly': 'read only',
      'profile.user': 'user',
      'profile.location': 'location',
      'profile.focus': 'focus',
      'profile.focusValue': 'build · learn',
      'palette.label': 'Catppuccin Frappé color palette',
      'stack.comment': '// working with',
      'stack.label': 'Project technologies',
      'projects.eyebrow': "A FEW THINGS I'VE BUILT",
      'projects.heading': 'Pinned projects',
      'projects.count': '5 repositories',
      'projects.description': 'From mobile apps to text adventures. Take a look under the hood.',
      'project.acic': 'A mobile hub for ACIC Caçador: news, events, member benefits, and job opportunities.',
      'project.ludwig': 'A local OCR prototype for assisted inspection of Brazilian identity-document images.',
      'project.zork1': 'The Great Underground Empire, translated from ZIL into standalone Python. Adventure starts here.',
      'project.zork2': 'The Wizard of Frobozz, reimagined in Python with the original puzzles, parser, and world.',
      'project.zork3': 'The Dungeon Master in Python. The final chapter, with persistent saves and replayable sessions.',
      'project.technologies': 'Technologies',
      'project.mobile': 'mobile app',
      'project.vision': 'computer vision',
      'project.fiction': 'interactive fiction',
      'project.adventure': 'Text adventure',
      'project.view': 'View repository on GitHub (opens in a new tab)',
      'projects.more': "// there's more in the source",
      'projects.all': 'all repositories',
      'contact.eyebrow': 'KEEP THE CONVERSATION GOING',
      'contact.heading': 'Say hello',
      'contact.description1': 'Have an idea, a question, or a good rabbit hole?',
      'contact.description2': 'Find me on the other side of these links.',
      'contact.linkedin': "let's connect",
      'contact.github': 'follow the code',
      'terminal.label': 'Interactive portfolio terminal',
      'terminal.hint': 'This prompt works. Try',
      'terminal.clearTitle': 'Clear terminal output',
      'terminal.clear': 'clear',
      'terminal.inputLabel': 'Enter a portfolio command',
      'terminal.placeholder': 'type a command...',
      'terminal.run': 'Run command',
      'terminal.autocomplete': 'autocomplete',
      'terminal.history': 'history',
      'terminal.focus': 'to focus',
      'footer.made': 'Made with curiosity',
    },
    'pt-BR': {
      'meta.title': 'Pedro Henrique | ~/portfólio',
      'meta.description': 'Pedro Henrique — desenvolvedor de software no Brasil, movido pela curiosidade. Conheça aplicativos, ferramentas em Python e aventuras de texto em um portfólio inspirado no terminal.',
      'meta.socialDescription': 'Movido pela curiosidade. Software, pequenos experimentos e algumas aventuras de texto.',
      skip: 'Pular para o conteúdo',
      'desktop.workspace': 'espaço de trabalho do pedro',
      'desktop.context': 'pessoal / portfólio',
      'language.label': 'Idioma',
      'language.changed': 'Idioma alterado para Português (Brasil).',
      'nav.label': 'Navegação principal',
      'nav.about': 'sobre',
      'nav.projects': 'projetos',
      'nav.contact': 'contato',
      'nav.help': 'ajuda',
      'command.whoami': 'Comando: whoami',
      'command.projects': 'Comando: ls projects',
      'command.contact': 'Comando: cat contact.sh',
      'intro.hello': 'OLÁ, AMIGO',
      'intro.role': 'Desenvolvedor de software',
      country: 'Brasil',
      'intro.curious': 'Movido pela curiosidade.',
      'intro.description1': 'Crio experiências mobile, ferramentas úteis',
      'intro.description2': 'e mundos que você explora um comando por vez.',
      'intro.explore': 'explorar projetos',
      'external.newTab': '(abre em uma nova aba)',
      'profile.label': 'Resumo do perfil',
      'profile.readonly': 'só leitura',
      'profile.user': 'usuário',
      'profile.location': 'país',
      'profile.focus': 'foco',
      'profile.focusValue': 'criar · aprender',
      'palette.label': 'Paleta de cores Catppuccin Frappé',
      'stack.comment': '// tecnologias que uso',
      'stack.label': 'Tecnologias dos projetos',
      'projects.eyebrow': 'UM POUCO DO QUE JÁ CRIEI',
      'projects.heading': 'Projetos fixados',
      'projects.count': '5 repositórios',
      'projects.description': 'De aplicativos a aventuras de texto. Explore o código por trás de cada projeto.',
      'project.acic': 'Um aplicativo para a ACIC Caçador: notícias, eventos, benefícios para associados e oportunidades de emprego.',
      'project.ludwig': 'Um protótipo local de OCR para auxiliar na análise de imagens de documentos de identidade brasileiros.',
      'project.zork1': 'The Great Underground Empire, traduzido de ZIL para Python, sem dependências externas. A aventura começa aqui.',
      'project.zork2': 'The Wizard of Frobozz, recriado em Python com os enigmas, o interpretador de comandos e o mundo originais.',
      'project.zork3': 'The Dungeon Master em Python. O capítulo final, com partidas salvas e sessões que podem ser reproduzidas.',
      'project.technologies': 'Tecnologias',
      'project.mobile': 'aplicativo mobile',
      'project.vision': 'visão computacional',
      'project.fiction': 'ficção interativa',
      'project.adventure': 'Aventura de texto',
      'project.view': 'Ver repositório no GitHub (abre em uma nova aba)',
      'projects.more': '// tem mais no código',
      'projects.all': 'todos os repositórios',
      'contact.eyebrow': 'VAMOS CONTINUAR A CONVERSA',
      'contact.heading': 'Diga olá',
      'contact.description1': 'Tem uma ideia, uma dúvida ou algo interessante para explorar?',
      'contact.description2': 'Você me encontra nestes links.',
      'contact.linkedin': 'vamos nos conectar',
      'contact.github': 'acompanhe o código',
      'terminal.label': 'Terminal interativo do portfólio',
      'terminal.hint': 'Este terminal funciona. Digite',
      'terminal.clearTitle': 'Limpar a saída do terminal',
      'terminal.clear': 'limpar',
      'terminal.inputLabel': 'Digite um comando do portfólio',
      'terminal.placeholder': 'digite um comando...',
      'terminal.run': 'Executar comando',
      'terminal.autocomplete': 'completar',
      'terminal.history': 'histórico',
      'terminal.focus': 'para focar',
      'footer.made': 'Feito com curiosidade',
    },
  };

  const storageKey = 'portfolio-language';
  let locale = 'en';

  const normalizeLocale = (value) => {
    if (typeof value !== 'string') return null;
    const normalized = value.toLowerCase();
    if (normalized === 'en') return 'en';
    if (normalized === 'pt' || normalized === 'pt-br') return 'pt-BR';
    return null;
  };

  const t = (key, params = {}) => {
    const message = messages[locale][key] ?? messages.en[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (match, name) => params[name] === undefined ? match : String(params[name]));
  };

  const render = () => {
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    ['aria-label', 'placeholder', 'title', 'content'].forEach((attribute) => {
      document.querySelectorAll(`[data-i18n-${attribute}]`).forEach((node) => {
        node.setAttribute(attribute, t(node.getAttribute(`data-i18n-${attribute}`)));
      });
    });
    document.querySelectorAll('[data-language]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.language === locale));
    });
  };

  const setLocale = (value) => {
    const nextLocale = normalizeLocale(value);
    if (!nextLocale) return false;
    const scrollPosition = { left: window.scrollX, top: window.scrollY };
    const changed = locale !== nextLocale;
    locale = nextLocale;
    try { localStorage.setItem(storageKey, locale); } catch { /* A blocked store must not prevent switching. */ }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', locale);
      window.history.replaceState(window.history.state, '', url);
    } catch { /* Some file previews disallow history updates. */ }
    render();
    if (changed) {
      document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { locale } }));
      const status = document.querySelector('#language-status');
      if (status) status.textContent = t('language.changed');
    }
    window.scrollTo({ ...scrollPosition, behavior: 'instant' });
    return true;
  };

  let requestedLocale;
  let savedLocale;
  try { requestedLocale = normalizeLocale(new URL(window.location.href).searchParams.get('lang')); } catch { /* Use the next available preference. */ }
  try { savedLocale = normalizeLocale(localStorage.getItem(storageKey)); } catch { /* Storage is optional. */ }
  const browserLanguage = navigator.languages?.[0] || navigator.language || 'en';
  locale = requestedLocale || savedLocale || (/^pt(?:-|$)/i.test(browserLanguage) ? 'pt-BR' : 'en');

  window.portfolioI18n = Object.freeze({ getLocale: () => locale, setLocale, t });
  render();
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLocale(button.dataset.language));
  });
  document.querySelectorAll('.language-switch').forEach((switcher) => { switcher.hidden = false; });
})();
