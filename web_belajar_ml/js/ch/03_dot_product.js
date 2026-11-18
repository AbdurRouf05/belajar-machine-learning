/* Bab 3 — Dot Product & Cosine Similarity */
ML.chapter({
  id: 'dot-product',
  num: 3,
  group: 'Dasar',
  title: 'Dot Product & Cosine Similarity',
  lead: 'Operasi kecil yang dipakai di mana-mana: <b>kalikan per posisi, lalu jumlahkan</b>. Hasilnya satu angka yang juga mengukur <b>seberapa searah</b> dua vektor.',
  render(el) {
    const { h, box, steps, fmt, fmtp } = ML;

    el.append(box('analogi', null, `
      Kamu belanja: <b>1</b> buku, <b>2</b> pulpen, <b>3</b> penghapus. Harganya: buku <b>4</b> ribu, pulpen <b>5</b> ribu, penghapus <b>6</b> ribu.
      Total bayar? Kalikan jumlah × harga untuk tiap barang, lalu jumlahkan:
      <br><code>1×4 + 2×5 + 3×6 = 4 + 10 + 18 = 32</code> ribu.
      <br><br>Selamat, kamu baru saja menghitung <b>dot product</b>! Daftar jumlah <code>[1, 2, 3]</code> dan daftar harga <code>[4, 5, 6]</code>
      masing-masing disebut <b>vektor</b> (= daftar angka berurutan).`));

    // ---------- rumus ----------
    el.append(h('h2', {}, 'Cara Menghitung Dot Product'));
    el.append(box('rumus', null, ML.formula(
      '<b>a</b> · <b>b</b> = <span class="var">a</span><sub>1</sub><span class="var">b</span><sub>1</sub> + <span class="var">a</span><sub>2</sub><span class="var">b</span><sub>2</sub> + … + <span class="var">a</span><sub>n</sub><span class="var">b</span><sub>n</sub>',
      [['<b>a</b>, <b>b</b>', 'dua vektor (daftar angka) yang <b>panjangnya harus sama</b>'],
        ['a<sub>1</sub>, b<sub>1</sub>', 'angka di posisi ke-1 dari a dan dari b (a<sub>2</sub>, b<sub>2</sub> = posisi ke-2, dst.)'],
        ['n', 'banyaknya angka di dalam vektor (dimensi)'],
        ['·', 'tanda dot product (dibaca "a dot b")'],
        ['hasil', '<b>satu angka</b> saja (disebut skalar), bukan vektor']])));

    // ---------- editor vektor + animasi ----------
    el.append(h('h3', {}, 'Coba: Kalikan per Posisi, lalu Jumlahkan'));
    el.append(box('coba', null, 'Ganti angka di vektor <b>a</b> dan <b>b</b>, atau tambah/kurangi jumlah posisinya. Tekan <b>Putar animasi</b> untuk melihat urutan hitungnya pelan-pelan.'));
    let A = [1, 2, 3], B = [4, 5, 6];
    const editor = h('div');
    const visual = h('div', { style: 'margin:12px 0' });
    const dotSteps = h('div');
    const btnAnim = h('button', { class: 'primary', onclick: () => animate() }, 'Putar animasi');
    const btnPlus = h('button', { onclick: () => { if (A.length < 6) { A.push(1); B.push(1); buildEditor(); update(); } } }, '+ posisi');
    const btnMinus = h('button', { onclick: () => { if (A.length > 2) { A.pop(); B.pop(); buildEditor(); update(); } } }, '− posisi');
    const btnReset = h('button', { onclick: () => { A = [1, 2, 3]; B = [4, 5, 6]; buildEditor(); update(); } }, '↺ contoh awal');
    el.append(editor, h('div', { class: 'controls' }, btnAnim, btnPlus, btnMinus, btnReset), visual, dotSteps);

    function buildEditor() {
      editor.innerHTML = '';
      [['a', A], ['b', B]].forEach(([name, V]) => {
        const row = h('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:4px 0' },
          h('b', { style: 'min-width:46px;white-space:nowrap;font-family:var(--mono)' }, name + ' = ['));
        V.forEach((v, i) => {
          const inp = h('input', { type: 'number', value: v, step: 1, 'aria-label': `${name} posisi ${i + 1}`, style: 'width:68px' });
          inp.addEventListener('input', () => { const x = parseFloat(inp.value); if (isFinite(x)) { V[i] = x; update(); } });
          row.append(inp);
        });
        row.append(h('b', { style: 'font-family:var(--mono)' }, ']'));
        editor.append(row);
      });
    }

    const cell = (txt, st) => h('div', { style: 'font-family:var(--mono);font-size:17px;text-align:center;padding:4px 0;' + (st || '') }, txt);
    let cols = [], sumEl = null, timers = [];
    function drawVisual() {
      visual.innerHTML = '';
      const n = A.length;
      const grid = h('div', { style: `display:grid;grid-template-columns:70px repeat(${n}, minmax(64px, 90px));gap:4px 8px;align-items:center` });
      const lab = (t) => h('div', { class: 'small muted', style: 'text-align:right' }, t);
      cols = [];
      const rows = [[], [], [], [], []];
      for (let i = 0; i < n; i++) {
        const prod = A[i] * B[i];
        const c = {
          a: cell(fmt(A[i], 3), 'background:var(--surface);border:1px solid var(--border);border-radius:6px'),
          x: cell('×', 'color:var(--text-3)'),
          b: cell(fmt(B[i], 3), 'background:var(--surface);border:1px solid var(--border);border-radius:6px'),
          d: cell('↓', 'color:var(--text-3)'),
          p: cell(fmt(prod, 3), 'background:var(--surface-2);border:1px solid var(--axis);border-radius:6px;font-weight:700'),
        };
        cols.push(c);
        rows[0].push(c.a); rows[1].push(c.x); rows[2].push(c.b); rows[3].push(c.d); rows[4].push(c.p);
      }
      const labels = ['vektor a', '', 'vektor b', '', 'hasil kali'];
      rows.forEach((r, k) => { grid.append(lab(labels[k]), ...r); });
      const total = ML.dot(A, B);
      sumEl = h('div', { style: 'margin-top:10px;font-size:17px' },
        h('span', { class: 'muted' }, 'Jumlahkan semua hasil kali: '),
        h('span', { style: 'font-family:var(--mono)', html: A.map((v, i) => fmtp(v * B[i], 3)).join(' + ') + ' = ' }),
        h('span', { style: 'font-family:var(--mono);font-size:22px;font-weight:700;padding:2px 10px;border-radius:8px;border:2px solid var(--axis)' }, fmt(total, 3)),
        h('span', { class: 'muted small' }, '  ← satu angka (skalar)'));
      visual.append(h('div', { style: 'overflow-x:auto' }, grid), sumEl);
    }
    function animate() {
      timers.forEach(clearTimeout); timers = [];
      drawVisual();
      cols.forEach((c) => { c.p.style.visibility = 'hidden'; });
      sumEl.style.visibility = 'hidden';
      const hl = 'outline:3px solid var(--accent);outline-offset:1px;';
      cols.forEach((c, i) => {
        timers.push(setTimeout(() => {
          cols.forEach((o) => { o.a.style.outline = o.b.style.outline = 'none'; });
          c.a.style.cssText += hl; c.b.style.cssText += hl;
          c.p.style.visibility = 'visible';
        }, 300 + i * 900));
      });
      timers.push(setTimeout(() => {
        cols.forEach((o) => { o.a.style.outline = o.b.style.outline = 'none'; });
        sumEl.style.visibility = 'visible';
      }, 300 + cols.length * 900));
    }

    // ---------- cosine ----------
    const cosHead = h('h2', {}, 'Arti Dot Product: Mengukur "Searah atau Tidak"');
    const cosIntro = h('p', { html: `Bayangkan vektor sebagai <b>panah</b>. Vektor <code>[3, 1]</code> = panah yang ke kanan 3 langkah dan ke atas 1 langkah.
      Dot product ternyata juga bisa ditulis dengan <b>sudut θ</b> (theta) di antara dua panah:` });
    const cosF1 = box('rumus', 'Hubungan dot product dan sudut', ML.formula(
      '<b>a</b> · <b>b</b> = ‖<b>a</b>‖ × ‖<b>b</b>‖ × cos θ',
      [['‖a‖', '<b>panjang</b> panah a (dibaca "norm a")'], ['θ', 'sudut di antara dua panah'],
        ['cos θ', '"cosinus" sudut: 1 kalau sudutnya 0° (searah), 0 kalau 90° (tegak lurus), −1 kalau 180° (berlawanan)']]));
    const cosTbl = ML.table(['Hasil dot product', 'Sudut', 'Artinya'], [
      ['<b>positif</b>', 'kurang dari 90°', 'arahnya mirip'],
      ['<b>nol</b>', 'tepat 90°', 'tegak lurus, tidak berhubungan'],
      ['<b>negatif</b>', 'lebih dari 90°', 'arahnya berlawanan'],
    ]);
    const cosF2 = box('rumus', 'Cosine Similarity', ML.formula(
      'cos θ = ' + ML.frac('<b>a</b> · <b>b</b>', '‖<b>a</b>‖ × ‖<b>b</b>‖') + ' &nbsp;&nbsp;&nbsp; ‖<b>a</b>‖ = ' + ML.sqrt('<span class="var">a</span><sub>1</sub>² + <span class="var">a</span><sub>2</sub>² + … + <span class="var">a</span><sub>n</sub>²'),
      [['cos θ', '<b>cosine similarity</b> = kemiripan arah, nilainya selalu antara −1 dan 1'],
        ['a · b', 'dot product (dari bagian atas)'],
        ['‖a‖', 'panjang vektor a = akar dari jumlah kuadrat isinya (rumus Pythagoras, tapi boleh lebih dari 2 sisi)'],
        ['kenapa dibagi?', 'supaya <b>panjang</b> panah tidak berpengaruh, yang diukur hanya <b>arah</b>-nya']]));
    el.append(cosHead, cosIntro, cosF1, cosTbl, cosF2);

    const cosStepsWrap = h('div');
    el.append(cosStepsWrap);

    function update() {
      drawVisual();
      const total = ML.dot(A, B);
      dotSteps.innerHTML = '';
      dotSteps.append(box('langkah', 'Langkah Hitung Dot Product (ikut berubah)', steps([
        ['Kalikan angka yang posisinya sama', A.map((v, i) => `${fmtp(v, 3)} × ${fmtp(B[i], 3)} = ${fmt(v * B[i], 3)}`).join('\n')],
        ['Jumlahkan semua hasil kali', A.map((v, i) => fmtp(v * B[i], 3)).join(' + ') + ` = <b>${fmt(total, 3)}</b>`],
      ])));
      // cosine 4 langkah
      const na = ML.norm(A), nb = ML.norm(B);
      cosStepsWrap.innerHTML = '';
      const sq = (V) => V.map((v) => fmtp(v, 3) + '²').join(' + ');
      const sqv = (V) => V.map((v) => fmt(v * v, 3)).join(' + ');
      if (na === 0 || nb === 0) {
        cosStepsWrap.append(box('info', 'Ada vektor nol', 'Kalau semua isi vektor 0, panjangnya 0 dan tidak bisa dibagi. Panah dengan panjang 0 tidak punya arah, jadi cosine similarity-nya tidak terdefinisi.'));
        return;
      }
      const cos = total / (na * nb);
      cosStepsWrap.append(box('langkah', `Langkah Hitung Cosine Similarity untuk a = [${A.map((v) => fmt(v, 3)).join(', ')}] dan b = [${B.map((v) => fmt(v, 3)).join(', ')}]`, steps([
        ['Dot product (sudah dihitung di atas)', `a · b = ${fmt(total, 3)}`],
        ['Panjang vektor a', `‖a‖ = √(${sq(A)}) = √(${sqv(A)}) = √${fmt(na * na, 3)} = ${fmt(na, 3)}`],
        ['Panjang vektor b', `‖b‖ = √(${sq(B)}) = √(${sqv(B)}) = √${fmt(nb * nb, 3)} = ${fmt(nb, 3)}`],
        ['Bagi dot product dengan perkalian kedua panjang', `cos θ = ${fmt(total, 3)} ÷ (${fmt(na, 3)} × ${fmt(nb, 3)})\n      = ${fmt(total, 3)} ÷ ${fmt(na * nb, 3)}\n      = <b>${fmt(cos, 2)}</b>   → ${reading(cos).short}`],
      ])));
    }

    function reading(c) {
      if (c > 0.95) return { short: 'hampir searah (sangat mirip)', long: 'Kedua panah <b>hampir searah</b>. Dalam ML artinya: <b>sangat mirip</b>.' };
      if (c > 0.05) return { short: 'cenderung searah (mirip)', long: 'Kedua panah <b>cenderung searah</b> (sudut kurang dari 90°). Artinya: <b>cukup mirip</b>.' };
      if (c >= -0.05) return { short: 'tegak lurus (tidak berhubungan)', long: 'Kedua panah <b>(hampir) tegak lurus</b>, sudut sekitar 90°. Artinya: <b>tidak berhubungan</b>.' };
      if (c >= -0.95) return { short: 'cenderung berlawanan', long: 'Kedua panah <b>cenderung berlawanan</b> (sudut lebih dari 90°). Artinya: <b>tidak mirip / berkebalikan</b>.' };
      return { short: 'hampir berlawanan arah', long: 'Kedua panah <b>hampir berlawanan arah</b> (sekitar 180°). Artinya: <b>berkebalikan</b>.' };
    }

    buildEditor();
    update();

    // ---------- demo 2D drag ----------
    el.append(h('h2', {}, 'Coba: Tarik Dua Panah'));
    el.append(box('coba', null, `<b>Tarik ujung panah</b> a atau b dengan mouse (atau jari). Angka di bawah grafik langsung berubah.
      Coba buat kedua panah searah, tegak lurus (membentuk huruf L), lalu berlawanan.
      Perhatikan: kalau panah diperpanjang tanpa mengubah arah, dot product berubah tapi <b>cosine tetap</b>.`));
    const V = { a: [4, 1], b: [2, 3] };
    let drag = null;
    const LIM = 5;
    const vp = ML.plot({ height: 420, x: [-LIM, LIM], y: [-LIM, LIM], pad: { l: 40, r: 16, t: 14, b: 30 },
      legend: [{ label: 'vektor a', color: 'c1', shape: 'line' }, { label: 'vektor b', color: 'c2', shape: 'line' }],
      caption: 'Kotak grid = 1 satuan. Ujung panah menempel ke kelipatan 0.5 supaya mudah membuat sudut 90°.' });
    const readout = h('div', { class: 'grid3', style: 'margin:8px 0' });
    const verbal = h('div', { class: 'box info', style: 'margin:8px 0' });
    const presets = h('div', { class: 'controls' },
      h('span', { class: 'small muted' }, 'Contoh cepat:'),
      h('button', { onclick: () => setV([4, 1], [2, 0.5]) }, 'searah'),
      h('button', { onclick: () => setV([3, 1], [-1, 3]) }, 'tegak lurus'),
      h('button', { onclick: () => setV([3, 1], [-3, -1]) }, 'berlawanan'),
      h('button', { onclick: () => setV([4, 1], [1, 4]) }, 'agak mirip'));
    function setV(a, b) { V.a = a; V.b = b; refresh2d(); }

    vp.draw((p) => {
      // jaga perbandingan 1:1 supaya sudut tidak terdistorsi
      const pw = p.W - p.pad.l - p.pad.r, ph = p.H - p.pad.t - p.pad.b;
      const half = LIM * pw / ph;
      p.x = [-half, half];
      p.xTicks = []; for (let t = Math.ceil(-half); t <= Math.floor(half); t++) p.xTicks.push(t);
      p.yTicks = []; for (let t = -LIM; t <= LIM; t++) p.yTicks.push(t);
      p.clear(); p.grid(); p.axes();
      const [ax, ay] = V.a, [bx, by] = V.b;
      // busur sudut
      const ta = Math.atan2(ay, ax), tb = Math.atan2(by, bx);
      let d = tb - ta; while (d > Math.PI) d -= 2 * Math.PI; while (d <= -Math.PI) d += 2 * Math.PI;
      const cx = p.sx(0), cy = p.sy(0), R = 34;
      if (ML.norm(V.a) > 0 && ML.norm(V.b) > 0) {
        p.ctx.save(); p.ctx.strokeStyle = p.col('text-2'); p.ctx.lineWidth = 1.5; p.ctx.beginPath();
        p.ctx.arc(cx, cy, R, -ta, -tb, d > 0); p.ctx.stroke(); p.ctx.restore();
        const tm = ta + d / 2, ang = Math.abs(d) * 180 / Math.PI;
        const lx = cx + Math.cos(tm) * (R + 22), ly = cy - Math.sin(tm) * (R + 22);
        p.text(p.ix(lx), p.iy(ly), 'θ = ' + fmt(ang, 0) + '°', { size: 13, bold: true, bg: true });
      }
      p.arrow(0, 0, ax, ay, { color: 'c1', width: 3 });
      p.arrow(0, 0, bx, by, { color: 'c2', width: 3 });
      p.point(ax, ay, { color: 'c1', r: 7 });
      p.point(bx, by, { color: 'c2', r: 7, shape: 'square' });
      p.text(ax, ay, `a (${fmt(ax, 1)}, ${fmt(ay, 1)})`, { dx: 12, dy: -12, align: 'left', bold: true, bg: true });
      p.text(bx, by, `b (${fmt(bx, 1)}, ${fmt(by, 1)})`, { dx: 12, dy: -12, align: 'left', bold: true, bg: true });
    });
    vp.onDrag({
      start: (x, y) => {
        const k = vp.nearest([V.a, V.b], x, y, 22);
        drag = k === 0 ? 'a' : k === 1 ? 'b' : null;
        return !!drag;
      },
      move: (x, y) => {
        const snap = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v * 2) / 2));
        const nx = snap(x, Math.ceil(vp.x[0] * 2) / 2, Math.floor(vp.x[1] * 2) / 2), ny = snap(y, -LIM, LIM);
        if (nx === 0 && ny === 0) return;
        V[drag] = [nx, ny]; refresh2d();
      },
      end: () => { drag = null; },
    });
    vp.canvas.style.cursor = 'grab';
    vp.onHover((x, y) => {
      const k = vp.nearest([V.a, V.b], x, y, 22);
      if (k < 0) return null;
      const n = k ? 'b' : 'a', v = V[n];
      return `<b>vektor ${n}</b> = [${fmt(v[0], 1)}, ${fmt(v[1], 1)}]<br>panjang ‖${n}‖ = ${fmt(ML.norm(v), 3)}<br><i>tarik untuk menggeser</i>`;
    });
    el.append(presets, h('div', { style: 'max-width:640px' }, vp.el), readout, verbal);

    // skala cosine −1..1
    el.append(h('h3', {}, 'Skala Cosine Similarity: −1 sampai 1'));
    let curCos = 0;
    const sp = ML.plot({ height: 110, x: [-1.08, 1.08], y: [0, 1], pad: { l: 20, r: 20, t: 8, b: 8 },
      caption: 'Penanda bulat = cosine dari dua panah di atas. Contoh kira-kira dari Word2Vec: "raja" vs "ratu" ≈ 0.85 (mirip), "raja" vs "pesawat" ≈ 0.05 (tidak berhubungan).' });
    sp.draw((p) => {
      p.clear();
      const Y = 0.5;
      p.line(-1, Y, 1, Y, { color: 'axis', width: 2 });
      [-1, -0.5, 0, 0.5, 1].forEach((t) => {
        p.line(t, Y - 0.06, t, Y + 0.06, { color: 'axis', width: 1.5 });
        p.text(t, Y, fmt(t, 1), { color: 'text-2', size: 12, base: 'top', dy: 12 });
      });
      p.text(-1, Y, 'berlawanan', { color: 'text-2', size: 12.5, base: 'top', dy: 30, align: 'left', dx: -6 });
      p.text(0, Y, 'tidak berhubungan', { color: 'text-2', size: 12.5, base: 'top', dy: 30 });
      p.text(1, Y, 'arahnya sama', { color: 'text-2', size: 12.5, base: 'top', dy: 30, align: 'right', dx: 6 });
      p.point(curCos, Y, { color: 'c3', r: 8, ring: true });
      p.text(curCos, Y, 'cos = ' + fmt(curCos, 2), { base: 'bottom', dy: -16, bold: true, size: 12.5, bg: true, align: curCos > 0.75 ? 'right' : curCos < -0.75 ? 'left' : 'center' });
    });
    sp.onHover((x) => {
      if (x < -1 || x > 1) return null;
      return `cos = ${fmt(x, 2)} → sudut ≈ ${fmt(Math.acos(x) * 180 / Math.PI, 0)}°<br>${reading(x).short}`;
    });
    el.append(sp.el);

    function refresh2d() {
      const a = V.a, b = V.b, dot = ML.dot(a, b), na = ML.norm(a), nb = ML.norm(b);
      const cos = dot / (na * nb), ang = Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI;
      curCos = cos;
      readout.innerHTML = '';
      readout.append(
        ML.html(`<div class="stat"><div class="k">dot product a · b</div><div class="v">${fmt(dot, 2)}</div>
          <div class="d">${fmtp(a[0], 1)}×${fmtp(b[0], 1)} + ${fmtp(a[1], 1)}×${fmtp(b[1], 1)}</div></div>`),
        ML.html(`<div class="stat"><div class="k">cosine similarity</div><div class="v">${fmt(cos, 2)}</div>
          <div class="d">${fmt(dot, 2)} ÷ (${fmt(na, 2)} × ${fmt(nb, 2)})</div></div>`),
        ML.html(`<div class="stat"><div class="k">sudut θ</div><div class="v">${fmt(ang, 0)}°</div>
          <div class="d">‖a‖ = ${fmt(na, 2)}, ‖b‖ = ${fmt(nb, 2)}</div></div>`));
      verbal.innerHTML = '<b>Cara membaca:</b> ' + reading(cos).long;
      vp.redraw(); sp.redraw();
    }
    refresh2d();

    // ---------- dipakai di mana ----------
    el.append(h('h2', {}, 'Dot Product Dipakai di Mana Saja?'));
    el.append(ML.table(['Tempat', 'Bentuknya', 'Bab'], [
      ['<b>Neuron</b> (jaringan saraf)', '<code>z = w · x + b</code> → input dikali bobot lalu dijumlah', '<a href="#sigmoid">Bobot, Bias & Sigmoid</a>'],
      ['<b>Logistic Regression</b>', '<code>z = w · x + b</code>, lalu masuk sigmoid', '<a href="#logreg">Logistic Regression</a>'],
      ['<b>SVM</b>', 'garis pemisah: <code>w · x + b = 0</code>', '<a href="#svm">SVM</a>'],
      ['<b>TF-IDF</b> (pencarian dokumen)', 'cosine similarity antar dokumen', '<a href="#tfidf">TF-IDF</a>'],
      ['<b>Word2Vec</b>', 'cosine similarity antar kata (cari kata mirip)', '<a href="#word2vec">Word2Vec</a>'],
    ]));
    el.append(box('info', 'Hubungan ke bab berikutnya', `Rumus <code>z = w₁x₁ + w₂x₂ + … + b</code> yang akan sering kamu lihat
      <b>sebenarnya adalah dot product</b> <code>w · x</code> ditambah bias. Contoh: w = [0.6, 2.0], x = [5, 0.8] →
      w · x = 0.6×5 + 2.0×0.8 = 3 + 1.6 = 4.6.`));
    el.append(box('bisindo', null, `Di proyek BISINDO, satu frame tangan = vektor <b>63 angka</b>.
      SVM menghitung <code>w · x + b</code> untuk vektor itu: 63 perkalian lalu dijumlahkan, persis seperti demo di atas, hanya lebih panjang.
      Tanda hasilnya (positif / negatif) menentukan kelas mana yang dipilih.`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Berapa dot product dari [2, 3] dan [4, 1]?', options: ['10', '11', '[8, 3]', '14'], answer: 1, explain: '2×4 + 3×1 = 8 + 3 = 11. Hasilnya selalu satu angka, bukan vektor.' },
      { q: 'Dot product dua vektor bernilai 0. Artinya kedua panah…', options: ['Searah', 'Tegak lurus (90°)', 'Berlawanan arah'], answer: 1, explain: 'cos 90° = 0, jadi dot product = 0. Artinya tidak berhubungan.' },
      { q: 'Cosine similarity "raja" vs "ratu" = 0.85. Artinya…', options: ['Kata itu sangat berbeda', 'Arah vektornya mirip, maknanya berdekatan', 'Panjang vektornya 0.85'], answer: 1, explain: 'Mendekati 1 = arahnya hampir sama = maknanya mirip. Cosine tidak mengukur panjang.' },
      { q: 'Vektor b diperpanjang 2 kali lipat (arah tetap). Yang terjadi…', options: ['Dot product dan cosine tetap', 'Dot product jadi 2×, cosine tetap', 'Keduanya jadi 2×'], answer: 1, explain: 'Dot product ikut membesar karena panjangnya berubah. Cosine dibagi panjang, jadi hanya melihat arah, sehingga tetap.' },
    ]));
  },
});
