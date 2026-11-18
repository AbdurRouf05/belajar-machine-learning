/* Bab 5 — Loss Function: Mengukur Kesalahan */
ML.chapter({
  id: 'loss',
  num: 5,
  group: 'Cara Mesin Belajar',
  title: 'Loss Function: Mengukur Kesalahan',
  lead: 'Sebelum bisa memperbaiki diri, mesin harus tahu <b>seberapa salah</b> tebakannya. Alat ukurnya disebut <b>loss</b>.',
  render(el) {
    const { h, box, steps, fmt, fmtp } = ML;

    el.append(box('analogi', null, `
      Bayangkan kamu bermain <b>lempar panah</b> ke papan target.
      Setelah melempar, temanmu mengukur <b>jarak panah ke titik tengah</b>.
      Jarak kecil = lemparan bagus. Jarak besar = lemparan jelek.
      <br><br><b>Loss</b> adalah "jarak" itu untuk mesin: satu angka yang mengatakan
      <b>seberapa jauh tebakan mesin dari jawaban yang benar</b>.
      Loss besar → masih banyak salah. Loss kecil → sudah bagus.
      Tujuan belajar = <b>membuat loss sekecil mungkin</b>.`));

    // ---------------- posisi loss dalam alur ----------------
    el.append(h('h2', {}, 'Di Mana Loss Dihitung?'));
    el.append(h('p', {}, 'Ingat lagi alur satu tebakan (disebut forward pass, artinya "jalan maju" dari input sampai tebakan). Loss selalu dihitung di paling akhir, setelah tebakan jadi.'));
    const fx = 2, fw = 0.5, fb = -0.4, fy = 1;
    const fz = fw * fx + fb;
    const fyh = Math.round(ML.sigmoid(fz) * 100) / 100;
    const floss = -Math.log(fyh);
    el.append(ML.flow([
      { t: 'Input x', s: 'x = ' + fmt(fx) },
      { t: 'z = w·x + b', s: 'z = ' + fmt(fz) },
      { t: 'Aktivasi', s: 'sigmoid(z)' },
      { t: 'Prediksi ŷ', s: 'ŷ = ' + fmt(fyh) },
      { t: 'Loss', s: 'seberapa salah?' },
    ], 4).el);
    el.append(box('langkah', 'Contoh satu forward pass sampai loss', steps([
      [`Kalikan input dengan bobot, tambah bias (w = ${fmt(fw)}, b = ${fmt(fb)})`, `z = ${fmt(fw)} × ${fmt(fx)} + ${fmtp(fb)} = <b>${fmt(fz)}</b>`],
      ['Masukkan z ke fungsi aktivasi sigmoid (membuat angka jadi 0–1)', `ŷ = 1 / (1 + e^(−${fmt(fz)})) ≈ <b>${fmt(fyh)}</b>`],
      [`Bandingkan dengan jawaban asli y = ${fy} memakai loss (cross-entropy, dijelaskan di bawah)`, `loss = −ln(${fmt(fyh)}) ≈ <b>${fmt(floss)}</b>`],
    ])));
    el.append(h('p', { class: 'muted small' }, 'Simbol ŷ dibaca "y topi" = tebakan model. Simbol y (tanpa topi) = jawaban yang benar (label).'));

    el.append(h('p', {}, 'Ada dua loss yang paling sering dipakai:'));
    el.append(ML.html(`<div class="grid2">
      <div class="stat"><div class="k">MENEBAK ANGKA (regresi)</div><div style="font-size:15px;margin-top:4px"><b>MSE</b> — Mean Squared Error<br>contoh: menebak harga, nilai ujian</div></div>
      <div class="stat"><div class="k">MENEBAK KELOMPOK (klasifikasi)</div><div style="font-size:15px;margin-top:4px"><b>Cross-Entropy</b><br>contoh: lulus / tidak, huruf A / B / C</div></div>
    </div>`));

    // ---------------- MSE ----------------
    el.append(h('h2', {}, 'MSE: Untuk Menebak Angka'));
    el.append(h('p', {}, 'MSE singkatan dari Mean Squared Error = "rata-rata dari kesalahan yang dikuadratkan". Caranya cuma 3 langkah: selisihkan → kuadratkan → rata-ratakan.'));
    el.append(box('rumus', null, ML.formula(
      `MSE = ${ML.frac('1', 'N')} × Σ (<span class="var">y</span> − <span class="var">ŷ</span>)²`,
      [
        ['y', 'jawaban asli (nilai yang benar)'],
        ['ŷ', 'tebakan model'],
        ['y − ŷ', 'selisih (error) satu data'],
        ['( )²', 'dikuadratkan = dikali dirinya sendiri, supaya selalu positif'],
        ['Σ', 'dibaca "sigma" = jumlahkan semua baris'],
        ['N', 'banyaknya data'],
      ])));

    el.append(box('coba', null, `Kasus: menebak nilai ujian (dalam puluhan) beberapa mahasiswa.
      <b>Ubah angka di kolom "asli" atau "tebakan"</b>. Semua hitungan, batang, dan MSE ikut berubah langsung.`));

    const DEF = [[3, 2.5], [5, 5], [2, 4]];
    let rows = DEF.map((r) => r.slice());
    const tblWrap = h('div', { class: 'tbl-scroll' });
    const mseStats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const mseSteps = h('div');
    const btnAdd = h('button', { onclick: () => { if (rows.length < 6) { rows.push([4, 3]); renderMSE(true); } } }, '+ Tambah baris');
    const btnDel = h('button', { onclick: () => { if (rows.length > 1) { rows.pop(); renderMSE(true); } } }, '− Hapus baris');
    const btnReset = h('button', { onclick: () => { rows = DEF.map((r) => r.slice()); renderMSE(true); } }, '↺ Kembalikan contoh');

    const pm = ML.plot({
      width: 640, height: 260, x: [0.4, 3.6], y: [0, 5],
      yLabel: 'error²', pad: { l: 52, b: 34 },
      xFmt: (v) => 'Mhs ' + v,
      caption: 'Tinggi batang = kesalahan yang sudah dikuadratkan. Perhatikan: kesalahan besar jadi <b>jauh</b> lebih tinggi.',
    });
    const sq = (r) => (r[0] - r[1]) ** 2;
    pm.draw((p) => {
      const n = rows.length, mx = Math.max(1, ...rows.map(sq));
      p.x = [0.4, n + 0.6]; p.y = [0, mx * 1.2];
      p.xTicks = rows.map((_, i) => i + 1);
      p.clear(); p.grid(); p.axes();
      const mse = rows.reduce((s, r) => s + sq(r), 0) / n;
      rows.forEach((r, i) => {
        p.bar(i + 1, 0, sq(r), 0.55, { color: 'c1' });
        p.text(i + 1, sq(r), fmt(sq(r)), { dy: -9, size: 12.5, color: 'text', bold: true });
      });
      p.hline(mse, { color: 'text-2', width: 1.5, dash: [6, 4] });
      p.text(p.x[1], mse, 'MSE = ' + fmt(mse), { align: 'right', base: 'bottom', dy: -3, dx: -4, size: 12.5, color: 'text-2', bg: true });
    });
    pm.onHover((x) => {
      const i = Math.round(x) - 1;
      if (i < 0 || i >= rows.length || Math.abs(x - (i + 1)) > 0.3) return null;
      const [y, yh] = rows[i];
      return `<b>Mhs ${i + 1}</b><br>asli ${fmt(y)}, tebakan ${fmt(yh)}<br>selisih ${fmt(y - yh)} → error² ${fmt(sq(rows[i]))}`;
    });

    function renderMSE(rebuild) {
      const n = rows.length;
      if (rebuild) {
        tblWrap.innerHTML = '';
        const t = h('table', { class: 'tbl' });
        t.append(h('tr', {}, ...['Data', 'asli (y)', 'tebakan (ŷ)', 'selisih (y − ŷ)', 'dikuadratkan'].map((s) => h('th', {}, s))));
        rows.forEach((r, i) => {
          const mk = (j) => { const inp = h('input', { type: 'number', step: '0.5', value: r[j], 'aria-label': (j ? 'tebakan' : 'asli') + ' Mhs ' + (i + 1), style: 'width:76px' });
            inp.addEventListener('input', () => { const v = parseFloat(inp.value); if (isFinite(v)) { rows[i][j] = v; renderMSE(false); } }); return inp; };
          t.append(h('tr', {}, h('td', {}, 'Mhs ' + (i + 1)), h('td', {}, mk(0)), h('td', {}, mk(1)), h('td', { 'data-d': i }), h('td', { 'data-s': i })));
        });
        t.append(h('tr', {}, h('td', { colspan: 4, style: 'text-align:right' }, 'jumlah'), h('td', { 'data-sum': 1, style: 'font-weight:700' })));
        tblWrap.append(t);
      }
      let sum = 0;
      rows.forEach((r, i) => {
        const d = r[0] - r[1], s = d * d; sum += s;
        tblWrap.querySelector(`[data-d="${i}"]`).textContent = fmt(d);
        tblWrap.querySelector(`[data-s="${i}"]`).textContent = fmt(s);
      });
      tblWrap.querySelector('[data-sum]').textContent = fmt(sum);
      const mse = sum / n;
      const big = rows.reduce((b, r, i) => (sq(r) > sq(rows[b]) ? i : b), 0);
      mseStats.innerHTML = `
        <div class="stat"><div class="k">Jumlah error²</div><div class="v">${fmt(sum)}</div><div class="d">dari ${n} data</div></div>
        <div class="stat"><div class="k">MSE</div><div class="v">${fmt(mse)}</div><div class="d">${fmt(sum)} ÷ ${n}</div></div>
        <div class="stat"><div class="k">Penyumbang terbesar</div><div class="v">Mhs ${big + 1}</div><div class="d">error² = ${fmt(sq(rows[big]))}</div></div>`;
      mseSteps.innerHTML = '';
      mseSteps.append(steps([
        ['Selisihkan: jawaban asli dikurangi tebakan', rows.map((r, i) => `Mhs ${i + 1}: ${fmt(r[0])} − ${fmtp(r[1])} = ${fmt(r[0] - r[1])}`).join('\n')],
        ['Kuadratkan tiap selisih (dikali dirinya sendiri)', rows.map((r, i) => `Mhs ${i + 1}: ${fmtp(r[0] - r[1])}² = ${fmt(sq(r))}`).join('\n')],
        ['Jumlahkan semua', rows.map((r) => fmt(sq(r))).join(' + ') + ' = ' + fmt(sum)],
        [`Rata-ratakan: bagi dengan banyak data (N = ${n})`, `MSE = ${fmt(sum)} ÷ ${n} = <b>${fmt(mse)}</b>`],
      ]));
      btnAdd.disabled = n >= 6; btnDel.disabled = n <= 1;
      pm.redraw();
    }
    el.append(tblWrap, h('div', { class: 'controls' }, btnAdd, btnDel, btnReset), mseStats, pm.el);
    el.append(box('langkah', 'Langkah Hitung MSE (ikut berubah)', mseSteps));
    renderMSE(true);
    el.append(box('info', 'Kenapa harus dikuadratkan?', `
      <ul style="margin:4px 0;padding-left:20px">
        <li>Supaya selisih <b>negatif</b> (−2) tidak "membatalkan" selisih <b>positif</b> (+2). Tanpa kuadrat, −2 + 2 = 0, seolah-olah tidak ada salah!</li>
        <li>Supaya kesalahan <b>besar dihukum jauh lebih berat</b>. Selisih 0.5 → 0.25, tapi selisih 2 → 4. Selisihnya cuma 4× lipat, hukumannya 16× lipat.</li>
      </ul>`));

    // ---------------- Cross-entropy ----------------
    el.append(h('h2', {}, 'Cross-Entropy: Untuk Menebak Kelompok'));
    el.append(h('p', {}, `Untuk klasifikasi, model tidak menebak angka biasa, tapi menebak peluang (probabilitas) antara 0 dan 1.
      Misalnya ŷ = 0.95 artinya "model 95% yakin jawabannya LULUS (1)". Loss yang dipakai adalah cross-entropy.`));
    el.append(box('rumus', null, ML.formula(
      `jika <span class="var">y</span> = 1:&nbsp; loss = −ln(<span class="var">ŷ</span>)<br>jika <span class="var">y</span> = 0:&nbsp; loss = −ln(1 − <span class="var">ŷ</span>)`,
      [
        ['y', 'jawaban asli: 1 (misal LULUS) atau 0 (TIDAK LULUS)'],
        ['ŷ', 'peluang yang ditebak model bahwa jawabannya 1 (antara 0 dan 1)'],
        ['ln', 'logaritma natural. Di kalkulator pakai tombol <b>ln</b> (bukan log). Di Python: <code>math.log()</code>'],
        ['−', 'tanda minus, karena ln dari angka 0–1 hasilnya negatif. Minus membuatnya positif.'],
      ])));
    el.append(h('p', { class: 'small muted' }, 'Intinya: ambil peluang yang diberikan model untuk jawaban yang BENAR, lalu hitung −ln dari peluang itu. Makin kecil peluangnya, makin besar loss-nya.'));

    el.append(box('coba', null, `Geser slider <b>ŷ</b> (keyakinan model bahwa jawabannya 1). Pilih juga jawaban aslinya.
      Lihat titik di kurva: kalau model <b>yakin tapi salah</b>, loss melonjak tinggi.`));
    let yTrue = 1;
    const ceStats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const ceSteps = h('div');
    const sl = ML.slider({ label: 'Tebakan model ŷ (peluang jawaban = 1)', min: 0.01, max: 0.99, step: 0.01, value: 0.95, digits: 2, onInput: () => renderCE() });
    const b1 = h('button', { onclick: () => { yTrue = 1; renderCE(); } }, 'Jawaban asli y = 1 (LULUS)');
    const b0 = h('button', { onclick: () => { yTrue = 0; renderCE(); } }, 'Jawaban asli y = 0 (TIDAK)');
    const q95 = h('button', { onclick: () => { sl.value = 0.95; renderCE(); } }, 'Contoh A: ŷ = 0.95');
    const q20 = h('button', { onclick: () => { sl.value = 0.2; renderCE(); } }, 'Contoh B: ŷ = 0.20');
    const ce = (yh) => (yTrue === 1 ? -Math.log(yh) : -Math.log(1 - yh));
    const pc = ML.plot({
      width: 640, height: 300, x: [0, 1], y: [0, 5],
      xLabel: 'tebakan model ŷ (peluang jawaban = 1)', yLabel: 'loss',
      legend: [{ label: 'kurva loss cross-entropy', color: 'c1', shape: 'line' }, { label: 'tebakan sekarang', color: 'c2', shape: 'circle' }],
    });
    pc.draw((p) => {
      p.clear(); p.grid(); p.axes();
      p.fn((x) => (x <= 0 || x >= 1 ? NaN : ce(x)), { color: 'c1', width: 2 });
      const yh = sl.value, L = ce(yh);
      p.line(yh, 0, yh, L, { color: 'text-2', width: 1, dash: [3, 3] });
      p.point(yh, L, { color: 'c2', r: 7, ring: true });
      const right = yh < 0.6;
      p.text(yh, L, 'loss = ' + L.toFixed(2), { align: right ? 'left' : 'right', dx: right ? 14 : -14, dy: -12, bold: true, bg: true, size: 13 });
    });
    pc.onHover((x) => (x <= 0.005 || x >= 0.995 ? null : `ŷ = ${fmt(x)}<br>y asli = ${yTrue}<br>loss = ${yTrue ? '−ln(' + fmt(x) + ')' : '−ln(1 − ' + fmt(x) + ')'} = <b>${fmt(ce(x))}</b>`));

    function renderCE() {
      const yh = sl.value, L = ce(yh), pBenar = yTrue === 1 ? yh : 1 - yh;
      b1.classList.toggle('primary', yTrue === 1); b0.classList.toggle('primary', yTrue === 0);
      let badge;
      if (pBenar >= 0.7) badge = '<span class="badge good">✓ yakin &amp; benar → loss kecil</span>';
      else if (pBenar < 0.35) badge = '<span class="badge bad">✗ yakin tapi salah = hukuman besar</span>';
      else badge = '<span class="badge" style="background:var(--surface-2)">ragu-ragu → loss sedang</span>';
      ceStats.innerHTML = `
        <div class="stat"><div class="k">Peluang untuk jawaban yang BENAR</div><div class="v">${fmt(pBenar)}</div><div class="d">${yTrue === 1 ? 'ŷ' : '1 − ŷ'}</div></div>
        <div class="stat"><div class="k">Loss</div><div class="v">${L.toFixed(2)}</div><div class="d">−ln(${fmt(pBenar)})</div></div>
        <div class="stat"><div class="k">Penilaian</div><div style="margin-top:8px">${badge}</div></div>`;
      ceSteps.innerHTML = '';
      ceSteps.append(steps([
        [`Jawaban asli y = ${yTrue}, jadi ambil peluang yang diberikan model untuk jawaban ${yTrue}`, yTrue === 1 ? `peluang benar = ŷ = ${fmt(yh)}` : `peluang benar = 1 − ŷ = 1 − ${fmt(yh)} = ${fmt(pBenar)}`],
        ['Hitung ln dari peluang itu (hasilnya negatif karena angkanya di bawah 1)', `ln(${fmt(pBenar)}) = ${fmt(Math.log(pBenar), 3)}`],
        ['Beri tanda minus supaya positif', `loss = −(${fmt(Math.log(pBenar), 3)}) = <b>${L.toFixed(2)}</b>`],
      ]));
      pc.redraw();
    }
    el.append(h('div', { class: 'controls' }, b1, b0), h('div', { class: 'controls' }, sl.el, q95, q20), pc.el, ceStats);
    el.append(box('langkah', 'Langkah Hitung Cross-Entropy (ikut berubah)', ceSteps));
    renderCE();

    el.append(ML.table(['Jawaban asli', 'Tebakan model', 'Hitung', 'Loss', 'Arti'], [
      ['LULUS (1)', 'Model A: 0.95', '−ln(0.95)', '<b>' + fmt(-Math.log(0.95)) + '</b>', '<span class="badge good">✓ yakin &amp; benar</span>'],
      ['LULUS (1)', 'Model B: 0.20', '−ln(0.20)', '<b>' + fmt(-Math.log(0.2)) + '</b>', '<span class="badge bad">✗ salah, loss besar</span>'],
      ['LULUS (1)', 'Model C: 0.01', '−ln(0.01)', '<b>' + fmt(-Math.log(0.01)) + '</b>', '<span class="badge bad">✗ yakin tapi salah</span>'],
    ]));
    el.append(box('info', 'Pesan penting', `Cross-entropy <b>tidak hanya</b> peduli benar atau salah, tapi juga <b>seberapa yakin</b>.
      Salah sambil ragu-ragu (ŷ = 0.4) hukumannya sedang. Salah sambil <b>sangat yakin</b> (ŷ = 0.01) hukumannya <b>sangat besar</b>.
      Ini memaksa model untuk tidak sok yakin kalau belum benar.`));

    // ---------------- tabel pilih loss ----------------
    el.append(h('h2', {}, 'Loss Mana untuk Tugas Apa?'));
    el.append(ML.table(['Tugas', 'Contoh', 'Aktivasi di output', 'Loss yang dipakai'], [
      ['Regresi (menebak angka)', 'harga buku, nilai ujian', 'tanpa aktivasi (linear)', '<b>MSE</b>'],
      ['Klasifikasi 2 kelas', 'lulus / tidak, spam / bukan', 'Sigmoid', '<b>Binary Cross-Entropy</b>'],
      ['Klasifikasi banyak kelas', 'huruf A / B / C / …', 'Softmax', '<b>Cross-Entropy</b>'],
    ]));
    el.append(h('p', { class: 'small muted' }, 'Sigmoid dan softmax dibahas lebih lengkap di Bab 4 dan Bab 7.'));

    el.append(box('bisindo', null, `Menebak huruf isyarat BISINDO adalah <b>klasifikasi banyak kelas</b>.
      Kalau modelnya neural network atau logistic regression, loss yang dipakai adalah <b>cross-entropy</b>:
      model dihukum besar kalau yakin isyarat "A" padahal sebenarnya "B".
      <br>Model <b>SVM</b> yang dipakai di proyek punya loss sendiri bernama <i>hinge loss</i>,
      tapi idenya sama: makin salah tebakannya, makin besar hukumannya.`));

    // ---------------- kuis ----------------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Loss yang <b>kecil</b> artinya…', options: ['Model masih banyak salah', 'Tebakan model sudah dekat dengan jawaban asli', 'Data latihnya sedikit'], answer: 1, explain: 'Loss = ukuran kesalahan. Makin kecil, makin dekat tebakan ke jawaban yang benar.' },
      { q: 'Asli = [3, 5, 2], tebakan = [2.5, 5, 4]. Berapa MSE-nya?', options: ['0.83', '1.42', '4.25'], answer: 1, explain: 'Selisih: 0.5, 0, −2 → kuadrat: 0.25, 0, 4 → jumlah 4.25 → dibagi 3 = 1.42. (4.25 adalah jumlahnya, belum dirata-rata.)' },
      { q: 'Jawaban asli = 1. Tebakan mana yang loss cross-entropy-nya PALING besar?', options: ['ŷ = 0.95', 'ŷ = 0.50', 'ŷ = 0.05'], answer: 2, explain: '−ln(0.05) ≈ 3.00, jauh lebih besar dari −ln(0.5) ≈ 0.69 dan −ln(0.95) ≈ 0.05. Yakin tapi salah = hukuman besar.' },
      { q: 'Untuk menebak <b>harga rumah</b> (angka), loss yang cocok adalah…', options: ['MSE', 'Cross-entropy', 'Softmax'], answer: 0, explain: 'Menebak angka = regresi → MSE. Cross-entropy untuk klasifikasi. Softmax bukan loss, tapi fungsi aktivasi.' },
    ]));
  },
});
