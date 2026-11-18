/* Bab 13 — Word2Vec: kata jadi vektor (embedding) */
ML.chapter({
  id: 'word2vec',
  num: 13,
  group: 'Teks & Kata',
  title: 'Word2Vec: Kata Jadi Vektor',
  lead: 'Setiap kata diberi <b>koordinat</b>. Kata yang maknanya mirip letaknya berdekatan, bahkan bisa dihitung: <b>raja − pria + wanita ≈ ratu</b>.',
  render(el) {
    const { h, box, steps, fmt } = ML;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const f = (x) => fmt(x, 2), f3 = (x) => x.toFixed(3);
    const vstr = (v) => `[${f(v[0])}, ${f(v[1])}]`;
    const cosine = (a, b) => { const n = ML.norm(a) * ML.norm(b); return n ? ML.dot(a, b) / n : 0; };

    // ---------- analogi ----------
    el.append(box('analogi', null, `
      Kamu bisa menebak sifat seseorang dari <b>teman-teman tongkrongannya</b>. Word2Vec melakukan hal yang sama pada kata:
      kata yang sering ditemani kata-kata yang sama ("kucing" dan "anjing" sama-sama dekat dengan "makan", "lucu", "peliharaan")
      dianggap <b>mirip maknanya</b>.<br><br>
      Hasilnya, setiap kata mendapat <b>alamat berupa deretan angka</b> (vektor). Kata yang mirip punya alamat yang berdekatan,
      seperti rumah-rumah di satu kompleks.`));

    // ---------- sparse vs dense ----------
    el.append(h('h2', {}, 'Sebelum Word2Vec: Vektor One-Hot yang Boros'));
    el.append(h('p', { html: `<b>One-hot</b> = vektor sepanjang kosakata, isinya 0 semua kecuali satu angka 1 di posisi kata itu.
      Vektor seperti ini disebut <b>sparse</b> (jarang terisi). Masalahnya: semua kata sama jauhnya satu sama lain, tidak ada informasi makna.
      Word2Vec membuat vektor <b>dense</b> (padat): pendek, semua angka terisi, dan punya makna.` }));
    const cellRow = (vals, numeric) => h('div', { style: 'display:flex;gap:3px;flex-wrap:wrap' }, ...vals.map((v) => h('span', {
      style: `min-width:${numeric ? 46 : 22}px;height:24px;display:inline-grid;place-items:center;font-family:var(--mono);font-size:12.5px;border-radius:4px;border:1px solid var(--border);color:var(--text);`
        + `background:color-mix(in srgb, var(--c1) ${Math.round(Math.min(1, Math.abs(v)) * 60)}%, var(--surface))` }, numeric ? fmt(v, 2) : String(v))));
    const oh = (k) => Array.from({ length: 12 }, (_, i) => (i === k ? 1 : 0));
    const dense = { kucing: [0.62, -0.11, 0.83, 0.20, -0.35], anjing: [0.58, -0.09, 0.79, 0.25, -0.30], pesawat: [-0.40, 0.91, -0.22, 0.66, 0.12] };
    const sd = h('div', { class: 'grid2' });
    const col1 = h('div', { class: 'stat' }, h('div', { class: 'k' }, 'ONE-HOT (sparse): panjang = jumlah kosakata (bisa 10.000+)'));
    const col2 = h('div', { class: 'stat' }, h('div', { class: 'k' }, 'WORD2VEC (dense): pendek (misal 50 angka), semua terisi'));
    [['kucing', 2], ['anjing', 5], ['pesawat', 9]].forEach(([w, k]) => {
      col1.append(h('div', { style: 'margin-top:8px' }, h('div', { class: 'small' }, w), h('div', { style: 'display:flex;align-items:center;gap:6px' }, cellRow(oh(k), false), h('span', { class: 'small muted' }, '…'))));
      col2.append(h('div', { style: 'margin-top:8px' }, h('div', { class: 'small' }, w), h('div', { style: 'display:flex;align-items:center;gap:6px' }, cellRow(dense[w], true), h('span', { class: 'small muted' }, '…'))));
    });
    col1.append(h('div', { class: 'd', style: 'margin-top:8px' }, '✗ kucing vs anjing sama jauhnya dengan kucing vs pesawat'));
    col2.append(h('div', { class: 'd', style: 'margin-top:8px' }, '✓ kucing dan anjing angkanya mirip, pesawat jauh berbeda'));
    sd.append(col1, col2);
    el.append(sd);
    el.append(h('p', { class: 'small muted' }, 'Warna sel: makin gelap = angkanya makin jauh dari 0. Angka dense di atas hanya ilustrasi.'));

    // ---------- playground 2D ----------
    el.append(h('h2', {}, 'Ruang Kata 2 Dimensi & Aritmatika Kata'));
    el.append(h('p', { html: `Vektor asli punya 50–300 angka. Supaya bisa digambar, anggap tiap kata hanya punya <b>2 angka</b>:
      angka ke-1 = seberapa <b>"laki-laki"</b>, angka ke-2 = seberapa <b>"kerajaan"</b>. (Kata seperti "kucing" tidak cocok di 2 sumbu ini;
      di model asli ia tinggal di dimensi-dimensi lain.)` }));
    const START = [['raja', 0.9, 0.9], ['ratu', 0.1, 0.9], ['pangeran', 0.9, 0.6], ['putri', 0.1, 0.6], ['pria', 0.9, 0.1], ['wanita', 0.1, 0.1]];
    const words = START.map(([w, x, y]) => ({ w, v: [x, y] }));
    const byName = (n) => words.find((o) => o.w === n);

    el.append(box('coba', null, `<b>Seret titik kata</b> untuk memindahkannya. Pilih rumus <b>A − B + C</b> di bawah:
      panah aqua menunjukkan "arah" C − B. Arah yang sama ditempelkan di A, dan ujungnya adalah <b>hasil</b>.
      Kata terdekat (cosine terbesar, selain A, B, C) adalah jawaban analoginya.`));

    const mkSel = (val) => { const s = h('select', {}); words.forEach((o) => s.append(h('option', { value: o.w, selected: o.w === val }, o.w))); return s; };
    const sA = mkSel('raja'), sB = mkSel('pria'), sC = mkSel('wanita');
    const resetBtn = h('button', { onclick: () => { START.forEach(([w, x, y]) => { byName(w).v = [x, y]; }); refresh(); } }, '↺ Posisi awal');
    el.append(h('div', { class: 'controls' },
      h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, 'A'), sA),
      h('span', { style: 'font-size:22px;padding-bottom:4px' }, '−'),
      h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, 'B'), sB),
      h('span', { style: 'font-size:22px;padding-bottom:4px' }, '+'),
      h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, 'C'), sC),
      h('span', { style: 'font-size:22px;padding-bottom:4px' }, '='),
      h('span', { style: 'font-size:16px;padding-bottom:6px' }, '?'),
      resetBtn));

    const analog = () => {
      const A = byName(sA.value).v, B = byName(sB.value).v, C = byName(sC.value).v;
      const R = [A[0] - B[0] + C[0], A[1] - B[1] + C[1]];
      const ex = new Set([sA.value, sB.value, sC.value]);
      const cands = words.filter((o) => !ex.has(o.w)).map((o) => ({ w: o.w, v: o.v, cos: cosine(R, o.v), dist: Math.hypot(R[0] - o.v[0], R[1] - o.v[1]) }))
        .sort((a, b) => b.cos - a.cos);
      return { A, B, C, R, cands, best: cands[0] };
    };

    const p = ML.plot({
      width: 640, height: 420, x: [-0.2, 1.2], y: [-0.2, 1.2], xLabel: 'laki-laki →', yLabel: 'kerajaan →',
      legend: [{ label: 'kata', color: 'c1', shape: 'circle' }, { label: 'hasil A − B + C', color: 'c2', shape: 'square' }, { label: 'arah C − B (sama di dua tempat)', color: 'c3', shape: 'line' }],
      caption: 'Seret titik kata. Garis putus-putus melengkapi jajaran genjang: B → A sejajar C → hasil.',
    });
    p.draw((p) => {
      const an = analog();
      const xs = [...words.map((o) => o.v[0]), an.R[0]], ys = [...words.map((o) => o.v[1]), an.R[1]];
      p.x = [Math.min(-0.2, Math.min(...xs) - 0.15), Math.max(1.2, Math.max(...xs) + 0.25)];
      p.y = [Math.min(-0.2, Math.min(...ys) - 0.15), Math.max(1.2, Math.max(...ys) + 0.15)];
      p.clear(); p.grid(); p.axes();
      // jajaran genjang
      p.line(an.B[0], an.B[1], an.A[0], an.A[1], { color: 'text-2', width: 1.5, dash: [4, 4] });
      p.line(an.C[0], an.C[1], an.R[0], an.R[1], { color: 'text-2', width: 1.5, dash: [4, 4] });
      if (Math.hypot(an.C[0] - an.B[0], an.C[1] - an.B[1]) > 1e-9) {
        p.arrow(an.B[0], an.B[1], an.C[0], an.C[1], { color: 'c3', width: 2 });
        p.arrow(an.A[0], an.A[1], an.R[0], an.R[1], { color: 'c3', width: 2 });
        p.text((an.B[0] + an.C[0]) / 2, (an.B[1] + an.C[1]) / 2, 'C − B', { dy: 14, size: 12, color: 'text-2', bg: true });
        p.text((an.A[0] + an.R[0]) / 2, (an.A[1] + an.R[1]) / 2, 'C − B', { dy: -14, size: 12, color: 'text-2', bg: true });
      }
      const role = { [sA.value]: 'A', [sB.value]: 'B', [sC.value]: 'C' };
      words.forEach((o) => {
        const isBest = an.best && o.w === an.best.w;
        p.point(o.v[0], o.v[1], { color: 'c1', r: 7, ring: isBest ? 'c2' : false, label: (role[o.w] ? role[o.w] + ': ' : '') + o.w, bold: !!role[o.w] || isBest });
      });
      p.point(an.R[0], an.R[1], { color: 'c2', shape: 'square', r: 6 });
      p.text(an.R[0], an.R[1], 'hasil ' + vstr(an.R), { dx: 12, dy: 12, align: 'left', base: 'top', size: 12.5, bg: true });
    });
    let dragIdx = -1;
    p.onDrag({
      start: (x, y) => { dragIdx = p.nearest(words.map((o) => o.v), x, y, 16); return dragIdx >= 0; },
      move: (x, y) => {
        const cl = (t) => Math.round(Math.max(0, Math.min(1, t)) * 20) / 20;
        words[dragIdx].v = [cl(x), cl(y)]; refresh();
      },
      end: () => { dragIdx = -1; },
    });
    p.onHover((x, y) => {
      const an = analog();
      const pts = [...words.map((o) => o.v), an.R];
      const i = p.nearest(pts, x, y);
      if (i < 0) return null;
      if (i === words.length) return `<b>hasil A − B + C</b><br>${vstr(an.R)}`;
      return `<b>${words[i].w}</b><br>laki-laki ${f(words[i].v[0])}, kerajaan ${f(words[i].v[1])}<br><i>seret untuk memindah</i>`;
    });
    p.canvas.style.cursor = 'grab';
    el.append(p.el);

    const anOut = h('div');
    el.append(anOut);

    function renderAnalogy() {
      const an = analog();
      const [a, b, c] = [sA.value, sB.value, sC.value];
      const dim = (k, nm) => `angka ke-${k + 1} (${nm}):  ${f(an.A[k])} − ${ML.fmtp(an.B[k])} + ${ML.fmtp(an.C[k])} = ${f(an.R[k])}`;
      const best = an.best;
      const st = [
        [`Tulis vektor tiap kata`, `A ${esc(a)} = ${vstr(an.A)}\nB ${esc(b)} = ${vstr(an.B)}\nC ${esc(c)} = ${vstr(an.C)}`],
        ['Hitung <b>per posisi</b> (seperti menjumlah biasa, satu kolom demi satu kolom)', dim(0, 'laki-laki') + '\n' + dim(1, 'kerajaan')],
        ['Hasilnya sebuah titik baru', `${esc(a)} − ${esc(b)} + ${esc(c)} = ${vstr(an.R)}`],
      ];
      if (best) st.push([`Cari kata dengan <b>cosine terbesar</b> terhadap hasil (A, B, C tidak ikut)`,
        `cosine(hasil, ${best.w}) = ${f3(best.cos)}  → jawaban: ${best.w.toUpperCase()}`]);
      anOut.innerHTML = '';
      anOut.append(box('langkah', `Langkah Hitung: ${esc(a)} − ${esc(b)} + ${esc(c)}`, steps(st)));
      if (an.cands.length) {
        anOut.append(ML.table(['Kandidat', 'Vektor', 'Cosine dengan hasil', 'Jarak ke hasil'],
          an.cands.map((o, i) => [(i === 0 ? '<b>' + o.w + '</b> ✓' : o.w), vstr(o.v), f3(o.cos), f3(o.dist)]), { highlight: 0 }));
        anOut.append(h('p', { class: 'small muted' }, 'Gensim memakai cosine (membandingkan arah, bukan jarak). Di ruang 2 dimensi beberapa kata bisa punya cosine sangat mirip; di ruang 50–300 dimensi perbedaannya jauh lebih jelas.'));
      }
    }

    // ---------- kemiripan ----------
    el.append(h('h2', {}, 'Seberapa Mirip Dua Kata? (Cosine Similarity)'));
    el.append(box('rumus', null, ML.formula(
      `cos(<span class="var">u</span>, <span class="var">v</span>) = ${ML.frac('<span class="var">u</span> · <span class="var">v</span>', '|<span class="var">u</span>| × |<span class="var">v</span>|')}`,
      [
        ['u, v', 'vektor dua kata, misalnya raja dan ratu'],
        ['u · v', '<b>dot product</b>: kalikan angka yang seposisi, lalu jumlahkan'],
        ['|u|', '<b>panjang</b> vektor = √(angka₁² + angka₂² + …)'],
        ['cos', 'hasilnya −1 sampai 1. Mendekati 1 = arahnya sama = maknanya mirip'],
      ])));
    const s1 = mkSel('raja'), s2 = mkSel('ratu');
    el.append(h('div', { class: 'controls' },
      h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, 'Kata 1'), s1),
      h('div', { class: 'ctl', style: 'min-width:auto' }, h('label', {}, 'Kata 2'), s2)));
    const simWrap = h('div', { class: 'grid2' });
    const p2 = ML.plot({
      width: 420, height: 320, x: [0, 1.1], y: [0, 1.1], xLabel: 'laki-laki →', yLabel: 'kerajaan →',
      legend: [{ label: 'kata 1', color: 'c1', shape: 'line' }, { label: 'kata 2', color: 'c2', shape: 'line' }],
      caption: 'Cosine hanya melihat <b>sudut</b> antara dua panah dari titik (0, 0).',
    });
    p2.draw((p) => {
      const u = byName(s1.value).v, v = byName(s2.value).v;
      p.clear(); p.grid(); p.axes();
      const X0 = p.sx(0), Y0 = p.sy(0);
      const a1 = Math.atan2(-(p.sy(u[1]) - Y0), p.sx(u[0]) - X0), a2 = Math.atan2(-(p.sy(v[1]) - Y0), p.sx(v[0]) - X0);
      if (ML.norm(u) && ML.norm(v)) {
        const ctx = p.ctx; ctx.save(); ctx.strokeStyle = p.col('text-2'); ctx.lineWidth = 1.5; ctx.beginPath();
        ctx.arc(X0, Y0, 46, -Math.max(a1, a2), -Math.min(a1, a2)); ctx.stroke(); ctx.restore();
        const deg = Math.acos(Math.max(-1, Math.min(1, cosine(u, v)))) * 180 / Math.PI;
        const am = (a1 + a2) / 2;
        p.text(p.ix(X0 + 62 * Math.cos(am)), p.iy(Y0 - 62 * Math.sin(am)), 'sudut ' + fmt(deg, 0) + '°', { size: 12, color: 'text-2', align: 'left', bg: true });
      }
      p.arrow(0, 0, u[0], u[1], { color: 'c1', width: 2 });
      p.arrow(0, 0, v[0], v[1], { color: 'c2', width: 2 });
      p.point(u[0], u[1], { color: 'c1', r: 6, label: s1.value });
      p.point(v[0], v[1], { color: 'c2', r: 6, shape: 'square', label: s2.value });
    });
    p2.onHover((x, y) => {
      const pts = [byName(s1.value).v, byName(s2.value).v];
      const i = p2.nearest(pts, x, y); if (i < 0) return null;
      const n = i ? s2.value : s1.value;
      return `<b>${n}</b><br>${vstr(pts[i])}<br>panjang ${f3(ML.norm(pts[i]))}`;
    });
    const simOut = h('div');
    simWrap.append(p2.el, simOut);
    el.append(simWrap);

    function renderSim() {
      const u = byName(s1.value).v, v = byName(s2.value).v, n1 = s1.value, n2 = s2.value;
      const dot = ML.dot(u, v), lu = ML.norm(u), lv = ML.norm(v);
      const c = lu && lv ? dot / (lu * lv) : 0;
      const sq = (w) => `√(${f(w[0])}² + ${f(w[1])}²) = √${fmt(w[0] * w[0] + w[1] * w[1], 4)} = ${f3(ML.norm(w))}`;
      const word = c > 0.95 ? 'sangat mirip' : c > 0.7 ? 'cukup mirip' : c > 0.4 ? 'agak mirip' : 'tidak mirip';
      simOut.innerHTML = '';
      simOut.append(box('langkah', `${n1} vs ${n2}`, steps([
        ['Dot product', `${n1} · ${n2} = ${f(u[0])}×${f(v[0])} + ${f(u[1])}×${f(v[1])}\n= ${fmt(u[0] * v[0], 4)} + ${fmt(u[1] * v[1], 4)} = ${fmt(dot, 4)}`],
        ['Panjang ' + n1, sq(u)],
        ['Panjang ' + n2, sq(v)],
        ['Cosine', lu && lv ? `${fmt(dot, 4)} ÷ (${f3(lu)} × ${f3(lv)}) = ${fmt(dot, 4)} ÷ ${f3(lu * lv)} = <b>${f(c)}</b>  → ${word}` : 'panjang 0, cosine tidak terdefinisi'],
      ])));
    }

    function refresh() { p.redraw(); p2.redraw(); renderAnalogy(); renderSim(); }
    [sA, sB, sC, s1, s2].forEach((s) => s.addEventListener('change', refresh));
    renderAnalogy(); renderSim();

    // ---------- skip-gram ----------
    el.append(h('h2', {}, 'Dari Mana Word2Vec Belajar? Pasangan Kata Tetangga'));
    el.append(h('p', { html: `Word2Vec tidak butuh label buatan manusia. Ia membuat soal latihan sendiri dari kalimat:
      untuk tiap kata (<b>target</b>), kata-kata di sekitarnya dalam <b>jendela</b> (window) dijadikan <b>konteks</b>.
      Pasangan (target → konteks) inilah data latihnya.` }));
    el.append(box('coba', null, 'Ketik kalimat dan geser ukuran <b>window</b> (berapa kata di kiri dan kanan yang dilihat).'));
    const sentIn = h('input', { type: 'text', value: 'kucing suka ikan segar', 'aria-label': 'kalimat', style: 'width:100%' });
    const win = ML.slider({ label: 'window', min: 1, max: 4, step: 1, value: 1, digits: 0, onInput: () => renderSkip() });
    el.append(h('div', { class: 'controls' }, h('div', { class: 'ctl', style: 'flex:1 1 300px' }, h('label', {}, 'Kalimat'), sentIn), win.el));
    const skipOut = h('div');
    el.append(skipOut);
    function renderSkip() {
      const t = sentIn.value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
      const W = Math.round(win.value);
      let total = 0;
      const rows = t.map((w, i) => {
        const lo = Math.max(0, i - W), hi = Math.min(t.length - 1, i + W);
        const jendela = t.map((x, j) => {
          if (j === i) return `<b class="c1">[${esc(x)}]</b>`;
          if (j >= lo && j <= hi) return `<span style="background:var(--surface-2);border:1px solid var(--axis);border-radius:4px;padding:0 4px">${esc(x)}</span>`;
          return `<span style="color:var(--text-3)">${esc(x)}</span>`;
        }).join(' ');
        const pairs = [];
        for (let j = lo; j <= hi; j++) if (j !== i) pairs.push(`(${esc(w)} → ${esc(t[j])})`);
        total += pairs.length;
        return [esc(w), jendela, '<span style="font-family:var(--mono);font-size:13.5px">' + pairs.join(', ') + '</span>'];
      });
      skipOut.innerHTML = '';
      if (!t.length) { skipOut.append(h('p', { class: 'muted' }, 'Ketik kalimat dulu.')); return; }
      const tb = ML.table(['Target', 'Jendela (kotak hijau = konteks)', 'Pasangan latih yang dibuat'], rows);
      tb.querySelectorAll('td:nth-child(2), td:nth-child(3)').forEach((td) => { td.classList.add('l'); });
      skipOut.append(tb);
      skipOut.append(h('p', { html: `Total <b>${total} pasangan latih</b> dari ${t.length} kata dengan window = ${W}.` }));
    }
    sentIn.addEventListener('input', renderSkip);
    renderSkip();
    el.append(h('p', { html: `Model lalu dilatih menebak: "kalau diberi <b>kucing</b>, tetangganya <b>suka</b>". Kata-kata yang sering punya tetangga sama
      akhirnya mendapat vektor yang mirip. Berbeda dengan <a href="#naive-bayes">Naive Bayes</a>, pelatihan ini <b>memakai loss dan diulang banyak epoch</b>.` }));

    // ---------- CBOW vs Skip-gram ----------
    el.append(h('h3', {}, 'Dua Cara Melatih: CBOW vs Skip-gram'));
    el.append(h('p', { class: 'small muted', html: 'Contoh kalimat: "kucing adalah <b>hewan</b> yang lucu", target = hewan, window = 2.' }));
    const chip = (t, strong) => `<span style="display:inline-block;padding:2px 10px;margin:2px 0;border-radius:6px;border:1px solid var(--border);background:${strong ? 'var(--surface-2)' : 'var(--surface-2)'};${strong ? 'font-weight:700' : ''}">${t}</span>`;
    const ctxCol = ['kucing', 'adalah', 'yang', 'lucu'].map((w) => chip(w)).join('<br>');
    const model = `<span style="display:inline-block;padding:8px 12px;border-radius:8px;border:1.5px dashed var(--axis)">model</span>`;
    const arr = '<span style="font-size:20px;color:var(--text-3)">→</span>';
    const row = (inner) => `<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:8px 0">${inner}</div>`;
    el.append(ML.html(`<div class="grid2">
      <div class="stat"><div class="k">CBOW (sg=0): konteks → tebak target</div>
        ${row(`<div style="text-align:right">${ctxCol}</div>${arr}${model}${arr}${chip('hewan ?', true)}`)}
        <div class="d">"Diberi kata-kata di sekitar, kata tengahnya apa?"</div></div>
      <div class="stat"><div class="k">SKIP-GRAM (sg=1): target → tebak konteks</div>
        ${row(`${chip('hewan', true)}${arr}${model}${arr}<div>${['kucing ?', 'adalah ?', 'yang ?', 'lucu ?'].map((w) => chip(w)).join('<br>')}</div>`)}
        <div class="d">"Diberi satu kata, tetangganya apa saja?" (tabel di atas)</div></div>
    </div>`));
    el.append(ML.table(['Aspek', 'CBOW', 'Skip-gram'], [
      ['Kecepatan latih', 'Lebih cepat', 'Lebih lambat'],
      ['Cocok untuk', 'Kata umum, data besar', 'Data kecil–menengah, kata langka'],
      ['Parameter Gensim', '<code>sg=0</code>', '<code>sg=1</code>'],
    ]));

    // ---------- gensim ----------
    el.append(h('h2', {}, 'Parameter Penting di Gensim'));
    el.append((() => { const t = ML.table(['Parameter', 'Artinya', 'Contoh'], [
      ['<code>sentences</code>', 'Data latih: daftar kalimat yang sudah dipecah jadi kata', '<code>[["kucing","suka","ikan"], …]</code>'],
      ['<code>vector_size</code>', 'Berapa angka per kata (dimensi vektor)', '50 (default 100)'],
      ['<code>window</code>', 'Berapa kata di kiri & kanan yang dianggap tetangga', '5'],
      ['<code>min_count</code>', 'Kata yang muncul lebih jarang dari ini dibuang', '1'],
      ['<code>sg</code>', '0 = CBOW, 1 = Skip-gram', '1'],
      ['<code>epochs</code>', 'Berapa kali seluruh data dipelajari ulang', '100'],
      ['<code>workers</code>', 'Jumlah thread CPU yang dipakai', '4'],
    ]); t.querySelectorAll('td:nth-child(2)').forEach((td) => td.classList.add('l')); return t; })());
    el.append(h('pre', { class: 'code' }, `from gensim.models import Word2Vec

model = Word2Vec(sentences=korpus_token, vector_size=50, window=5,
                 min_count=1, sg=1, epochs=100, workers=4)

model.wv['raja']                          # vektor kata (50 angka)
model.wv.similarity('raja', 'ratu')       # cosine similarity dua kata
model.wv.most_similar('raja', topn=5)     # 5 kata paling mirip
model.wv.most_similar(positive=['raja', 'wanita'], negative=['pria'], topn=3)  # raja - pria + wanita
model.wv.doesnt_match(['kucing', 'anjing', 'singa', 'komputer'])  # 'komputer'`));

    el.append(box('bisindo', null, `Word2Vec menunjukkan ide penting: <b>sesuatu yang mirip → vektornya berdekatan</b>.
      Di BISINDO, tiap isyarat juga sudah berupa vektor (63 angka koordinat tangan). Isyarat yang mirip bentuknya akan punya vektor yang berdekatan,
      dan itulah yang dimanfaatkan model klasifikasi seperti <a href="#svm">SVM</a>.`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Dengan vektor [laki-laki, kerajaan]: raja [0.9, 0.9], pria [0.9, 0.1], wanita [0.1, 0.1]. Hasil raja − pria + wanita?', options: ['[1.9, 1.1] = tidak ada kata', '[0.1, 0.9] = ratu', '[0.9, 0.1] = pria'], answer: 1, explain: 'Per posisi: 0.9 − 0.9 + 0.1 = 0.1 dan 0.9 − 0.1 + 0.1 = 0.9 → [0.1, 0.9] = ratu.' },
      { q: 'Apa kelemahan utama vektor one-hot?', options: ['Terlalu pendek', 'Tidak menyimpan kemiripan makna: semua kata sama jauhnya', 'Tidak bisa dibuat untuk bahasa Indonesia'], answer: 1, explain: 'One-hot hanya menandai posisi kata. "kucing" vs "anjing" sama jauhnya dengan "kucing" vs "pesawat".' },
      { q: 'Kalimat "kucing suka ikan segar" dengan window = 1 menghasilkan berapa pasangan latih skip-gram?', options: ['4', '6', '8'], answer: 1, explain: 'kucing→1, suka→2, ikan→2, segar→1. Total 6.' },
      { q: 'Skip-gram (sg=1) bekerja dengan cara…', options: ['Diberi kata konteks, tebak kata tengah', 'Diberi satu kata target, tebak kata-kata di sekitarnya', 'Menghitung TF-IDF'], answer: 1, explain: 'Itu skip-gram. Kebalikannya (konteks → target) adalah CBOW (sg=0).' },
    ]));
  },
});
