/* Bab 9 — Logistic Regression */
ML.chapter({
  id: 'logreg',
  num: 9,
  group: 'Algoritma Klasifikasi',
  title: 'Logistic Regression',
  lead: 'Algoritma klasifikasi paling sederhana: hitung <b>z = w·x + b</b>, ubah jadi <b>peluang</b> dengan sigmoid, lalu putuskan kelasnya.',
  render(el) {
    const { h, box, fmt, fmtp, sigmoid } = ML;
    const V = (s) => `<span class="var">${s}</span>`;

    /* ================= ANALOGI ================= */
    el.append(box('analogi', null, `
      Ingat ramalan cuaca: <b>"peluang hujan 70%"</b>. Ramalan itu tidak bilang "pasti hujan",
      tapi memberi <b>peluang</b> (angka antara 0 dan 1). Lalu <b>kamu</b> yang memutuskan:
      kalau peluangnya di atas 50%, bawa payung.<br><br>
      Logistic Regression bekerja persis seperti itu: dari data (fitur), ia menghitung <b>peluang</b> sesuatu
      termasuk <b>kelas 1</b> (misalnya "lulus"). Kalau peluangnya ≥ 0.5 → tebak kelas 1, kalau tidak → kelas 0.
      <br><br>Walaupun namanya ada kata "Regression", algoritma ini dipakai untuk <b>klasifikasi</b> (menebak kelompok).`));

    /* ================= ALUR ================= */
    el.append(h('h2', {}, 'Alurnya: dari Fitur sampai Kelas'));
    el.append(h('p', {}, 'Contoh: menebak apakah mahasiswa lulus dari 2 fitur, yaitu jam belajar per hari (x₁) dan kehadiran (x₂, 0 sampai 1). Bobotnya sudah "dipelajari": w₁ = 0.6, w₂ = 2.0, bias b = −4. Geser slider untuk mengganti data mahasiswanya.'));
    const W0 = [0.6, 2.0], B0 = -4;
    const flowWrap = h('div');
    const alurSteps = h('div');
    const sJam = ML.slider({ label: 'Jam belajar x₁', min: 0, max: 10, step: 0.5, value: 5, digits: 1, onInput: updAlur });
    const sHadir = ML.slider({ label: 'Kehadiran x₂', min: 0, max: 1, step: 0.05, value: 0.8, digits: 2, onInput: updAlur });
    const sThr = ML.slider({ label: 'Ambang (threshold)', min: 0.1, max: 0.9, step: 0.05, value: 0.5, digits: 2, onInput: updAlur });
    function updAlur() {
      const x1 = sJam.value, x2 = sHadir.value, t = sThr.value;
      const z = W0[0] * x1 + W0[1] * x2 + B0, p = sigmoid(z), k = p >= t ? 1 : 0;
      flowWrap.innerHTML = '';
      flowWrap.append(ML.flow([
        { t: 'Fitur x', s: `[${fmt(x1, 1)}, ${fmt(x2, 2)}]` },
        { t: 'z = w·x + b', s: 'z = ' + fmt(z, 2) },
        { t: 'Sigmoid σ(z)', s: 'ŷ = ' + fmt(p, 3) },
        { t: 'Ambang', s: `ŷ ${p >= t ? '≥' : '<'} ${fmt(t, 2)}` },
        { t: 'Kelas', s: k ? '1 = LULUS' : '0 = TIDAK LULUS' },
      ], 4).el);
      alurSteps.innerHTML = '';
      alurSteps.append(box('langkah', null, ML.steps([
        ['<b>Kalikan & jumlahkan</b> (dot product + bias)', `z = 0.6×${fmtp(x1, 1)} + 2.0×${fmtp(x2, 2)} + (−4) = ${fmt(0.6 * x1, 2)} + ${fmt(2 * x2, 2)} − 4 = <b>${fmt(z, 2)}</b>`],
        ['<b>Sigmoid</b>: ubah z jadi peluang 0–1', `ŷ = 1 ÷ (1 + e^(−z)) = 1 ÷ (1 + e^(${fmt(-z, 2)})) = 1 ÷ (1 + ${fmt(Math.exp(-z), 3)}) = <b>${fmt(p, 3)}</b>  (≈ ${fmt(p * 100, 1)}% lulus)`],
        ['<b>Bandingkan dengan ambang</b>', `${fmt(p, 3)} ${p >= t ? '≥' : '<'} ${fmt(t, 2)}  →  kelas <b>${k}</b> (${k ? 'LULUS' : 'TIDAK LULUS'})`],
      ])));
    }
    el.append(box('coba', null, h('div', {}, h('div', { class: 'controls' }, sJam.el, sHadir.el, sThr.el), flowWrap, alurSteps)));
    updAlur();

    el.append(box('rumus', null, ML.formula(
      `${V('z')} = ${V('w')}₁${V('x')}₁ + ${V('w')}₂${V('x')}₂ + … + ${V('b')} &nbsp;&nbsp;→&nbsp;&nbsp; ${V('ŷ')} = σ(${V('z')}) = ${ML.frac('1', '1 + e<sup>−z</sup>')} &nbsp;&nbsp;→&nbsp;&nbsp; kelas = 1 jika ${V('ŷ')} ≥ 0.5`,
      [
        ['x', 'fitur (angka ciri data), misalnya jam belajar'],
        ['w', 'bobot: seberapa penting tiap fitur (dipelajari mesin)'],
        ['b', 'bias: angka geser, supaya hasil tidak harus lewat nol'],
        ['z', 'skor mentah, bisa berapa saja (−∞ sampai +∞)'],
        ['σ', 'fungsi sigmoid: "pemeras" angka menjadi 0 sampai 1'],
        ['e', 'bilangan Euler ≈ 2.718 (konstanta matematika)'],
        ['ŷ', 'dibaca "y-topi": tebakan peluang kelas 1'],
        ['0.5', 'ambang (threshold): batas memutuskan kelas'],
      ])));

    /* ================= KENAPA BUKAN LINEAR REGRESSION ================= */
    el.append(h('h2', {}, 'Kenapa Tidak Pakai Linear Regression (Garis Lurus) Saja?'));
    el.append(h('p', {}, 'Label kita cuma 0 (tidak lulus) atau 1 (lulus). Kalau kita paksa tarik garis lurus melewati titik-titik ini, garisnya bisa memberi angka 1.3 atau −0.2. Itu bukan peluang! Peluang harus antara 0 dan 1. Kurva S dari sigmoid selalu berada di antara 0 dan 1.'));
    const lrData = [[1, 0], [2, 0], [2.5, 0], [3, 0], [4, 0], [4.5, 1], [5, 0], [6, 1], [6.5, 1], [7, 1], [8, 1], [9, 1]];
    // garis lurus (kuadrat terkecil)
    const mx = lrData.reduce((s, d) => s + d[0], 0) / lrData.length, my = lrData.reduce((s, d) => s + d[1], 0) / lrData.length;
    let sxy = 0, sxx = 0; lrData.forEach(([x, y]) => { sxy += (x - mx) * (y - my); sxx += (x - mx) * (x - mx); });
    const lin_m = sxy / sxx, lin_c = my - lin_m * mx;
    // kurva logistik (gradient descent singkat)
    let lw = 0, lb = 0;
    for (let it = 0; it < 4000; it++) {
      let gw = 0, gb = 0;
      lrData.forEach(([x, y]) => { const e = sigmoid(lw * x + lb) - y; gw += e * x; gb += e; });
      lw -= 0.1 * gw / lrData.length; lb -= 0.1 * gb / lrData.length;
    }
    const pLin = ML.plot({
      height: 320, x: [0, 12], y: [-0.5, 1.5], xLabel: 'jam belajar per hari', yLabel: 'peluang lulus',
      legend: [{ label: 'garis lurus (linear regression)', color: 'c2', shape: 'line' }, { label: 'kurva S (logistic regression)', color: 'c1', shape: 'line' }, { label: 'data: 1 = lulus, 0 = tidak', color: 'text-2', shape: 'circle' }],
      caption: 'Area abu-abu = di luar 0–1, <b>bukan peluang yang masuk akal</b>. Arahkan mouse untuk melihat nilai kedua model.',
    });
    pLin.draw((p) => {
      p.clear();
      p.rect(0, 1, 12, 1.5, { fill: 'text-3', alpha: 0.12 }); p.rect(0, -0.5, 12, 0, { fill: 'text-3', alpha: 0.12 });
      p.grid(); p.axes();
      p.hline(1, { color: 'axis', width: 1, dash: [3, 3] });
      p.text(0.2, 1.42, 'di atas 1: mustahil untuk peluang', { align: 'left', size: 12, color: 'text-2' });
      p.text(0.2, -0.42, 'di bawah 0: mustahil untuk peluang', { align: 'left', size: 12, color: 'text-2' });
      p.fn((x) => lin_m * x + lin_c, { color: 'c2', width: 2 });
      p.fn((x) => sigmoid(lw * x + lb), { color: 'c1', width: 2 });
      lrData.forEach(([x, y]) => p.point(x, y, { color: 'text-2', r: 6 }));
      const xl = Math.min(11.8, (1.3 - lin_c) / lin_m); p.text(xl, lin_m * xl + lin_c, 'garis lurus: ' + fmt(lin_m * xl + lin_c, 2) + ' (lebih dari 1!)', { align: 'right', base: 'bottom', dy: -6, size: 12.5, bg: true });
    });
    pLin.onHover((x) => {
      if (x < 0 || x > 12) return null;
      const a = lin_m * x + lin_c, s = sigmoid(lw * x + lb);
      return `<b>jam belajar = ${fmt(x, 1)}</b><br>garis lurus: ${fmt(a, 2)} ${a > 1 || a < 0 ? '✗ bukan peluang' : ''}<br>kurva S: ${fmt(s, 2)} ✓`;
    });
    el.append(pLin.el);

    /* ================= LOG LOSS ================= */
    el.append(h('h2', {}, 'Log Loss: Mengukur Seberapa Salah Tebakan'));
    el.append(h('p', {}, 'Untuk belajar, mesin perlu tahu seberapa salah tebakannya. Logistic Regression memakai log loss (disebut juga binary cross-entropy). Idenya: kalau mesin yakin tapi salah, hukumannya sangat besar.'));
    el.append(box('rumus', null, ML.formula(
      `loss = −[ ${V('y')} · ln(${V('ŷ')}) + (1 − ${V('y')}) · ln(1 − ${V('ŷ')}) ]`,
      [
        ['y', 'jawaban asli: 1 atau 0'],
        ['ŷ', 'tebakan peluang kelas 1 dari model'],
        ['ln', 'logaritma natural (tombol "ln" di kalkulator). ln(1) = 0, dan makin kecil angkanya, makin negatif'],
        ['jika y = 1', 'rumus jadi: loss = −ln(ŷ)'],
        ['jika y = 0', 'rumus jadi: loss = −ln(1 − ŷ)'],
      ])));
    const LL = [0.99, 0.9, 0.5, 0.1, 0.01];
    const pLL = ML.plot({
      height: 280, x: [-0.6, 4.6], y: [0, 5.4], xTicks: [0, 1, 2, 3, 4], yTicks: [0, 1, 2, 3, 4, 5],
      xFmt: (i) => 'ŷ = ' + LL[Math.round(i)], xLabel: 'tebakan model (jawaban asli y = 1)', yLabel: 'loss',
      caption: 'Jawaban asli <b>y = 1</b> (lulus). Makin jauh tebakan dari 1, loss naik makin <b>curam</b>.',
    });
    pLL.draw((p) => {
      p.clear(); p.grid(); p.axes();
      LL.forEach((v, i) => { const L = -Math.log(v); p.bar(i, 0, L, 0.6, { color: 'c1' }); p.text(i, L, fmt(L, 2), { base: 'bottom', dy: -4, bold: true }); });
    });
    pLL.onHover((x) => {
      const i = Math.round(x); if (i < 0 || i > 4 || Math.abs(x - i) > 0.35) return null;
      return `<b>ŷ = ${LL[i]}</b>, y = 1<br>loss = −ln(${LL[i]}) = ${fmt(-Math.log(LL[i]), 2)}<br>${LL[i] >= 0.5 ? 'tebakan benar' : 'tebakan salah'}${LL[i] <= 0.1 ? ' dan sangat yakin → dihukum berat' : ''}`;
    });
    el.append(pLL.el);

    // kalkulator log loss
    let llY = 1;
    const llOut = h('div');
    const sYhat = ML.slider({ label: 'Tebakan ŷ', min: 0.01, max: 0.99, step: 0.01, value: 0.9, digits: 2, onInput: updLL });
    const bY1 = h('button', { onclick: () => { llY = 1; updLL(); } }, 'Jawaban asli y = 1');
    const bY0 = h('button', { onclick: () => { llY = 0; updLL(); } }, 'Jawaban asli y = 0');
    function updLL() {
      bY1.classList.toggle('primary', llY === 1); bY0.classList.toggle('primary', llY === 0);
      const yh = sYhat.value, L = -(llY * Math.log(yh) + (1 - llY) * Math.log(1 - yh));
      const benar = (yh >= 0.5 ? 1 : 0) === llY;
      llOut.innerHTML = '';
      llOut.append(ML.steps([
        ['Masukkan ke rumus', `loss = −[${llY} · ln(${fmt(yh, 2)}) + ${1 - llY} · ln(1 − ${fmt(yh, 2)})]`],
        [`Karena y = ${llY}, bagian ${llY ? 'kedua' : 'pertama'} jadi nol`, llY ? `loss = −ln(${fmt(yh, 2)})` : `loss = −ln(1 − ${fmt(yh, 2)}) = −ln(${fmt(1 - yh, 2)})`],
        ['Hitung ln', `ln(${fmt(llY ? yh : 1 - yh, 2)}) = ${fmt(Math.log(llY ? yh : 1 - yh), 3)}  →  loss = <b>${fmt(L, 2)}</b>`],
        ['Artinya', `tebakan ${benar ? '<span class="badge good">✓ benar</span>' : '<span class="badge bad">✗ salah</span>'} — ${L < 0.2 ? 'loss kecil, model hampir tepat.' : L < 0.8 ? 'loss sedang, model masih ragu.' : 'loss besar, model yakin tapi keliru!'}`],
      ]));
    }
    el.append(box('coba', 'Coba Sendiri: Kalkulator Log Loss', h('div', {}, h('div', { class: 'controls' }, sYhat.el, h('div', { style: 'display:flex;gap:8px' }, bY1, bY0)), llOut)));
    updLL();

    /* ================= GRADIENT ================= */
    el.append(h('h2', {}, 'Gradient: Ke Mana Bobot Harus Digeser?'));
    el.append(h('p', {}, 'Setelah tahu seberapa salah, mesin menggeser bobot sedikit demi sedikit supaya loss turun (gradient descent). Kabar baiknya: untuk sigmoid + log loss, rumus gradient-nya sangat sederhana.'));
    el.append(box('rumus', null, ML.formula(
      `gradient ${V('w')}<sub>i</sub> = (${V('ŷ')} − ${V('y')}) × ${V('x')}<sub>i</sub> &nbsp;&nbsp;&nbsp; gradient ${V('b')} = ${V('ŷ')} − ${V('y')}<br><br>${V('w')}<sub>baru</sub> = ${V('w')} − ${V('lr')} × gradient`,
      [
        ['ŷ − y', '"selisih": tebakan dikurangi jawaban asli. Negatif = tebakan terlalu rendah, positif = terlalu tinggi'],
        ['x<sub>i</sub>', 'nilai fitur ke-i. Fitur yang besar ikut "bertanggung jawab" lebih besar atas kesalahan'],
        ['lr', 'learning rate: ukuran langkah. Kecil = pelan tapi aman, besar = cepat tapi bisa kebablasan'],
        ['−', 'tanda minus: kita bergerak <b>berlawanan</b> arah gradient supaya loss turun'],
      ])));

    /* ================= CONTOH HITUNG INTERAKTIF ================= */
    el.append(h('h2', {}, 'Contoh Hitung: Model "Prediksi Lulus" Belajar'));
    el.append(h('p', {}, 'Data: jam belajar x₁ = 5, kehadiran x₂ = 0.8, jawaban asli y = 1 (LULUS). Bobot awal w = [0.6, 2.0], b = −4, learning rate = 0.1. Klik "Putaran berikutnya" dan lihat tebakannya makin yakin.'));
    const X = [5, 0.8], Y = 1, LR = 0.1;
    let st;
    const stepOut = h('div'), histOut = h('div'), roundLbl = h('div', { style: 'font-weight:700;margin:4px 0' });
    const resetEx = () => { st = { w: W0.slice(), b: B0, r: 1, hist: [] }; renderEx(); };
    const calc = (w, b) => { const z = w[0] * X[0] + w[1] * X[1] + b, yh = sigmoid(z); return { z, yh, loss: -Math.log(yh), s: yh - Y }; };
    function renderEx() {
      const { w, b } = st, c = calc(w, b);
      const g = [c.s * X[0], c.s * X[1]], gb = c.s;
      const nw = [w[0] - LR * g[0], w[1] - LR * g[1]], nb = b - LR * gb;
      roundLbl.textContent = `Putaran ${st.r}`;
      stepOut.innerHTML = '';
      stepOut.append(ML.steps([
        ['<b>Hitung z</b>', `z = ${fmt(w[0], 3)}×5 + ${fmt(w[1], 3)}×0.8 + ${fmtp(b, 3)} = ${fmt(w[0] * 5, 3)} + ${fmt(w[1] * 0.8, 3)} − ${fmt(-b, 3)} = <b>${fmt(c.z, 2)}</b>`],
        ['<b>Sigmoid</b>', `ŷ = 1 ÷ (1 + e^(${fmt(-c.z, 2)})) = 1 ÷ (1 + ${fmt(Math.exp(-c.z), 3)}) = <b>${fmt(c.yh, 3)}</b>   (tebakan: ${fmt(c.yh * 100, 1)}% lulus)`],
        ['<b>Loss</b> (y = 1, jadi loss = −ln ŷ)', `loss = −ln(${fmt(c.yh, 3)}) = <b>${fmt(c.loss, 2)}</b>`],
        ['<b>Selisih</b>', `ŷ − y = ${fmt(c.yh, 3)} − 1 = <b>${fmt(c.s, 3)}</b>   (negatif → tebakan masih terlalu rendah)`],
        ['<b>Gradient</b>', `grad w₁ = ${fmt(c.s, 3)} × 5   = ${fmt(g[0], 3)}\ngrad w₂ = ${fmt(c.s, 3)} × 0.8 = ${fmt(g[1], 3)}\ngrad b  = ${fmt(gb, 3)}`],
        ['<b>Update</b> (w − lr × gradient)', `w₁ = ${fmt(w[0], 3)} − 0.1 × ${fmtp(g[0], 3)} = ${fmt(w[0], 3)} + ${fmt(-LR * g[0], 3)} = <b>${fmt(nw[0], 3)}</b>\nw₂ = ${fmt(w[1], 3)} − 0.1 × ${fmtp(g[1], 3)} = ${fmt(w[1], 3)} + ${fmt(-LR * g[1], 3)} = <b>${fmt(nw[1], 3)}</b>\nb  = ${fmt(b, 3)} − 0.1 × ${fmtp(gb, 3)} = ${fmt(b, 3)} + ${fmt(-LR * gb, 3)} = <b>${fmt(nb, 3)}</b>`],
      ]));
      const rows = st.hist.concat([{ r: st.r, w, b, ...c }]).map((o) => [
        o.r, fmt(o.w[0], 3), fmt(o.w[1], 3), fmt(o.b, 3), fmt(o.z, 2), fmt(o.yh, 3),
        `<span style="display:inline-flex;align-items:center;gap:6px">${fmt(o.loss, 2)}<span style="display:inline-block;height:10px;width:${Math.max(2, o.loss * 120)}px;background:var(--c1);border-radius:3px"></span></span>`]);
      histOut.innerHTML = '';
      histOut.append(ML.table(['putaran', 'w₁', 'w₂', 'b', 'z', 'ŷ (peluang lulus)', 'loss'], rows, { highlight: rows.length - 1 }));
      st.next = { w: nw, b: nb };
    }
    const bNext = h('button', { class: 'primary', onclick: () => {
      if (st.r >= 40) return;
      const c = calc(st.w, st.b); st.hist.push({ r: st.r, w: st.w, b: st.b, ...c });
      st.w = st.next.w; st.b = st.next.b; st.r++; renderEx();
    } }, 'Putaran berikutnya');
    const bReset = h('button', { onclick: resetEx }, '↺ Ulang dari awal');
    el.append(box('langkah', 'Langkah Hitung (bisa diklik terus)', h('div', {},
      h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px' }, bNext, bReset), roundLbl, stepOut,
      h('div', { class: 'small muted', style: 'margin-top:8px' }, 'Riwayat (baris yang disorot = putaran sekarang):'), histOut)));
    resetEx();
    el.append(h('p', { class: 'small muted' }, 'Perhatikan: w₁ berubah paling banyak karena x₁ = 5 nilainya besar. Fitur yang lebih "berperan" pada kesalahan mendapat koreksi lebih besar. Dalam training sungguhan, langkah ini dilakukan untuk semua data sekaligus (dirata-rata), lalu diulang per epoch.'));

    /* ================= PLAYGROUND ================= */
    el.append(h('h2', {}, 'Playground: Latih Logistic Regression Sendiri'));
    el.append(box('coba', null, `
      <b>Klik di grafik</b> untuk menambah titik (pilih dulu kelasnya). Klik titik yang sudah ada untuk menghapusnya.
      Lalu tekan <b>Latih</b>. Warna latar = peluang: makin biru makin yakin kelas 1, makin oranye makin yakin kelas 0.
      Garis tebal = <b>batas keputusan</b> (tempat ŷ tepat 0.5). Arahkan mouse ke mana saja untuk melihat z dan ŷ di titik itu.
      <br>Coba juga dataset <b>"Cincin"</b>: garis lurus tidak akan bisa memisahkannya!`));

    // RNG deterministik
    const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
    const PRESETS = {
      rapi: () => { const r = rng(7), o = []; for (let i = 0; i < 14; i++) { o.push([1.8 + gauss(r) * 0.8, 1.2 + gauss(r) * 0.8, 1]); o.push([-1.8 + gauss(r) * 0.8, -1.2 + gauss(r) * 0.8, 0]); } return o; },
      tumpang: () => { const r = rng(11), o = []; for (let i = 0; i < 16; i++) { o.push([0.9 + gauss(r) * 1.3, 0.6 + gauss(r) * 1.3, 1]); o.push([-0.9 + gauss(r) * 1.3, -0.6 + gauss(r) * 1.3, 0]); } return o; },
      cincin: () => { const r = rng(5), o = []; for (let i = 0; i < 14; i++) { const a = r() * 6.283, d = r() * 1.2; o.push([d * Math.cos(a), d * Math.sin(a), 1]); } for (let i = 0; i < 22; i++) { const a = (i / 22) * 6.283 + r() * 0.2, d = 2.4 + r() * 0.8; o.push([d * Math.cos(a), d * Math.sin(a), 0]); } return o; },
    };
    let pts = PRESETS.rapi(), addCls = 1, showCont = true;
    let gw = [0, 0], gbias = 0, epoch = 0, losses = [], running = false, lastPreset = 'rapi';
    const sLR = ML.slider({ label: 'Learning rate (lr)', min: 0.01, max: 1, step: 0.01, value: 0.3, digits: 2 });
    const predict = (x, y) => sigmoid(gw[0] * x + gw[1] * y + gbias);
    const meanLoss = () => { if (!pts.length) return 0; let s = 0; pts.forEach(([x, y, c]) => { const q = Math.min(1 - 1e-12, Math.max(1e-12, predict(x, y))); s += -(c * Math.log(q) + (1 - c) * Math.log(1 - q)); }); return s / pts.length; };
    const acc = () => pts.length ? pts.filter(([x, y, c]) => (predict(x, y) >= 0.5 ? 1 : 0) === c).length / pts.length : 0;
    function epochStep() {
      if (!pts.length) return;
      if (!losses.length) losses.push(meanLoss());
      let g0 = 0, g1 = 0, g2 = 0;
      pts.forEach(([x, y, c]) => { const e = predict(x, y) - c; g0 += e * x; g1 += e * y; g2 += e; });
      const n = pts.length, lr = sLR.value;
      gw = [gw[0] - lr * g0 / n, gw[1] - lr * g1 / n]; gbias -= lr * g2 / n;
      epoch++; losses.push(meanLoss());
    }
    const stats = h('div', { class: 'small', style: 'font-family:var(--mono);margin:6px 0' });
    const note = h('div', { class: 'small muted' });
    const btnC1 = h('button', { onclick: () => { addCls = 1; updBtns(); } }, '● Tambah kelas 1');
    const btnC0 = h('button', { onclick: () => { addCls = 0; updBtns(); } }, '■ Tambah kelas 0');
    const btnTrain = h('button', { class: 'primary', onclick: () => { running ? stop() : start(); } }, 'Latih');
    const btnStep = h('button', { onclick: () => { stop(); epochStep(); refresh(); } }, 'Langkah (1 epoch)');
    const btnReset = h('button', { onclick: () => { stop(); resetModel(); refresh(); } }, '↺ Reset bobot');
    const cbCont = h('input', { type: 'checkbox', checked: true, onchange: () => { showCont = cbCont.checked; pG.redraw(); } });
    const presetBtn = (k, t) => h('button', { onclick: () => { stop(); pts = PRESETS[k] ? PRESETS[k]() : []; lastPreset = k; resetModel(); refresh(); } }, t);
    function updBtns() { btnC1.classList.toggle('primary', addCls === 1); btnC0.classList.toggle('primary', addCls === 0); }
    function resetModel() { gw = [0, 0]; gbias = 0; epoch = 0; losses = []; }
    const MAXEP = 600;
    function start() {
      if (!pts.length) return;
      running = true; btnTrain.textContent = '⏸ Jeda';
      const tick = () => {
        if (!running) return;
        if (!pG.canvas.isConnected) { running = false; return; }
        for (let k = 0; k < 3; k++) epochStep();
        refresh();
        const n = losses.length;
        if (epoch >= MAXEP || (n > 20 && Math.abs(losses[n - 1] - losses[n - 11]) < 1e-5)) { stop(); return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    function stop() { running = false; btnTrain.textContent = 'Latih'; }
    updBtns();

    const pG = ML.plot({
      height: 420, x: [-6, 6], y: [-4.2, 4.2], xLabel: 'fitur x₁', yLabel: 'fitur x₂',
      legend: [{ label: 'kelas 1', color: 'c1', shape: 'circle' }, { label: 'kelas 0', color: 'c2', shape: 'square' }, { label: 'batas keputusan (ŷ = 0.5)', color: 'text', shape: 'line' }, { label: 'garis ŷ = 0.25 / 0.75 (putus-putus)', color: 'text-2', shape: 'line' }],
    });
    // garis w1·x + w2·y + b = c, digambar melewati seluruh area
    const drawLevel = (p, c, op) => {
      const [a, bb] = gw; if (Math.hypot(a, bb) < 1e-9) return;
      if (Math.abs(bb) >= Math.abs(a)) p.line(p.x[0], (c - gbias - a * p.x[0]) / bb, p.x[1], (c - gbias - a * p.x[1]) / bb, op);
      else p.line((c - gbias - bb * p.y[0]) / a, p.y[0], (c - gbias - bb * p.y[1]) / a, p.y[1], op);
    };
    pG.draw((p) => {
      // satuan x dan y dibuat sama panjang (supaya cincin terlihat bulat)
      const pw = p.W - p.pad.l - p.pad.r, ph = p.H - p.pad.t - p.pad.b, hx = Math.max(4.6, 4.2 * pw / ph);
      p.x = [-hx, hx];
      p.clear();
      const C1 = p.col('c1'), C2 = p.col('c2');
      if (Math.hypot(gw[0], gw[1]) > 1e-9 || Math.abs(gbias) > 1e-9) p.region((x, y) => { const q = predict(x, y); return q >= 0.5 ? { color: C1, alpha: (q - 0.5) * 0.55 } : { color: C2, alpha: (0.5 - q) * 0.55 }; }, 7);
      p.grid(); p.axes();
      if (showCont) { drawLevel(p, Math.log(3), { color: 'text-2', width: 1.5, dash: [6, 5] }); drawLevel(p, -Math.log(3), { color: 'text-2', width: 1.5, dash: [6, 5] }); }
      drawLevel(p, 0, { color: 'text', width: 2.5 });
      pts.forEach(([x, y, c]) => p.point(x, y, { color: c ? 'c1' : 'c2', shape: c ? 'circle' : 'square', r: 6 }));
      if (!pts.length) p.text(0, 0, 'Klik untuk menambah titik', { color: 'text-2', size: 15 });
    });
    pG.onClick((x, y) => {
      const i = pG.nearest(pts, x, y, 10);
      if (i >= 0) pts.splice(i, 1); else pts.push([x, y, addCls]);
      refresh();
    });
    pG.onHover((x, y) => {
      const z = gw[0] * x + gw[1] * y + gbias, q = sigmoid(z), i = pG.nearest(pts, x, y, 10);
      let s = '';
      if (i >= 0) { const c = pts[i][2], ok = (q >= 0.5 ? 1 : 0) === c; s = `<b>Titik kelas ${c}</b> ${ok ? '✓ ditebak benar' : '✗ ditebak salah'}<br>`; }
      return s + `x₁ = ${fmt(x, 2)}, x₂ = ${fmt(y, 2)}<br>z = ${fmt(gw[0], 2)}×${fmtp(x, 2)} + ${fmt(gw[1], 2)}×${fmtp(y, 2)} + ${fmtp(gbias, 2)} = <b>${fmt(z, 2)}</b><br>ŷ = σ(z) = <b>${fmt(q, 3)}</b><br>tebakan: <b>kelas ${q >= 0.5 ? 1 : 0}</b>${i < 0 ? '<br><span style="opacity:.75">klik = tambah titik</span>' : '<br><span style="opacity:.75">klik = hapus titik</span>'}`;
    });

    const pL = ML.plot({ height: 200, x: [0, 50], y: [0, 1], xLabel: 'epoch', yLabel: 'loss rata-rata', pad: { l: 52 }, caption: 'Loss per epoch. Garis turun = model makin pintar. Kalau mendatar, model sudah tidak bisa lebih baik lagi.' });
    pL.draw((p) => {
      p.x = [0, Math.max(50, losses.length - 1)];
      p.y = [0, Math.max(0.8, ...losses) * 1.1];
      p.clear(); p.grid(); p.axes();
      if (losses.length) p.path(losses.map((v, i) => [i, v]), { color: 'c1', width: 2 });
      if (losses.length) { const i = losses.length - 1; p.point(i, losses[i], { color: 'c1', r: 6 }); }
      else p.text((p.x[0] + p.x[1]) / 2, p.y[1] / 2, 'Tekan "Latih" atau "Langkah" untuk mulai', { color: 'text-2' });
    });
    pL.onHover((x) => { if (!losses.length) return null; const i = Math.max(0, Math.min(losses.length - 1, Math.round(x))); return `epoch ${i}<br>loss = <b>${fmt(losses[i], 3)}</b>`; });

    function refresh() {
      const L = meanLoss(), a = acc();
      stats.innerHTML = `epoch: <b>${epoch}</b> · loss: <b>${fmt(L, 3)}</b> · akurasi: <b>${fmt(a * 100, 0)}%</b> · w = [${fmt(gw[0], 2)}, ${fmt(gw[1], 2)}] · b = ${fmt(gbias, 2)} · titik: ${pts.length}`;
      if (lastPreset === 'cincin' && epoch > 30) note.innerHTML = 'Data cincin: kelas 1 di tengah, kelas 0 mengelilingi. <b>Satu garis lurus mustahil memisahkannya</b>, jadi akurasi mentok dan loss tidak bisa turun banyak. Inilah keterbatasan Logistic Regression: batasnya selalu <b>linear</b>. Solusinya ada di bab SVM (kernel trick).';
      else if (epoch >= MAXEP) note.textContent = `Berhenti otomatis setelah ${MAXEP} epoch. Tekan Latih lagi untuk lanjut.`;
      else note.textContent = '';
      pG.redraw(); pL.redraw();
    }
    el.append(h('div', { class: 'controls' }, h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' }, btnC1, btnC0), sLR.el,
      h('label', { class: 'small', style: 'display:flex;gap:6px;align-items:center' }, cbCont, 'tampilkan garis ŷ = 0.25 / 0.75')));
    el.append(h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:center' },
      btnTrain, btnStep, btnReset, h('span', { class: 'small muted', style: 'margin-left:10px' }, 'Dataset:'),
      presetBtn('rapi', 'Terpisah rapi'), presetBtn('tumpang', 'Agak tumpang tindih'), presetBtn('cincin', 'Cincin (non-linear)'), presetBtn('kosong', 'Kosongkan')));
    el.append(stats, pG.el, note, pL.el);
    refresh();
    el.append(box('info', 'Yang bisa kamu amati', `
      <ul style="margin:4px 0;padding-left:20px">
        <li>Garis batas keputusan selalu <b>tegak lurus</b> terhadap arah bobot w. Bobot menentukan kemiringan, bias menggeser garis.</li>
        <li>Jarak antara garis putus-putus ŷ = 0.25 dan ŷ = 0.75 makin <b>sempit</b> saat model makin yakin (bobot makin besar).</li>
        <li>Learning rate besar → loss turun cepat. Terlalu kecil → butuh banyak epoch.</li>
        <li>Pada data "Agak tumpang tindih", akurasi 100% mustahil. Model mencari garis yang <b>salahnya paling sedikit</b>.</li>
      </ul>`));

    /* ================= MULTI KELAS ================= */
    el.append(h('h2', {}, 'Lebih dari 2 Kelas: One-vs-Rest dan Softmax'));
    el.append(h('p', {}, 'Sigmoid hanya menjawab "kelas 1 atau bukan". Untuk banyak kelas (misalnya huruf A, B, C), ada dua cara:'));
    el.append(ML.html(`<div class="grid2">
      <div class="stat"><div class="k">ONE-VS-REST (OvR)</div><div style="font-size:15px;margin-top:4px">
        Latih <b>satu model per kelas</b>: "A atau bukan?", "B atau bukan?", "C atau bukan?".<br>
        Contoh hasil: A 0.80, B 0.30, C 0.10 → pilih yang tertinggi → <b>A</b>.<br>
        <span class="muted small">Total peluangnya tidak harus 1.</span></div></div>
      <div class="stat"><div class="k">MULTINOMIAL (SOFTMAX)</div><div style="font-size:15px;margin-top:4px">
        <b>Satu model</b> menghitung skor z untuk tiap kelas, lalu <b>softmax</b> mengubahnya jadi peluang yang totalnya <b>tepat 1</b>.<br>
        <span class="muted small">Ini cara bawaan (default) di scikit-learn.</span></div></div>
    </div>`));
    el.append(box('rumus', null, ML.formula(`peluang kelas ${V('k')} = ${ML.frac('e<sup>z<sub>k</sub></sup>', 'e<sup>z<sub>A</sub></sup> + e<sup>z<sub>B</sub></sup> + e<sup>z<sub>C</sub></sup>')}`,
      [['z<sub>k</sub>', 'skor mentah untuk kelas k (dari w·x + b milik kelas itu)'], ['e<sup>z</sup>', 'membuat semua skor positif; skor besar jadi jauh lebih besar'], ['pembagi', 'jumlah semua e<sup>z</sup>, supaya total peluang = 1']])));
    const smOut = h('div');
    const smS = ['A', 'B', 'C'].map((k, i) => ML.slider({ label: 'skor z' + k, min: -3, max: 4, step: 0.1, value: [2, 1, 0.1][i], digits: 1, onInput: updSM }));
    function updSM() {
      const zs = smS.map((s) => s.value), ex = zs.map(Math.exp), tot = ex.reduce((a, b) => a + b, 0), pr = ex.map((v) => v / tot);
      const best = pr.indexOf(Math.max(...pr)), L = ['A', 'B', 'C'];
      smOut.innerHTML = '';
      smOut.append(ML.steps([
        ['Hitung e<sup>z</sup> tiap kelas', L.map((k, i) => `e^${fmtp(zs[i], 1)} = ${fmt(ex[i], 3)}`).join('    ')],
        ['Jumlahkan', `total = ${ex.map((v) => fmt(v, 3)).join(' + ')} = ${fmt(tot, 3)}`],
        ['Bagi tiap e<sup>z</sup> dengan total', L.map((k, i) => `${k}: ${fmt(ex[i], 3)} ÷ ${fmt(tot, 3)} = ${fmt(pr[i], 2)}`).join('\n')],
        ['Pilih peluang tertinggi', `→ huruf <b>${L[best]}</b>   (cek total: ${pr.map((v) => fmt(v, 2)).join(' + ')} ≈ 1)`],
      ]));
      const bars = h('div', { style: 'margin-top:6px' });
      L.forEach((k, i) => bars.append(h('div', { style: 'display:flex;align-items:center;gap:8px;margin:3px 0;font-family:var(--mono);font-size:14px' },
        h('span', { style: 'width:20px' }, k),
        h('span', { style: `display:inline-block;height:14px;border-radius:3px;background:var(--c1);width:${Math.max(2, pr[i] * 300)}px` }),
        h('span', {}, fmt(pr[i], 2) + (i === best ? '  ← dipilih' : '')))));
      smOut.append(bars);
    }
    el.append(box('coba', 'Coba Sendiri: Softmax', h('div', {}, h('div', { class: 'controls' }, ...smS.map((s) => s.el)), smOut)));
    updSM();

    /* ================= PERBANDINGAN ================= */
    el.append(h('h2', {}, 'Kelebihan, Kekurangan, dan Dibanding SVM'));
    el.append(ML.table(['Kelebihan', 'Kekurangan'], [
      ['Sederhana, cepat, mudah dimengerti (bobot = pengaruh fitur)', 'Hanya bisa membuat batas keputusan <b>linear</b> (garis lurus)'],
      ['Langsung menghasilkan <b>peluang</b>', 'Kurang akurat kalau pola datanya rumit / non-linear (seperti cincin)'],
      ['Bagus sebagai <b>baseline</b> (pembanding awal)', 'Kurang bagus kalau fitur-fiturnya sangat mirip satu sama lain'],
    ]));
    el.append(ML.table(['', 'Logistic Regression', 'SVM'], [
      ['<b>Output</b>', 'Peluang (0–1)', 'Kelas (dari tanda + / − jarak ke garis)'],
      ['<b>Batas keputusan</b>', 'Linear saja', 'Linear atau non-linear (pakai kernel)'],
      ['<b>Yang diperhatikan</b>', 'Semua titik data', 'Hanya titik terdekat ke garis (support vector)'],
      ['<b>Cara memilih garis</b>', 'Meminimalkan log loss', 'Mencari "jalan" (margin) paling lebar'],
    ]));

    el.append(h('h3', {}, 'Contoh di Python (scikit-learn)'));
    el.append(h('pre', { class: 'code' }, `from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, max_iter=1000))
model.fit(X_train, y_train)

print(model.score(X_test, y_test))      # akurasi
print(model.predict_proba(X_test[:1]))  # peluang tiap kelas`));
    el.append(h('p', { class: 'small muted' }, 'Parameter C di sini adalah kebalikan dari kekuatan regularisasi: C kecil = regularisasi kuat = model lebih sederhana.'));

    el.append(box('bisindo', null, `Logistic Regression cocok jadi <b>baseline</b> (model pembanding paling sederhana) untuk klasifikasi huruf BISINDO
      dari 63 fitur landmark tangan (21 titik × x, y, z dari MediaPipe). Karena ada banyak huruf, dipakai versi <b>softmax</b>.
      <br><br>Lalu bandingkan dengan SVM. <b>Kalau SVM kernel RBF jauh lebih akurat</b>, artinya pola gestur tangan
      itu <b>non-linear</b> (seperti data cincin di playground), sehingga garis lurus saja tidak cukup.`));

    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Model menghitung z = 0. Berapa tebakan peluangnya (ŷ)?', options: ['0', '0.5', '1'], answer: 1, explain: 'σ(0) = 1 ÷ (1 + e⁰) = 1 ÷ (1 + 1) = 0.5. Tepat di batas keputusan, model ragu-ragu.' },
      { q: 'Jawaban asli y = 1, tapi model menebak ŷ = 0.01. Bagaimana log loss-nya?', options: ['Kecil, sekitar 0.01', 'Sangat besar, sekitar 4.61', 'Nol karena dibulatkan'], answer: 1, explain: 'loss = −ln(0.01) = 4.61. Model yakin tapi salah, jadi dihukum sangat berat.' },
      { q: 'Selisih ŷ − y = −0.354 dan x₁ = 5. Berapa gradient w₁?', options: ['−1.77', '0.354', '−0.071'], answer: 0, explain: 'gradient w₁ = (ŷ − y) × x₁ = −0.354 × 5 = −1.77. Karena negatif, w₁ akan dinaikkan saat update.' },
      { q: 'Kenapa Logistic Regression gagal pada data "cincin"?', options: ['Learning rate-nya terlalu kecil', 'Batas keputusannya selalu garis lurus, padahal data cincin butuh batas melingkar', 'Datanya terlalu sedikit'], answer: 1, explain: 'Logistic Regression hanya bisa membuat batas linear. Untuk pola melingkar, butuh model non-linear seperti SVM dengan kernel RBF.' },
    ]));
  },
});
