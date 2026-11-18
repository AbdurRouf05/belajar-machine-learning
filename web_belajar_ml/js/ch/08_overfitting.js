/* Bab 8 — Epoch, Overfitting & Underfitting */
ML.chapter({
  id: 'overfitting',
  num: 8,
  group: 'Cara Mesin Belajar',
  title: 'Epoch, Overfitting & Underfitting',
  lead: 'Model yang bagus bukan yang <b>hafal</b> data latih, tapi yang bisa menebak <b>data baru</b> dengan benar.',
  render(el) {
    const { h, box, steps, fmt } = ML;

    // ---------------- epoch ----------------
    el.append(h('h2', {}, 'Epoch: Berapa Kali Seluruh Data Dipelajari'));
    el.append(h('p', {}, `1 epoch = model sudah melihat seluruh data latih sebanyak satu kali. Untuk tiap data, model menjalankan putaran
      yang sudah kamu kenal: tebak → hitung loss → hitung gradient → perbarui bobot (Bab 5 dan 6). Satu kali belum cukup, jadi diulang berkali-kali.`));
    el.append(box('coba', null, 'Tekan <b>Jalankan 1 epoch</b>. Lihat model membaca 10 data satu per satu. Setelah data ke-10 selesai, hitungan epoch bertambah 1.'));
    const N_CARD = 10;
    const cards = Array.from({ length: N_CARD }, (_, i) => h('div', {
      style: 'flex:1 1 52px;min-width:52px;text-align:center;padding:8px 4px;border:1.5px solid var(--border);border-radius:8px;background:var(--surface);font-size:13.5px;transition:all .12s',
    }, h('div', { style: 'font-weight:600' }, 'data ' + (i + 1)), h('div', { class: 'small muted', 'data-c': 1 }, 'dilihat 0×')));
    const seen = Array(N_CARD).fill(0);
    let epoch = 0, epTimer = null;
    const epInfo = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const bEp = h('button', { class: 'primary', onclick: () => runEpoch() }, 'Jalankan 1 epoch');
    const bEpReset = h('button', { onclick: () => { stopEp(); epoch = 0; seen.fill(0); paintCards(-1); } }, '↺ Reset');
    function paintCards(active) {
      cards.forEach((c, i) => {
        const on = i === active;
        c.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
        c.style.background = on ? 'var(--surface-2)' : 'var(--surface)';
        c.style.transform = on ? 'translateY(-3px)' : 'none';
        c.querySelector('[data-c]').textContent = 'dilihat ' + seen[i] + '×';
      });
      epInfo.innerHTML = `
        <div class="stat"><div class="k">Epoch selesai</div><div class="v">${epoch}</div><div class="d">putaran penuh atas 10 data</div></div>
        <div class="stat"><div class="k">Update bobot</div><div class="v">${seen.reduce((a, b) => a + b, 0)}</div><div class="d">1 update per data (seperti SGD)</div></div>
        <div class="stat"><div class="k">Posisi sekarang</div><div class="v">${active >= 0 ? 'data ' + (active + 1) : '—'}</div><div class="d">${active >= 0 ? 'sedang dipelajari' : 'menunggu'}</div></div>`;
      bEp.disabled = !!epTimer;
    }
    function stopEp() { if (epTimer) { clearInterval(epTimer); epTimer = null; } }
    function runEpoch() {
      if (epTimer) return;
      let i = 0;
      epTimer = setInterval(() => {
        if (!bEp.isConnected) { stopEp(); return; }
        if (i >= N_CARD) { stopEp(); epoch++; paintCards(-1); return; }
        seen[i]++; paintCards(i); i++;
      }, 180);
      paintCards(-1);
    }
    el.append(h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin:10px 0' }, ...cards), h('div', { class: 'controls' }, bEp, bEpReset), epInfo);
    paintCards(-1);
    el.append(box('info', 'Berapa epoch yang pas?', `
      <ul style="margin:4px 0;padding-left:20px">
        <li>Epoch <b>terlalu sedikit</b> → model belum cukup belajar (<b>underfitting</b>).</li>
        <li>Epoch <b>terlalu banyak</b> → model mulai <b>menghafal</b> data latih, bukan memahami polanya (<b>overfitting</b>).</li>
      </ul>
      Kedua istilah ini dijelaskan di bawah. Contoh: <code>epochs=200</code> artinya seluruh data dibaca ulang 200 kali.`));

    // ---------------- analogi ----------------
    el.append(h('h2', {}, 'Menghafal vs Memahami'));
    el.append(box('analogi', null, `Tiga siswa belajar untuk ujian dari <b>buku latihan soal</b>:
      <ul style="margin:6px 0;padding-left:20px">
        <li><b>Siswa A (underfitting)</b>: belajarnya terlalu sedikit. Soal latihan saja masih banyak salah, apalagi soal ujian.</li>
        <li><b>Siswa B (pas)</b>: memahami <b>cara</b> mengerjakan. Soal latihan bagus, soal ujian yang baru juga bagus.</li>
        <li><b>Siswa C (overfitting)</b>: <b>menghafal jawaban</b> tiap soal latihan. Soal latihan nilainya 100, tapi begitu soal ujian sedikit berbeda, langsung bingung.</li>
      </ul>
      Di ML: <b>soal latihan = data latih (training)</b>, <b>soal ujian = data uji (testing)</b> yang tidak pernah dilihat model saat belajar.`));
    el.append(ML.table(['', 'Error data latih', 'Error data uji', 'Artinya'], [
      ['<b>Underfitting</b>', 'besar', 'besar', 'model terlalu sederhana / belum cukup belajar'],
      ['<b>Pas</b>', 'kecil', 'kecil', 'model menangkap pola sebenarnya'],
      ['<b>Overfitting</b>', 'sangat kecil (hampir 0)', '<b>besar</b>', 'model menghafal, termasuk noise (gangguan acak)'],
    ]));

    // ---------------- demo polinomial ----------------
    el.append(h('h2', {}, 'Coba: Seberapa Lentur Kurva Model?'));
    el.append(h('p', {}, `Di bawah ada 10 titik data latih (lingkaran biru) dan 10 titik data uji (kotak oranye). Keduanya berasal dari pola asli
      yang sama, ditambah sedikit noise (gangguan acak, seperti salah ukur). Model kita berupa kurva polinomial. Derajat polinomial
      menentukan seberapa lentur kurvanya: derajat 1 = garis lurus, derajat 2 = satu lengkungan, derajat 9 = sangat berkelok-kelok.`));
    el.append(box('coba', null, `Geser <b>derajat</b> dari 1 sampai 9. Model hanya belajar dari titik <b>biru</b>.
      Perhatikan error data latih dan data uji. Derajat 9 bisa melewati semua titik biru (error latih ≈ 0), tapi bagaimana dengan titik oranye?`));

    // data tetap (dibuat sekali dari pola 2 + 2.5·sin(x/2.2) + noise, seed tetap) supaya hasil selalu sama
    const TRAIN = [[0.35, 0.7], [1.44, 3.5], [2.25, 3.77], [3.35, 3.87], [3.96, 4.45], [4.91, 4.52], [5.96, 2.97], [6.83, 0.97], [7.94, 0.78], [8.73, -0.28]];
    const TEST = [[0.83, 2.75], [1.69, 4.09], [2.57, 4.51], [3.55, 4.5], [4.45, 3.9], [5.39, 4.37], [6.49, 2.5], [7.55, 0.96], [8.29, 0.96], [9.43, 0.1]];
    const truth = (x) => 2 + 2.5 * Math.sin(x / 2.2);
    const scale = (x) => (x - 5) / 5; // x 0..10 → −1..1 supaya hitungan stabil
    // least squares dengan persamaan normal (XᵀX + λI) w = Xᵀy, diselesaikan eliminasi Gauss-Jordan
    function fit(pts, d, lam) {
      const n = d + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
      for (const [x, y] of pts) {
        const t = scale(x), pw = []; for (let k = 0; k < n; k++) pw.push(Math.pow(t, k));
        for (let i = 0; i < n; i++) { for (let j = 0; j < n; j++) A[i][j] += pw[i] * pw[j]; A[i][n] += pw[i] * y; }
      }
      for (let i = 1; i < n; i++) A[i][i] += lam + 1e-9;
      for (let c = 0; c < n; c++) {
        let m = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r;
        [A[c], A[m]] = [A[m], A[c]];
        for (let r = 0; r < n; r++) { if (r === c) continue; const k = A[r][c] / A[c][c]; for (let j = c; j <= n; j++) A[r][j] -= k * A[c][j]; }
      }
      const w = A.map((row, i) => row[n] / row[i]);
      return (x) => { const t = scale(x); let s = 0, p = 1; for (let k = 0; k < n; k++) { s += w[k] * p; p *= t; } return s; };
    }
    const fe = (v) => (v < 5e-4 ? '≈ 0' : fmt(v, v > 100 ? 0 : 3));
    const mse = (g, P) => P.reduce((s, [x, y]) => s + (g(x) - y) ** 2, 0) / P.length;
    const LAMS = [0, 0.001, 0.01, 0.1, 1];
    let deg = 1, lamIdx = 0;
    let all = [], g = null, label = '';
    function compute() {
      const lam = LAMS[lamIdx];
      all = [];
      for (let d = 1; d <= 9; d++) { const gd = fit(TRAIN, d, lam); all.push({ d, g: gd, tr: mse(gd, TRAIN), te: mse(gd, TEST) }); }
      g = all[deg - 1].g;
      // aturan sederhana: error latih masih besar → underfitting;
      // error latih kecil tapi error uji jauh lebih besar → overfitting; selain itu pas
      const cur = all[deg - 1];
      if (cur.tr > 0.3) label = 'under';
      else if (cur.te > 0.6 && cur.te > 2 * cur.tr) label = 'over';
      else label = 'pas';
    }
    compute();
    const slDeg = ML.slider({ label: 'Derajat polinomial (kelenturan)', min: 1, max: 9, step: 1, value: 1, digits: 0, onInput: (v) => { deg = Math.round(v); renderFit(); } });
    const slLam = ML.slider({ label: 'Tingkat regularisasi (0–4)', min: 0, max: 4, step: 1, value: 0, digits: 0, onInput: (v) => { lamIdx = Math.round(v); renderFit(); } });
    const lamTxt = h('div', { class: 'small muted' });
    const fitStats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const fitSteps = h('div');
    const pf = ML.plot({
      width: 640, height: 340, x: [0, 10], y: [-2, 7],
      xLabel: 'x (fitur)', yLabel: 'y (target)',
      legend: [
        { label: 'data latih (dipelajari model)', color: 'c1', shape: 'circle' },
        { label: 'data uji (tidak dilihat saat belajar)', color: 'c2', shape: 'square' },
        { label: 'kurva model', color: 'c3', shape: 'line' },
        { label: 'pola asli (biasanya tidak diketahui)', color: 'text-2', shape: 'line' },
      ],
      caption: 'Garis putus-putus = jarak tiap titik uji ke kurva model (inilah error data uji).',
    });
    pf.draw((p) => {
      p.clear(); p.grid(); p.axes();
      p.fn(truth, { color: 'text-2', width: 1.5, dash: [6, 5] });
      TEST.forEach(([x, y]) => p.line(x, y, x, g(x), { color: 'c2', width: 1, dash: [2, 3] }));
      p.fn(g, { color: 'c3', width: 2.5, samples: 500 });
      TRAIN.forEach(([x, y]) => p.point(x, y, { color: 'c1', r: 6 }));
      TEST.forEach(([x, y]) => p.point(x, y, { color: 'c2', r: 5.5, shape: 'square' }));
      p.text(0.2, 7, 'kurva model derajat ' + deg, { align: 'left', base: 'top', dy: 4, size: 12.5, bold: true, bg: true });
    });
    pf.onHover((x, y) => {
      const i = pf.nearest(TRAIN, x, y), j = pf.nearest(TEST, x, y);
      if (i >= 0) { const [a, b] = TRAIN[i]; return `<b>data latih ${i + 1}</b><br>x = ${fmt(a)}, y = ${fmt(b)}<br>tebakan model = ${fmt(g(a))}<br>error² = ${fmt((g(a) - b) ** 2, 3)}`; }
      if (j >= 0) { const [a, b] = TEST[j]; return `<b>data uji ${j + 1}</b><br>x = ${fmt(a)}, y = ${fmt(b)}<br>tebakan model = ${fmt(g(a))}<br>error² = ${fmt((g(a) - b) ** 2, 3)}`; }
      if (x < 0 || x > 10) return null;
      return `x = ${fmt(x)}<br>kurva model = ${fmt(g(x))}`;
    });

    const CAP = 3;
    const pe = ML.plot({
      width: 640, height: 250, x: [0.5, 9.5], y: [0, CAP * 1.1], yTicks: [0, 0.5, 1, 1.5, 2, 2.5, 3], xTicks: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      xLabel: 'derajat polinomial', yLabel: 'error (MSE)', pad: { l: 52 },
      legend: [{ label: 'error data latih', color: 'c1', shape: 'circle' }, { label: 'error data uji', color: 'c2', shape: 'square' }],
      caption: `Error latih terus turun saat model makin lentur. Error uji turun dulu, lalu <b>naik lagi</b>: itulah overfitting. Nilai di atas ${CAP} ditandai ▲ di tepi atas.`,
    });
    pe.draw((p) => {
      p.clear(); p.grid(); p.axes();
      p.rect(deg - 0.4, 0, deg + 0.4, CAP, { fill: 'text-2', alpha: 0.08 });
      const cl = (v) => Math.min(v, CAP);
      p.path(all.map((a) => [a.d, cl(a.tr)]), { color: 'c1', width: 2 });
      p.path(all.map((a) => [a.d, cl(a.te)]), { color: 'c2', width: 2 });
      all.forEach((a) => {
        p.point(a.d, cl(a.tr), { color: 'c1', r: 6 });
        p.point(a.d, cl(a.te), { color: 'c2', r: 5.5, shape: 'square' });
        if (a.te > CAP) p.text(a.d, CAP, '▲ ' + fmt(a.te, a.te > 10 ? 0 : 1), { align: 'left', dx: 10, dy: 10, size: 11.5, color: 'text-2', bg: true });
      });
    });
    pe.onHover((x) => {
      const d = Math.round(x); if (d < 1 || d > 9) return null;
      const a = all[d - 1];
      return `<b>derajat ${d}</b><br>error latih = ${fmt(a.tr, 3)}<br>error uji = ${fmt(a.te, 3)}`;
    });

    function renderFit() {
      compute();
      const cur = all[deg - 1], lam = LAMS[lamIdx];
      lamTxt.textContent = 'λ = ' + lam + (lam === 0 ? ' (tanpa regularisasi)' : ' — makin besar, kurva makin "dipaksa" kalem');
      const st = label === 'under' ? '<span class="badge bad">✗ underfitting</span><div class="d" style="margin-top:4px">terlalu kaku, pola belum tertangkap</div>'
        : label === 'over' ? '<span class="badge bad">✗ overfitting</span><div class="d" style="margin-top:4px">menghafal noise data latih</div>'
          : '<span class="badge good">✓ pas</span><div class="d" style="margin-top:4px">error latih &amp; uji sama-sama kecil</div>';
      fitStats.innerHTML = `
        <div class="stat"><div class="k">Error data latih (MSE)</div><div class="v">${fe(cur.tr)}</div><div class="d">soal latihan</div></div>
        <div class="stat"><div class="k">Error data uji (MSE)</div><div class="v">${fe(cur.te)}</div><div class="d">soal ujian</div></div>
        <div class="stat"><div class="k">Status</div><div style="margin-top:6px">${st}</div></div>`;
      fitSteps.innerHTML = '';
      const ex = TEST[0], yh = g(ex[0]);
      fitSteps.append(steps([
        [`Model (derajat ${deg}) belajar hanya dari 10 titik latih, mencari kurva dengan error latih sekecil mungkin`, `error latih = rata-rata (tebakan − y)² di 10 titik biru = ${fe(cur.tr)}`],
        ['Ambil satu titik uji (belum pernah dilihat model), misalnya data uji 1', `x = ${fmt(ex[0])}, y asli = ${fmt(ex[1])}\ntebakan model = ${fmt(yh, 3)}\nerror² = (${fmt(yh, 3)} − ${fmt(ex[1])})² = ${fmt((yh - ex[1]) ** 2, 3)}`],
        ['Lakukan untuk 10 titik uji lalu rata-ratakan', `error uji = <b>${fe(cur.te)}</b>`],
        ['Bandingkan keduanya', label === 'over' ? `error uji jauh lebih besar dari error latih → tanda menghafal (overfitting)` : label === 'under' ? `error latih saja masih besar → model terlalu kaku (underfitting)` : `keduanya kecil dan tidak berbeda jauh → pas`],
      ]));
      pf.redraw(); pe.redraw();
    }
    el.append(h('div', { class: 'controls' }, slDeg.el, h('div', {}, slLam.el, lamTxt)), pf.el, fitStats, pe.el);
    el.append(box('info', 'Bonus: slider λ = rem untuk kurva yang terlalu liar', `<b>Regularisasi</b> = "denda" untuk bobot yang terlalu besar,
      sehingga kurva tidak boleh berkelok seenaknya. Set derajat ke 9, lalu naikkan tingkat regularisasi sedikit (1–2): error uji turun jauh.
      Tapi kalau terlalu besar (tingkat 4), kurva jadi terlalu kaku dan kembali <b>underfitting</b>.`));
    el.append(box('langkah', 'Langkah Hitung Error (ikut berubah)', fitSteps));
    renderFit();

    // ---------------- tips ----------------
    el.append(h('h2', {}, 'Cara Mencegah Overfitting'));
    el.append(ML.table(['Cara', 'Penjelasan sederhana', 'Analogi siswa'], [
      ['<b>Tambah data</b>', 'Makin banyak contoh, makin sulit menghafal semuanya, jadi model terpaksa mencari pola.', 'Latihan dari 1000 soal, bukan 10 soal'],
      ['<b>Regularisasi</b>', 'Memberi denda pada model yang terlalu rumit (seperti λ di atas). Di SVM dan Logistic Regression diatur lewat parameter <b>C</b>: C kecil = regularisasi kuat = model lebih kalem.', 'Guru melarang jawaban yang terlalu bertele-tele'],
      ['<b>Data validasi</b>', 'Sisihkan sebagian data latih untuk "ujian coba". Pilih setelan model yang nilai ujian cobanya paling bagus.', 'Try out sebelum ujian asli'],
      ['<b>Early stopping</b>', 'Pantau error validasi tiap epoch. Begitu mulai naik lagi, hentikan training.', 'Berhenti belajar sebelum mulai sekadar menghafal'],
      ['<b>Model lebih sederhana</b>', 'Kurangi kelenturan (seperti menurunkan derajat polinomial).', 'Pahami konsep, bukan detail tiap soal'],
    ]));
    el.append(box('bisindo', null, `Di proyek BISINDO, data dibagi menjadi <b>data latih</b> dan <b>data uji</b>.
      Kalau akurasi latih 100% tapi akurasi uji jauh lebih rendah, model SVM-mu sedang <b>overfitting</b>
      (misalnya hafal tangan orang tertentu saja). Solusinya: tambah video dari lebih banyak orang,
      atur parameter <b>C</b> pada SVM, dan pakai validasi (misalnya cross-validation) untuk memilih setelan terbaik.`));

    // ---------------- kuis ----------------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Error data latih 0.00, error data uji sangat besar. Model ini…', options: ['Underfitting', 'Pas', 'Overfitting'], answer: 2, explain: 'Hafal data latih (error 0) tapi gagal di data baru = overfitting, seperti siswa yang menghafal jawaban.' },
      { q: 'Error data latih dan data uji sama-sama besar. Model ini…', options: ['Underfitting', 'Pas', 'Overfitting'], answer: 0, explain: 'Data latih saja belum bisa ditebak dengan baik → model terlalu sederhana atau belum cukup belajar.' },
      { q: '1 epoch artinya…', options: ['Model sudah melihat seluruh data latih satu kali', 'Model melihat satu data saja', 'Model selesai dites'], answer: 0, explain: 'Epoch = satu putaran penuh atas seluruh data latih.' },
      { q: 'Mana yang <b>bukan</b> cara mencegah overfitting?', options: ['Menambah data latih', 'Early stopping', 'Menambah epoch terus tanpa batas'], answer: 2, explain: 'Epoch yang terlalu banyak justru membuat model makin menghafal. Early stopping menghentikannya tepat waktu.' },
    ]));
  },
});
