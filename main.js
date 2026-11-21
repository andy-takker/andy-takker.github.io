// Theme toggle and a small interactive shell. The page works without this file.
(() => {
  const root = document.documentElement;
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const isDark = () => root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = (t) => { root.dataset.theme = t; save('theme', t); };
  document.getElementById('theme').addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));

  // Print the whole resume, including collapsed experience entries.
  addEventListener('beforeprint', () => document.querySelectorAll('details').forEach(d => {
    d.dataset.wasOpen = d.open; d.open = true;
  }));
  addEventListener('afterprint', () => document.querySelectorAll('details').forEach(d => {
    d.open = d.dataset.wasOpen === 'true';
  }));

  const shell = document.getElementById('shell');
  const out = document.getElementById('shell-out');
  const form = document.getElementById('shell-form');
  const input = document.getElementById('shell-in');

  const LINKS = {
    github: 'https://github.com/andy-takker',
    habr: 'https://habr.com/ru/users/andy-takker/',
    linkedin: 'https://www.linkedin.com/in/sergey-natalenko',
    telegram: 'https://t.me/natalenko_sergey',
    blog: 'https://t.me/need_free_time',
    email: 'mailto:sergey.natalenko@mail.ru',
    resume: 'resume.pdf',
  };
  const SECTIONS = ['about', 'impact', 'experience', 'projects', 'writing', 'services', 'stack', 'education', 'contact'];

  // Output is built from text nodes only; user input is never parsed as HTML.
  const line = (parts, cls) => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    for (const p of [].concat(parts)) {
      if (typeof p === 'string') div.append(p);
      else { const a = document.createElement('a'); a.href = p.href; a.textContent = p.text; if (!p.href.startsWith('mailto') && p.href.startsWith('http')) a.target = '_blank'; div.append(a); }
    }
    out.append(div);
  };
  const go = (id) => { close(); document.getElementById(id).scrollIntoView(); };
  const listOf = (id) => [...document.querySelectorAll(`#${id} .rows li > a`)]
    .forEach(a => line(['  ', { href: a.href, text: a.textContent }]));

  const COMMANDS = {
    help: () => line([
      'whoami              who I am\n',
      'ls                  list sections\n',
      'cd <section>        jump to a section\n',
      'projects | writing  list links\n',
      'services | contact  how to work with me\n',
      'open <name>         github, habr, linkedin, telegram, blog, email, resume\n',
      'cat resume          open resume.pdf\n',
      'theme [dark|light]  switch colours\n',
      'history | clear | exit',
    ]),
    whoami: () => line('Sergey Natalenko. Hands-on tech lead, Python & Go. Backend reliability and performance; AI products: RAG agents, MCP, fine-tuned models.'),
    ls: () => line(SECTIONS.map(s => s + '/').join('  ')),
    cd: (a) => {
      if (!a || a === '~' || a === '/') return go('about');
      const id = a.replace(/\/$/, '');
      SECTIONS.includes(id) ? go(id) : line(`cd: no such section: ${a}`);
    },
    projects: () => listOf('projects'),
    writing: () => listOf('writing'),
    services: () => document.querySelectorAll('#services dt')
      .forEach(dt => line(['  - ' + dt.textContent])),
    contact: () => Object.entries(LINKS).filter(([k]) => k !== 'resume')
      .forEach(([k, href]) => line([k.padEnd(10), { href, text: href.replace(/^mailto:|^https:\/\//, '') }])),
    open: (a) => LINKS[a] ? (window.open(LINKS[a], '_blank', 'noopener'), line(`opening ${a}…`)) : line('usage: open ' + Object.keys(LINKS).join('|')),
    cat: (a) => (a || '').startsWith('resume') ? COMMANDS.open('resume') : line(`cat: ${a || ''}: try "cat resume"`),
    theme: (a) => { setTheme(a === 'light' || a === 'dark' ? a : (isDark() ? 'light' : 'dark')); line(`theme: ${root.dataset.theme}`); },
    history: () => hist.forEach((h, i) => line(`${String(i + 1).padStart(4)}  ${h}`)),
    clear: () => { out.textContent = ''; },
    exit: () => close(),
    sudo: (a) => a.startsWith('hire') ? line(['[sudo] permission granted. Next step: ', { href: LINKS.telegram, text: 't.me/natalenko_sergey' }]) : line('sudo: nice try'),
    rm: () => line('rm: refusing to remove anything; this site is stateless anyway'),
    vim: () => line('you are now stuck in vim. just kidding: type exit'),
  };

  const hist = [];
  let pos = 0;
  const run = (raw) => {
    const cmd = raw.trim();
    line(['guest@takker:~$ ' + raw], 'dim');
    if (!cmd) return;
    hist.push(cmd); pos = hist.length;
    const [name, ...rest] = cmd.split(/\s+/);
    const fn = COMMANDS[name.toLowerCase()];
    fn ? fn(rest.join(' ')) : line(`${name}: command not found. Type "help".`);
    shell.scrollTop = shell.scrollHeight;
  };

  const open = () => {
    shell.hidden = false;
    if (!out.childElementCount) line('Welcome. Type "help" to see the commands.', 'dim');
    input.focus();
  };
  const close = () => { shell.hidden = true; };

  form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && pos > 0) { input.value = hist[--pos]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { pos = Math.min(pos + 1, hist.length); input.value = hist[pos] || ''; e.preventDefault(); }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const [name, arg] = input.value.split(/\s+/, 2);
      const pool = arg === undefined ? Object.keys(COMMANDS)
        : name === 'cd' ? SECTIONS : name === 'open' ? Object.keys(LINKS) : name === 'theme' ? ['dark', 'light'] : [];
      const word = arg === undefined ? name : arg;
      const hits = pool.filter(w => w.startsWith(word || ''));
      if (hits.length === 1) input.value = arg === undefined ? hits[0] + ' ' : `${name} ${hits[0]}`;
      else if (hits.length > 1) line(hits.join('  '), 'dim');
    }
  });
  document.getElementById('shell-open').addEventListener('click', () => (shell.hidden ? open() : close()));
  addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && document.activeElement !== input;
    if (e.key === '`' && !typing) { e.preventDefault(); shell.hidden ? open() : close(); }
    else if (e.key === 'Escape' && !shell.hidden) close();
  });
})();
