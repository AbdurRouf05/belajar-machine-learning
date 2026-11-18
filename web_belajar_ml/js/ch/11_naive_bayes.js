/* Bab 11 — Naive Bayes (klasifikasi dengan menghitung peluang) */
ML.chapter({
  id: 'naive-bayes',
  num: 11,
  group: 'Algoritma Klasifikasi',
  title: 'Naive Bayes',
  lead: 'Menebak kelas dengan <b>menghitung peluang</b>. Tidak ada loss, tidak ada epoch: cukup <b>menghitung kata</b> sekali jalan.',
  render(el) {
    const { h, box, steps, fmt } = ML;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const tok = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
    // angka peluang: 4 angka penting, notasi ×10^ kalau sangat kecil
    const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
    const sig = (x) => {
      if (x === 0) return '0';
      if (Math.abs(x) >= 1e-4) return String(+x.toPrecision(4));
      const [m, e] = x.toExponential(2).split('e');
      return +m + '×10' + String(+e).split('').map((c) => SUP[c]).join('');
    };
    const pct = (x) => fmt(x * 100, 1) + '%';
    const NAMA = ['spam', 'bukan spam'], COL = ['c2', 'c1'];

    // ---------- analogi ----------
    el.append(box('analogi', null, `
      Kamu menerima pesan: <b>"Selamat! Anda menang hadiah GRATIS, klaim sekarang!"</b><br>
      Tanpa berpikir panjang kamu curiga itu penipuan. Kenapa? Karena dari <b>pengalaman</b> (data masa lalu),
      kata seperti <i>gratis</i>, <i>hadiah</i>, dan <i>klaim</i> <b>sering</b> muncul di pesan penipuan
      dan <b>jarang</b> muncul di pesan teman.<br><br>
      Naive Bayes melakukan hal yang sama, hanya saja memakai <b>angka peluang</b>.`));

    el.append(ML.html(`<div class="grid2">
      <div class="stat"><div class="k">PENGALAMAN (data latih)</div>
        <div style="font-size:14.5px;margin-top:6px">kata <b>"gratis"</b> muncul di…</div>
        <div style="display:grid;grid-template-columns:110px 1fr;gap:6px 8px;align-items:center;font-size:14px;margin-top:6px">
          <span>pesan penipuan</span><div style="height:14px;width:90%;background:var(--c2);border-radius:3px"></div>
          <span>pesan teman</span><div style="height:14px;width:6%;background:var(--c1);border-radius:3px"></div>
        </div>
        <div class="d" style="margin-top:4px">sering di penipuan, jarang di pesan teman</div></div>
      <div class="stat"><div class="k">PESAN BARU</div>
        <div style="font-size:15px;margin-top:6px">"Selamat! Anda menang hadiah <b>GRATIS</b>, klaim sekarang!"</div>
        <div style="margin-top:8px;font-size:15px">→ kemungkinan besar <b>PENIPUAN</b></div></div>
    </div>`));

    // ---------- konsep ----------
    el.append(h('h2', {}, 'Ide Dasar: Prior × Likelihood'));
    el.append(h('p', { html: `<b>Peluang</b> (probabilitas) = angka 0 sampai 1 yang menyatakan seberapa mungkin sesuatu terjadi.
      0 = mustahil, 1 = pasti, 0.6 = 60%. Naive Bayes menggabungkan dua jenis peluang:` }));
    el.append(ML.html(`<div class="grid3">
      <div class="stat"><div class="k">PRIOR (sebelum baca isi)</div>
        <div style="font-size:15px;margin-top:4px">"Dari semua pesan, <b>60%</b> biasanya spam."</div>
        <div class="d">P(kelas) = peluang awal tiap kelas</div></div>
      <div class="stat"><div class="k">LIKELIHOOD (setelah baca isi)</div>
        <div style="font-size:15px;margin-top:4px">"Kata <b>gratis</b> sering muncul di spam."</div>
        <div class="d">P(kata | kelas) = seberapa sering kata itu muncul di kelas itu</div></div>
      <div class="stat"><div class="k">SKOR / POSTERIOR (kesimpulan)</div>
        <div style="font-size:15px;margin-top:4px">prior × likelihood → "pesan ini kemungkinan besar <b>spam</b>"</div>
        <div class="d">kelas dengan skor terbesar = jawaban</div></div>
    </div>`));

    el.append(box('rumus', 'Rumus Skor Tiap Kelas', ML.formula(
      `Skor(<span class="var">kelas</span>) = P(<span class="var">kelas</span>) × P(<span class="var">kata</span><sub>1</sub> | <span class="var">kelas</span>) × P(<span class="var">kata</span><sub>2</sub> | <span class="var">kelas</span>) × …`,
      [
        ['P(kelas)', '<b>prior</b>: jumlah pesan kelas itu ÷ jumlah semua pesan'],
        ['P(kata | kelas)', '<b>likelihood</b>: peluang kata itu muncul, <i>kalau</i> pesannya dari kelas itu. Tanda "|" dibaca "jika diketahui".'],
        ['×', 'semua dikalikan, satu faktor untuk tiap kata di pesan baru'],
        ['Skor', 'dibandingkan antar kelas. Skor terbesar menang. Bagi dengan total skor supaya jadi persen.'],
      ])));
    el.append(box('info', 'Dari mana rumus ini? (Teorema Bayes)', `
      Rumus lengkapnya: P(kelas | data) = P(data | kelas) × P(kelas) ÷ P(data).
      Bagian <b>P(data)</b> nilainya sama untuk semua kelas, jadi boleh dibuang saat <b>membandingkan</b>.
      Sisanya tinggal <b>prior × likelihood</b>.`));

    // ---------- naive ----------
    el.append(h('h2', {}, 'Kenapa Disebut "Naive" (Naif)?'));
    el.append(h('p', { html: `Karena algoritma ini menganggap setiap kata <b>saling bebas</b>: kemunculan satu kata
      tidak memengaruhi kata lain. Padahal kenyataannya kata "machine" dan "learning" sering muncul bersama.` }));
    el.append(ML.html(`<div class="grid2">
      <div class="stat"><div class="k">KENYATAAN</div>
        <div style="font-size:16px;margin:10px 0;text-align:center">machine <span style="color:var(--text-3)">◄── sering bersama ──►</span> learning</div>
        <div class="d">kata-kata saling berhubungan</div></div>
      <div class="stat"><div class="k">ANGGAPAN NAIVE BAYES</div>
        <div style="font-size:16px;margin:10px 0;text-align:center">P(machine) &nbsp;×&nbsp; P(learning)</div>
        <div class="d">tiap kata dihitung sendiri-sendiri, lalu dikalikan</div></div>
    </div>`));
    el.append(h('p', { html: `Anggapan ini <b>tidak realistis</b> (makanya disebut naif), tapi justru membuat hitungannya
      <b>sangat mudah</b>: tinggal kalikan. Di praktik hasilnya sering tetap bagus, terutama untuk teks.` }));

    // ---------- laplace ----------
    el.append(h('h2', {}, 'Masalah Peluang Nol & Laplace Smoothing'));
    el.append(h('p', { html: `Kalau sebuah kata <b>belum pernah</b> muncul di kelas spam, peluangnya 0. Karena semua dikalikan,
      <b>skor spam langsung jadi 0</b>, walaupun kata lain sangat menunjukkan spam. Solusinya: setiap hitungan <b>ditambah 1</b>.
      Trik ini disebut <b>Laplace smoothing</b> (smoothing = "menghaluskan").` }));
    el.append(box('rumus', 'Rumus Likelihood dengan Laplace Smoothing', ML.formula(
      `P(<span class="var">kata</span> | <span class="var">kelas</span>) = ${ML.frac('jumlah kata itu di kelas + 1', 'total kata di kelas + |V|')}`,
      [
        ['jumlah kata itu di kelas', 'berapa kali kata itu muncul di semua pesan kelas tersebut'],
        ['+ 1', 'Laplace smoothing, supaya tidak ada peluang yang 0'],
        ['total kata di kelas', 'jumlah semua kata (termasuk yang berulang) di pesan kelas itu'],
        ['|V|', 'ukuran <b>kosakata</b> (vocabulary) = banyaknya kata <b>unik</b> di semua data latih'],
      ])));

    // ---------- interaktif ----------
    el.append(h('h2', {}, 'Coba Sendiri: Detektor Spam Mini'));
    const DEFAULT = 'spam: gratis hadiah\nspam: gratis pulsa gratis\nspam: klaim hadiah\nbukan: rapat besok pagi\nbukan: kirim tugas besok';
    el.append(box('coba', null, `Tulis <b>data latih</b> di kotak kiri: satu pesan per baris, diawali <code>spam:</code> atau <code>bukan:</code>.
      Lalu ketik <b>pesan baru</b>. Semua hitungan di bawah langsung berubah. Coba juga matikan Laplace smoothing
      dan lihat apa yang terjadi pada pesan <code>gratis besok</code>.`));

    const ta = h('textarea', { rows: 7, 'aria-label': 'data latih', spellcheck: 'false' });
    ta.value = DEFAULT;
    const msgIn = h('input', { type: 'text', value: 'gratis besok', 'aria-label': 'pesan baru', style: 'width:100%' });
    const smoothCb = h('input', { type: 'checkbox', checked: true, id: 'nb-smooth' });
    const quick = ['gratis besok', 'rapat besok', 'hadiah pulsa', 'tugas gratis', 'klaim hadiah besok pagi'];
    const resetBtn = h('button', { onclick: () => { ta.value = DEFAULT; msgIn.value = 'gratis besok'; smoothCb.checked = true; update(); } }, '↺ Kembalikan contoh awal');
    el.append(h('div', { class: 'grid2' },
      h('div', { class: 'ctl' }, h('label', {}, 'Data latih (spam: … / bukan: …)'), ta),
      h('div', {},
        h('div', { class: 'ctl' }, h('label', {}, 'Pesan baru yang mau ditebak'), msgIn),
        h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin:8px 0' },
          h('span', { class: 'small muted', style: 'align-self:center' }, 'contoh:'),
          ...quick.map((q) => h('button', { style: 'padding:3px 10px;font-size:13.5px', onclick: () => { msgIn.value = q; update(); } }, q))),
        h('label', { for: 'nb-smooth', style: 'display:flex;gap:8px;align-items:center;margin:8px 0' }, smoothCb, 'Pakai Laplace smoothing (+1)'),
        resetBtn)));

    const out = h('div', {});
    el.append(out);

    function compute() {
      const docs = [], bad = [];
      ta.value.split('\n').forEach((ln) => {
        const t = ln.trim(); if (!t) return;
        const m = t.match(/^(spam|bukan(?:\s*spam)?)\s*:\s*(.*)$/i);
        if (!m) { bad.push(t); return; }
        docs.push({ c: /^spam/i.test(m[1]) ? 0 : 1, words: tok(m[2]) });
      });
      const vocab = [], cnt = {}, total = [0, 0], nDoc = [0, 0];
      for (const d of docs) {
        nDoc[d.c]++;
        for (const w of d.words) {
          if (!cnt[w]) { cnt[w] = [0, 0]; vocab.push(w); }
          cnt[w][d.c]++; total[d.c]++;
        }
      }
      const N = docs.length, V = vocab.length, a = smoothCb.checked ? 1 : 0;
      const prior = [0, 1].map((c) => (N ? nDoc[c] / N : 0));
      const msgW = tok(msgIn.value);
      const known = msgW.filter((w) => cnt[w]), unknown = [...new Set(msgW.filter((w) => !cnt[w]))];
      const lik = known.map((w) => [0, 1].map((c) => { const den = total[c] + a * V; return den ? (cnt[w][c] + a) / den : 0; }));
      const score = [0, 1].map((c) => lik.reduce((s, l) => s * l[c], prior[c]));
      const sum = score[0] + score[1];
      return { docs, bad, vocab, cnt, total, nDoc, N, V, a, prior, msgW, known, unknown, lik, score, sum };
    }

    function update() {
      const r = compute();
      out.innerHTML = '';
      if (r.bad.length) out.append(box('info', 'Baris yang diabaikan', 'Baris ini tidak diawali <code>spam:</code> atau <code>bukan:</code>, jadi tidak dipakai: ' + r.bad.map((b) => '<code>' + esc(b) + '</code>').join(', ')));
      if (!r.nDoc[0] || !r.nDoc[1]) {
        out.append(box('info', 'Data belum cukup', 'Butuh minimal <b>satu</b> pesan <code>spam:</code> dan <b>satu</b> pesan <code>bukan:</code> supaya kedua kelas bisa dibandingkan.'));
        return;
      }
      const msgSet = new Set(r.msgW);
      const S = r.a ? ' + 1' : '', SV = r.a ? ' + ' + r.V : '';

      // langkah 1: prior
      const L1 = [`<b>Prior</b>: dari ${r.N} pesan latih, berapa yang spam dan berapa yang bukan?`,
        `P(spam)       = ${r.nDoc[0]} / ${r.N} = ${sig(r.prior[0])}\nP(bukan spam) = ${r.nDoc[1]} / ${r.N} = ${sig(r.prior[1])}`];
      // langkah 2: hitung kata
      const L2 = [`<b>Hitung kemunculan kata</b> di tiap kelas (baris berwarna = kata yang ada di pesan baru)`,
        `total kata spam = ${r.total[0]},  total kata bukan spam = ${r.total[1]},  kosakata |V| = ${r.V} kata unik`];
      // langkah 3: likelihood
      const L3 = [`<b>Likelihood</b> tiap kata di pesan baru ${r.a ? '(dengan Laplace smoothing +1)' : '(<b>tanpa</b> smoothing)'}`,
        r.known.length ? null : 'Tidak ada kata pesan baru yang dikenal. Skor = prior saja.'];
      // langkah 4: skor
      const fac = (c) => [sig(r.prior[c]), ...r.lik.map((l) => sig(l[c]))].join(' × ');
      const L4 = ['<b>Skor tiap kelas</b> = prior × semua likelihood',
        `Skor spam       = ${fac(0)} = ${sig(r.score[0])}\nSkor bukan spam = ${fac(1)} = ${sig(r.score[1])}`];
      // langkah 5: normalisasi
      const L5 = r.sum > 0
        ? ['<b>Ubah ke persen</b>: bagi skor dengan total skor',
          `spam       = ${sig(r.score[0])} / (${sig(r.score[0])} + ${sig(r.score[1])}) = ${pct(r.score[0] / r.sum)}\nbukan spam = ${sig(r.score[1])} / (${sig(r.score[0])} + ${sig(r.score[1])}) = ${pct(r.score[1] / r.sum)}`]
        : ['<b>Ubah ke persen</b>', 'Kedua skor = 0, jadi tidak bisa dibandingkan. Inilah masalah peluang nol!'];

      const ol = steps([L1, L2, L3, L4, L5]);
      const lis = ol.children;
      // tabel hitungan kata
      lis[1].append(ML.table(['Kata', 'Jumlah di <b>spam</b>', 'Jumlah di <b>bukan spam</b>'],
        r.vocab.map((w) => [(msgSet.has(w) ? '<b>' + esc(w) + '</b>' : esc(w)), r.cnt[w][0], r.cnt[w][1]])
          .concat([['<b>Total kata</b>', '<b>' + r.total[0] + '</b>', '<b>' + r.total[1] + '</b>']])));
      const tbl2 = lis[1].querySelector('table');
      r.vocab.forEach((w, i) => { if (msgSet.has(w)) tbl2.rows[i + 1].classList.add('hl'); });
      // tabel likelihood dengan pecahan
      if (r.known.length) {
        const cell = (w, c, l) => `${ML.frac(r.cnt[w][c] + S, r.total[c] + SV)} = ${ML.frac(r.cnt[w][c] + r.a, r.total[c] + r.a * r.V)} = <b>${sig(l)}</b>`
          + (l === 0 ? ' <span style="color:var(--bad)">✗ nol!</span>' : '');
        lis[2].append(ML.table(['Kata', 'P(kata | spam)', 'P(kata | bukan spam)'],
          r.known.map((w, i) => [esc(w), cell(w, 0, r.lik[i][0]), cell(w, 1, r.lik[i][1])])));
      }
      if (r.unknown.length) lis[2].append(h('div', { class: 'small muted', html: 'Kata yang tidak ada di kosakata diabaikan (sama seperti scikit-learn): ' + r.unknown.map((w) => '<code>' + esc(w) + '</code>').join(', ') }));

      out.append(box('langkah', 'Langkah Hitung (otomatis dari data di atas)', ol));

      // hasil: dua batang
      const res = h('div', { class: 'canvas-wrap', style: 'padding:6px 14px 12px' });
      res.append(ML.legend([{ label: 'spam', color: 'c2', shape: 'square' }, { label: 'bukan spam', color: 'c1', shape: 'circle' }]));
      const grid = h('div', { style: 'display:grid;grid-template-columns:100px 1fr 64px;gap:8px 10px;align-items:center;margin-top:10px' });
      [0, 1].forEach((c) => {
        const p = r.sum > 0 ? r.score[c] / r.sum : 0;
        const track = h('div', { style: 'background:var(--surface-2);border-radius:4px;height:24px' },
          h('div', { style: `width:${(p * 100).toFixed(2)}%;height:100%;background:var(--${COL[c]});border-radius:4px;transition:width .25s` }));
        track.addEventListener('mousemove', (e) => ML.tip.show(e.clientX, e.clientY, `<b>${NAMA[c]}</b><br>skor ${sig(r.score[c])}<br>peluang ${pct(p)}`));
        track.addEventListener('mouseleave', () => ML.tip.hide());
        grid.append(h('span', { style: 'font-size:14.5px' }, NAMA[c]), track, h('span', { class: 'mono', style: 'background:none;font-weight:700' }, pct(p)));
      });
      res.append(grid);
      let verdict;
      if (r.sum === 0) verdict = 'Tidak bisa memutuskan: kedua skor 0. Nyalakan lagi Laplace smoothing.';
      else if (r.score[0] === r.score[1]) verdict = 'Skor sama persis, jadi seri.';
      else {
        const w = r.score[0] > r.score[1] ? 0 : 1;
        verdict = `Pesan <b>"${esc(msgIn.value.trim())}"</b> ditebak: <b style="font-size:17px">${NAMA[w].toUpperCase()}</b> (${pct(r.score[w] / r.sum)})`;
      }
      res.append(h('div', { style: 'margin-top:10px', html: 'Keputusan: ' + verdict }));
      out.append(res);
      if (!r.a && r.score.some((s) => s === 0) && r.sum > 0)
        out.append(box('info', 'Lihat efek peluang nol', 'Satu kata yang belum pernah muncul di sebuah kelas membuat skor kelas itu langsung <b>0</b>, apa pun kata lainnya. Nyalakan Laplace smoothing untuk memperbaikinya.'));
    }
    ta.addEventListener('input', update);
    msgIn.addEventListener('input', update);
    smoothCb.addEventListener('change', update);
    update();

    // ---------- kontras alur ----------
    el.append(h('h2', {}, 'Bedanya dengan Model Lain: Tidak Ada Loss & Epoch'));
    el.append(h('p', { html: `Logistic Regression, neural network, dan Word2Vec belajar dengan cara <b>menebak → mengukur salah (loss) →
      memperbaiki bobot</b>, diulang ratusan kali (epoch). Naive Bayes <b>tidak</b>. "Belajarnya" cukup <b>menghitung</b>
      (counting) sekali jalan seperti yang barusan kamu lihat. Karena itu Naive Bayes <b>sangat cepat</b>.` }));
    el.append(h('div', { class: 'small muted' }, 'Model biasa:'));
    el.append(ML.flow([{ t: 'Data' }, { t: 'Fitur' }, { t: 'Model', s: 'tebak' }, { t: 'Loss', s: 'seberapa salah' }, { t: 'Gradient', s: 'arah perbaikan' }, { t: '↻ Ulangi', s: 'ratusan epoch' }]).el);
    el.append(h('div', { class: 'small muted' }, 'Naive Bayes:'));
    el.append(ML.flow([{ t: 'Data' }, { t: 'Fitur', s: 'hitung kata' }, { t: 'Hitung peluang', s: 'sekali jalan' }, { t: 'Selesai ✓', s: 'tanpa loss/epoch' }], 2).el);
    el.append(ML.table(['Tahap ML', 'Di Naive Bayes'], [
      ['Parameter (dipelajari mesin)', 'Prior P(kelas) dan likelihood P(kata | kelas)'],
      ['Hyperparameter (diatur manusia)', '<code>alpha</code> = besar smoothing (1 = Laplace)'],
      ['Loss, gradient descent, optimizer, epoch', '<b>Tidak dipakai</b>'],
    ]));

    // ---------- kode ----------
    el.append(h('h2', {}, 'Kode Python (scikit-learn)'));
    el.append(h('p', {}, 'Hasilnya sama persis dengan hitungan manual di atas (64% spam).'));
    el.append(h('pre', { class: 'code' }, `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

pesan = ["gratis hadiah", "gratis pulsa gratis", "klaim hadiah",
         "rapat besok pagi", "kirim tugas besok"]
label = ["spam", "spam", "spam", "bukan spam", "bukan spam"]

vectorizer = CountVectorizer()          # teks -> jumlah kemunculan kata
X = vectorizer.fit_transform(pesan)

model = MultinomialNB(alpha=1.0)        # alpha=1.0 = Laplace smoothing (+1)
model.fit(X, label)                     # "belajar" = menghitung, sekali jalan

baru = vectorizer.transform(["gratis besok"])
print(model.predict(baru))              # ['spam']
print(model.predict_proba(baru))        # [[0.363 0.637]] -> urutan: bukan spam, spam`));

    el.append(h('h3', {}, 'Jenis-jenis Naive Bayes'));
    el.append(ML.table(['Jenis', 'Cocok untuk data', 'Contoh'], [
      ['<b>Multinomial NB</b>', 'Jumlah kemunculan (berapa kali kata muncul)', 'Spam, sentimen (yang kita pakai di atas)'],
      ['<b>Bernoulli NB</b>', 'Ada / tidak ada (0 atau 1)', 'Teks pendek'],
      ['<b>Gaussian NB</b>', 'Angka desimal (kontinu)', 'Tinggi badan, suhu, data tabel'],
    ]));

    el.append(box('bisindo', null, `Data BISINDO berupa <b>63 angka desimal</b> (koordinat titik tangan), bukan kata.
      Kalau mau mencoba Naive Bayes di sana, jenis yang cocok adalah <b>Gaussian NB</b>. Biasanya dipakai sebagai
      <b>baseline</b> (pembanding awal) yang sangat cepat, sebelum model utama seperti <a href="#svm">SVM</a>.`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Skor tiap kelas di Naive Bayes dihitung dengan…', options: ['Loss × jumlah epoch', 'Prior × likelihood semua kata', 'Jumlah kata di pesan baru'], answer: 1, explain: 'Skor = P(kelas) × P(kata₁ | kelas) × P(kata₂ | kelas) × … lalu skor terbesar menang.' },
      { q: 'Kenapa disebut "naive" (naif)?', options: ['Karena datanya sedikit', 'Karena menganggap tiap kata saling bebas, tidak saling memengaruhi', 'Karena hasilnya selalu salah'], answer: 1, explain: 'Asumsi saling bebas ini tidak realistis, tapi membuat hitungan jadi tinggal dikali.' },
      { q: 'Tanpa Laplace smoothing, pesan "gratis besok" punya skor spam…', options: ['0, karena "besok" belum pernah muncul di spam', 'Tetap 0.009375', 'Lebih besar dari 1'], answer: 0, explain: 'P(besok | spam) = 0/7 = 0, dan apa pun yang dikali 0 hasilnya 0. Makanya tiap hitungan ditambah 1.' },
      { q: 'Bagaimana Naive Bayes "belajar"?', options: ['Gradient descent ratusan epoch', 'Menghitung kemunculan kata sekali jalan', 'Menebak secara acak'], answer: 1, explain: 'Tidak ada loss, gradient, maupun epoch. Cukup counting, makanya sangat cepat.' },
    ]));
  },
});
