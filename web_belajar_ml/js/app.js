/* app.js — router (#id), sidebar, progres belajar (localStorage), tema. Dimuat PALING AKHIR. */
(function () {
  'use strict';
  const { h } = ML;
  const KEY = 'belajar-ml-selesai';
  const done = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  const save = () => localStorage.setItem(KEY, JSON.stringify([...done]));

  const chs = ML.chapters.slice().sort((a, b) => a.num - b.num);
  const nav = document.getElementById('nav');
  const main = document.getElementById('content');
  const bar = document.getElementById('progress-fill');
  const ptxt = document.getElementById('progress-text');
  const sidebar = document.querySelector('.sidebar');

  // ---- tema (default ikut sistem, bisa di-toggle) ----
  const themeBtn = document.getElementById('theme-btn');
  const applyTheme = (t) => {
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? 'Mode terang' : 'Mode gelap';
    ML.redrawAll();
  };
  let theme = localStorage.getItem('belajar-ml-tema') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  themeBtn.addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('belajar-ml-tema', theme); applyTheme(theme); });
  applyTheme(theme);

  // ---- sidebar ----
  const links = {};
  let lastGroup = null;
  for (const c of chs) {
    if (c.group !== lastGroup) { nav.append(h('div', { class: 'nav-group' }, c.group)); lastGroup = c.group; }
    const a = h('a', { href: '#' + c.id }, h('span', { class: 'num' }, h('span', {}, String(c.num))), c.title);
    links[c.id] = a; nav.append(a);
  }
  const updateProgress = () => {
    let n = 0;
    for (const c of chs) { const d = done.has(c.id); links[c.id].classList.toggle('done', d); if (d) n++; }
    bar.style.width = (100 * n) / chs.length + '%';
    ptxt.textContent = `Progres: ${n} / ${chs.length} bab selesai`;
  };

  // ---- render bab ----
  function show() {
    const id = location.hash.slice(1) || chs[0].id;
    const i = Math.max(0, chs.findIndex((c) => c.id === id));
    const c = chs[i];
    for (const k in links) links[k].classList.toggle('active', k === c.id);
    main.innerHTML = '';
    main.append(h('div', { class: 'chapter-head' },
      h('div', { class: 'kicker' }, `Bab ${c.num} · ${c.group}`),
      h('h1', {}, c.title),
      c.lead ? h('p', { class: 'lead', html: c.lead }) : null));
    const body = h('div', { class: 'chapter-body' });
    main.append(body);
    try { c.render(body); }
    catch (e) { console.error(e); body.append(ML.box('info', 'Ups, bab ini error', '<code>' + String(e.message || e) + '</code>')); }
    ML.redrawAll();

    const isDone = done.has(c.id);
    const doneBtn = h('button', { class: 'done-btn ' + (isDone ? '' : 'primary'), onclick: () => {
      done.has(c.id) ? done.delete(c.id) : done.add(c.id); save(); updateProgress();
      doneBtn.textContent = done.has(c.id) ? 'Sudah paham (klik untuk batal)' : 'Tandai: saya sudah paham bab ini';
      doneBtn.classList.toggle('primary', !done.has(c.id));
    } }, isDone ? 'Sudah paham (klik untuk batal)' : 'Tandai: saya sudah paham bab ini');
    main.append(doneBtn);
    const prev = chs[i - 1], next = chs[i + 1];
    main.append(h('div', { class: 'pager' },
      prev ? h('a', { class: 'btn', href: '#' + prev.id }, '← ' + prev.title) : h('span'),
      next ? h('a', { class: 'btn primary', href: '#' + next.id, style: 'background:var(--accent);color:#fff;border-color:var(--accent)' }, next.title + ' →') : h('span')));
    sidebar.classList.remove('open');
    window.scrollTo(0, 0);
    document.title = c.title + ' — Belajar ML dari Nol';
  }
  window.addEventListener('hashchange', show);
  document.getElementById('menu-btn').addEventListener('click', () => sidebar.classList.toggle('open'));
  let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(ML.redrawAll, 120); });
  updateProgress();
  show();
})();
