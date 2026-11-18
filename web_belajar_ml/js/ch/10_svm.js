/* Bab 10 — SVM (Support Vector Machine) */
ML.chapter({
  id: 'svm',
  num: 10,
  group: 'Algoritma Klasifikasi',
  title: 'SVM (Support Vector Machine)',
  lead: 'Banyak garis bisa memisahkan dua kelompok. SVM memilih garis dengan <b>"jalan" paling lebar</b> di antara keduanya.',
  render(el) {
    const { h, box, fmt, fmtp } = ML;
    const V = (s) => `<span class="var">${s}</span>`;

    /* ---------- alat bantu ---------- */
    // SMO (Sequential Minimal Optimization): pelatih SVM sungguhan, deterministik. Y berisi +1 / −1.
    function smo(X, Y, C, K, hook) {
      const n = X.length, a = new Array(n).fill(0); let b = 0;
      const Km = X.map((p) => X.map((q) => K(p, q)));
      const f = (i) => { let s = b; for (let k = 0; k < n; k++) if (a[k]) s += a[k] * Y[k] * Km[k][i]; return s; };
      const take = (i, j, Ei, Ej) => {
        if (i === j) return false;
        const yi = Y[i], yj = Y[j], ai = a[i], aj = a[j];
        let L, H;
        if (yi !== yj) { L = Math.max(0, aj - ai); H = Math.min(C, C + aj - ai); } else { L = Math.max(0, ai + aj - C); H = Math.min(C, ai + aj); }
        if (H - L < 1e-12) return false;
        const eta = Km[i][i] + Km[j][j] - 2 * Km[i][j]; if (eta <= 1e-12) return false;
        const ajn = Math.min(H, Math.max(L, aj + (yj * (Ei - Ej)) / eta));
        if (Math.abs(ajn - aj) < 1e-9 * (ajn + aj + 1e-9)) return false;
        const ain = ai + yi * yj * (aj - ajn);
        const b1 = b - Ei - yi * (ain - ai) * Km[i][i] - yj * (ajn - aj) * Km[i][j];
        const b2 = b - Ej - yi * (ain - ai) * Km[i][j] - yj * (ajn - aj) * Km[j][j];
        a[i] = ain; a[j] = ajn;
        b = ain > 0 && ain < C ? b1 : ajn > 0 && ajn < C ? b2 : (b1 + b2) / 2;
        if (hook) hook(a, b);
        return true;
      };
      for (let it = 0; it < 300; it++) {
        let changed = 0;
        for (let i = 0; i < n; i++) {
          const Ei = f(i) - Y[i], r = Ei * Y[i];
          if ((r < -1e-4 && a[i] < C) || (r > 1e-4 && a[i] > 0)) {
            const E = X.map((_, j) => f(j) - Y[j]);
            const order = X.map((_, j) => j).sort((p, q) => Math.abs(E[q] - Ei) - Math.abs(E[p] - Ei));
            for (const j of order) if (take(i, j, Ei, E[j])) { changed++; break; }
          }
        }
        if (!changed) break;
      }
      return { a, b };
    }
    const linK = (p, q) => p[0] * q[0] + p[1] * q[1];
    const wOf = (X, Y, a) => { const w = [0, 0]; a.forEach((ai, i) => { w[0] += ai * Y[i] * X[i][0]; w[1] += ai * Y[i] * X[i][1]; }); return w; };
    // satuan x & y sama panjang (supaya "lebar jalan" terlihat benar)
    const square = (p, cx, cy, half) => {
      const pw = p.W - p.pad.l - p.pad.r, ph = p.H - p.pad.t - p.pad.b;
      if (pw >= ph) { const hx = (half * pw) / ph; p.x = [cx - hx, cx + hx]; p.y = [cy - half, cy + half]; }
      else { const hy = (half * ph) / pw; p.x = [cx - half, cx + half]; p.y = [cy - hy, cy + hy]; }
    };
    // garis w1·x + w2·y + b = c
    const level = (p, w, b, c, op) => {
      if (Math.hypot(w[0], w[1]) < 1e-9) return;
      if (Math.abs(w[1]) >= Math.abs(w[0])) p.line(p.x[0], (c - b - w[0] * p.x[0]) / w[1], p.x[1], (c - b - w[0] * p.x[1]) / w[1], op);
      else p.line((c - b - w[1] * p.y[0]) / w[0], p.y[0], (c - b - w[1] * p.y[1]) / w[0], p.y[1], op);
    };
    const NAMA = { 1: 'kelas 1 (●)', '-1': 'kelas 0 (■)' };
    const ptStyle = (y) => ({ color: y > 0 ? 'c1' : 'c2', shape: y > 0 ? 'circle' : 'square', r: 6 });
    const legendKelas = [{ label: 'kelas 1 (hasil +)', color: 'c1', shape: 'circle' }, { label: 'kelas 0 (hasil −)', color: 'c2', shape: 'square' }];

    /* ================= ANALOGI ================= */
    el.append(box('analogi', null, `
      Bayangkan dua kampung yang mau dipisah dengan <b>jalan raya</b>. Jalan bisa dibuat di banyak posisi.
      Jalan yang paling aman adalah yang <b>paling lebar</b>: rumah dari kedua kampung sama-sama jauh dari tengah jalan,
      jadi kalau ada rumah baru yang dibangun sedikit melenceng, masih jelas ikut kampung mana.<br><br>
      SVM melakukan hal yang sama: dari semua garis yang bisa memisahkan dua kelas, SVM memilih garis yang
      <b>"jalannya" (margin) paling lebar</b>. Rumah-rumah yang tepat berada di pinggir jalan disebut
      <b>support vector</b>, karena merekalah yang "menopang" posisi jalan.`));

    el.append(h('h2', {}, 'Rumus: Cukup Lihat Tandanya'));
    el.append(h('p', {}, 'SVM memakai rumus yang sama dengan bab-bab sebelumnya, yaitu w·x + b (dot product + bias). Bedanya dengan Logistic Regression: SVM tidak memakai sigmoid. SVM cukup melihat tanda hasilnya, positif atau negatif.'));
    el.append(box('rumus', null, ML.formula(
      `${V('f')}(${V('x')}) = ${V('w')}₁${V('x')}₁ + ${V('w')}₂${V('x')}₂ + ${V('b')} &nbsp;&nbsp;→&nbsp;&nbsp; kelas 1 jika ${V('f')} &gt; 0, kelas 0 jika ${V('f')} &lt; 0<br><br>margin (lebar jalan) = ${ML.frac('2', '‖' + V('w') + '‖')} , &nbsp; ‖${V('w')}‖ = ${ML.sqrt(V('w') + '₁² + ' + V('w') + '₂²')}`,
      [
        ['f(x) = 0', '<b>hyperplane</b> = garis tengah jalan (di 2 dimensi berupa garis lurus)'],
        ['f(x) = ±1', 'dua tepi jalan. Titik yang tepat di tepi = <b>support vector</b>'],
        ['w', 'bobot, menentukan arah/kemiringan garis'],
        ['b', 'bias, menggeser garis'],
        ['‖w‖', 'panjang vektor w (dibaca "norm w"). <b>w kecil → jalan lebar</b>'],
      ])));

    /* ================= INTERAKTIF 1 ================= */
    el.append(h('h2', {}, 'Coba: Cari Jalan Paling Lebar'));
    el.append(box('coba', null, `Geser <b>w₁, w₂, b</b>. Garis tebal = hyperplane, garis putus-putus = tepi jalan (f = ±1), area abu-abu = jalan.
      Syaratnya: semua titik harus di sisi yang benar <b>dan tidak boleh masuk jalan</b>. Di antara semua garis yang sah, cari yang jalannya paling lebar.
      Atau tekan <b>Cari otomatis</b> dan lihat komputer mencarinya. Titik <b>◆ (2,2)</b> adalah titik uji tanpa label.`));
    const D1 = [[1, 1, -1], [1.5, 1.5, -1], [0.5, 2, -1], [2, 0.5, -1], [0.5, 0.5, -1], [3, 3, 1], [4, 1, 1], [2.5, 2.5, 1], [1, 4, 1], [3.5, 2, 1]];
    const UJI = [2, 2];
    let w1 = 1, w2 = 1, b1 = -4, anim = null;
    const s1 = ML.slider({ label: 'w₁', min: -3, max: 3, step: 0.05, value: w1, digits: 2, onInput: (v) => { w1 = v; stopAnim(); upd1(); } });
    const s2 = ML.slider({ label: 'w₂', min: -3, max: 3, step: 0.05, value: w2, digits: 2, onInput: (v) => { w2 = v; stopAnim(); upd1(); } });
    const s3 = ML.slider({ label: 'b', min: -12, max: 12, step: 0.1, value: b1, digits: 2, onInput: (v) => { b1 = v; stopAnim(); upd1(); } });
    const setW = (a, b2v, c) => { w1 = a; w2 = b2v; b1 = c; s1.value = a; s2.value = b2v; s3.value = c; };
    const out1 = h('div'), status1 = h('div', { style: 'margin:6px 0' }), tbl1 = h('div');
    const f1 = (x, y) => w1 * x + w2 * y + b1;
    const p1 = ML.plot({ height: 400, x: [0, 5], y: [0, 5], xLabel: 'x₁', yLabel: 'x₂', legend: legendKelas.concat([{ label: 'titik uji', color: 'c3', shape: 'circle' }]) });
    p1.draw((p) => {
      square(p, 2.4, 2.4, 2.75);
      p.clear();
      const G = p.col('text-3'), C1 = p.col('c1'), C2 = p.col('c2'), w = [w1, w2];
      if (Math.hypot(w1, w2) > 1e-9) p.region((x, y) => { const v = f1(x, y); return Math.abs(v) < 1 ? { color: G, alpha: 0.28 } : { color: v > 0 ? C1 : C2, alpha: 0.1 }; }, 5);
      p.grid(); p.axes();
      level(p, w, b1, 1, { color: 'text-2', width: 1.5, dash: [6, 5] });
      level(p, w, b1, -1, { color: 'text-2', width: 1.5, dash: [6, 5] });
      level(p, w, b1, 0, { color: 'text', width: 2.5 });
      D1.forEach(([x, y, c]) => { const m = c * f1(x, y); p.point(x, y, Object.assign(ptStyle(c), { ring: Math.abs(m - 1) < 0.05 ? 'text' : false })); });
      p.point(UJI[0], UJI[1], { color: 'c3', shape: 'diamond', r: 6 }); p.text(UJI[0], UJI[1], 'uji (2,2)', { align: 'right', base: 'top', dx: -8, dy: 6, size: 12.5, bold: true, bg: true });
    });
    p1.onHover((x, y) => {
      const all = D1.map((d) => [d[0], d[1]]).concat([UJI]), i = p1.nearest(all, x, y);
      const px = i >= 0 ? all[i] : [x, y], v = f1(px[0], px[1]);
      const head = i < 0 ? 'posisi' : i === D1.length ? 'titik uji' : NAMA[D1[i][2]];
      return `<b>${head}</b> (${fmt(px[0], 2)}, ${fmt(px[1], 2)})<br>f = ${fmt(w1, 2)}×${fmtp(px[0], 2)} + ${fmt(w2, 2)}×${fmtp(px[1], 2)} + ${fmtp(b1, 2)} = <b>${fmt(v, 2)}</b><br>${Math.abs(v) < 1 ? 'berada di dalam jalan' : v > 0 ? 'sisi kelas 1' : 'sisi kelas 0'}`;
    });
    function upd1() {
      p1.redraw();
      const nw = Math.hypot(w1, w2);
      out1.innerHTML = '';
      out1.append(ML.steps([
        ['Panjang w', `‖w‖ = √(${fmtp(w1, 2)}² + ${fmtp(w2, 2)}²) = √${fmt(w1 * w1 + w2 * w2, 3)} = <b>${fmt(nw, 3)}</b>`],
        ['Lebar jalan (margin)', nw > 1e-9 ? `margin = 2 ÷ ${fmt(nw, 3)} = <b>${fmt(2 / nw, 3)}</b>` : 'w = 0 → tidak ada garis'],
      ]));
      let salah = 0, masuk = 0;
      const rows = D1.map(([x, y, c]) => {
        const v = f1(x, y), m = c * v, pred = v > 0 ? 1 : v < 0 ? -1 : 0, ok = pred === c;
        if (!ok) salah++; else if (m < 1 - 1e-6) masuk++;
        const sv = Math.abs(m - 1) < 0.05;
        return [`(${x}, ${y})`, c > 0 ? '● kelas 1' : '■ kelas 0',
          `${fmt(w1, 2)}×${fmtp(x, 1)} + ${fmt(w2, 2)}×${fmtp(y, 1)} + ${fmtp(b1, 2)} = <b>${fmt(v, 2)}</b>`,
          v > 0 ? '+ → kelas 1' : v < 0 ? '− → kelas 0' : '0 → ragu',
          ok ? '<span class="badge good">✓ benar</span>' : '<span class="badge bad">✗ salah</span>',
          sv ? '<b>★ ya</b> (tepat di tepi)' : ok && m < 1 ? 'masuk jalan' : '–'];
      });
      const vu = f1(UJI[0], UJI[1]);
      rows.push(['(2, 2) uji', 'tanpa label', `${fmt(w1, 2)}×2 + ${fmt(w2, 2)}×2 + ${fmtp(b1, 2)} = <b>${fmt(vu, 2)}</b>`, Math.abs(vu) < 1e-9 ? '0 → tepat di garis (ragu-ragu)' : vu > 0 ? '+ → kelas 1' : '− → kelas 0', '–', '–']);
      tbl1.innerHTML = '';
      tbl1.append(ML.table(['titik (x₁, x₂)', 'label asli', 'f = w·x + b', 'tanda → tebakan', 'benar?', 'support vector?'], rows));
      status1.innerHTML = salah ? `<span class="badge bad">✗ ${salah} titik salah sisi</span> Garis ini belum memisahkan dengan benar.`
        : masuk ? `<span class="badge bad">✗ ${masuk} titik masuk jalan</span> Pemisahnya benar, tapi jalannya menabrak rumah. Perkecil jalan atau geser garis.`
        : `<span class="badge good">✓ garis sah</span> Semua titik benar dan di luar jalan. Lebar jalan = <b>${fmt(2 / nw, 3)}</b>.`;
    }
    function stopAnim() { if (anim) { anim.stop = true; anim = null; } }
    function cariOtomatis() {
      stopAnim();
      const X = D1.map((d) => [d[0], d[1]]), Y = D1.map((d) => d[2]), path = [[w1, w2, b1]];
      smo(X, Y, 1000, linK, (a, b) => { const w = wOf(X, Y, a); path.push([w[0], w[1], b]); });
      const me = (anim = { stop: false }); let seg = 0, t0 = performance.now();
      const SEG = 260;
      const tick = (now) => {
        if (me.stop) return;
        if (!p1.canvas.isConnected) { me.stop = true; return; }
        let t = (now - t0) / SEG;
        while (t >= 1 && seg < path.length - 2) { seg++; t0 += SEG; t -= 1; }
        t = Math.min(1, t); const e = t * t * (3 - 2 * t), A = path[seg], B = path[seg + 1];
        setW(A[0] + (B[0] - A[0]) * e, A[1] + (B[1] - A[1]) * e, A[2] + (B[2] - A[2]) * e);
        upd1();
        if (seg >= path.length - 2 && t >= 1) {
          const F = path[path.length - 1]; setW(+F[0].toFixed(3), +F[1].toFixed(3), +F[2].toFixed(3)); upd1(); anim = null;
          status1.insertAdjacentHTML('beforeend', `<br><span class="small">Selesai dalam ${path.length - 1} langkah perbaikan. Hasil: w = [${fmt(F[0], 2)}, ${fmt(F[1], 2)}], b = ${fmt(F[2], 2)}. Inilah jalan paling lebar.</span>`);
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const btns1 = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;margin:8px 0' },
      h('button', { class: 'primary', onclick: cariOtomatis }, 'Cari otomatis'),
      h('button', { onclick: () => { stopAnim(); setW(1, 1, -4); upd1(); } }, 'Contoh catatan: w=[1,1], b=−4'),
      h('button', { onclick: () => { stopAnim(); setW(2, 2, -8); upd1(); } }, 'Garis sama, w dobel'),
      h('button', { onclick: () => { stopAnim(); setW(0.5, 1.2, -3); upd1(); } }, 'Garis asal-asalan'));
    el.append(h('div', { class: 'grid2', style: 'align-items:start' },
      p1.el,
      h('div', {}, h('div', { class: 'controls', style: 'margin-top:0' }, s1.el, s2.el, s3.el), btns1, status1, box('langkah', null, out1))));
    el.append(tbl1);
    upd1();
    el.append(box('info', 'Coba perhatikan', `<ul style="margin:4px 0;padding-left:20px">
      <li>Tombol <b>"Garis sama, w dobel"</b>: garis tengahnya tetap x₁ + x₂ = 4, tapi ‖w‖ jadi 2.828 sehingga jalannya menyempit jadi 0.707. Jadi <b>w kecil = jalan lebar</b>.</li>
      <li>Dengan w = [1, 1], b = −4: ‖w‖ = √2 = 1.414, margin = 2 ÷ 1.414 = 1.414. Support vector ■ (1.5, 1.5) memberi −1 dan ● (2.5, 2.5) memberi +1, dan jarak keduanya memang √(1² + 1²) = 1.414.</li>
      <li>"Cari otomatis" memakai algoritma <b>SMO</b> (cara standar melatih SVM). Tiap langkah ia memperbaiki dua titik sekaligus sampai jalannya paling lebar.</li></ul>`));

    /* ================= INTERAKTIF 2: C ================= */
    el.append(h('h2', {}, 'Parameter C: Seberapa Ketat?'));
    el.append(h('p', {}, 'Data nyata jarang rapi. Kadang ada satu titik "nyasar" (pencilan / outlier). Parameter C mengatur seberapa besar hukuman untuk titik yang masuk jalan atau salah sisi.'));
    el.append(ML.table(['C kecil (toleran)', 'C besar (ketat)'], [
      ['Boleh ada titik masuk jalan / salah', 'Berusaha tidak ada satu pun yang salah'],
      ['Jalan lebar → model lebih umum (general) ✓', 'Jalan sempit → rawan <b>overfitting</b> (menghafal data) ✗'],
    ]));
    const D2 = [[1, 2, -1], [1.5, 3, -1], [2, 1.5, -1], [1, 4, -1], [2, 3.5, -1], [0.5, 3, -1], [5, 2, 1], [5.5, 3.5, 1], [6, 2.5, 1], [5, 4.5, 1], [6.5, 1.5, 1], [4.5, 3, 1], [2.8, 2.5, 1]];
    const OUT = D2.length - 1;
    let m2 = null;
    const out2 = h('div');
    const sC = ML.slider({ label: 'log₁₀ C (geser kanan = C besar)', min: -2, max: 2, step: 0.1, value: -1, digits: 1, onInput: upd2 });
    const cLbl = h('div', { style: 'font-family:var(--mono);font-weight:700;font-size:18px' });
    const p2 = ML.plot({ height: 360, x: [0, 7], y: [0, 5], xLabel: 'x₁', yLabel: 'x₂', legend: legendKelas });
    p2.draw((p) => {
      square(p, 3.5, 2.75, 2.75);
      p.clear(); if (!m2) return;
      const { w, b } = m2, G = p.col('text-3'), C1 = p.col('c1'), C2 = p.col('c2');
      p.region((x, y) => { const v = w[0] * x + w[1] * y + b; return Math.abs(v) < 1 ? { color: G, alpha: 0.28 } : { color: v > 0 ? C1 : C2, alpha: 0.1 }; }, 5);
      p.grid(); p.axes();
      level(p, w, b, 1, { color: 'text-2', width: 1.5, dash: [6, 5] }); level(p, w, b, -1, { color: 'text-2', width: 1.5, dash: [6, 5] });
      level(p, w, b, 0, { color: 'text', width: 2.5 });
      D2.forEach(([x, y, c], i) => p.point(x, y, Object.assign(ptStyle(c), { ring: m2.a[i] > 1e-6 ? 'text' : false, label: i === OUT ? 'pencilan' : null })));
    });
    p2.onHover((x, y) => {
      if (!m2) return null; const i = p2.nearest(D2, x, y); if (i < 0) return null;
      const [px, py, c] = D2[i], v = m2.w[0] * px + m2.w[1] * py + m2.b;
      return `<b>${NAMA[c]}</b>${i === OUT ? ' — pencilan' : ''}<br>f = ${fmt(v, 2)}<br>${c * v <= 0 ? '✗ salah sisi' : c * v < 1 - 1e-3 ? 'benar, tapi masuk jalan' : '✓ benar & di luar jalan'}${m2.a[i] > 1e-6 ? '<br>★ support vector' : ''}`;
    });
    function upd2() {
      const C = Math.pow(10, sC.value), X = D2.map((d) => [d[0], d[1]]), Y = D2.map((d) => d[2]);
      const r = smo(X, Y, C, linK), w = wOf(X, Y, r.a).map((v) => (Math.abs(v) < 1e-3 ? 0 : v));
      m2 = { w, b: r.b, a: r.a };
      cLbl.textContent = 'C = ' + fmt(C, C < 0.1 ? 3 : 2);
      let salah = 0, masuk = 0;
      D2.forEach(([x, y, c]) => { const m = c * (w[0] * x + w[1] * y + r.b); if (m <= 0) salah++; else if (m < 1 - 1e-3) masuk++; });
      const nw = Math.hypot(w[0], w[1]), sv = r.a.filter((v) => v > 1e-6).length;
      out2.innerHTML = '';
      out2.append(ML.steps([
        ['Hasil training', `w = [${fmt(w[0], 2)}, ${fmt(w[1], 2)}], b = ${fmt(r.b, 2)}`],
        ['Lebar jalan', `‖w‖ = ${fmt(nw, 3)} → margin = 2 ÷ ${fmt(nw, 3)} = <b>${fmt(2 / nw, 2)}</b>`],
        ['Titik bermasalah', `masuk jalan: ${masuk}, salah sisi: ${salah}, support vector (★): ${sv}`],
      ]));
      p2.redraw();
    }
    el.append(h('div', { class: 'grid2', style: 'align-items:start' }, p2.el,
      h('div', {}, box('coba', null, h('div', {}, h('div', {}, 'Geser C dari kecil ke besar. Perhatikan jalannya menyempit demi "menyelamatkan" si pencilan.'), sC.el, cLbl)), box('langkah', null, out2))));
    upd2();

    /* ================= INTERAKTIF 3: KERNEL TRICK ================= */
    el.append(h('h2', {}, 'Kernel Trick: Kalau Garis Lurus Tidak Cukup'));
    el.append(box('analogi', null, `Bayangkan kelereng merah dan biru bercampur di atas meja, biru di tengah dan merah di pinggir.
      Tidak ada satu penggaris lurus yang bisa memisahkan. Tapi kalau kamu <b>menepuk meja</b> sehingga kelereng pinggir terlempar lebih tinggi,
      sekarang kamu bisa menyelipkan selembar kertas <b>datar</b> di antara mereka. Itulah ide kernel trick: <b>tambah dimensi baru</b>,
      supaya data yang tadinya tidak bisa dipisah garis lurus menjadi bisa.`));
    const D3 = [[-2.5, 1], [-1, -1], [0, -1], [1, -1], [2.5, 1]];
    let lift = 0, liftTarget = 0, raf3 = null;
    const SEP = 3.6;
    const btn3 = h('button', { class: 'primary', onclick: () => { liftTarget = liftTarget ? 0 : 1; btn3.textContent = liftTarget ? '↓ Kembali ke 1 dimensi' : '↑ Tambah dimensi x²'; anim3(); } }, '↑ Tambah dimensi x²');
    const out3 = h('div');
    const p3 = ML.plot({ height: 330, x: [-3.5, 3.5], y: [-1, 7.5], xLabel: 'x (dimensi asli)', yLabel: 'dimensi baru: x²', legend: legendKelas });
    p3.draw((p) => {
      p.clear(); p.grid(); p.axes();
      if (lift > 0.02) p.fn((x) => lift * x * x, { color: 'text-3', width: 1.5, dash: [3, 4] });
      if (lift > 0.98) {
        p.hline(SEP, { color: 'text', width: 2.5 });
        p.text(3.4, SEP, 'pemisah: x² = 3.6', { align: 'right', base: 'bottom', dy: -5, bg: true, bold: true });
        [-1, 1].forEach((s) => p.vline(s * Math.sqrt(SEP), { color: 'text-2', width: 1.5, dash: [6, 5] }));
        p.text(Math.sqrt(SEP), -0.55, 'x = 1.9', { align: 'left', dx: 4, size: 12, color: 'text-2' });
        p.text(-Math.sqrt(SEP), -0.55, 'x = −1.9', { align: 'right', dx: -4, size: 12, color: 'text-2' });
      } else if (lift < 0.02) p.text(0, 3.2, 'Satu garis (satu titik potong) tidak bisa memisahkan ● ■ ■ ■ ●', { color: 'text-2' });
      D3.forEach(([x, c]) => p.point(x, lift * x * x, Object.assign(ptStyle(c), { label: 'x=' + fmt(x, 1) + (lift > 0.98 ? ', x²=' + fmt(x * x, 2) : '') })));
    });
    p3.onHover((x, y) => { const pts = D3.map(([a]) => [a, lift * a * a]), i = p3.nearest(pts, x, y); if (i < 0) return null; const [a, c] = D3[i]; return `<b>${NAMA[c]}</b><br>x = ${fmt(a, 1)}<br>x² = ${fmtp(a, 1)}² = ${fmt(a * a, 2)}`; });
    function anim3() {
      if (raf3) return;
      const tick = () => {
        if (!p3.canvas.isConnected) { raf3 = null; return; }
        lift += Math.sign(liftTarget - lift) * 0.04;
        if (Math.abs(liftTarget - lift) < 0.04) lift = liftTarget;
        p3.redraw(); upd3();
        if (lift !== liftTarget) raf3 = requestAnimationFrame(tick); else raf3 = null;
      };
      raf3 = requestAnimationFrame(tick);
    }
    function upd3() {
      out3.innerHTML = '';
      out3.append(ML.steps([
        ['Hitung dimensi baru x² untuk tiap titik', D3.map(([x, c]) => `${c > 0 ? '●' : '■'} x = ${fmtp(x, 1)} → x² = ${fmt(x * x, 2)}`).join('\n')],
        ['Cari garis datar di antara keduanya', `■ paling tinggi x² = 1, ● paling rendah x² = 6.25\n→ garis x² = 3.6 (di antara 1 dan 6.25) memisahkan dengan sempurna`],
        ['Kembali ke dimensi asli', 'x² = 3.6 berarti x = ±1.9\n→ di garis asli batasnya jadi DUA titik: −1.9 dan 1.9 (non-linear!)'],
      ]));
    }
    el.append(box('coba', null, h('div', {}, h('div', {}, 'Lima titik di garis bilangan: ● ■ ■ ■ ●. Klik tombol untuk "mengangkat" tiap titik setinggi x²-nya.'), h('div', { style: 'margin-top:8px' }, btn3))));
    el.append(p3.el, box('langkah', null, out3));
    upd3();
    el.append(h('p', {}, 'Hebatnya, SVM tidak perlu benar-benar menghitung dimensi baru ini satu per satu. Fungsi kernel langsung menghitung "kemiripan" dua titik seolah-olah sudah di dimensi tinggi. Karena itu disebut "trick".'));
    el.append(ML.table(['Kernel', 'Kapan dipakai'], [['<code>linear</code>', 'Data bisa dipisah garis lurus'], ['<code>rbf</code> (Gaussian)', 'Paling sering dipakai, default di scikit-learn'], ['<code>poly</code>', 'Polinomial (seperti x² di atas, bisa x³, dst.)']]));

    /* ================= INTERAKTIF 4: RBF ================= */
    el.append(h('h2', {}, 'Kernel RBF dan Gamma (γ)'));
    el.append(h('p', {}, 'Kernel RBF mengukur kemiripan dua titik berdasarkan jaraknya. Dekat = mirip (nilai mendekati 1). Jauh = tidak mirip (mendekati 0). Gamma mengatur seberapa cepat "kemiripan" itu hilang saat jaraknya bertambah.'));
    el.append(box('rumus', null, ML.formula(`${V('K')}(${V('a')}, ${V('b')}) = e<sup>−γ · jarak²</sup>`,
      [['a, b', 'dua titik data'], ['jarak²', 'jarak kuadrat: (selisih x₁)² + (selisih x₂)²'], ['γ', 'gamma: besar = pengaruh tiap titik sempit; kecil = pengaruh luas'], ['K', 'kemiripan, antara 0 (asing) dan 1 (sama persis)']])));
    const RA = [1, 1], RB = [2, 2];
    let dragI = -1;
    const sG = ML.slider({ label: 'γ (gamma)', min: 0.1, max: 10, step: 0.1, value: 0.5, digits: 1, onInput: upd4 });
    const out4 = h('div');
    const p4 = ML.plot({ height: 340, x: [0, 4], y: [0, 4], xLabel: 'x₁', yLabel: 'x₂', caption: 'Seret titik <b>a</b> dan <b>b</b>. Lingkaran putus-putus = jarak di mana K tinggal 0.5 (pengaruh a "setengah").' });
    p4.draw((p) => {
      square(p, 2, 2, 2.1);
      p.clear(); p.grid(); p.axes();
      const r = Math.sqrt(Math.log(2) / sG.value), R = r * (p.sx(1) - p.sx(0));
      const ctx = p.ctx; ctx.save(); p.clip(); ctx.beginPath(); ctx.arc(p.sx(RA[0]), p.sy(RA[1]), R, 0, 7);
      ctx.fillStyle = p.col('c3'); ctx.globalAlpha = 0.1; ctx.fill(); ctx.globalAlpha = 1;
      ctx.setLineDash([6, 5]); ctx.lineWidth = 1.5; ctx.strokeStyle = p.col('text-2'); ctx.stroke(); ctx.restore();
      p.line(RA[0], RA[1], RB[0], RB[1], { color: 'text-2', width: 1.5, dash: [3, 3] });
      p.point(RA[0], RA[1], { color: 'c3', r: 7, label: 'a (' + fmt(RA[0], 1) + ', ' + fmt(RA[1], 1) + ')', bold: true });
      p.point(RB[0], RB[1], { color: 'c3', r: 7, shape: 'square', label: 'b (' + fmt(RB[0], 1) + ', ' + fmt(RB[1], 1) + ')', bold: true });
    });
    p4.onDrag({
      start: (x, y) => { dragI = p4.nearest([RA, RB], x, y, 18); return dragI >= 0; },
      move: (x, y) => { const P = dragI ? RB : RA; P[0] = Math.round(Math.max(0, Math.min(4, x)) * 10) / 10; P[1] = Math.round(Math.max(0, Math.min(4, y)) * 10) / 10; upd4(); },
      end: () => { dragI = -1; },
    });
    p4.onHover((x, y) => { const i = p4.nearest([RA, RB], x, y, 18); return i < 0 ? null : `titik <b>${i ? 'b' : 'a'}</b> — seret untuk memindahkan`; });
    function upd4() {
      const g = sG.value, dx = RB[0] - RA[0], dy = RB[1] - RA[1], d2 = dx * dx + dy * dy, K = Math.exp(-g * d2);
      out4.innerHTML = '';
      out4.append(ML.steps([
        ['Jarak kuadrat', `jarak² = (${fmt(RB[0], 1)} − ${fmt(RA[0], 1)})² + (${fmt(RB[1], 1)} − ${fmt(RA[1], 1)})² = ${fmt(dx * dx, 2)} + ${fmt(dy * dy, 2)} = <b>${fmt(d2, 2)}</b>`],
        ['Kalikan dengan −γ', `−γ × jarak² = −${fmt(g, 1)} × ${fmt(d2, 2)} = ${fmt(-g * d2, 3)}`],
        ['Pangkatkan e', `K = e^(${fmt(-g * d2, 3)}) = <b>${K < 0.001 ? fmt(K, 6) : fmt(K, 3)}</b>`],
        ['Artinya', K > 0.6 ? 'sangat mirip (dianggap tetangga dekat)' : K > 0.2 ? 'cukup mirip' : K > 0.01 ? 'kurang mirip' : 'dianggap <b>sama sekali tidak mirip</b>'],
      ]));
      out4.append(h('div', { style: 'display:flex;align-items:center;gap:8px;margin-top:6px;font-family:var(--mono)' }, 'K:',
        h('span', { style: 'flex:1;max-width:260px;height:14px;background:var(--surface-2);border-radius:3px;overflow:hidden' }, h('span', { style: `display:block;height:100%;width:${K * 100}%;background:var(--c3)` })), fmt(K, 3)));
      p4.redraw();
    }
    const gBtn = (v) => h('button', { onclick: () => { sG.value = v; upd4(); } }, 'γ = ' + v);
    el.append(h('div', { class: 'grid2', style: 'align-items:start' }, p4.el,
      h('div', {}, box('coba', null, h('div', {}, sG.el, h('div', { style: 'display:flex;gap:6px;margin-top:6px' }, gBtn(0.5), gBtn(5), h('button', { onclick: () => { RA[0] = 1; RA[1] = 1; RB[0] = 2; RB[1] = 2; upd4(); } }, 'posisi awal')))), box('langkah', null, out4))));
    upd4();
    el.append(h('p', { class: 'small muted' }, 'Contoh dari catatan: a = (1, 1), b = (2, 2) → jarak² = 2. Dengan γ = 0.5: K = e^(−1) = 0.37 (masih cukup mirip). Dengan γ = 5: K = e^(−10) ≈ 0.00005 (dianggap asing).'));

    // ---- demo wilayah RBF ----
    el.append(h('h3', {}, 'Lihat Efek Gamma pada Batas Keputusan'));
    const D5 = [[2.5, 2.5, 1], [3, 3.2, 1], [3.4, 2.4, 1], [2.7, 1.9, 1], [3.6, 3.4, 1], [2.2, 3.3, 1],
      [1, 1, -1], [0.8, 3, -1], [1.5, 4.5, -1], [3, 4.6, -1], [4.6, 4.2, -1], [5, 2.5, -1], [4.5, 0.8, -1], [2.5, 0.6, -1], [1.2, 2, -1], [4.3, 1.8, -1]];
    const X5 = D5.map((d) => [d[0], d[1]]), Y5 = D5.map((d) => d[2]);
    let m5 = null;
    const sG5 = ML.slider({ label: 'log₁₀ γ', min: -1.3, max: 1.5, step: 0.1, value: 0, digits: 1, onInput: upd5 });
    const g5Lbl = h('div', { style: 'font-family:var(--mono);font-weight:700;font-size:18px' }), out5 = h('div');
    const f5 = (x, y) => { let s = m5.b; for (let i = 0; i < D5.length; i++) if (m5.a[i] > 1e-8) { const dx = x - X5[i][0], dy = y - X5[i][1]; s += m5.a[i] * Y5[i] * Math.exp(-m5.g * (dx * dx + dy * dy)); } return s; };
    const p5 = ML.plot({ height: 360, x: [0, 5.6], y: [0, 5.2], xLabel: 'x₁', yLabel: 'x₂', legend: legendKelas.concat([{ label: 'batas keputusan', color: 'text', shape: 'line' }]), caption: 'SVM kernel RBF sungguhan versi mini (dilatih dengan SMO, C = 10). Cincin hitam = support vector.' });
    p5.draw((p) => {
      square(p, 2.8, 2.6, 2.75);
      p.clear(); if (!m5) return;
      const C1 = p.col('c1'), C2 = p.col('c2');
      p.region((x, y) => { const v = f5(x, y); return { color: v > 0 ? C1 : C2, alpha: 0.07 + 0.2 * Math.min(1, Math.abs(v)) }; }, 5);
      p.grid(); p.axes();
      // garis batas f = 0 (marching squares sederhana)
      const N = 4, ctx = p.ctx, x0 = p.pad.l, y0 = p.pad.t, x1 = p.W - p.pad.r, y1 = p.H - p.pad.b;
      const cols = Math.ceil((x1 - x0) / N) + 1, rows = Math.ceil((y1 - y0) / N) + 1, F = [];
      for (let j = 0; j < rows; j++) { F.push([]); for (let i = 0; i < cols; i++) F[j].push(f5(p.ix(x0 + i * N), p.iy(y0 + j * N))); }
      ctx.save(); p.clip(); ctx.strokeStyle = p.col('text'); ctx.lineWidth = 2; ctx.beginPath();
      const ip = (a, b) => a / (a - b);
      for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) {
        const a = F[j][i], b = F[j][i + 1], c = F[j + 1][i + 1], d = F[j + 1][i], X = x0 + i * N, Y = y0 + j * N, pts = [];
        if ((a > 0) !== (b > 0)) pts.push([X + ip(a, b) * N, Y]);
        if ((b > 0) !== (c > 0)) pts.push([X + N, Y + ip(b, c) * N]);
        if ((d > 0) !== (c > 0)) pts.push([X + ip(d, c) * N, Y + N]);
        if ((a > 0) !== (d > 0)) pts.push([X, Y + ip(a, d) * N]);
        for (let k = 0; k + 1 < pts.length; k += 2) { ctx.moveTo(pts[k][0], pts[k][1]); ctx.lineTo(pts[k + 1][0], pts[k + 1][1]); }
      }
      ctx.stroke(); ctx.restore();
      D5.forEach(([x, y, c], i) => p.point(x, y, Object.assign(ptStyle(c), { ring: m5.a[i] > 1e-6 ? 'text' : false })));
    });
    p5.onHover((x, y) => { if (!m5) return null; const v = f5(x, y); return `f = <b>${fmt(v, 2)}</b> → tebakan ${v > 0 ? 'kelas 1' : 'kelas 0'}`; });
    function upd5() {
      const g = Math.pow(10, sG5.value), r = smo(X5, Y5, 10, (p, q) => Math.exp(-g * ((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2)));
      m5 = { a: r.a, b: r.b, g };
      g5Lbl.textContent = 'γ = ' + fmt(g, 2);
      const sv = r.a.filter((v) => v > 1e-6).length, ok = D5.filter(([x, y, c]) => c * f5(x, y) > 0).length;
      out5.innerHTML = `Support vector: <b>${sv}</b> dari ${D5.length} titik · akurasi data latih: <b>${fmt((ok / D5.length) * 100, 0)}%</b><br>` +
        (g < 0.3 ? 'γ kecil → pengaruh tiap titik luas → batasnya <b>halus</b> dan sederhana (satu lengkungan besar). Kalau terlalu kecil, model bisa jadi terlalu sederhana.'
          : g > 5 ? 'γ besar → pengaruh tiap titik sempit → muncul <b>"pulau"</b> kecil di sekitar tiap titik. Model menghafal data latih (<b>overfitting</b>), titik baru di antara pulau bisa salah tebak.'
          : 'γ sedang → batas melengkung mengikuti bentuk kelompok biru. Biasanya ini yang paling bagus.');
      p5.redraw();
    }
    el.append(h('div', { class: 'grid2', style: 'align-items:start' }, p5.el,
      box('coba', null, h('div', {}, h('div', {}, 'Geser γ ke kiri (kecil) lalu ke kanan (besar).'), sG5.el, g5Lbl, h('div', { style: 'margin-top:8px' }, out5)))));
    upd5();

    /* ================= BISINDO ================= */
    el.append(h('h2', {}, 'SVM di Proyek BISINDO'));
    el.append(ML.flow([
      { t: 'Video isyarat', s: 'tangan membentuk huruf' },
      { t: 'MediaPipe Hands', s: '21 titik × (x, y, z)' },
      { t: '63 fitur', s: 'angka per frame' },
      { t: 'StandardScaler', s: 'samakan skala' },
      { t: 'SVC (RBF)', s: 'cari pemisah antar huruf' },
      { t: 'Huruf', s: '"A"' },
    ], 4).el);
    el.append(box('bisindo', null, `SVM cocok untuk BISINDO karena datanya <b>tidak terlalu besar</b> tapi <b>berdimensi tinggi</b> (63 fitur), dan di situlah SVM kuat.
      Kernel RBF membantu kalau pola tangan antar huruf tidak bisa dipisah garis lurus.<br><br>
      <b>Penting: SVM wajib di-scaling.</b> SVM (terutama RBF) bekerja dengan <b>jarak</b>. Kalau satu fitur skalanya jauh lebih besar,
      jarak hanya ditentukan fitur itu. Contoh: a = (0.2, 500) dan b = (0.9, 510) → jarak² = 0.7² + 10² = 0.49 + 100 = 100.49.
      Fitur pertama hampir tidak berpengaruh! StandardScaler membuat semua fitur punya skala setara.`));
    el.append(h('pre', { class: 'code' }, `from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# X_train: (jumlah_sampel, 63) koordinat landmark, y_train: huruf
model = make_pipeline(StandardScaler(), SVC(kernel='rbf', C=1.0, gamma='scale'))
model.fit(X_train, y_train)
print(model.score(X_test, y_test))   # akurasi
print(model.predict(X_test[:1]))     # misalnya ['A']`));

    el.append(ML.table(['Kelebihan', 'Kekurangan'], [
      ['Bekerja baik di data berdimensi tinggi', 'Lambat untuk dataset sangat besar (puluhan ribu sampel lebih)'],
      ['Efektif walaupun datanya sedikit', 'Perlu mencari nilai C dan gamma yang pas (tuning)'],
      ['Tahan overfitting kalau parameternya tepat', 'Tidak langsung menghasilkan peluang (beda dengan Logistic Regression)'],
    ]));

    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Dengan w = [1, 1] dan b = −4, titik (4, 1) masuk kelas apa?', options: ['Kelas 1, karena 4 + 1 − 4 = +1 (positif)', 'Kelas 0, karena hasilnya negatif', 'Tidak bisa ditentukan'], answer: 0, explain: 'f = 1×4 + 1×1 − 4 = +1. Positif → kelas 1. Karena tepat +1, titik ini juga support vector (tepat di tepi jalan).' },
      { q: 'w = [1, 1]. Berapa lebar margin-nya?', options: ['2', '1.414', '0.707'], answer: 1, explain: '‖w‖ = √(1² + 1²) = 1.414, margin = 2 ÷ 1.414 = 1.414.' },
      { q: 'Kamu menaikkan C menjadi sangat besar. Apa yang terjadi?', options: ['Jalan makin lebar dan lebih toleran', 'Jalan menyempit supaya tidak ada titik yang salah, rawan overfitting', 'Tidak ada pengaruhnya'], answer: 1, explain: 'C besar = hukuman kesalahan besar, jadi model memaksa semua titik benar walaupun jalannya jadi sempit.' },
      { q: 'Dengan kernel RBF, gamma yang sangat besar membuat…', options: ['Batas halus seperti garis lurus', 'Muncul "pulau" kecil di sekitar tiap titik (menghafal data)', 'Training jadi tidak butuh data'], answer: 1, explain: 'Gamma besar → K cepat turun ke 0 → tiap titik hanya memengaruhi daerah yang sangat dekat. Contoh: jarak² = 2, γ = 5 → K ≈ 0.00005.' },
    ]));
  },
});
