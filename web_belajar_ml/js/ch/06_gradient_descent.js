/* Bab 6 — Gradient Descent: Turun Gunung */
ML.chapter({
  id: 'gradient-descent',
  num: 6,
  group: 'Cara Mesin Belajar',
  title: 'Gradient Descent: Turun Gunung',
  lead: 'Loss sudah bisa diukur. Sekarang: <b>bagaimana mesin mengubah bobotnya</b> supaya loss makin kecil?',
  render(el) {
    const { h, box, steps, fmt, fmtp } = ML;

    el.append(box('analogi', null, `
      Bayangkan kamu berdiri di <b>atas gunung yang tertutup kabut tebal</b>. Kamu tidak bisa melihat lembah di bawah.
      Yang bisa kamu lakukan: <b>meraba tanah di sekitar kaki</b>, mencari arah yang paling menurun, lalu <b>melangkah sedikit</b> ke arah itu.
      Ulangi terus, sampai tanah di sekitarmu sudah datar. Itu artinya kamu sudah di lembah.
      <br><br>Untuk mesin: <b>tinggi gunung = loss</b>, <b>posisimu = nilai bobot w</b>, dan <b>lembah = bobot terbaik</b> (loss paling kecil).`));

    el.append(h('h2', {}, 'Tiga Kata Kunci'));
    el.append(ML.html(`<div class="grid3">
      <div class="stat"><div class="k">GRADIENT</div><div style="font-size:15px;margin-top:4px"><b>Kemiringan</b> tanah di posisimu. Menunjukkan ke arah mana loss <b>naik</b>.</div></div>
      <div class="stat"><div class="k">DESCENT</div><div style="font-size:15px;margin-top:4px">Artinya <b>turun</b>. Jadi kita melangkah ke arah <b>berlawanan</b> dengan gradient.</div></div>
      <div class="stat"><div class="k">LEARNING RATE</div><div style="font-size:15px;margin-top:4px"><b>Besar langkah</b>. Terlalu kecil = lambat. Terlalu besar = melompati lembah.</div></div>
    </div>`));
    el.append(h('p', {}, 'Aturan tandanya gampang: gradient negatif (tanah menurun ke kanan) → w dinaikkan. Gradient positif (tanah menurun ke kiri) → w diturunkan.'));

    // ---------------- soal ----------------
    el.append(h('h2', {}, 'Soal: Mencari Harga Satu Buku'));
    el.append(h('p', {}, 'Kita hanya punya 1 data: beli 2 buku → bayar 6 (ribu rupiah). Mesin harus menemukan harga per buku (bobot w) sendiri. Kita tahu jawabannya 3, tapi mesin tidak tahu.'));
    const X = 2, Y = 6;
    el.append(box('rumus', null, ML.formula(
      `<span class="var">ŷ</span> = <span class="var">w</span> × <span class="var">x</span><br>
       loss = (<span class="var">ŷ</span> − <span class="var">y</span>)²<br>
       gradient = 2 × (<span class="var">ŷ</span> − <span class="var">y</span>) × <span class="var">x</span><br>
       <span class="var">w</span><sub>baru</sub> = <span class="var">w</span> − lr × gradient`,
      [
        ['x', 'input: jumlah buku = 2'],
        ['y', 'jawaban asli: harga bayar = 6'],
        ['w', 'bobot = tebakan harga per buku (yang sedang dicari)'],
        ['ŷ', 'tebakan harga bayar'],
        ['gradient', 'kemiringan kurva loss di posisi w (rumus turunan, cukup dipakai saja)'],
        ['lr', 'learning rate = besar langkah (contoh: 0.05)'],
      ])));

    // ---------------- interaktif ----------------
    el.append(h('h2', {}, 'Coba: Gelindingkan Bola ke Lembah'));
    el.append(box('coba', null, `Bola oranye = posisi bobot w sekarang. Tekan <b>Langkah 1x</b> untuk satu putaran belajar,
      atau <b>Auto</b> untuk jalan terus. Lalu ubah <b>learning rate</b>: coba 0.01 (lambat), 0.05 (pas), 0.2 (zig-zag), dan 0.3 (meledak!).`));

    const LR0 = 0.05, W0 = 1;
    let hist = [W0], timer = null;
    const lossOf = (w) => (w * X - Y) ** 2;
    const gradOf = (w) => 2 * (w * X - Y) * X;
    const slLr = ML.slider({ label: 'Learning rate (lr)', min: 0.01, max: 0.3, step: 0.01, value: LR0, digits: 2, onInput: () => reset() });
    const slW = ML.slider({ label: 'Bobot awal w', min: -2, max: 8, step: 0.1, value: W0, digits: 1, onInput: () => reset() });
    const bStep = h('button', { class: 'primary', onclick: () => { stopAuto(); stepOnce(); } }, '▶ Langkah 1x');
    const bAuto = h('button', { onclick: () => (timer ? stopAuto() : startAuto()) }, '⏩ Auto');
    const bReset = h('button', { onclick: () => { slLr.value = LR0; slW.value = W0; reset(); } }, '↺ Reset');
    const status = h('div', { style: 'margin:6px 0' });
    const stats = h('div', { class: 'grid3', style: 'margin:10px 0' });
    const stepBox = h('div');
    const tblBox = h('div', { style: 'max-height:320px;overflow:auto' });

    const curW = () => hist[hist.length - 1];
    const diverged = () => Math.abs(curW()) > 1e4 || !isFinite(curW());
    const converged = () => lossOf(curW()) < 1e-4;

    const pg = ML.plot({
      width: 640, height: 340, x: [-3, 9], y: [0, 70],
      xLabel: 'bobot w (tebakan harga per buku)', yLabel: 'loss',
      legend: [
        { label: 'kurva loss: (2w − 6)²', color: 'c1', shape: 'line' },
        { label: 'bola (posisi w) & jejaknya', color: 'c2', shape: 'circle' },
        { label: 'kemiringan = gradient', color: 'text-2', shape: 'line' },
      ],
      caption: 'Lembah (loss = 0) ada di w = 3. Arahkan mouse ke kurva untuk melihat loss di tiap w.',
    });
    pg.draw((p) => {
      p.clear(); p.grid(); p.axes();
      p.fn(lossOf, { color: 'c1', width: 2 });
      p.vline(3, { color: 'text-2', width: 1, dash: [2, 4] });
      p.text(3, 66, 'lembah w = 3', { color: 'text-2', size: 12, bg: true });
      const vis = hist.filter((w) => isFinite(w));
      const pts = vis.map((w) => [w, Math.min(lossOf(w), p.y[1] * 2)]);
      p.path(pts, { color: 'c2', width: 2, dash: [5, 4] });
      vis.slice(0, -1).forEach((w) => { if (lossOf(w) <= p.y[1]) p.point(w, lossOf(w), { color: 'c2', r: 4.5, hollow: true }); });
      const w = curW();
      if (!isFinite(w) || w < p.x[0] || w > p.x[1] || lossOf(w) > p.y[1]) {
        p.text((p.x[0] + p.x[1]) / 2, p.y[1] * 0.85, '↑ bola terlempar keluar grafik (loss ' + (isFinite(w) ? fmt(lossOf(w), 0) : '∞') + ')', { bold: true, bg: true, size: 13.5 });
        return;
      }
      const L = lossOf(w), g = gradOf(w), dx = 1.2;
      p.line(w - dx, L - g * dx, w + dx, L + g * dx, { color: 'text-2', width: 2, dash: [6, 4] });
      p.point(w, L, { color: 'c2', r: 8, ring: true });
      const lbl = 'w = ' + fmt(w, 3) + ', loss = ' + fmt(L);
      p.text(w, L, lbl, { align: w > 5 ? 'right' : 'left', dx: w > 5 ? -16 : 16, dy: -16, bold: true, bg: true, size: 13 });
    });
    pg.onHover((x, y) => {
      const i = pg.nearest(hist.map((w) => [w, lossOf(w)]), x, y, 12);
      if (i >= 0) return `<b>posisi setelah putaran ${i}</b><br>w = ${fmt(hist[i], 4)}<br>loss = ${fmt(lossOf(hist[i]), 4)}`;
      if (x < pg.x[0] || x > pg.x[1]) return null;
      return `w = ${fmt(x)}<br>ŷ = ${fmt(x)} × 2 = ${fmt(2 * x)}<br>loss = ${fmt(lossOf(x))}`;
    });

    const pl = ML.plot({
      width: 640, height: 220, x: [0.4, 10.6], y: [0, 20],
      xLabel: 'putaran ke-', yLabel: 'loss', pad: { l: 52 },
      caption: 'Loss di awal tiap putaran. Kalau learning rate pas, batangnya makin pendek.',
    });
    pl.draw((p) => {
      const n = Math.max(1, hist.length - (diverged() ? 0 : 1));
      const ls = hist.slice(0, n).map(lossOf).filter(isFinite);
      const N = Math.max(10, ls.length);
      p.x = [0.4, N + 0.6]; p.y = [0, Math.max(1, ...ls) * 1.15];
      p.xTicks = Array.from({ length: N }, (_, i) => i + 1).filter((i) => N <= 20 || i % 5 === 0 || i === 1);
      p.clear(); p.grid(); p.axes();
      ls.forEach((L, i) => p.bar(i + 1, 0, L, 0.6, { color: 'c1' }));
      if (ls.length <= 14) ls.forEach((L, i) => p.text(i + 1, L, fmt(L), { dy: -8, size: 11.5, color: 'text-2' }));
    });
    pl.onHover((x) => {
      const i = Math.round(x) - 1;
      if (i < 0 || i >= hist.length || !isFinite(hist[i])) return null;
      return `<b>putaran ${i + 1}</b><br>w = ${fmt(hist[i], 4)}<br>loss = ${fmt(lossOf(hist[i]), 4)}`;
    });

    function render() {
      const lr = slLr.value, w = curW(), k = 1 - 8 * lr;
      // status learning rate (untuk soal ini: w bergerak dengan faktor 1 − 8·lr tiap langkah)
      let st;
      if (lr < 0.03) st = '<span class="badge" style="background:var(--surface-2)">🐢 learning rate kecil: turun pelan sekali, butuh banyak putaran</span>';
      else if (k >= 0) st = '<span class="badge good">✓ learning rate pas: turun mulus ke lembah</span>';
      else if (Math.abs(k) < 1 - 1e-9) st = '<span class="badge" style="background:var(--surface-2)">↔ learning rate besar: melompati lembah (zig-zag), tapi masih sampai</span>';
      else if (Math.abs(Math.abs(k) - 1) < 1e-9) st = '<span class="badge bad">✗ learning rate terlalu besar: bolak-balik di tempat, tidak pernah sampai</span>';
      else st = '<span class="badge bad">✗ learning rate terlalu besar: melompat makin jauh, loss meledak</span>';
      status.innerHTML = st;
      const L = lossOf(w);
      stats.innerHTML = `
        <div class="stat"><div class="k">Putaran selesai</div><div class="v">${hist.length - 1}</div><div class="d">learning rate ${fmt(lr)}</div></div>
        <div class="stat"><div class="k">Bobot w sekarang</div><div class="v">${isFinite(w) && Math.abs(w) < 1e6 ? fmt(w, 4) : 'meledak'}</div><div class="d">target: 3</div></div>
        <div class="stat"><div class="k">Loss sekarang</div><div class="v">${isFinite(L) && L < 1e7 ? fmt(L, 4) : 'sangat besar'}</div><div class="d">target: 0</div></div>`;

      stepBox.innerHTML = '';
      if (diverged()) stepBox.append(h('p', {}, 'Bobot sudah meledak (sangat jauh dari 3). Tekan Reset atau kecilkan learning rate.'));
      else {
        const yh = w * X, g = gradOf(w), wn = w - lr * g;
        stepBox.append(h('p', { class: 'small muted', style: 'margin-top:0' }, `Putaran ke-${hist.length} (yang akan dijalankan saat kamu menekan "Langkah 1x"):`));
        stepBox.append(steps([
          ['<b>Model</b>: hitung tebakan dengan w sekarang', `ŷ = w × x = ${fmt(w, 4)} × ${X} = ${fmt(yh, 4)}`],
          ['<b>Loss</b>: seberapa salah?', `loss = (ŷ − y)² = (${fmt(yh, 4)} − ${Y})² = ${fmtp(yh - Y, 4)}² = <b>${fmt(lossOf(w), 4)}</b>`],
          ['<b>Gradient</b>: kemiringan di posisi ini', `gradient = 2 × (ŷ − y) × x = 2 × ${fmtp(yh - Y, 4)} × ${X} = <b>${fmt(g, 4)}</b>` +
            (Math.abs(g) < 1e-9 ? '\n→ datar, sudah di lembah' : g < 0 ? '\n→ negatif, artinya w harus DINAIKKAN' : '\n→ positif, artinya w harus DITURUNKAN')],
          ['<b>Update</b>: geser w melawan arah gradient', `w_baru = w − lr × gradient = ${fmt(w, 4)} − ${fmt(lr)} × ${fmtp(g, 4)}\n       = ${fmt(w, 4)} ${-lr * g >= 0 ? '+' : '−'} ${fmt(Math.abs(lr * g), 4)} = <b>${fmt(wn, 4)}</b>`],
        ]));
      }

      const rows = [];
      for (let i = 0; i < hist.length - 1; i++) {
        const wi = hist[i], yh = wi * X, g = gradOf(wi);
        rows.push([i + 1, fmt(wi, 4), fmt(yh, 4), fmt(lossOf(wi), 4), fmt(g, 4), fmt(hist[i + 1], 4)]);
      }
      tblBox.innerHTML = '';
      tblBox.append(rows.length
        ? ML.table(['Putaran', 'w', 'tebakan ŷ', 'loss', 'gradient', 'w baru'], rows, { highlight: rows.length - 1 })
        : h('p', { class: 'small muted' }, 'Tabel putaran masih kosong. Tekan "Langkah 1x".'));
      bStep.disabled = diverged() || hist.length > 60;
      bAuto.textContent = timer ? '⏸ Berhenti' : '⏩ Auto';
      pg.redraw(); pl.redraw();
    }
    function stepOnce() {
      if (diverged() || hist.length > 60) return false;
      const w = curW();
      hist.push(w - slLr.value * gradOf(w));
      render();
      return !(diverged() || converged() || hist.length > 60);
    }
    function startAuto() {
      if (diverged() || converged()) return;
      timer = setInterval(() => {
        if (!pg.canvas.isConnected) { stopAuto(); return; }
        if (!stepOnce()) stopAuto();
      }, 550);
      render();
    }
    function stopAuto() { if (timer) { clearInterval(timer); timer = null; } if (pg.canvas.isConnected) render(); }
    function reset() { if (timer) { clearInterval(timer); timer = null; } hist = [slW.value]; render(); }

    el.append(h('div', { class: 'controls' }, slLr.el, slW.el, bStep, bAuto, bReset), status, pg.el, stats);
    el.append(box('langkah', 'Langkah Hitung Putaran Ini (ikut berubah)', stepBox));
    el.append(h('h3', {}, 'Riwayat Tiap Putaran'));
    el.append(tblBox, pl.el);
    reset();

    el.append(box('info', 'Cek dengan catatan', `Dengan w awal = 1 dan learning rate = 0.05, loss tiap putaran adalah
      <b>16 → 5.76 → 2.07 → 0.75 → 0.27 → 0.10</b>, dan w bergerak 1 → 1.8 → 2.28 → 2.568 → 2.7408 → 2.8445 … mendekati 3.
      Coba tekan "Langkah 1x" enam kali dan cocokkan dengan tabelmu.`));

    el.append(box('analogi', 'Learning rate itu seperti panjang langkah kaki', `
      <ul style="margin:4px 0;padding-left:20px">
        <li><b>Terlalu kecil</b> (0.01): seperti jalan jinjit. Pasti sampai, tapi lama sekali.</li>
        <li><b>Pas</b> (0.05): langkah wajar, cepat sampai ke lembah.</li>
        <li><b>Besar</b> (0.2): langkah raksasa, melewati lembah lalu balik lagi (zig-zag).</li>
        <li><b>Terlalu besar</b> (0.3): lompatan makin jauh, malah naik gunung di sisi seberang. Loss meledak.</li>
      </ul>`));

    // ---------------- optimizer & epoch ----------------
    el.append(h('h2', {}, 'Optimizer dan Epoch'));
    el.append(h('p', {}, 'Bagian yang benar-benar mengubah bobot (langkah "update" di atas) disebut optimizer. Gradient descent biasa adalah optimizer yang paling dasar. Ada versi yang lebih pintar:'));
    el.append(ML.table(['Optimizer', 'Cara kerja (versi sederhana)', 'Analogi'], [
      ['<b>SGD</b><br><small>Stochastic Gradient Descent</small>', 'Persis seperti di atas, tapi gradient dihitung dari sebagian kecil data saja (bukan semuanya) supaya cepat.', 'Meraba tanah sekilas, langsung melangkah'],
      ['<b>Momentum</b>', 'Ikut memperhitungkan arah langkah sebelumnya, jadi tidak gampang zig-zag.', 'Bola menggelinding yang punya laju'],
      ['<b>Adam</b><br><small>paling populer</small>', 'Mengatur besar langkahnya sendiri untuk tiap bobot: langkah besar di tanah landai, langkah kecil di tanah curam.', 'Pendaki berpengalaman yang menyesuaikan langkah'],
    ]));
    el.append(box('info', 'Apa itu epoch?', `<b>1 epoch</b> = model sudah melihat <b>seluruh data latih satu kali</b>
      (setiap data sudah melewati putaran model → loss → gradient → update).
      Di soal buku, datanya cuma 1, jadi 1 putaran = 1 epoch. Pada data sungguhan (misalnya ribuan video), satu epoch berisi banyak putaran.
      Training biasanya berjalan puluhan sampai ratusan epoch. Lebih lengkap di Bab 8.`));
    el.append(box('bisindo', null, `Saat melatih model BISINDO, ada <b>ribuan bobot</b> (bukan cuma satu w), tapi caranya <b>sama persis</b>:
      tebak → ukur loss → hitung gradient tiap bobot → geser sedikit → ulangi.
      Learning rate dan jumlah epoch adalah <b>hyperparameter</b>: angka yang kamu atur sendiri sebelum training, bukan dipelajari mesin.`));

    // ---------------- kuis ----------------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Gradient di posisi w sekarang bernilai <b>negatif</b>. Apa yang dilakukan gradient descent?', options: ['Menurunkan w', 'Menaikkan w', 'Tidak mengubah w'], answer: 1, explain: 'w_baru = w − lr × gradient. Dikurangi angka negatif = ditambah. Jadi w naik.' },
      { q: 'w = 1, lr = 0.05, gradient = −16. Berapa w baru?', options: ['0.2', '1.8', '17'], answer: 1, explain: 'w_baru = 1 − 0.05 × (−16) = 1 + 0.8 = 1.8.' },
      { q: 'Loss malah makin besar dan bola melompat-lompat makin jauh. Apa penyebab paling mungkin?', options: ['Learning rate terlalu kecil', 'Learning rate terlalu besar', 'Datanya terlalu banyak'], answer: 1, explain: 'Langkah terlalu besar membuat bobot melompati lembah dan mendarat makin tinggi di sisi seberang.' },
      { q: '1 epoch artinya…', options: ['Satu kali update satu bobot', 'Model sudah melihat seluruh data latih satu kali', 'Satu jam training'], answer: 1, explain: 'Epoch = satu putaran penuh atas SELURUH data latih.' },
    ]));
  },
});
