/* Bab 4 — Bobot, Bias & Sigmoid */
ML.chapter({
  id: 'sigmoid',
  num: 4,
  group: 'Dasar',
  title: 'Bobot, Bias & Sigmoid',
  lead: 'Tiga bagian yang bekerja bersama di dalam satu <b>neuron</b> (dan di Logistic Regression). Kita pakai satu contoh dari awal sampai akhir: <b>menebak apakah mahasiswa lulus</b>.',
  render(el) {
    const { h, box, steps, fmt, fmtp, sigmoid } = ML;
    const DEF = { x1: 5, x2: 0.8, w1: 0.6, w2: 2.0, b: -4 };
    const pct = (p) => fmt(p * 100, 1) + '%';
    /* label keputusan: kelas 1 (lulus) = c1 lingkaran, kelas 0 = c2 kotak */
    const decHTML = (p) => p >= 0.5
      ? '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:var(--c1);margin-right:6px"></span><b>LULUS</b>'
      : '<span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:var(--c2);margin-right:6px"></span><b>TIDAK LULUS</b>';

    el.append(box('info', 'Contoh yang dipakai di seluruh bab', `
      Kita ingin menebak apakah seorang mahasiswa <b>lulus</b> ujian dari dua fitur:
      <ul style="margin:4px 0;padding-left:20px">
        <li><b>x₁</b> = jam belajar = <b>5</b> jam</li>
        <li><b>x₂</b> = kehadiran = <b>0.8</b> (artinya 80% pertemuan hadir)</li>
      </ul>
      Model sudah dilatih dan mendapat bobot <b>w₁ = 0.6</b>, <b>w₂ = 2.0</b>, dan bias <b>b = −4</b>.`));
    el.append(ML.flow([
      { t: 'Input', s: 'x₁ = 5, x₂ = 0.8' },
      { t: '× Bobot', s: '3 dan 1.6' },
      { t: 'Σ + Bias', s: 'z = 0.6' },
      { t: 'Sigmoid', s: 'σ(0.6) = 0.6457' },
      { t: 'Keputusan', s: '64.6% → LULUS' },
    ]).el);

    // ---------- 1. bobot ----------
    el.append(h('h2', {}, '1. Bobot (w): Seberapa Penting Tiap Fitur'));
    el.append(box('analogi', null, `Ingat cara dosen menghitung nilai akhir: <b>UTS 30%, UAS 40%, tugas 30%</b>.
      Angka persen itu adalah <b>bobot</b>: UAS paling menentukan karena bobotnya paling besar.
      <br><br>Bedanya di ML: bobot <b>tidak ditentukan manusia</b>. Mesin mulai dari angka acak, lalu memperbaikinya sedikit demi sedikit
      sampai tebakannya bagus (caranya ada di bab Gradient Descent).`));
    const bars = [['kehadiran', 'w₂', 2.0, 'paling berpengaruh'], ['jam belajar', 'w₁', 0.6, ''], ['warna baju', 'w₃', 0.0, 'tidak berpengaruh sama sekali'], ['main game', 'w₄', -1.5, 'menarik ke arah "tidak lulus"']];
    const barBox = h('div', { class: 'canvas-wrap', style: 'padding:6px 14px 12px' },
      ML.legend([{ label: 'bobot positif (mendorong ke "lulus")', color: 'c1', shape: 'square' }, { label: 'bobot negatif (menarik ke "tidak lulus")', color: 'c2', shape: 'square' }]));
    bars.forEach(([name, sym, w, note]) => {
      barBox.append(h('div', { style: 'display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:center;margin-top:8px' },
        h('div', { class: 'small', style: 'text-align:right' }, `${name}  ${sym} = ${fmt(w, 1)}`),
        h('div', { style: 'display:flex;align-items:center;gap:8px' },
          h('div', { style: `height:16px;width:${Math.max(2, Math.abs(w) / 2 * 60)}%;border-radius:0 4px 4px 0;background:var(--${w > 0 ? 'c1' : w < 0 ? 'c2' : 'text-3'})` }),
          h('span', { class: 'small muted' }, note))));
    });
    el.append(barBox);
    el.append(ML.table(['Nilai bobot', 'Artinya'], [
      ['positif besar', 'fitur ini sangat <b>mendorong</b> ke arah "ya" (lulus)'],
      ['mendekati 0', 'fitur ini hampir <b>tidak berpengaruh</b>'],
      ['negatif', 'fitur ini <b>menarik</b> ke arah "tidak"'],
    ]));

    // ---------- 2. bias ----------
    el.append(h('h2', {}, '2. Bias (b): Titik Awal'));
    el.append(box('analogi', null, `Bayangkan setiap mahasiswa mulai dari <b>skor awal −4</b> (bias). Skor ini sama untuk semua orang,
      tidak peduli berapa jam belajarnya. Lalu jam belajar dan kehadiran <b>menambah</b> skornya.
      Artinya: "secara bawaan, cenderung <b>tidak lulus</b>, kecuali belajar dan hadirnya cukup".
      <br><br>Mirip persamaan garis di SMA: <code>y = mx + c</code>. <b>m</b> = bobot (kemiringan), <b>c</b> = bias (menggeser garis naik/turun).
      Tanpa <b>c</b>, garis <b>wajib</b> lewat titik (0, 0), sehingga modelnya kaku.`));
    el.append(h('p', {}, 'Bias juga dipelajari mesin, sama seperti bobot. Keduanya disebut parameter. (Catatan: "bias" di sini tidak ada hubungannya dengan "berprasangka/tidak adil".)'));
    el.append(h('h3', {}, 'Coba: Dengan vs Tanpa Bias'));
    el.append(box('coba', null, `Model sederhana dengan satu fitur: <code>z = 0.6 × jam + b</code>, lalu peluang lulus = σ(z).
      Geser slider <b>b</b> dan lihat kurvanya bergeser ke kiri/kanan. Arahkan mouse ke grafik untuk membaca nilainya.`));
    const bS = ML.slider({ label: 'bias b', min: -8, max: 3, step: 0.1, value: -4, digits: 1, onInput: () => { bp.redraw(); biasNote(); } });
    const bNote = h('p', { class: 'small' });
    const bp = ML.plot({ height: 300, x: [0, 12], y: [0, 1], xLabel: 'jam belajar', yLabel: 'peluang lulus',
      legend: [{ label: 'dengan bias (b dari slider)', color: 'c1', shape: 'line' }, { label: 'tanpa bias (b = 0)', color: 'c2', shape: 'line' }],
      yFmt: (v) => fmt(v * 100, 0) + '%' });
    let bHover = null;
    bp.draw((p) => {
      const b = bS.value;
      p.clear(); p.grid(); p.axes();
      p.hline(0.5, { color: 'text-3', width: 1, dash: [5, 4] });
      p.text(12, 0.5, 'batas 50%', { align: 'right', base: 'bottom', dy: -3, dx: -4, color: 'text-2', size: 12 });
      p.fn((x) => sigmoid(0.6 * x), { color: 'c2', width: 2, dash: [7, 5] });
      p.fn((x) => sigmoid(0.6 * x + b), { color: 'c1', width: 2.5 });
      p.point(0, 0.5, { color: 'c2', r: 6, shape: 'square' });
      p.text(0, 0.5, '0 jam → 50%?!', { align: 'left', dx: 10, dy: -14, size: 12.5, bg: true });
      const cross = -b / 0.6;
      if (cross >= 0 && cross <= 12) {
        p.point(cross, 0.5, { color: 'c1', r: 6 });
        p.text(cross, 0.5, `50% di ${fmt(cross, 1)} jam`, { align: 'left', dx: 10, dy: 16, size: 12.5, bg: true });
      }
      if (bHover != null) {
        p.vline(bHover, { color: 'text-2', width: 1 });
        p.point(bHover, sigmoid(0.6 * bHover + b), { color: 'c1', r: 5 });
        p.point(bHover, sigmoid(0.6 * bHover), { color: 'c2', r: 5, shape: 'square' });
      }
    });
    bp.onHover((x) => {
      if (x < 0 || x > 12) { if (bHover != null) { bHover = null; bp.redraw(); } return null; }
      bHover = x; bp.redraw();
      const b = bS.value;
      return `<b>${fmt(x, 1)} jam belajar</b><br>dengan bias: σ(0.6×${fmt(x, 1)} ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b), 1)}) = ${pct(sigmoid(0.6 * x + b))}<br>tanpa bias: σ(0.6×${fmt(x, 1)}) = ${pct(sigmoid(0.6 * x))}`;
    });
    bp.canvas.addEventListener('mouseleave', () => { bHover = null; bp.redraw(); });
    function biasNote() {
      const b = bS.value, cross = -b / 0.6;
      bNote.innerHTML = `<b>Tanpa bias</b>, orang yang belajar <b>0 jam</b> tetap dapat peluang lulus 50% (karena σ(0) = 0.5). Tidak masuk akal!
        <br><b>Dengan b = ${fmt(b, 1)}</b>, peluang 50% baru tercapai saat 0.6 × jam = ${fmt(-b, 1)} → jam = ${fmt(-b, 1)} ÷ 0.6 = <b>${fmt(cross, 2)} jam</b>.
        ${b < 0 ? 'Bias negatif menggeser kurva ke kanan (lebih susah lulus).' : b > 0 ? 'Bias positif menggeser kurva ke kiri (lebih mudah lulus).' : 'b = 0 sama dengan tanpa bias.'}`;
    }
    el.append(h('div', { class: 'controls' }, bS.el), bp.el, bNote);
    biasNote();

    // ---------- 3. sigmoid ----------
    el.append(h('h2', {}, '3. Sigmoid (σ): Pemeras Angka ke 0 sampai 1'));
    el.append(box('analogi', null, `Setelah dikali bobot dan ditambah bias, kita dapat angka <b>z</b>. Masalahnya, z bisa berapa saja:
      −100, 0.6, 57… Angka 57 itu artinya apa? Belum bisa dibaca sebagai peluang.
      <br><br>Sigmoid itu seperti <b>alat pemeras</b>: angka sebesar apa pun dimasukkan, keluarnya pasti di antara <b>0 dan 1</b>.
      z besar → hampir 1 (hampir pasti "ya"). z sangat negatif → hampir 0 (hampir pasti "tidak"). z = 0 → tepat 0.5 (ragu-ragu).`));
    el.append(box('rumus', null, ML.formula(
      '<span class="var">z</span> = <span class="var">w</span><sub>1</sub><span class="var">x</span><sub>1</sub> + <span class="var">w</span><sub>2</sub><span class="var">x</span><sub>2</sub> + <span class="var">b</span>' +
      ' &nbsp;&nbsp;&nbsp;&nbsp; σ(<span class="var">z</span>) = ' + ML.frac('1', '1 + <span class="var">e</span><sup>−<span class="var">z</span></sup>'),
      [['x₁, x₂', 'input / fitur (jam belajar, kehadiran)'],
        ['w₁, w₂', 'bobot: seberapa penting tiap fitur'],
        ['b', 'bias: titik awal / penggeser'],
        ['z', 'skor mentah, bisa berapa saja. Bagian w₁x₁ + w₂x₂ adalah <a href="#dot-product">dot product</a> w · x'],
        ['e', 'bilangan Euler ≈ 2.718 (di kalkulator HP: tombol eˣ)'],
        ['σ(z)', 'hasil sigmoid = peluang, selalu antara 0 dan 1']])));
    const zs = [-5, -2.4, -2, 0, 0.6, 2, 2.8, 3, 5];
    const means = (s) => s < 0.05 ? 'hampir pasti "tidak"' : s < 0.3 ? 'cenderung "tidak"' : s < 0.45 ? 'agak "tidak"' : s <= 0.55 ? 'ragu-ragu (50 : 50)' : s < 0.7 ? 'agak "ya"' : s < 0.95 ? 'cenderung "ya"' : 'hampir pasti "ya"';
    el.append(h('p', {}, 'Tabel nilai sigmoid (dihitung langsung oleh halaman ini):'));
    el.append(ML.table(['z', 'σ(z)', 'Artinya'], zs.map((z) => {
      const s = sigmoid(z);
      return [fmt(z, 1), fmt(s, s < 0.02 || s > 0.98 ? 3 : 2), means(s)];
    }), { highlight: 3 }));

    // ---------- coba utama: neuron ----------
    el.append(h('h2', {}, 'Coba Sendiri: Neuron Lengkap'));
    el.append(box('coba', null, `Geser slider apa saja. Diagram neuron, langkah hitung, dan titik di kurva sigmoid langsung berubah.
      Mulai dari contoh: x₁ = 5, x₂ = 0.8, w₁ = 0.6, w₂ = 2.0, b = −4.`));
    const S = {};
    const mk = (key, label, min, max, step, digits) => (S[key] = ML.slider({ label, min, max, step, value: DEF[key], digits, onInput: update }));
    const ctlIn = h('div', { class: 'controls' },
      mk('x1', 'x₁ jam belajar', 0, 10, 0.5, 1).el,
      mk('x2', 'x₂ kehadiran', 0, 1, 0.05, 2).el);
    const ctlW = h('div', { class: 'controls' },
      mk('w1', 'bobot w₁', -2, 2, 0.1, 1).el,
      mk('w2', 'bobot w₂', -4, 4, 0.1, 1).el,
      mk('b', 'bias b', -8, 4, 0.1, 1).el,
      h('button', { onclick: () => { for (const k in DEF) S[k].value = DEF[k]; update(); } }, '↺ contoh awal'));
    el.append(h('div', { class: 'small muted' }, 'Input (data mahasiswa):'), ctlIn, h('div', { class: 'small muted' }, 'Parameter (hasil belajar mesin):'), ctlW);

    const neuron = h('div', { style: 'overflow-x:auto;margin:10px 0' });
    const nSteps = h('div');
    el.append(neuron);

    // kurva sigmoid
    let hz = null, cur = null;
    const sp = ML.plot({ height: 320, x: [-8, 8], y: [0, 1], xLabel: 'z (skor mentah)', yLabel: 'σ(z)',
      legend: [{ label: 'kurva sigmoid σ(z)', color: 'c1', shape: 'line' }, { label: 'z saat ini: ≥ 0.5 = lulus (bulat)', color: 'c1', shape: 'circle' }, { label: '< 0.5 = tidak lulus (kotak)', color: 'c2', shape: 'square' }],
      caption: 'Arahkan mouse ke grafik: garis bantu menunjukkan σ(z) di posisi mouse.' });
    sp.draw((p) => {
      p.clear(); p.grid(); p.axes();
      p.hline(0.5, { color: 'text-3', width: 1, dash: [5, 4] });
      p.text(-8, 0.5, 'threshold 0.5', { align: 'left', base: 'bottom', dx: 4, dy: -3, color: 'text-2', size: 12 });
      p.fn(sigmoid, { color: 'c1', width: 2.5 });
      if (hz != null) {
        const s = sigmoid(hz);
        p.line(hz, 0, hz, s, { color: 'text-2', width: 1, dash: [3, 3] });
        p.line(-8, s, hz, s, { color: 'text-2', width: 1, dash: [3, 3] });
        p.point(hz, s, { color: 'text-2', r: 4 });
      }
      if (cur) {
        const zc = Math.max(-8, Math.min(8, cur.z)), on = cur.p >= 0.5;
        p.line(zc, 0, zc, cur.p, { color: on ? 'c1' : 'c2', width: 1.5, dash: [4, 3] });
        p.point(zc, cur.p, { color: on ? 'c1' : 'c2', shape: on ? 'circle' : 'square', r: 7, ring: true });
        p.text(zc, cur.p, `z = ${fmt(cur.z, 2)} → σ = ${fmt(cur.p, 4)}`, { align: zc > 2 ? 'right' : 'left', dx: zc > 2 ? -14 : 14, dy: on ? 18 : -18, bold: true, size: 12.5, bg: true });
      }
    });
    sp.onHover((x) => {
      if (x < -8 || x > 8) { if (hz != null) { hz = null; sp.redraw(); } return null; }
      hz = x; sp.redraw();
      const s = sigmoid(x);
      return `z = ${fmt(x, 2)}<br>σ(z) = <b>${fmt(s, 4)}</b> (${pct(s)})<br>${s >= 0.5 ? 'di atas' : 'di bawah'} threshold → ${s >= 0.5 ? 'lulus' : 'tidak lulus'}`;
    });
    sp.canvas.addEventListener('mouseleave', () => { hz = null; sp.redraw(); });
    el.append(sp.el, nSteps);

    const nodeSt = 'background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:6px 10px;text-align:center;font-family:var(--mono);font-size:14px;white-space:nowrap';
    const arr = (t, extra) => h('div', { style: 'text-align:center;color:var(--text-2);font-size:13px;white-space:nowrap;' + (extra || ''), html: t });
    function drawNeuron(v, prod1, prod2, sum, z, p) {
      neuron.innerHTML = '';
      const g = h('div', { style: 'display:grid;grid-template-columns:auto auto auto auto auto auto auto auto auto auto auto;grid-template-rows:auto auto;gap:8px 6px;align-items:center;min-width:820px' });
      const span2 = 'grid-row:1 / span 2;';
      g.append(
        h('div', { style: nodeSt + ';grid-row:1;grid-column:1', html: `<span class="small muted" style="font-family:var(--sans)">jam belajar</span><br>x₁ = ${fmt(v.x1, 2)}` }),
        arr(`× w₁ (${fmt(v.w1, 1)}) →`, 'grid-row:1;grid-column:2'),
        h('div', { style: nodeSt + ';grid-row:1;grid-column:3' }, fmt(prod1, 3)),
        h('div', { style: nodeSt + ';grid-row:2;grid-column:1', html: `<span class="small muted" style="font-family:var(--sans)">kehadiran</span><br>x₂ = ${fmt(v.x2, 2)}` }),
        arr(`× w₂ (${fmt(v.w2, 1)}) →`, 'grid-row:2;grid-column:2'),
        h('div', { style: nodeSt + ';grid-row:2;grid-column:3' }, fmt(prod2, 3)),
        arr('→ Σ', span2 + 'grid-column:4'),
        h('div', { style: nodeSt + ';' + span2 + 'grid-column:5', html: `<span class="small muted" style="font-family:var(--sans)">jumlah</span><br>${fmt(sum, 3)}` }),
        arr(`+ b (${fmt(v.b, 1)}) →`, span2 + 'grid-column:6'),
        h('div', { style: nodeSt + ';' + span2 + 'grid-column:7;border:2px solid var(--axis)', html: `<span class="small muted" style="font-family:var(--sans)">skor</span><br><b>z = ${fmt(z, 3)}</b>` }),
        arr('→ σ →', span2 + 'grid-column:8'),
        h('div', { style: nodeSt + ';' + span2 + 'grid-column:9;border:2px solid var(--axis)', html: `<span class="small muted" style="font-family:var(--sans)">peluang</span><br><b>${fmt(p, 4)}</b> = ${pct(p)}` }),
        arr('→ ≥ 0.5? →', span2 + 'grid-column:10'),
        h('div', { style: nodeSt + ';' + span2 + 'grid-column:11;font-family:var(--sans)', html: decHTML(p) }));
      neuron.append(g);
    }

    function update() {
      const v = {}; for (const k in S) v[k] = S[k].value;
      const prod1 = v.w1 * v.x1, prod2 = v.w2 * v.x2, sum = prod1 + prod2, z = sum + v.b;
      const ez = Math.exp(-z), p = 1 / (1 + ez);
      cur = { z, p };
      drawNeuron(v, prod1, prod2, sum, z, p);
      nSteps.innerHTML = '';
      nSteps.append(box('langkah', 'Langkah Hitung (ikut berubah saat slider digeser)', steps([
        ['Kalikan tiap input dengan bobotnya', `w₁ × x₁ = ${fmtp(v.w1, 2)} × ${fmtp(v.x1, 2)} = ${fmt(prod1, 3)}\nw₂ × x₂ = ${fmtp(v.w2, 2)} × ${fmtp(v.x2, 2)} = ${fmt(prod2, 3)}`],
        ['Jumlahkan, lalu tambah bias → dapat z', `z = ${fmtp(prod1, 3)} + ${fmtp(prod2, 3)} + ${fmtp(v.b, 2)} = <b>${fmt(z, 3)}</b>`],
        ['Sigmoid, langkah a: ubah tanda z', `z = ${fmt(z, 3)}  →  −z = ${fmt(-z, 3)}`],
        ['Sigmoid, langkah b: hitung e pangkat −z (kalkulator: tombol eˣ)', `e^(${fmt(-z, 3)}) = ${fmt(ez, 4)}`],
        ['Sigmoid, langkah c: tambah 1', `1 + ${fmt(ez, 4)} = ${fmt(1 + ez, 4)}`],
        ['Sigmoid, langkah d: 1 dibagi hasilnya', `1 ÷ ${fmt(1 + ez, 4)} = <b>${fmt(p, 4)}</b>  (= ${pct(p)})`],
        ['Keputusan dengan threshold 0.5', `${fmt(p, 4)} ${p >= 0.5 ? '≥' : '<'} 0.5  →  ${p >= 0.5 ? 'LULUS' : 'TIDAK LULUS'}`],
      ])));
      sp.redraw();
    }
    update();

    // ---------- latihan ----------
    el.append(h('h2', {}, 'Latihan: Tebak Dulu, Baru Cek'));
    el.append(box('coba', null, `Bobot dan bias tetap (w₁ = 0.6, w₂ = 2.0, b = −4). Ada 3 mahasiswa berbeda.
      <b>Tebak</b> dulu tiap mahasiswa lulus atau tidak (boleh pakai feeling atau hitung sendiri), lalu tekan <b>Lihat jawaban</b>.`));
    const MHS = [['Rajin', 8, 1.0], ['Biasa', 5, 0.8], ['Malas', 1, 0.5]];
    const guess = [null, null, null];
    const pWrap = h('div');
    let revealed = false;
    function drawPractice() {
      pWrap.innerHTML = '';
      const t = h('table', { class: 'tbl' });
      t.append(h('tr', {}, ...['Mahasiswa', 'jam (x₁)', 'hadir (x₂)', 'Tebakanmu', 'z = 0.6×jam + 2.0×hadir − 4', 'σ(z)', 'Prediksi model', 'Cek'].map((s) => h('th', {}, s))));
      MHS.forEach(([nm, x1, x2], i) => {
        const z = 0.6 * x1 + 2.0 * x2 - 4, s = sigmoid(z), lulus = s >= 0.5;
        const bt = (val, lbl) => h('button', { class: guess[i] === val ? 'primary' : '', style: 'padding:3px 10px;margin:0 2px', disabled: revealed,
          onclick: () => { guess[i] = val; drawPractice(); } }, lbl);
        const ok = guess[i] === lulus;
        t.append(h('tr', {},
          h('td', {}, h('b', {}, nm)), h('td', {}, fmt(x1, 1)), h('td', {}, fmt(x2, 1)),
          h('td', {}, bt(true, 'Lulus'), bt(false, 'Tidak')),
          h('td', { style: 'font-family:var(--mono);text-align:left' }, revealed ? `${fmt(0.6 * x1, 2)} + ${fmt(2 * x2, 2)} − 4 = ${fmt(z, 2)}` : '?'),
          h('td', {}, revealed ? fmt(s, 2) : '?'),
          h('td', { html: revealed ? decHTML(s) : '?' }),
          h('td', { html: !revealed ? '' : guess[i] == null ? '<span class="muted small">tidak ditebak</span>' : ok ? '<span class="badge good">✓ benar</span>' : '<span class="badge bad">✗ salah</span>' })));
      });
      const nOk = MHS.filter(([, x1, x2], i) => guess[i] === (sigmoid(0.6 * x1 + 2 * x2 - 4) >= 0.5)).length;
      pWrap.append(h('div', { class: 'tbl-scroll' }, t),
        h('div', { class: 'controls' },
          revealed ? h('button', { onclick: () => { revealed = false; guess.fill(null); drawPractice(); } }, '↺ Ulangi')
            : h('button', { class: 'primary', onclick: () => { revealed = true; drawPractice(); } }, 'Lihat jawaban'),
          revealed ? h('span', {}, `Tebakan benar: ${nOk} dari 3. Perhatikan: z positif → σ di atas 0.5 → lulus; z negatif → σ di bawah 0.5.`) : null));
    }
    drawPractice();
    el.append(pWrap);

    el.append(box('bisindo', null, `Rumus <code>z = w · x + b</code> yang sama dipakai di proyek BISINDO, hanya saja <b>x</b> berisi <b>63 fitur</b>
      (posisi titik jari) sehingga ada 63 bobot. SVM memakai tanda z (positif / negatif) untuk memilih kelas.
      Logistic Regression memasukkan z ke sigmoid seperti di bab ini untuk mendapat peluang.`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Bobot w₂ (kehadiran) = 2.0, bobot w₁ (jam belajar) = 0.6. Artinya…', options: ['Jam belajar lebih penting', 'Kehadiran lebih berpengaruh pada hasil', 'Keduanya sama penting'], answer: 1, explain: 'Bobot = seberapa penting fitur. Makin besar bobotnya, makin besar pengaruhnya.' },
      { q: 'Berapa σ(0)?', options: ['0', '0.5', '1'], answer: 1, explain: 'σ(0) = 1 ÷ (1 + e⁰) = 1 ÷ (1 + 1) = 0.5. Artinya ragu-ragu 50 : 50.' },
      { q: 'Jika z = −2.4, prediksinya…', options: ['Lulus, karena σ > 0.5', 'Tidak lulus, karena σ(−2.4) ≈ 0.08 < 0.5', 'Tidak bisa dihitung karena z negatif'], answer: 1, explain: 'z negatif selalu menghasilkan σ di bawah 0.5. σ(−2.4) ≈ 0.08 → tidak lulus.' },
      { q: 'Apa gunanya bias?', options: ['Membuat model berprasangka', 'Menggeser titik awal, sehingga model tidak wajib lewat titik (0, 0)', 'Mengubah sigmoid menjadi garis lurus'], answer: 1, explain: 'Bias = titik awal/penggeser. Tanpa bias, input 0 selalu memberi z = 0 → peluang 50%.' },
    ]));
  },
});
