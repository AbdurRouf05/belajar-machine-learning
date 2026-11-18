/* Bab 7 — Fungsi Aktivasi & Softmax */
ML.chapter({
  id: 'aktivasi',
  num: 7,
  group: 'Cara Mesin Belajar',
  title: 'Fungsi Aktivasi & Softmax',
  lead: 'Setelah menghitung z = w·x + b, model memasukkan z ke sebuah <b>fungsi aktivasi</b>. Fungsi inilah yang membuat model bisa belajar pola yang berkelok-kelok.',
  render(el) {
    const { h, box, steps, fmt, fmtp } = ML;

    el.append(box('analogi', null, `
      Bayangkan <b>saklar lampu pintar</b>. Angka z adalah seberapa kuat tombolnya ditekan.
      Fungsi aktivasi menentukan <b>apakah lampu menyala, dan seberapa terang</b>.
      <br><br>Ada saklar yang "mati total kalau ditekan lemah" (ReLU), ada yang "terangnya naik pelan-pelan dari 0% sampai 100%" (sigmoid),
      dan ada yang bisa "redup ke arah negatif" (tanh).`));

    el.append(h('h2', {}, 'Kenapa Butuh Fungsi Aktivasi?'));
    el.append(h('p', {}, `Tanpa fungsi aktivasi, model hanya berisi perkalian dan penjumlahan biasa. Ditumpuk 100 lapis pun,
      hasilnya tetap setara dengan satu garis lurus. Padahal pola di dunia nyata (gambar, suara, gerakan tangan) berkelok-kelok.
      Fungsi aktivasi membuat model bisa "membengkokkan garis". Istilahnya: memberi sifat non-linear (tidak lurus).`));
    el.append(h('p', { class: 'small muted' }, 'Catatan: fungsi aktivasi tidak mengubah bobot. Yang diubahnya hanya hasil hitungan z. Bobot hanya diubah oleh optimizer (Bab 6).'));

    // ---------------- tiga fungsi ----------------
    el.append(h('h2', {}, 'Tiga Fungsi Aktivasi yang Paling Sering Dipakai'));
    el.append(box('rumus', null, ML.formula(
      `ReLU(<span class="var">z</span>) = max(0, <span class="var">z</span>)<br>
       sigmoid(<span class="var">z</span>) = ${ML.frac('1', '1 + e<sup>−<i>z</i></sup>')}<br>
       tanh(<span class="var">z</span>) = ${ML.frac('e<sup><i>z</i></sup> − e<sup>−<i>z</i></sup>', 'e<sup><i>z</i></sup> + e<sup>−<i>z</i></sup>')}`,
      [
        ['z', 'hasil w·x + b (angka bebas, boleh negatif)'],
        ['max(0, z)', 'pilih yang lebih besar antara 0 dan z → negatif jadi 0, positif dibiarkan'],
        ['e', 'bilangan Euler ≈ 2.718 (tombol e<sup>x</sup> di kalkulator)'],
        ['e<sup>−z</sup>', 'e dipangkatkan −z'],
      ])));

    el.append(box('coba', null, `Geser slider <b>z</b>. Titik oranye di ketiga grafik ikut bergeser dan menunjukkan output tiap fungsi.
      Arahkan mouse ke grafik untuk melihat nilai di titik mana saja.`));
    const FN = [
      { name: 'ReLU', f: (z) => Math.max(0, z), y: [-1, 5], range: '0 sampai ∞', use: 'hidden layer (lapisan tengah), paling populer karena cepat' },
      { name: 'Sigmoid', f: ML.sigmoid, y: [-0.1, 1.1], range: '0 sampai 1', use: 'output klasifikasi 2 kelas (ya / tidak)' },
      { name: 'Tanh', f: Math.tanh, y: [-1.2, 1.2], range: '−1 sampai 1', use: 'hidden layer (versi lama, misalnya RNN)' },
    ];
    const slZ = ML.slider({ label: 'Nilai z', min: -5, max: 5, step: 0.1, value: 3, digits: 1, onInput: () => renderAct() });
    const actStats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const actSteps = h('div');
    const actTbl = h('div');
    const grid = h('div', { class: 'grid3' });
    const plots = FN.map((F) => {
      const p = ML.plot({ width: 300, height: 220, x: [-5, 5], y: F.y, xLabel: 'z', pad: { l: 40, r: 10 },
        yTicks: F.name === 'ReLU' ? [0, 1, 2, 3, 4, 5] : F.name === 'Sigmoid' ? [0, 0.5, 1] : [-1, 0, 1],
        xTicks: [-4, -2, 0, 2, 4],
        caption: `<b>${F.name}</b> · output ${F.range}` });
      p.draw((p) => {
        p.clear(); p.grid(); p.axes();
        if (F.name === 'Sigmoid') p.hline(0.5, { color: 'grid', width: 1, dash: [3, 3] });
        p.fn(F.f, { color: 'c1', width: 2 });
        const z = slZ.value, v = F.f(z);
        p.line(z, 0, z, v, { color: 'text-2', width: 1, dash: [3, 3] });
        p.point(z, v, { color: 'c2', r: 6.5, ring: true });
        p.text(-4.8, F.y[1], F.name + '(' + fmt(z, 1) + ') = ' + fmt(v), { align: 'left', base: 'top', dy: 4, bold: true, bg: true, size: 12.5 });
      });
      p.onHover((x) => (x < -5 || x > 5 ? null : `<b>${F.name}</b>(${fmt(x)}) = ${fmt(F.f(x), 3)}`));
      grid.append(h('div', { style: 'min-width:0' }, p.el));
      return p;
    });
    el.append(h('div', { class: 'controls' }, slZ.el), grid, actStats);
    el.append(box('langkah', 'Langkah Hitung untuk z sekarang (ikut berubah)', actSteps));
    el.append(actTbl);

    function renderAct() {
      const z = slZ.value, ez = Math.exp(-z), ep = Math.exp(z);
      actStats.innerHTML = FN.map((F) => `<div class="stat"><div class="k">${F.name}(${fmt(z, 1)})</div><div class="v">${fmt(F.f(z), 3)}</div><div class="d">output ${F.range}</div></div>`).join('');
      actSteps.innerHTML = '';
      actSteps.append(steps([
        ['<b>ReLU</b>: pilih yang lebih besar antara 0 dan z', `max(0, ${fmt(z, 1)}) = <b>${fmt(Math.max(0, z), 3)}</b>` + (z < 0 ? '   ← negatif jadi 0' : '   ← positif dibiarkan')],
        ['<b>Sigmoid</b>: hitung e<sup>−z</sup>, tambah 1, lalu 1 dibagi hasilnya', `e^(−z) = e^${fmtp(-z, 1)} = ${fmt(ez, 3)}\n1 / (1 +${fmt(ez, 3)}) = 1 / ${fmt(1 + ez, 3)} = <b>${fmt(ML.sigmoid(z), 3)}</b>`],
        ['<b>Tanh</b>: (e<sup>z</sup> − e<sup>−z</sup>) dibagi (e<sup>z</sup> + e<sup>−z</sup>)', `e^z = e^${fmtp(z, 1)} = ${fmt(ep, 3)},  e^(−z) = e^${fmtp(-z, 1)} = ${fmt(ez, 3)}\n(${fmt(ep, 3)} − ${fmt(ez, 3)}) / (${fmt(ep, 3)} + ${fmt(ez, 3)}) = ${fmt(ep - ez, 3)} / ${fmt(ep + ez, 3)} = <b>${fmt(Math.tanh(z), 3)}</b>`],
      ]));
      const zs = [-2, 0, 3];
      if (!zs.some((v) => Math.abs(v - z) < 1e-9)) zs.push(z);
      zs.sort((a, b) => a - b);
      actTbl.innerHTML = '';
      actTbl.append(ML.table(['z', 'ReLU = max(0, z)', 'Sigmoid = 1/(1+e<sup>−z</sup>)', 'Tanh'],
        zs.map((v) => [fmt(v, 1), `max(0, ${fmt(v, 1)}) = ${fmt(Math.max(0, v), 2)}`, `1 / (1 + ${fmt(Math.exp(-v), 3)}) = ${fmt(ML.sigmoid(v), 2)}`, fmt(Math.tanh(v), 2)]),
        { highlight: zs.findIndex((v) => Math.abs(v - z) < 1e-9) }));
      plots.forEach((p) => p.redraw());
    }
    renderAct();
    el.append(h('p', { class: 'small muted' }, 'Baris yang disorot = nilai z dari slider. Baris z = −2, 0, 3 adalah contoh dari catatan.'));

    el.append(ML.table(['Nama', 'Cara kerja singkat', 'Rentang output', 'Biasa dipakai untuk'], [
      ...FN.map((F) => ['<b>' + F.name + '</b>', F.name === 'ReLU' ? 'negatif → 0, positif dibiarkan' : F.name === 'Sigmoid' ? 'memampatkan angka apa pun ke 0–1' : 'memampatkan angka apa pun ke −1 sampai 1', F.range, F.use]),
      ['<b>Softmax</b>', 'mengubah beberapa skor jadi peluang', '0 sampai 1, <b>total = 1</b>', 'output klasifikasi banyak kelas'],
    ]));

    // ---------------- softmax ----------------
    el.append(h('h2', {}, 'Softmax: Membagi Kue Peluang'));
    el.append(box('analogi', 'Analogi: membagi satu kue', `Ada <b>satu kue utuh</b> (= 100%) yang harus dibagi ke beberapa kandidat jawaban.
      Kandidat dengan skor lebih tinggi mendapat potongan <b>jauh</b> lebih besar. Berapa pun skornya, potongan-potongannya selalu
      kalau dijumlah <b>tepat satu kue</b>. Softmax melakukan persis itu.`));
    el.append(h('p', {}, 'Sigmoid cocok untuk 2 pilihan (ya/tidak). Kalau pilihannya banyak (huruf A, B, C, …), model mengeluarkan satu skor mentah z untuk tiap huruf, lalu softmax mengubahnya menjadi peluang.'));
    el.append(box('rumus', null, ML.formula(
      `peluang<sub>i</sub> = ${ML.frac('e<sup><i>z</i><sub>i</sub></sup>', 'e<sup><i>z</i><sub>1</sub></sup> + e<sup><i>z</i><sub>2</sub></sup> + … (jumlah semua e<sup><i>z</i></sup>)')}`,
      [
        ['z<sub>i</sub>', 'skor mentah untuk kelas ke-i (boleh negatif)'],
        ['e<sup>z</sup>', 'e ≈ 2.718 dipangkatkan z → hasilnya <b>selalu positif</b>'],
        ['pembagi', 'jumlah semua e<sup>z</sup>, supaya total peluang = 1 (100%)'],
      ])));
    el.append(box('coba', null, 'Geser skor mentah z untuk tiap huruf. Perhatikan: total peluang <b>selalu 1</b>, dan skor yang sedikit lebih besar mendapat porsi jauh lebih besar.'));

    const NAMES = ['A', 'B', 'C'];
    const DEF = [2, 1, 0.1];
    const zSl = NAMES.map((n, i) => ML.slider({ label: 'skor mentah z huruf ' + n, min: -3, max: 5, step: 0.1, value: DEF[i], digits: 1, onInput: () => renderSm() }));
    const bDef = h('button', { onclick: () => { zSl.forEach((s, i) => (s.value = DEF[i])); renderSm(); } }, '↺ Contoh catatan [2, 1, 0.1]');
    const bSame = h('button', { onclick: () => { zSl.forEach((s) => (s.value = 1)); renderSm(); } }, 'Semua sama [1, 1, 1]');
    const smStats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const smSteps = h('div');
    const ps = ML.plot({
      width: 640, height: 260, x: [0.4, 3.6], y: [0, 1.1], yLabel: 'peluang', pad: { l: 52 },
      xTicks: [1, 2, 3], yTicks: [0, 0.25, 0.5, 0.75, 1], xFmt: (v) => 'huruf ' + NAMES[v - 1], yFmt: (v) => Math.round(v * 100) + '%',
      caption: 'Tinggi batang = peluang hasil softmax. Jumlah ketiga batang selalu 100%.',
    });
    const probs = () => ML.softmax(zSl.map((s) => s.value));
    ps.draw((p) => {
      p.clear(); p.grid(); p.axes();
      const pr = probs();
      pr.forEach((v, i) => {
        p.bar(i + 1, 0, v, 0.5, { color: 'c1' });
        p.text(i + 1, v, Math.round(v * 100) + '%  (' + v.toFixed(2) + ')', { dy: -9, bold: true, size: 13 });
      });
    });
    ps.onHover((x) => {
      const i = Math.round(x) - 1; if (i < 0 || i > 2 || Math.abs(x - i - 1) > 0.3) return null;
      const z = zSl[i].value, pr = probs();
      return `<b>huruf ${NAMES[i]}</b><br>z = ${fmt(z, 1)} → e^z = ${fmt(Math.exp(z), 3)}<br>peluang = ${fmt(pr[i], 3)} (${Math.round(pr[i] * 100)}%)`;
    });
    function renderSm() {
      const zs = zSl.map((s) => s.value), pr = ML.softmax(zs);
      // langkah hitung memakai e^z yang dibulatkan 3 desimal, supaya angkanya bisa dicek manual
      const ex = zs.map((z) => Math.round(Math.exp(z) * 1000) / 1000), S = Math.round(ex.reduce((a, b) => a + b, 0) * 1000) / 1000;
      const best = pr.indexOf(Math.max(...pr));
      const total = pr.reduce((a, b) => a + b, 0);
      smStats.innerHTML = `
        <div class="stat"><div class="k">Tebakan model</div><div class="v">huruf ${NAMES[best]}</div><div class="d">peluang paling besar</div></div>
        <div class="stat"><div class="k">Peluang tertinggi</div><div class="v">${Math.round(pr[best] * 100)}%</div><div class="d">${fmt(pr[best], 3)}</div></div>
        <div class="stat"><div class="k">Total semua peluang</div><div class="v">${total.toFixed(2)}</div><div class="d"><span class="badge good">✓ selalu 1 (100%)</span></div></div>`;
      smSteps.innerHTML = '';
      smSteps.append(steps([
        ['Pangkatkan e dengan tiap skor (semua jadi positif)', zs.map((z, i) => `huruf ${NAMES[i]}: e^${fmtp(z, 1)} = ${fmt(ex[i], 3)}`).join('\n')],
        ['Jumlahkan semuanya', ex.map((v) => fmt(v, 3)).join(' + ') + ' = <b>' + fmt(S, 3) + '</b>'],
        ['Bagi tiap e<sup>z</sup> dengan jumlah tadi', ex.map((v, i) => `huruf ${NAMES[i]}: ${fmt(v, 3)} ÷ ${fmt(S, 3)} = <b>${(v / S).toFixed(2)}</b>`).join('\n')],
        ['Cek: jumlah peluang', pr.map((v) => fmt(v, 3)).join(' + ') + ' = ' + total.toFixed(2) + ' ✓'],
      ]));
      ps.redraw();
    }
    el.append(h('div', { class: 'controls' }, ...zSl.map((s) => s.el)), h('div', { class: 'controls' }, bDef, bSame), ps.el, smStats);
    el.append(box('langkah', 'Langkah Hitung Softmax (ikut berubah)', smSteps));
    renderSm();
    el.append(box('info', 'Kenapa pakai e pangkat z, bukan langsung dibagi?', `
      <ul style="margin:4px 0;padding-left:20px">
        <li>Skor bisa negatif. e<sup>z</sup> selalu positif, jadi tidak ada peluang negatif.</li>
        <li>e<sup>z</sup> membesar sangat cepat, jadi skor yang <b>sedikit</b> lebih tinggi dapat porsi yang <b>jauh</b> lebih besar.
            Contoh catatan: skor 2 vs 1 (selisih 1) → peluang 66% vs 24%.</li>
      </ul>`));

    el.append(box('bisindo', null, `Menebak huruf isyarat BISINDO = <b>klasifikasi banyak kelas</b>.
      Kalau model memakai softmax di output, model mengeluarkan satu skor untuk <b>tiap huruf</b> (A, B, C, …),
      lalu softmax mengubahnya jadi peluang, misalnya A = 66%, B = 24%, C = 10%. Huruf dengan peluang terbesar menjadi jawaban.
      Loss-nya lalu dihitung dengan cross-entropy dari peluang huruf yang benar (Bab 5).`));

    // ---------------- kuis ----------------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Berapa ReLU(−2)?', options: ['−2', '0', '2'], answer: 1, explain: 'ReLU = max(0, z). max(0, −2) = 0. Negatif selalu jadi 0.' },
      { q: 'Output sigmoid selalu berada di rentang…', options: ['−1 sampai 1', '0 sampai 1', '0 sampai tak terhingga'], answer: 1, explain: 'Sigmoid memampatkan angka apa pun ke 0–1, makanya cocok sebagai peluang. Rentang −1 sampai 1 milik tanh.' },
      { q: 'Skor mentah [2, 1, 0.1] diubah softmax menjadi kira-kira…', options: ['[0.66, 0.24, 0.10]', '[0.65, 0.32, 0.03]', '[2, 1, 0.1] dibagi 3'], answer: 0, explain: 'e^2 = 7.389, e^1 = 2.718, e^0.1 = 1.105. Jumlahnya 11.212. Dibagi: 0.66, 0.24, 0.10. Totalnya 1.' },
      { q: 'Untuk menebak satu dari 26 huruf, aktivasi output yang cocok adalah…', options: ['ReLU', 'Sigmoid', 'Softmax'], answer: 2, explain: 'Banyak kelas → softmax, karena menghasilkan peluang untuk tiap kelas dengan total 1.' },
    ]));
  },
});
