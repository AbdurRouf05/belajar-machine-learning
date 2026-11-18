/* =====================================================================
   core.js — helper bersama untuk semua bab.
   Semua bab memanggil ML.chapter({...}) dan memakai helper di bawah.
   Tanpa library luar, tanpa build step: cukup buka index.html.
   ===================================================================== */
(function () {
  'use strict';
  const ML = (window.ML = {});
  const chapters = [];
  ML.chapters = chapters;

  /* ---------- registrasi bab ----------
     ML.chapter({
       id: 'sigmoid',              // dipakai di URL: index.html#sigmoid
       num: 4,                     // urutan bab
       group: 'Dasar',             // judul grup di sidebar
       title: 'Bobot, Bias & Sigmoid',
       lead: 'kalimat pembuka 1 baris',
       render(el) { ... }          // isi bab ke elemen el
     })
  */
  ML.chapter = function (def) { chapters.push(def); };

  /* ---------- pembuat elemen ----------
     ML.h('div', {class:'x', onclick: fn, style:'...'}, 'teks', childEl, ...)
     - atribut 'html' => innerHTML
     - child berupa string => text node (BUKAN html)
  */
  ML.h = function (tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v == null || v === false) continue;
        if (k === 'html') el.innerHTML = v;
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else if (k === 'class') el.className = v;
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    }
    return el;
  };
  const h = ML.h;

  /* elemen dari string HTML (boleh banyak elemen) -> DocumentFragment */
  ML.html = function (str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content;
  };

  /* ---------- format angka ---------- */
  ML.fmt = function (n, d = 2) {
    if (!isFinite(n)) return String(n);
    let s;
    if (Math.abs(n) > 0 && Math.abs(n) < Math.pow(10, -d)) {
      // angka sangat kecil: tampilkan 1-2 angka penting tanpa notasi ilmiah (0.00005)
      const dd = Math.min(12, -Math.floor(Math.log10(Math.abs(n))) + 1);
      s = (+n).toFixed(dd);
    } else s = (+n).toFixed(d);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    return s.replace('-', '−');
  };
  /* angka dalam kurung kalau negatif: 3 × (−2) */
  ML.fmtp = function (n, d = 2) { const s = ML.fmt(n, d); return n < 0 ? '(' + s + ')' : s; };

  /* ---------- kotak penjelasan ----------
     type: 'analogi' | 'rumus' | 'coba' | 'langkah' | 'info' | 'bisindo'
     content: string HTML atau Node
  */
  const BOX = {
    analogi: 'Analogi',
    rumus: 'Rumus',
    coba: 'Coba sendiri',
    langkah: 'Langkah hitung',
    info: 'Catatan',
    bisindo: 'Kaitan dengan proyek BISINDO',
  };
  ML.box = function (type, title, content) {
    const def = BOX[type] || BOX.info;
    const body = h('div', { class: 'box-body' });
    if (content instanceof Node) body.append(content);
    else if (content != null) body.innerHTML = content;
    return h('div', { class: 'box ' + type }, h('div', { class: 'box-title' }, title || def), body);
  };

  /* rumus: ML.formula('<span class="var">z</span> = w·x + b') -> div.formula
     pecahan: ML.frac('atas','bawah')  akar: ML.sqrt('isi') (keduanya string HTML) */
  ML.formula = function (htmlStr, legendRows) {
    const d = h('div', {});
    d.append(h('div', { class: 'formula', html: htmlStr }));
    if (legendRows) {
      const t = h('table', { class: 'legend-formula' });
      for (const [sym, desc] of legendRows) t.append(h('tr', {}, h('td', { html: '<b>' + sym + '</b>' }), h('td', { html: desc })));
      d.append(t);
    }
    return d;
  };
  ML.frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
  ML.sqrt = (a) => `<span class="sqrt">√<span>${a}</span></span>`;

  /* langkah hitung: ML.steps([ ['judul', 'baris hitung (teks mono)'], ... ])
     judul boleh HTML; baris hitung ditampilkan monospace (boleh HTML). */
  ML.steps = function (list) {
    const ol = h('ol', { class: 'steps' });
    for (const [title, calc] of list) {
      const li = h('li', { html: title });
      if (calc != null && calc !== '') li.append(h('span', { class: 'calc', html: calc }));
      ol.append(li);
    }
    return ol;
  };

  /* ---------- slider ----------
     const s = ML.slider({label:'Bobot w', min:-3, max:3, step:0.1, value:1, digits:1, onInput:v=>{}})
     s.el (elemen), s.value (getter/setter)
  */
  ML.slider = function (o) {
    const digits = o.digits != null ? o.digits : 2;
    const val = h('span', { class: 'val' }, ML.fmt(o.value, digits));
    const inp = h('input', { type: 'range', min: o.min, max: o.max, step: o.step || 0.01, value: o.value, 'aria-label': o.label });
    const el = h('div', { class: 'ctl' }, h('label', {}, o.label + ' = ', val), inp);
    const api = {
      el, input: inp,
      get value() { return parseFloat(inp.value); },
      set value(v) { inp.value = v; val.textContent = ML.fmt(parseFloat(inp.value), digits); },
    };
    inp.addEventListener('input', () => { val.textContent = ML.fmt(api.value, digits); o.onInput && o.onInput(api.value); });
    return api;
  };

  /* input angka: ML.numInput({label, value, step, onInput}) -> {el, input, value} */
  ML.numInput = function (o) {
    const inp = h('input', { type: 'number', value: o.value, step: o.step || 'any', 'aria-label': o.label });
    const el = h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, o.label), inp);
    inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (isFinite(v)) o.onInput && o.onInput(v); });
    return { el, input: inp, get value() { const v = parseFloat(inp.value); return isFinite(v) ? v : 0; }, set value(v) { inp.value = v; } };
  };

  /* ---------- tooltip global ---------- */
  let tipEl;
  ML.tip = {
    show(clientX, clientY, html) {
      if (!tipEl) { tipEl = h('div', { class: 'tooltip' }); document.body.append(tipEl); }
      tipEl.innerHTML = html;
      tipEl.classList.add('show');
      const r = tipEl.getBoundingClientRect();
      let x = clientX + 14, y = clientY + 14;
      if (x + r.width > innerWidth - 8) x = clientX - r.width - 14;
      if (y + r.height > innerHeight - 8) y = clientY - r.height - 14;
      tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
    },
    hide() { tipEl && tipEl.classList.remove('show'); },
  };

  /* ---------- warna dari CSS variable ---------- */
  ML.color = function (name) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + name).trim() || '#888';
  };

  /* ---------- legenda ----------
     ML.legend([{label:'Kelas 1', color:'c1', shape:'circle'|'square'|'line'}, ...]) */
  ML.legend = function (items) {
    const d = h('div', { class: 'legend' });
    for (const it of items) {
      const cls = 'sw' + (it.shape === 'square' ? ' sq' : it.shape === 'line' ? ' ln' : '');
      const sw = h('span', { class: cls, style: `background:var(--${it.color})` + (it.shape === 'circle' || !it.shape ? ';border-radius:50%' : '') });
      d.append(h('span', {}, sw, it.label));
    }
    return d;
  };

  /* =====================================================================
     PLOT — kanvas 2D dengan sistem koordinat data.
     const p = ML.plot({ width: 640, height: 360, x:[xmin,xmax], y:[ymin,ymax],
                         xLabel:'x', yLabel:'y', caption:'...', legend:[...] })
     container: p.el  (append ke halaman)
     Gambar ulang: p.draw(fn)  -> fn(p) dipanggil setiap draw/resize/ganti tema
       Di dalam fn:
       p.clear(); p.grid(); p.axes();            // dasar
       p.fn(x => Math.sin(x), {color:'c1', width:2, dash:[4,4]})
       p.path([[x,y],...], {color, width, dash, fill})
       p.point(x, y, {color:'c1', r:6, shape:'circle'|'square'|'diamond', label:'A', hollow:false})
       p.line(x1,y1,x2,y2,{color, width, dash})
       p.arrow(x1,y1,x2,y2,{color, width})
       p.text(x, y, 'teks', {color:'text', align:'left'|'center'|'right', base:'middle', size:13, bold:false, dx:0, dy:0})
       p.rect(x1,y1,x2,y2,{fill, alpha})
       p.hline(y, opts) / p.vline(x, opts)
       p.region((x,y)=>warna|null, step)   // arsir latar (mis. wilayah kelas)
       p.sx(x), p.sy(y)  -> piksel ; p.ix(px), p.iy(py) -> data
       p.ctx (CanvasRenderingContext2D, satuan piksel CSS)
     Interaksi:
       p.onHover((x,y,ev)=> html|null)    // tooltip otomatis; return null = sembunyi
       p.onClick((x,y,ev)=>{})
       p.onDrag({start:(x,y)=>bool, move:(x,y)=>{}, end:()=>{}})
     Warna: nama variabel CSS ('c1','c2','c3','text','text-2','good','bad','axis','grid')
            atau warna langsung ('#f00','rgba(...)').
     ===================================================================== */
  const allPlots = new Set();
  ML.plot = function (o) {
    let W = o.width || 640; const H = o.height || 360;
    const pad = Object.assign({ l: 48, r: 16, t: 14, b: 40 }, o.pad || {});
    const canvas = h('canvas', { role: 'img', 'aria-label': o.aria || o.caption || 'grafik' });
    const el = h('div', { class: 'canvas-wrap' });
    if (o.legend) el.append(ML.legend(o.legend));
    el.append(canvas);
    if (o.caption) el.append(h('div', { class: 'canvas-caption', html: o.caption }));
    canvas.style.height = H + 'px';
    const ctx = canvas.getContext('2d');
    const p = { el, canvas, ctx, W, H, width: () => W, pad, x: o.x || [0, 1], y: o.y || [0, 1], opts: o };
    let drawFn = null, hoverFn = null;

    const col = (c, fallback) => {
      c = c || fallback || 'text';
      return /^(#|rgb|hsl|transparent)/.test(c) ? c : ML.color(c);
    };
    p.col = col;
    p.sx = (x) => pad.l + ((x - p.x[0]) / (p.x[1] - p.x[0])) * (W - pad.l - pad.r);
    p.sy = (y) => H - pad.b - ((y - p.y[0]) / (p.y[1] - p.y[0])) * (H - pad.t - pad.b);
    p.ix = (px) => p.x[0] + ((px - pad.l) / (W - pad.l - pad.r)) * (p.x[1] - p.x[0]);
    p.iy = (py) => p.y[0] + ((H - pad.b - py) / (H - pad.t - pad.b)) * (p.y[1] - p.y[0]);

    function fitCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const cw = canvas.clientWidth; if (cw > 50) W = cw; p.W = W;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    p.clear = () => { ctx.clearRect(0, 0, W, H); };
    const niceStep = (span, n) => {
      const raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
      const r = raw / mag;
      return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
    };
    const ticks = (a, b, n) => {
      const s = niceStep(b - a, n), out = [];
      for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(10));
      return out;
    };
    p.xTicks = o.xTicks; p.yTicks = o.yTicks;
    p.grid = () => {
      ctx.save(); ctx.strokeStyle = col('grid'); ctx.lineWidth = 1;
      for (const t of p.xTicks || ticks(p.x[0], p.x[1], 8)) { const X = Math.round(p.sx(t)) + 0.5; ctx.beginPath(); ctx.moveTo(X, pad.t); ctx.lineTo(X, H - pad.b); ctx.stroke(); }
      for (const t of p.yTicks || ticks(p.y[0], p.y[1], 5)) { const Y = Math.round(p.sy(t)) + 0.5; ctx.beginPath(); ctx.moveTo(pad.l, Y); ctx.lineTo(W - pad.r, Y); ctx.stroke(); }
      ctx.restore();
    };
    p.axes = (ao = {}) => {
      ctx.save();
      ctx.strokeStyle = col('axis'); ctx.fillStyle = col('text-2'); ctx.lineWidth = 1;
      ctx.font = '12px ' + getComputedStyle(document.body).fontFamily;
      // garis sumbu di tepi area plot
      ctx.beginPath(); ctx.moveTo(pad.l + 0.5, pad.t); ctx.lineTo(pad.l + 0.5, H - pad.b + 0.5); ctx.lineTo(W - pad.r, H - pad.b + 0.5); ctx.stroke();
      // garis nol jika masuk rentang
      ctx.setLineDash([3, 3]);
      if (p.y[0] < 0 && p.y[1] > 0 && ao.zero !== false) { const Y = Math.round(p.sy(0)) + 0.5; ctx.beginPath(); ctx.moveTo(pad.l, Y); ctx.lineTo(W - pad.r, Y); ctx.stroke(); }
      if (p.x[0] < 0 && p.x[1] > 0 && ao.zero !== false) { const X = Math.round(p.sx(0)) + 0.5; ctx.beginPath(); ctx.moveTo(X, pad.t); ctx.lineTo(X, H - pad.b); ctx.stroke(); }
      ctx.setLineDash([]);
      const fx = o.xFmt || ((v) => ML.fmt(v, 2)), fy = o.yFmt || ((v) => ML.fmt(v, 2));
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (const t of p.xTicks || ticks(p.x[0], p.x[1], 8)) ctx.fillText(fx(t), p.sx(t), H - pad.b + 5);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (const t of p.yTicks || ticks(p.y[0], p.y[1], 5)) ctx.fillText(fy(t), pad.l - 6, p.sy(t));
      if (o.xLabel) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xLabel, pad.l + (W - pad.l - pad.r) / 2, H - 2); }
      if (o.yLabel) { ctx.save(); ctx.translate(12, pad.t + (H - pad.t - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.yLabel, 0, 0); ctx.restore(); }
      ctx.restore();
    };
    const stroke = (op, def) => {
      ctx.strokeStyle = col(op.color, def || 'c1'); ctx.lineWidth = op.width || 2;
      ctx.setLineDash(op.dash || []); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    };
    const clipArea = () => { ctx.beginPath(); ctx.rect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b); ctx.clip(); };
    p.clip = clipArea;
    p.fn = (f, op = {}) => {
      ctx.save(); clipArea(); stroke(op); ctx.beginPath();
      const n = op.samples || 300; let started = false;
      for (let i = 0; i <= n; i++) {
        const x = p.x[0] + ((p.x[1] - p.x[0]) * i) / n, y = f(x);
        if (!isFinite(y)) { started = false; continue; }
        const Y = Math.max(-1e4, Math.min(1e4, p.sy(y)));
        if (!started) { ctx.moveTo(p.sx(x), Y); started = true; } else ctx.lineTo(p.sx(x), Y);
      }
      ctx.stroke(); ctx.restore();
    };
    p.path = (pts, op = {}) => {
      if (!pts.length) return;
      ctx.save(); if (op.clip !== false) clipArea(); stroke(op); ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(p.sx(x), p.sy(y)) : ctx.moveTo(p.sx(x), p.sy(y))));
      if (op.fill) { ctx.closePath(); ctx.globalAlpha = op.alpha != null ? op.alpha : 0.15; ctx.fillStyle = col(op.fill); ctx.fill(); ctx.globalAlpha = 1; }
      if (op.width !== 0) ctx.stroke();
      ctx.restore();
    };
    p.line = (x1, y1, x2, y2, op = {}) => p.path([[x1, y1], [x2, y2]], op);
    p.hline = (y, op = {}) => p.line(p.x[0], y, p.x[1], y, op);
    p.vline = (x, op = {}) => p.line(x, p.y[0], x, p.y[1], op);
    p.arrow = (x1, y1, x2, y2, op = {}) => {
      const X1 = p.sx(x1), Y1 = p.sy(y1), X2 = p.sx(x2), Y2 = p.sy(y2);
      const a = Math.atan2(Y2 - Y1, X2 - X1), L = op.head || 11;
      ctx.save(); stroke(op); ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X2 - Math.cos(a) * 3, Y2 - Math.sin(a) * 3); ctx.stroke();
      ctx.setLineDash([]); ctx.fillStyle = col(op.color, 'c1'); ctx.beginPath();
      ctx.moveTo(X2, Y2); ctx.lineTo(X2 - L * Math.cos(a - 0.4), Y2 - L * Math.sin(a - 0.4)); ctx.lineTo(X2 - L * Math.cos(a + 0.4), Y2 - L * Math.sin(a + 0.4)); ctx.closePath(); ctx.fill();
      ctx.restore();
    };
    p.point = (x, y, op = {}) => {
      const X = p.sx(x), Y = p.sy(y), r = op.r || 6, c = col(op.color, 'c1');
      ctx.save(); ctx.beginPath();
      if (op.shape === 'square') ctx.rect(X - r, Y - r, 2 * r, 2 * r);
      else if (op.shape === 'diamond') { ctx.moveTo(X, Y - r * 1.3); ctx.lineTo(X + r * 1.3, Y); ctx.lineTo(X, Y + r * 1.3); ctx.lineTo(X - r * 1.3, Y); ctx.closePath(); }
      else ctx.arc(X, Y, r, 0, Math.PI * 2);
      // cincin warna surface (2px) agar titik bertumpuk tetap terpisah
      ctx.lineWidth = 2; ctx.strokeStyle = col('surface'); ctx.stroke();
      if (op.hollow) { ctx.fillStyle = col('surface'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = c; ctx.stroke(); }
      else { ctx.fillStyle = c; ctx.fill(); }
      if (op.ring) { ctx.beginPath(); ctx.arc(X, Y, r + 5, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = col(op.ring === true ? 'text' : op.ring); ctx.stroke(); }
      ctx.restore();
      if (op.label) p.text(x, y, op.label, { dx: r + 5, dy: -r - 2, align: 'left', base: 'bottom', size: op.labelSize || 12.5, color: 'text', bold: op.bold });
    };
    p.text = (x, y, s, op = {}) => {
      ctx.save();
      ctx.font = (op.bold ? '600 ' : '') + (op.size || 13) + 'px ' + getComputedStyle(document.body).fontFamily;
      ctx.fillStyle = col(op.color, 'text'); ctx.textAlign = op.align || 'center'; ctx.textBaseline = op.base || 'middle';
      const X = p.sx(x) + (op.dx || 0), Y = p.sy(y) + (op.dy || 0);
      if (op.bg) { const m = ctx.measureText(s), w = m.width + 8, hh = (op.size || 13) + 6;
        let bx = op.align === 'left' ? X - 4 : op.align === 'right' ? X - w + 4 : X - w / 2;
        let by = op.base === 'top' ? Y - 3 : op.base === 'bottom' ? Y - hh + 3 : Y - hh / 2;
        ctx.fillStyle = col(op.bg === true ? 'surface' : op.bg); ctx.globalAlpha = 0.9; ctx.fillRect(bx, by, w, hh); ctx.globalAlpha = 1; ctx.fillStyle = col(op.color, 'text'); }
      ctx.fillText(s, X, Y); ctx.restore();
    };
    p.rect = (x1, y1, x2, y2, op = {}) => {
      ctx.save(); ctx.globalAlpha = op.alpha != null ? op.alpha : 1; ctx.fillStyle = col(op.fill, 'c1');
      const X = Math.min(p.sx(x1), p.sx(x2)), Y = Math.min(p.sy(y1), p.sy(y2));
      ctx.fillRect(X, Y, Math.abs(p.sx(x2) - p.sx(x1)), Math.abs(p.sy(y2) - p.sy(y1)));
      ctx.restore();
    };
    /* batang vertikal dengan ujung atas membulat 4px, menempel di baseline */
    p.bar = (xc, y0, y1, wData, op = {}) => {
      const X1 = p.sx(xc - wData / 2) + 1, X2 = p.sx(xc + wData / 2) - 1;
      const Ya = p.sy(y0), Yb = p.sy(y1), top = Math.min(Ya, Yb), hh = Math.abs(Ya - Yb), r = Math.min(4, hh, (X2 - X1) / 2);
      ctx.save(); ctx.fillStyle = col(op.color, 'c1'); ctx.globalAlpha = op.alpha != null ? op.alpha : 1; ctx.beginPath();
      if (y1 >= y0) { ctx.moveTo(X1, Ya); ctx.lineTo(X1, top + r); ctx.quadraticCurveTo(X1, top, X1 + r, top); ctx.lineTo(X2 - r, top); ctx.quadraticCurveTo(X2, top, X2, top + r); ctx.lineTo(X2, Ya); }
      else { ctx.moveTo(X1, Ya); ctx.lineTo(X1, Yb - r); ctx.quadraticCurveTo(X1, Yb, X1 + r, Yb); ctx.lineTo(X2 - r, Yb); ctx.quadraticCurveTo(X2, Yb, X2, Yb - r); ctx.lineTo(X2, Ya); }
      ctx.closePath(); ctx.fill(); ctx.restore();
    };
    p.region = (f, step = 6) => {
      ctx.save();
      const cache = {};
      const cc = (c) => (cache[c] || (cache[c] = col(c)));
      for (let px = pad.l; px < W - pad.r; px += step)
        for (let py = pad.t; py < H - pad.b; py += step) {
          const c = f(p.ix(px + step / 2), p.iy(py + step / 2));
          if (!c) continue;
          ctx.fillStyle = cc(c.color || c); ctx.globalAlpha = c.alpha != null ? c.alpha : 0.12;
          ctx.fillRect(px, py, Math.min(step, W - pad.r - px), Math.min(step, H - pad.b - py));
        }
      ctx.restore();
    };

    p.draw = (fn) => { if (fn) drawFn = fn; if (drawFn) { fitCanvas(); drawFn(p); } return p; };
    p.redraw = () => p.draw();

    const evPos = (ev) => {
      const r = canvas.getBoundingClientRect();
      const px = ((ev.clientX - r.left) / r.width) * W, py = ((ev.clientY - r.top) / r.height) * H;
      return [p.ix(px), p.iy(py), px, py];
    };
    p.evPos = evPos;
    p.onHover = (fn) => { hoverFn = fn; return p; };
    canvas.addEventListener('mousemove', (ev) => {
      if (!hoverFn || dragging) return;
      const [x, y] = evPos(ev); const html = hoverFn(x, y, ev);
      html ? ML.tip.show(ev.clientX, ev.clientY, html) : ML.tip.hide();
    });
    canvas.addEventListener('mouseleave', () => ML.tip.hide());
    p.onClick = (fn) => { canvas.style.cursor = 'crosshair'; canvas.addEventListener('click', (ev) => { if (moved) return; const [x, y] = evPos(ev); fn(x, y, ev); }); return p; };
    let dragging = false, moved = false;
    p.onDrag = (d) => {
      canvas.style.touchAction = 'none';
      canvas.addEventListener('pointerdown', (ev) => { moved = false; const [x, y] = evPos(ev); if (d.start(x, y, ev)) { dragging = true; canvas.setPointerCapture(ev.pointerId); ML.tip.hide(); } });
      canvas.addEventListener('pointermove', (ev) => { if (!dragging) return; moved = true; const [x, y] = evPos(ev); d.move(x, y, ev); });
      const end = () => { if (dragging) { dragging = false; d.end && d.end(); setTimeout(() => (moved = false), 0); } };
      canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
      return p;
    };
    /* bantu cari titik terdekat (dalam piksel) untuk hover/drag */
    p.nearest = (pts, x, y, maxPx = 14) => {
      let best = -1, bd = maxPx * maxPx;
      pts.forEach((q, i) => { const dx = p.sx(q[0]) - p.sx(x), dy = p.sy(q[1]) - p.sy(y), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    allPlots.add(p);
    return p;
  };
  ML.redrawAll = () => { for (const p of allPlots) if (p.canvas.isConnected) p.redraw(); else allPlots.delete(p); };

  /* =====================================================================
     KUIS
     ML.quiz([{ q:'pertanyaan', options:['a','b','c'], answer:1, explain:'kenapa' }, ...])
     ===================================================================== */
  ML.quiz = function (qs) {
    const wrap = h('div', { class: 'quiz' });
    let answered = 0, correct = 0;
    const score = h('div', { class: 'quiz-score' });
    qs.forEach((item, qi) => {
      const box = h('div', { class: 'q' }, h('div', { class: 'q-text', html: qi + 1 + '. ' + item.q }));
      const explain = h('div', { class: 'explain' });
      const btns = item.options.map((opt, oi) =>
        h('button', { class: 'opt', html: opt, onclick: () => {
          if (box.dataset.done) return; box.dataset.done = 1; answered++;
          const ok = oi === item.answer; if (ok) correct++;
          btns[item.answer].classList.add('correct'); btns[item.answer].insertAdjacentHTML('beforeend', ' ✓');
          if (!ok) { btns[oi].classList.add('wrong'); btns[oi].insertAdjacentHTML('beforeend', ' ✗'); }
          explain.innerHTML = (ok ? '<b>Benar!</b> ' : '<b>Belum tepat.</b> ') + (item.explain || '');
          if (answered === qs.length) score.textContent = `Skor kamu: ${correct} dari ${qs.length} ${correct === qs.length ? '. Semua benar.' : '. Baca lagi bagian yang salah, lalu coba lagi.'}`;
        } }));
      btns.forEach((b) => box.append(b));
      box.append(explain);
      wrap.append(box);
    });
    wrap.append(score);
    return wrap;
  };

  /* =====================================================================
     ALUR (flow): ML.flow([{t:'Data', s:'kecil'}, ...], activeIndex)
     return {el, set(i)}  — set(i) menyorot langkah ke-i
     ===================================================================== */
  ML.flow = function (nodes, active) {
    const el = h('div', { class: 'flow' });
    const els = [];
    nodes.forEach((n, i) => {
      if (i) el.append(h('div', { class: 'arrow' }, '→'));
      const d = h('div', { class: 'node', html: `<b>${n.t}</b>${n.s ? `<small>${n.s}</small>` : ''}` });
      if (n.tip) { d.addEventListener('mousemove', (e) => ML.tip.show(e.clientX, e.clientY, n.tip)); d.addEventListener('mouseleave', () => ML.tip.hide()); }
      els.push(d); el.append(d);
    });
    const api = { el, nodes: els, set(i) { els.forEach((d, j) => d.classList.toggle('on', j === i)); } };
    if (active != null) api.set(active);
    return api;
  };

  /* tabel sederhana: ML.table(['A','B'], [[1,2],[3,4]], {highlight: rowIndex}) — sel boleh HTML */
  ML.table = function (head, rows, op = {}) {
    const t = h('table', { class: 'tbl' });
    if (head) t.append(h('tr', {}, ...head.map((x) => h('th', { html: String(x) }))));
    rows.forEach((r, i) => t.append(h('tr', { class: op.highlight === i ? 'hl' : null }, ...r.map((x) => h('td', { html: String(x) })))));
    return h('div', { class: 'tbl-scroll' }, t);
  };

  /* fungsi matematika umum */
  ML.sigmoid = (z) => 1 / (1 + Math.exp(-z));
  ML.dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
  ML.norm = (a) => Math.sqrt(ML.dot(a, a));
  ML.softmax = (zs) => { const m = Math.max(...zs), e = zs.map((z) => Math.exp(z - m)), s = e.reduce((a, b) => a + b, 0); return e.map((v) => v / s); };
})();
