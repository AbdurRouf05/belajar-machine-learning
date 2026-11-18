/* Bab 1 — Apa itu Machine Learning? (juga CONTOH GAYA untuk bab lain) */
ML.chapter({
  id: 'apa-itu-ml',
  num: 1,
  group: 'Dasar',
  title: 'Apa itu Machine Learning?',
  lead: 'Mesin belajar dari <b>contoh</b>, bukan dari aturan yang ditulis manual. Mulai dari sini kalau kamu benar-benar baru.',
  render(el) {
    const { h, box, steps } = ML;

    el.append(box('analogi', null, `
      Bayangkan kamu mengajari adik kecil membedakan <b>apel</b> dan <b>jeruk</b>.
      Kamu tidak memberi rumus. Kamu cukup menunjukkan banyak buah sambil berkata
      "ini apel", "ini jeruk". Lama-lama adikmu bisa menebak sendiri buah yang belum pernah dia lihat.
      <br><br>Machine Learning bekerja <b>persis seperti itu</b>: beri komputer banyak <b>contoh + jawabannya</b>,
      lalu komputer mencari polanya sendiri.`));

    el.append(h('h2', {}, 'Program Biasa vs Machine Learning'));
    el.append(ML.html(`
      <div class="grid2">
        <div class="stat"><div class="k">PROGRAM BIASA</div>
          <div style="font-size:15px;margin-top:4px">Manusia menulis <b>aturan</b><br>
          <code>if berat &gt; 150: "jeruk"</code><br>Data + Aturan → <b>Jawaban</b></div></div>
        <div class="stat"><div class="k">MACHINE LEARNING</div>
          <div style="font-size:15px;margin-top:4px">Mesin mencari <b>aturan sendiri</b><br>
          dari contoh-contoh berlabel<br>Data + Jawaban → <b>Aturan (model)</b></div></div>
      </div>`));

    // ---------- demo interaktif ----------
    el.append(h('h2', {}, 'Coba: Ajari Mesin Membedakan Buah'));
    const data = [
      [120, 7.0, 0], [130, 7.5, 0], [110, 6.8, 0], [140, 7.2, 0], [125, 6.5, 0],
      [170, 8.6, 1], [180, 9.0, 1], [160, 8.2, 1], [190, 9.4, 1], [175, 8.0, 1],
    ];
    const NAMA = ['apel', 'jeruk'], COL = ['c2', 'c1'], SHAPE = ['square', 'circle'];
    let tebak = null;
    const info = h('div', { class: 'small muted' }, 'Klik di mana saja pada grafik untuk menaruh buah baru.');
    el.append(box('coba', null, `Tiap titik adalah satu buah yang <b>sudah diberi label</b> (data latih).
      <b>Klik di grafik</b> untuk menaruh buah baru. Mesin akan menebak dengan cara paling sederhana:
      "buah baru ini paling mirip (paling dekat) dengan buah mana?"`));
    const p = ML.plot({
      width: 640, height: 340, x: [100, 200], y: [6, 10],
      xLabel: 'berat (gram)', yLabel: 'diameter (cm)',
      legend: [{ label: 'apel (label 0)', color: 'c2', shape: 'square' }, { label: 'jeruk (label 1)', color: 'c1', shape: 'circle' }, { label: 'buah baru yang ditebak', color: 'text', shape: 'circle' }],
      caption: 'Sumbu x dan y = <b>fitur</b> (ciri). Warna/bentuk = <b>label</b> (jawaban).',
    });
    const dist = (a, b) => Math.hypot((a[0] - b[0]) / 10, a[1] - b[1]); // berat dibagi 10 agar skalanya setara
    p.draw((p) => {
      p.clear(); p.grid(); p.axes();
      if (tebak) {
        const nb = data[tebak.nn];
        p.line(tebak.x, tebak.y, nb[0], nb[1], { color: 'text-2', width: 1.5, dash: [4, 4] });
      }
      data.forEach(([x, y, c]) => p.point(x, y, { color: COL[c], shape: SHAPE[c] }));
      if (tebak) p.point(tebak.x, tebak.y, { color: COL[tebak.c], shape: SHAPE[tebak.c], r: 8, ring: true, label: 'tebakan: ' + NAMA[tebak.c], bold: true });
    });
    p.onClick((x, y) => {
      let nn = 0, best = Infinity;
      data.forEach((d, i) => { const dd = dist([x, y], d); if (dd < best) { best = dd; nn = i; } });
      tebak = { x, y, nn, c: data[nn][2] };
      info.innerHTML = `Buah baru: berat <b>${ML.fmt(x, 0)} g</b>, diameter <b>${ML.fmt(y, 1)} cm</b> → paling dekat dengan
        ${NAMA[data[nn][2]]} (${data[nn][0]} g, ${data[nn][1]} cm) → mesin menebak <b>${NAMA[tebak.c].toUpperCase()}</b>.`;
      p.redraw();
    });
    p.onHover((x, y) => { const i = p.nearest(data, x, y); return i < 0 ? null : `<b>${NAMA[data[i][2]]}</b><br>berat ${data[i][0]} g<br>diameter ${data[i][1]} cm`; });
    el.append(p.el, info);

    el.append(box('info', 'Istilah yang barusan kamu pakai', `
      <ul style="margin:4px 0;padding-left:20px">
        <li><b>Data latih</b> = contoh-contoh yang sudah ada jawabannya (10 buah di atas).</li>
        <li><b>Fitur</b> = ciri yang diukur (berat, diameter). Mesin hanya mengerti <b>angka</b>.</li>
        <li><b>Label</b> = jawaban yang benar (apel / jeruk).</li>
        <li><b>Model</b> = "otak" hasil belajar yang bisa menebak data baru.</li>
        <li><b>Prediksi</b> = tebakan model untuk data baru.</li>
      </ul>`));

    // ---------- peta besar ----------
    el.append(h('h2', {}, 'Peta Besar: Alur Belajar Mesin'));
    el.append(h('p', {}, 'Semua bab di web ini adalah potongan dari alur di bawah. Arahkan mouse atau klik tiap kotak.'));
    const nodes = [
      { t: '1. Data', s: 'contoh + label', d: 'Kumpulan contoh. Misalnya foto/video isyarat tangan beserta hurufnya.', bab: 'apa-itu-ml' },
      { t: '2. Feature Engineering', s: 'ubah jadi angka', d: 'Membersihkan data dan mengubahnya menjadi angka (fitur), lalu menyamakan skalanya.', bab: 'fitur' },
      { t: '3. Model', s: 'z = w·x + b → σ', d: 'Mengalikan fitur dengan <b>bobot</b>, menambah <b>bias</b>, lalu memakai fungsi aktivasi (misalnya sigmoid) untuk menghasilkan tebakan.', bab: 'sigmoid' },
      { t: '4. Loss', s: 'seberapa salah?', d: 'Mengukur seberapa jauh tebakan dari jawaban asli. Makin kecil makin bagus.', bab: 'loss' },
      { t: '5. Gradient Descent', s: 'perbaiki bobot', d: 'Menggeser bobot sedikit demi sedikit ke arah yang membuat loss turun.', bab: 'gradient-descent' },
      { t: '6. Ulangi', s: 'epoch', d: 'Langkah 3–5 diulang berkali-kali (epoch) sampai tebakan bagus.', bab: 'overfitting' },
    ];
    const fl = ML.flow(nodes.map((n) => ({ t: n.t, s: n.s })), 0);
    const flInfo = h('div', { class: 'box info', html: '' });
    const setNode = (i) => { fl.set(i); flInfo.innerHTML = `<b>${nodes[i].t}</b><br>${nodes[i].d}<br><a href="#${nodes[i].bab}">→ pelajari di bab terkait</a>`; };
    fl.nodes.forEach((d, i) => { d.style.cursor = 'pointer'; d.addEventListener('mouseenter', () => setNode(i)); d.addEventListener('click', () => setNode(i)); });
    setNode(0);
    el.append(fl.el, flInfo);

    // ---------- jenis ML ----------
    el.append(h('h2', {}, 'Tiga Jenis Tugas yang Akan Sering Kamu Temui'));
    el.append(ML.table(['Jenis', 'Pertanyaannya', 'Contoh', 'Algoritma di web ini'], [
      ['<b>Klasifikasi</b>', 'Masuk kelompok mana?', 'Huruf isyarat "A" atau "B"? Spam atau bukan?', 'Logistic Regression, SVM, Naive Bayes'],
      ['<b>Regresi</b>', 'Berapa angkanya?', 'Harga buku, nilai ujian', 'Contoh harga buku (Bab Gradient Descent)'],
      ['<b>Representasi teks</b>', 'Bagaimana mengubah kata jadi angka?', 'Mencari dokumen mirip', 'TF-IDF, Word2Vec'],
    ]));

    el.append(box('bisindo', null, `Proyek BISINDO adalah <b>klasifikasi</b>: inputnya video isyarat tangan, outputnya huruf.
      Alurnya sama dengan peta besar di atas:<br>
      video → MediaPipe (21 titik × x,y,z = <b>63 fitur</b>) → StandardScaler → <b>SVM</b> → huruf "A".`));

    el.append(h('h2', {}, 'Cara Belajar di Web Ini'));
    el.append(ML.html(`<p>Setiap bab disusun dengan urutan yang sama:</p>
      <ol style="padding-left:22px;margin:4px 0">
        <li><b>Analogi</b>: penjelasan pakai kejadian sehari-hari.</li>
        <li><b>Rumus</b>: rumusnya, plus arti setiap simbol.</li>
        <li><b>Langkah hitung</b>: hitungan langkah demi langkah dengan angka kecil.</li>
        <li><b>Coba sendiri</b>: geser slider atau klik grafik, angkanya ikut berubah.</li>
        <li><b>Kuis</b>: beberapa soal untuk mengecek pemahaman.</li>
      </ol>`));

    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Apa bedanya ML dengan program biasa?', options: ['ML ditulis dengan bahasa Python', 'Di ML, mesin mencari aturannya sendiri dari contoh berlabel', 'ML tidak butuh data'], answer: 1, explain: 'Program biasa: manusia menulis aturan. ML: mesin belajar aturan dari data + jawaban.' },
      { q: 'Pada demo buah, "berat" dan "diameter" disebut…', options: ['Label', 'Fitur', 'Model'], answer: 1, explain: 'Fitur = ciri yang diukur dalam bentuk angka. Labelnya adalah apel/jeruk.' },
      { q: 'Menebak huruf isyarat BISINDO termasuk tugas…', options: ['Regresi', 'Klasifikasi', 'Bukan ML'], answer: 1, explain: 'Outputnya kelompok (huruf A, B, C, …), jadi termasuk klasifikasi.' },
    ]));
  },
});
