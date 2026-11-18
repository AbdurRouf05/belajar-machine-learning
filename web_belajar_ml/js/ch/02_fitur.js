/* Bab 2 — Fitur, Label & Feature Engineering */
ML.chapter({
  id: 'fitur',
  num: 2,
  group: 'Dasar',
  title: 'Fitur, Label & Feature Engineering',
  lead: 'Mesin hanya mengerti <b>angka</b>. Bab ini membahas cara mengubah data mentah (teks, gambar, video) menjadi angka yang rapi dan siap dipelajari.',
  render(el) {
    const { h, box, steps, fmt } = ML;

    /* chip kecil untuk menampilkan token / angka */
    const chip = (txt, st) => h('span', {
      style: 'display:inline-block;font-family:var(--mono);font-size:14px;padding:2px 9px;margin:2px 4px 2px 0;border-radius:6px;' +
        'border:1px solid var(--border);background:var(--surface);' + (st || ''),
    }, txt);

    // =====================================================================
    el.append(box('analogi', null, `
      Bayangkan kamu ke dokter. Dokter mencatat <b>tinggi badan, berat badan, suhu tubuh</b>, dan <b>tekanan darah</b>.
      Dari catatan itu dokter menyimpulkan: "kamu <b>sehat</b>" atau "kamu <b>demam</b>".
      <br><br>Catatan yang diukur (tinggi, berat, suhu…) disebut <b>fitur</b>.
      Kesimpulan akhirnya (sehat / demam) disebut <b>label</b>.
      Machine Learning bekerja dengan cara yang sama: dari fitur, mesin belajar menebak label.`));

    // ---------- fitur vs label ----------
    el.append(h('h2', {}, 'Fitur vs Label'));
    el.append(h('p', {}, 'Data untuk ML biasanya berbentuk tabel. Tiap baris = satu contoh. Kolom dibagi dua kelompok:'));
    el.append(ML.html(`
      <div class="tbl-scroll"><table class="tbl">
        <tr><th colspan="3"><b class="c1">FITUR (X)</b> — ciri yang diukur, jadi <i>input</i></th>
            <th rowspan="2" style="border-left:3px solid var(--text-3)"><b class="c2">LABEL (y)</b><br><span class="small muted">jawaban / target</span></th></tr>
        <tr><th>luas tanah (m²)</th><th>jumlah kamar</th><th>jarak ke kota (km)</th></tr>
        <tr><td>120</td><td>3</td><td>5</td><td style="border-left:3px solid var(--text-3)"><b>500 juta</b></td></tr>
        <tr><td>90</td><td>2</td><td>12</td><td style="border-left:3px solid var(--text-3)"><b>300 juta</b></td></tr>
        <tr><td>150</td><td>4</td><td>3</td><td style="border-left:3px solid var(--text-3)"><b>? </b><span class="small muted">(ini yang ditebak model)</span></td></tr>
      </table></div>`));
    el.append(ML.flow([{ t: 'Fitur X', s: 'luas, kamar, jarak' }, { t: 'Model', s: 'mencari pola' }, { t: 'Label y', s: 'harga rumah' }], 1).el);
    el.append(ML.table(['', 'Fitur (X)', 'Label (y)'], [
      ['Nama lain', 'feature, input, predictor', 'target, output, <i>ground truth</i>'],
      ['Isinya', 'ciri-ciri data', 'jawaban yang benar'],
      ['Contoh: email', 'jumlah kata "gratis", ada link atau tidak', '<b>spam</b> / <b>bukan spam</b>'],
      ['Contoh: BISINDO', '63 angka posisi titik jari', 'huruf <b>"A"</b>, <b>"B"</b>, …'],
    ]));

    el.append(h('h3', {}, 'Kenapa harus angka?'));
    el.append(ML.html(`
      <div class="grid2">
        <div class="stat"><div class="k">YANG DILIHAT MANUSIA</div>
          <div style="font-size:15px;margin-top:4px">"Buahnya bulat, oranye, agak berat, kulitnya kasar."<br>
          <span class="muted small">Kita langsung paham. Komputer tidak.</span></div></div>
        <div class="stat"><div class="k">YANG DIBUTUHKAN MESIN</div>
          <div style="font-size:15px;margin-top:4px"><code>[180, 9.0, 1]</code><br>
          <span class="muted small">berat 180 g, diameter 9 cm, kulit kasar = 1 (halus = 0)</span></div></div>
      </div>`));
    el.append(h('p', {}, 'Model ML pada dasarnya adalah rumus matematika: kali, tambah, bandingkan. Rumus tidak bisa mengalikan kata "oranye". Jadi semua data harus diubah dulu menjadi angka. Proses mengubah inilah yang disebut Feature Engineering.'));

    // ---------- feature engineering ----------
    el.append(h('h2', {}, 'Apa itu Feature Engineering?'));
    el.append(box('analogi', null, `Feature engineering itu seperti <b>menyiapkan bahan sebelum memasak</b>.
      Sayur dicuci (membersihkan), dipotong-potong (mengambil bagian penting), yang busuk dibuang (memilih),
      lalu bumbunya ditakar dengan sendok yang sama (menyamakan ukuran). Masakan enak butuh bahan yang disiapkan dengan baik.
      <br><br>Pepatah di dunia data: <b>"Garbage in, garbage out"</b> — data masukan jelek, hasilnya juga jelek.`));
    el.append(h('p', { html: '<b>Feature Engineering</b> = semua proses untuk mengubah <b>data mentah</b> menjadi <b>fitur angka</b> yang rapi. Ini "payung besar" yang isinya beberapa langkah:' }));

    const tree = [
      ['a', 'Preprocessing', 'Membersihkan data mentah.', 'huruf kecil semua, buang tanda baca, pecah jadi kata, buang kata tidak penting'],
      ['b', 'Feature Extraction', '<b>Membuat</b> fitur angka baru dari data mentah. Bentuk data berubah.', 'teks → TF-IDF / Word2Vec; video → titik jari MediaPipe'],
      ['c', 'Feature Selection', '<b>Memilih</b> fitur yang berguna, sisanya dibuang. Bentuk data tetap.', 'buang kata yang sangat jarang muncul, buang fitur tidak relevan'],
      ['d', 'Feature Scaling', 'Menyamakan skala (ukuran) angka antar fitur.', 'Min-Max Scaler, StandardScaler'],
      ['+', 'Feature Creation (bonus)', 'Membuat fitur tambahan sendiri pakai logika/pengetahuan kita.', 'panjang teks, jumlah tanda seru, jarak ujung jempol ke telunjuk'],
    ];
    const treeEl = h('div', { style: 'margin:10px 0 10px 4px' },
      h('div', { style: 'display:inline-block;font-weight:700;padding:6px 14px;border-radius:8px;background:var(--rumus-bg);border:1px solid var(--rumus-bd)' }, '🌂 FEATURE ENGINEERING  (data mentah → fitur angka siap pakai)'));
    const branch = h('div', { style: 'margin-left:22px;border-left:2px solid var(--border);padding-left:0' });
    tree.forEach(([k, name, desc, ex]) => {
      branch.append(h('div', { style: 'position:relative;padding:8px 0 4px 26px' },
        h('span', { style: 'position:absolute;left:0;top:22px;width:20px;border-top:2px solid var(--border)' }),
        h('div', { style: 'background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px' },
          h('div', { html: `<b>${k === '+' ? '+' : k + '.'} ${name}</b> — ${desc}` }),
          h('div', { class: 'small muted', html: 'Contoh: ' + ex }))));
    });
    treeEl.append(branch);
    el.append(treeEl);

    el.append(h('h3', {}, 'Extraction vs Selection: dua istilah yang paling sering tertukar'));
    const fsel = [['f1', 1], ['f2', 0], ['f3', 1], ['f4', 0], ['f5', 1]];
    el.append(h('div', { class: 'grid2' },
      h('div', { class: 'stat' },
        h('div', { class: 'k' }, 'FEATURE EXTRACTION = MEMBUAT'),
        h('div', { style: 'margin:6px 0' }, chip('"pelayanannya ramah sekali"')),
        h('div', { class: 'muted small' }, '↓ TF-IDF (teks diubah jadi angka)'),
        h('div', { style: 'margin:6px 0' }, ...['0.00', '0.58', '0.00', '0.58', '0.58'].map((v) => chip(v))),
        h('div', { class: 'small muted' }, 'Input teks, output vektor angka baru. Bentuknya berubah total.')),
      h('div', { class: 'stat' },
        h('div', { class: 'k' }, 'FEATURE SELECTION = MEMILIH'),
        h('div', { style: 'margin:6px 0' }, ...fsel.map(([f]) => chip(f))),
        h('div', { class: 'muted small' }, '↓ pilih yang berguna saja'),
        h('div', { style: 'margin:6px 0' }, ...fsel.map(([f, ok]) => chip(f + (ok ? ' ✓ dipakai' : ' ✗ dibuang'), ok ? '' : 'text-decoration:line-through;opacity:.5'))),
        h('div', { class: 'small muted' }, 'Input fitur angka, output sebagian fitur yang sama. Bentuknya tetap.'))));
    el.append(ML.table(['', 'Feature Extraction', 'Feature Selection'], [
      ['Yang dilakukan', '<b>Membuat</b> fitur baru', '<b>Memilih</b> sebagian fitur'],
      ['Input', 'data mentah (teks, gambar, video)', 'fitur yang sudah berupa angka'],
      ['Contoh', 'TF-IDF, Word2Vec, MediaPipe', 'buang stopword, SelectKBest'],
    ]));

    // ---------- preprocessing interaktif ----------
    el.append(h('h2', {}, 'Coba: Preprocessing Teks Langkah demi Langkah'));
    const STOP = ['itu', 'dan', 'di', 'yang', 'sangat', 'adalah', 'ke', 'dari', 'ini', 'untuk', 'dengan', 'pada', 'juga', 'saya', 'akan', 'sudah', 'atau', 'sih', 'kok'];
    el.append(box('coba', null, `Ketik kalimat apa saja di kotak bawah. Setiap tahap pembersihan langsung diperbarui.
      <br><span class="small">Daftar <b>stopword</b> (kata umum yang sering dianggap tidak penting) yang dipakai di sini:
      ${STOP.map((s) => '<code>' + s + '</code>').join(' ')}</span>`));
    const txt = h('input', { type: 'text', value: 'Kucing itu SANGAT lucu!!', 'aria-label': 'kalimat', style: 'width:100%;max-width:560px' });
    const presets = h('div', { class: 'controls', style: 'margin:6px 0' },
      h('span', { class: 'small muted' }, 'Contoh lain:'),
      ...['Kucing itu SANGAT lucu!!', 'Pelayanannya RAMAH sekali :)', 'Saya sudah makan di warung itu 2x, enak!'].map((s) =>
        h('button', { onclick: () => { txt.value = s; runPre(); } }, s)));
    const preOut = h('div');
    el.append(h('div', { class: 'ctl', style: 'max-width:560px' }, h('label', {}, 'Kalimat mentah'), txt), presets, preOut);
    function runPre() {
      const raw = txt.value;
      const low = raw.toLowerCase();
      const clean = low.replace(/[^a-z\s]/g, '');
      const tokens = clean.trim() ? clean.trim().split(/\s+/) : [];
      const kept = tokens.filter((t) => !STOP.includes(t));
      const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const tokWrap = (list, mark) => {
        const d = h('div', { style: 'margin-top:4px' });
        if (!list.length) d.append(h('span', { class: 'muted small' }, '(kosong)'));
        list.forEach((t) => d.append(mark && STOP.includes(t) ? chip(t + ' ✗', 'text-decoration:line-through;opacity:.5') : chip(t)));
        return d;
      };
      const st = steps([
        ['<b>Lowercase</b> — ubah semua huruf jadi huruf kecil, supaya "Kucing" dan "kucing" dianggap kata yang sama.', '"' + esc(low) + '"'],
        ['<b>Hapus selain huruf</b> — buang tanda baca, angka, emoji. Aturannya (regex) <code>[^a-z\\s]</code> artinya "semua yang <i>bukan</i> huruf a–z dan bukan spasi".', '"' + esc(clean) + '"'],
        ['<b>Tokenisasi</b> — pecah kalimat jadi potongan kata (token) berdasarkan spasi.', null],
        ['<b>Hapus stopword</b> — buang kata umum yang tidak membawa banyak makna.', null],
        ['<b>Hasil akhir</b> — token bersih, siap diubah jadi angka (misalnya dengan TF-IDF di bab selanjutnya).', null],
      ]);
      const lis = st.querySelectorAll('li');
      lis[2].append(tokWrap(tokens, false), h('div', { class: 'small muted' }, tokens.length + ' token'));
      lis[3].append(tokWrap(tokens, true), h('div', { class: 'small muted' }, (tokens.length - kept.length) + ' stopword dibuang'));
      lis[4].append(h('div', { style: 'margin-top:4px;font-family:var(--mono)' }, '[' + kept.map((t) => "'" + t + "'").join(', ') + ']'));
      preOut.innerHTML = '';
      preOut.append(box('langkah', 'Langkah Preprocessing (berubah otomatis)', st));
    }
    txt.addEventListener('input', runPre);
    runPre();
    el.append(box('info', 'Hati-hati memilih stopword', `Kata seperti <code>tidak</code> sengaja <b>tidak</b> dimasukkan ke daftar stopword di atas.
      Untuk analisis sentimen, "tidak enak" dan "enak" artinya berlawanan. Kalau "tidak" dibuang, maknanya rusak.
      Jadi daftar stopword harus disesuaikan dengan tugasnya.`));

    // ---------- feature scaling ----------
    el.append(h('h2', {}, 'Feature Scaling: Menyamakan Ukuran'));
    el.append(box('analogi', null, `Dua orang lomba lari. Yang satu mencatat jarak dalam <b>meter</b> (100), yang lain dalam <b>kilometer</b> (0.1).
      Larinya sama jauh, tapi angkanya beda 1000 kali lipat! Kalau langsung dibandingkan, angka 100 terlihat "jauh lebih besar".
      Scaling = memakai <b>penggaris yang sama</b> untuk semua fitur.`));
    el.append(h('p', {}, 'Contoh nyata dari Bab 1: buah punya fitur berat (gram) dan diameter (cm). Kita ukur "jarak" (perbedaan) antara apel dan jeruk:'));
    el.append(ML.table(['', 'berat (gram)', 'diameter (cm)'], [
      ['apel', '120', '7'],
      ['jeruk', '180', '9'],
      ['<b>selisih</b>', '<b>60</b>', '<b>2</b>'],
      ['selisih²', '3600', '4'],
    ]));
    el.append(h('p', { html: `Jarak = √(3600 + 4) = <b>60.03</b>. Sumbangan diameter hanya 4 dari 3604, yaitu sekitar <b>0.1%</b>.
      Model jadi hampir <b>tidak melihat diameter sama sekali</b>, hanya karena satuannya kecil — bukan karena diameter tidak penting.
      Model yang mengandalkan jarak/perkalian seperti <b>SVM</b>, KNN, dan Logistic Regression sangat terpengaruh masalah ini.` }));

    el.append(box('rumus', 'Rumus 1: Min-Max Scaling (semua jadi 0 sampai 1)', ML.formula(
      '<span class="var">x</span><sub>baru</sub> = ' + ML.frac('<span class="var">x</span> − min', 'max − min'),
      [['x', 'nilai asli satu data'], ['min', 'nilai paling kecil di kolom itu'], ['max', 'nilai paling besar di kolom itu'],
        ['x<sub>baru</sub>', 'hasilnya: data terkecil jadi 0, terbesar jadi 1']])));
    el.append(box('rumus', 'Rumus 2: Standardization / StandardScaler (rata-rata jadi 0)', ML.formula(
      '<span class="var">x</span><sub>baru</sub> = ' + ML.frac('<span class="var">x</span> − μ', 'σ') +
      ' &nbsp;&nbsp; σ = ' + ML.sqrt('rata-rata dari (<span class="var">x</span> − μ)²'),
      [['μ (mu)', 'rata-rata semua data'], ['σ (sigma)', 'standar deviasi = rata-rata "jarak" data dari rata-ratanya (seberapa menyebar). Bukan σ sigmoid di Bab 4, hanya kebetulan hurufnya sama.'],
        ['x<sub>baru</sub>', 'hasilnya: negatif = di bawah rata-rata, positif = di atas rata-rata'],
        ['catatan', 'σ di sini dibagi n (jumlah data), sama seperti <code>StandardScaler</code> di scikit-learn']])));

    // kalkulator
    el.append(h('h3', {}, 'Coba: Kalkulator Scaling'));
    el.append(box('coba', null, 'Ubah daftar angka (pisahkan dengan koma). Hitungan, tabel, dan garis bilangan di bawah ikut berubah. Arahkan mouse ke titik di garis bilangan untuk melihat nilainya.'));
    const numIn = h('input', { type: 'text', value: '2, 4, 6, 8', 'aria-label': 'daftar angka', style: 'width:260px' });
    const scPresets = [['2, 4, 6, 8', 'jam belajar'], ['120, 130, 170, 180', 'berat buah (gram)'], ['1, 2, 3, 100', 'ada pencilan']];
    el.append(h('div', { class: 'controls' },
      h('div', { class: 'ctl' }, h('label', {}, 'Daftar angka'), numIn),
      ...scPresets.map(([v, lbl]) => h('button', { onclick: () => { numIn.value = v; runScale(); } }, lbl + ': ' + v))));
    const scMsg = h('div');
    const scSteps = h('div', { class: 'grid2' });
    const scTable = h('div');
    el.append(scMsg, scSteps, scTable);

    let S = null; // hasil hitung terakhir
    const lp = ML.plot({ height: 290, x: [0, 1], y: [0, 3], pad: { l: 120, r: 30, t: 10, b: 6 },
      caption: 'Tiga "penggaris" untuk data yang sama. Garis putus-putus menghubungkan data yang sama. <b>Urutan dan jarak relatif tidak berubah</b> — hanya angka di penggarisnya yang berubah.' });
    const niceTicks = (a, b) => {
      const raw = (b - a) / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), r = raw / mag;
      const s = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag, out = [];
      for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) out.push(+v.toFixed(10));
      return out;
    };
    const LANES = [{ y: 2.45, name: 'Asli', sub: 'satuan asli', key: 'x' }, { y: 1.45, name: 'Min-Max', sub: '0 s/d 1', key: 'mm' }, { y: 0.45, name: 'Standar', sub: '0 = rata-rata', key: 'sd' }];
    const laneRange = (key) => {
      if (key === 'mm') return [-0.1, 1.1];
      if (key === 'sd') { const M = Math.max(1.5, ...S.sd.map(Math.abs)) * 1.12; return [-M, M]; }
      const lo = Math.min(...S.x), hi = Math.max(...S.x), padv = (hi - lo) * 0.08; return [lo - padv, hi + padv];
    };
    const laneX = (key, v) => { const [a, b] = laneRange(key); return (v - a) / (b - a); };
    lp.draw((p) => {
      p.clear();
      if (!S) return;
      // garis penghubung data yang sama
      S.x.forEach((_, i) => p.path(LANES.map((L) => [laneX(L.key, S[L.key][i]), L.y]), { color: 'text-3', width: 1, dash: [3, 4] }));
      LANES.forEach((L) => {
        const [a, b] = laneRange(L.key);
        p.line(0, L.y, 1, L.y, { color: 'axis', width: 1.5 });
        niceTicks(a, b).forEach((t) => {
          const X = laneX(L.key, t);
          p.line(X, L.y - 0.06, X, L.y + 0.06, { color: 'axis', width: 1 });
          p.text(X, L.y, fmt(t, 2), { color: 'text-2', size: 11.5, base: 'top', dy: 9 });
        });
        p.text(0, L.y, L.name, { align: 'right', dx: -14, dy: -8, bold: true, size: 13.5 });
        p.text(0, L.y, L.sub, { align: 'right', dx: -14, dy: 9, color: 'text-2', size: 11.5 });
        S[L.key].forEach((v, i) => {
          p.point(laneX(L.key, v), L.y, { color: 'c1', r: 6 });
          p.text(laneX(L.key, v), L.y, fmt(v, 2), { size: 12, base: 'bottom', dy: -9 });
        });
      });
    });
    lp.onHover((x, y) => {
      if (!S) return null;
      const pts = [], idx = [];
      LANES.forEach((L) => S[L.key].forEach((v, i) => { pts.push([laneX(L.key, v), L.y]); idx.push(i); }));
      const k = lp.nearest(pts, x, y, 16);
      if (k < 0) return null;
      const i = idx[k];
      return `<b>Data ke-${i + 1}</b><br>asli: ${fmt(S.x[i], 3)}<br>Min-Max: ${fmt(S.mm[i], 3)}<br>Standar: ${fmt(S.sd[i], 3)}`;
    });
    el.append(lp.el);

    function runScale() {
      const xs = numIn.value.split(/[,;\s]+/).map(parseFloat).filter((v) => isFinite(v)).slice(0, 10);
      scSteps.innerHTML = ''; scTable.innerHTML = ''; scMsg.innerHTML = '';
      const n = xs.length;
      const mn = Math.min(...xs), mx = Math.max(...xs);
      if (n < 2 || mx === mn) {
        S = null; lp.redraw();
        scMsg.append(box('info', 'Butuh minimal 2 angka yang berbeda', 'Kalau semua angkanya sama, max − min = 0 dan standar deviasi = 0, jadi tidak bisa dibagi. Coba tulis misalnya <code>2, 4, 6, 8</code>.'));
        return;
      }
      if (numIn.value.split(/[,;\s]+/).filter((s) => s !== '').length > 10) scMsg.append(h('p', { class: 'small muted' }, 'Hanya 10 angka pertama yang dipakai.'));
      const range = mx - mn;
      const mm = xs.map((v) => (v - mn) / range);
      const mean = xs.reduce((a, b) => a + b, 0) / n;
      const sq = xs.map((v) => (v - mean) * (v - mean));
      const vr = sq.reduce((a, b) => a + b, 0) / n;
      const sd = Math.sqrt(vr);
      const zs = xs.map((v) => (v - mean) / sd);
      S = { x: xs, mm, sd: zs };
      const f = (v) => fmt(v, 3), fp = (v) => ML.fmtp(v, 3);
      scSteps.append(
        box('langkah', 'Min-Max', steps([
          ['Cari nilai terkecil dan terbesar', `min = ${f(mn)}, max = ${f(mx)}\nmax − min = ${f(mx)} − ${fp(mn)} = ${f(range)}`],
          ['Hitung tiap data: (x − min) ÷ (max − min)', xs.map((v, i) => `(${f(v)} − ${fp(mn)}) ÷ ${f(range)} = <b>${fmt(mm[i], 2)}</b>`).join('\n')],
        ])),
        box('langkah', 'Standardization', steps([
          ['Rata-rata (μ)', `(${xs.map(f).join(' + ')}) ÷ ${n} = ${f(mean)}`],
          ['Selisih tiap data dari rata-rata, dikuadratkan', xs.map((v, i) => `(${f(v)} − ${fp(mean)})² = ${f(sq[i])}`).join('\n')],
          ['Standar deviasi (σ) = akar dari rata-rata kuadrat tadi', `(${sq.map(f).join(' + ')}) ÷ ${n} = ${f(vr)}\nσ = √${f(vr)} = ${f(sd)}`],
          ['Hitung tiap data: (x − μ) ÷ σ', xs.map((v, i) => `(${f(v)} − ${fp(mean)}) ÷ ${f(sd)} = <b>${fmt(zs[i], 2)}</b>`).join('\n')],
        ])));
      scTable.append(ML.table(['Data ke-', 'Asli (x)', 'Min-Max', 'Standar'], xs.map((v, i) => [i + 1, f(v), fmt(mm[i], 2), fmt(zs[i], 2)])));
      lp.redraw();
    }
    numIn.addEventListener('input', runScale);
    runScale();
    el.append(box('info', 'Pilih yang mana?', `
      <ul style="margin:4px 0;padding-left:20px">
        <li><b>Min-Max</b>: hasilnya rapi di 0–1. Tapi coba contoh "ada pencilan" (1, 2, 3, 100): data 1, 2, 3 jadi berdempetan di dekat 0 karena satu angka 100 yang ekstrem.</li>
        <li><b>StandardScaler</b>: paling sering dipakai untuk SVM dan Logistic Regression. Rata-rata jadi 0, sebaran jadi 1.</li>
        <li>Penting: scaler dilatih (<code>fit</code>) pada data latih saja. Data baru cukup diubah (<code>transform</code>) dengan scaler yang <b>sama</b>, supaya min, max, μ, dan σ-nya sama.</li>
      </ul>`));

    // ---------- BISINDO ----------
    el.append(box('bisindo', null, `Feature engineering di proyek BISINDO:
      <ol style="margin:6px 0;padding-left:22px">
        <li><b>Data mentah</b>: video isyarat tangan → diambil per frame (gambar berisi jutaan piksel).</li>
        <li><b>Feature extraction</b>: MediaPipe Hands mendeteksi <b>21 titik</b> (landmark) di tangan. Tiap titik punya posisi (x, y, z).
          Jadi 21 × 3 = <b>63 fitur</b> angka, misalnya <code>[0.41, 0.62, −0.03, …]</code>. Dari jutaan piksel jadi 63 angka saja!</li>
        <li><b>Feature scaling</b>: 63 angka itu dirapikan dengan <b>StandardScaler</b>, supaya SVM menilai semua titik jari secara adil.</li>
        <li><b>Label</b>: huruf yang diperagakan ("A", "B", …).</li>
      </ol>`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Pada data prediksi harga rumah, "harga rumah" adalah…', options: ['Fitur', 'Label', 'Bias'], answer: 1, explain: 'Harga rumah adalah jawaban yang ingin ditebak, jadi label (y). Luas tanah, jumlah kamar, dan jarak adalah fitur (X).' },
      { q: 'MediaPipe mengubah gambar tangan menjadi 63 angka posisi jari. Ini termasuk…', options: ['Feature Selection', 'Feature Extraction', 'Feature Scaling'], answer: 1, explain: 'Data mentah (gambar) diubah menjadi fitur angka yang baru. Itu extraction = membuat fitur.' },
      { q: 'Kalimat "Halo, APA kabar?" setelah lowercase dan hapus selain huruf menjadi…', options: ['"halo apa kabar"', '"Halo APA kabar"', '"halo, apa kabar?"'], answer: 0, explain: 'Lowercase: "halo, apa kabar?". Lalu koma dan tanda tanya dibuang: "halo apa kabar".' },
      { q: 'Data [2, 4, 6, 8] di-Min-Max. Angka 8 menjadi…', options: ['0', '0.5', '1', '1.34'], answer: 2, explain: '(8 − 2) ÷ (8 − 2) = 1. Nilai terbesar selalu jadi 1. (1.34 adalah hasil StandardScaler.)' },
    ]));
  },
});
