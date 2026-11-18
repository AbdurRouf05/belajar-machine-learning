/* Bab 14 — Rangkuman: contekan rumus, pilih algoritma, pipeline BISINDO, kuis campuran */
ML.chapter({
  id: 'rangkuman',
  num: 14,
  group: 'Penutup',
  title: 'Rangkuman & Contekan Rumus',
  lead: 'Semua rumus penting di satu halaman, panduan memilih algoritma, dan kuis campuran untuk menguji diri.',
  render(el) {
    const { h, box, frac, sqrt } = ML;

    el.append(box('analogi', 'Satu kalimat untuk tiap bab', `
      <ul style="margin:4px 0;padding-left:20px">
        <li><b>ML</b>: mesin mencari aturan sendiri dari contoh berlabel.</li>
        <li><b>Feature engineering</b>: ubah data mentah jadi angka yang rapi.</li>
        <li><b>Dot product</b>: kalikan per posisi lalu jumlahkan, untuk mengukur "searah atau tidak".</li>
        <li><b>Bobot & bias</b>: tombol putar yang dicari mesin. <b>Sigmoid</b>: pemeras angka ke 0–1.</li>
        <li><b>Loss</b>: nilai rapor kesalahan. <b>Gradient descent</b>: turun gunung pelan-pelan.</li>
        <li><b>Overfitting</b>: menghafal soal latihan, gagal di ujian.</li>
        <li><b>Logistic Regression</b>: garis lurus + sigmoid, hasilnya peluang.</li>
        <li><b>SVM</b>: garis dengan jalan paling lebar, bisa melengkung lewat kernel.</li>
        <li><b>Naive Bayes</b>: menghitung peluang dari frekuensi kata.</li>
        <li><b>TF-IDF</b>: kata yang sering di sini tapi langka di tempat lain itu penting.</li>
        <li><b>Word2Vec</b>: kata yang tetangganya mirip, vektornya juga mirip.</li>
      </ul>`));

    // ---------- contekan rumus ----------
    el.append(h('h2', {}, 'Contekan Rumus'));
    el.append(h('p', { class: 'muted' }, 'Klik nama bab untuk kembali ke penjelasan lengkap dan latihan hitungnya.'));
    const v = (s) => `<span class="var">${s}</span>`;
    const rows = [
      ['Neuron (bagian linear)', 'sigmoid', `${v('z')} = ${v('w')}₁${v('x')}₁ + ${v('w')}₂${v('x')}₂ + … + ${v('b')}`, 'x=5, 0.8 · w=0.6, 2 · b=−4 → z = 0.6'],
      ['Sigmoid', 'sigmoid', `σ(${v('z')}) = ${frac('1', '1 + e<sup>−z</sup>')}`, 'σ(0.6) = 0.646'],
      ['Dot product', 'dot-product', `${v('a')}·${v('b')} = ${v('a')}₁${v('b')}₁ + ${v('a')}₂${v('b')}₂ + …`, '[1,2,3]·[4,5,6] = 32'],
      ['Cosine similarity', 'dot-product', `cos = ${frac(`${v('a')}·${v('b')}`, `‖${v('a')}‖ ‖${v('b')}‖`)}`, '32 ÷ (3.742 × 8.775) = 0.97'],
      ['Min-Max scaling', 'fitur', `${v('x')}' = ${frac(`${v('x')} − min`, 'max − min')}`, '[2,4,6,8] → 0, 0.33, 0.67, 1'],
      ['Standard scaling', 'fitur', `${v('x')}' = ${frac(`${v('x')} − μ`, 'σ')}`, '(2 − 5) ÷ 2.236 = −1.34'],
      ['MSE', 'loss', `MSE = ${frac('1', 'N')} Σ (${v('y')} − ${v('ŷ')})²`, 'rata-rata kuadrat selisih'],
      ['Cross-entropy (y=1)', 'loss', `loss = −ln(${v('ŷ')})`, '−ln(0.95) = 0.05 · −ln(0.2) = 1.61'],
      ['Update gradient descent', 'gradient-descent', `${v('w')}<sub>baru</sub> = ${v('w')} − η × gradient`, 'w: 1 → 1.8 → 2.28 → …'],
      ['Softmax', 'aktivasi', `P<sub>i</sub> = ${frac(`e<sup>z<sub>i</sub></sup>`, `Σ e<sup>z<sub>j</sub></sup>`)}`, '[2, 1, 0.1] → 0.66, 0.24, 0.10'],
      ['ReLU', 'aktivasi', `ReLU(${v('z')}) = max(0, ${v('z')})`, 'ReLU(−3) = 0 · ReLU(2) = 2'],
      ['Gradient logistic regression', 'logreg', `grad ${v('w')} = (${v('ŷ')} − ${v('y')}) × ${v('x')}`, '(0.646 − 1) × 5 = −1.77'],
      ['Margin SVM', 'svm', `margin = ${frac('2', `‖${v('w')}‖`)}`, 'w=[1,1] → 2 ÷ 1.414 = 1.414'],
      ['Kernel RBF', 'svm', `K = e<sup>−γ · jarak²</sup>`, 'γ=0.5, jarak²=2 → 0.37'],
      ['Naive Bayes', 'naive-bayes', `P(kelas | kata) ∝ P(kelas) × Π P(kata | kelas)`, 'prior × likelihood'],
      ['Laplace smoothing', 'naive-bayes', `P(kata | kelas) = ${frac('jumlah + 1', 'total kata kelas + |V|')}`, 'kata baru tidak membuat peluang = 0'],
      ['IDF (scikit-learn)', 'tfidf', `IDF = ln ${frac('1 + n', '1 + df')} + 1`, 'n=3, df=1 → 1.693'],
      ['Analogi Word2Vec', 'word2vec', `raja − pria + wanita ≈ ratu`, '[0.9,0.9] − [0.9,0.1] + [0.1,0.1] = [0.1,0.9]'],
    ];
    const t = h('table', { class: 'tbl', style: 'width:100%' });
    t.append(h('tr', {}, h('th', { class: 'l' }, 'Konsep'), h('th', {}, 'Rumus'), h('th', { class: 'l' }, 'Contoh angka')));
    for (const [nama, bab, rumus, contoh] of rows) {
      t.append(h('tr', {},
        h('td', { class: 'l' }, h('a', { href: '#' + bab }, nama)),
        h('td', { html: `<span style="font-family:'Cambria Math','Times New Roman',serif;font-size:17px;white-space:nowrap">${rumus}</span>` }),
        h('td', { class: 'l small' }, contoh)));
    }
    el.append(h('div', { class: 'tbl-scroll' }, t));

    // ---------- pilih algoritma ----------
    el.append(h('h2', {}, 'Pilih Algoritma yang Cocok'));
    el.append(box('coba', null, 'Jawab 3 pertanyaan tentang datamu. Web ini akan menyarankan algoritma untuk dicoba pertama kali.'));
    const q = {
      jenis: ['teks (kalimat/dokumen)', 'angka (misalnya koordinat landmark)'],
      pola: ['kira-kira bisa dipisah garis lurus', 'rumit / melengkung', 'belum tahu'],
      butuh: ['peluang (persen yakin)', 'cukup kelasnya saja'],
    };
    const label = { jenis: 'Datamu berupa…', pola: 'Pola datanya…', butuh: 'Hasil yang kamu butuhkan…' };
    const state = { jenis: 1, pola: 2, butuh: 1 };
    const out = h('div', { class: 'box info' });
    const ctrls = h('div', { class: 'controls' });
    for (const k in q) {
      const sel = h('select', { onchange: () => { state[k] = +sel.value; rec(); } }, ...q[k].map((o, i) => h('option', { value: i, selected: i === state[k] }, o)));
      ctrls.append(h('div', { class: 'ctl' }, h('label', {}, label[k]), sel));
    }
    function rec() {
      let r;
      if (state.jenis === 0) {
        r = state.butuh === 0
          ? ['Naive Bayes', 'naive-bayes', 'Cepat, cocok untuk teks, dan langsung memberi peluang. Ubah teks jadi angka dulu (hitung kata atau TF-IDF).']
          : ['TF-IDF + SVM (linear)', 'svm', 'Ubah teks dengan TF-IDF, lalu SVM linear. Kombinasi ini sangat kuat untuk klasifikasi teks.'];
      } else if (state.pola === 0) {
        r = state.butuh === 0
          ? ['Logistic Regression', 'logreg', 'Pola lurus dan butuh peluang, jadi pakai Logistic Regression. Sederhana dan mudah dijelaskan.']
          : ['SVM linear', 'svm', 'Pola lurus, jadi SVM dengan kernel linear sudah cukup.'];
      } else {
        r = ['SVM kernel RBF (bandingkan dengan Logistic Regression)', 'svm',
          'Pola rumit atau belum tahu: coba SVM RBF dan tuning C dan gamma. Jadikan Logistic Regression sebagai pembanding (baseline).' +
          (state.butuh === 0 ? ' Untuk peluang, pakai <code>SVC(probability=True)</code>.' : '')];
      }
      out.innerHTML = `<b>Saran: ${r[0]}</b><br>${r[2]}<br><a href="#${r[1]}">→ buka bab terkait</a>
        <br><span class="small muted">Apa pun algoritmanya, selalu lakukan <a href="#fitur">feature scaling</a> dan uji di data test agar tidak <a href="#overfitting">overfitting</a>.</span>`;
    }
    rec();
    el.append(ctrls, out);

    // ---------- pipeline BISINDO ----------
    el.append(h('h2', {}, 'Semua Bab Bertemu di Proyek BISINDO'));
    const steps = [
      { t: 'Video isyarat', s: 'data mentah', d: 'Kumpulkan video tiap huruf beserta labelnya (A, B, C, …). Ini <b>data + label</b>.', bab: 'apa-itu-ml' },
      { t: 'MediaPipe Hands', s: 'feature extraction', d: 'Tiap frame diubah jadi 21 titik tangan × (x, y, z) = <b>63 angka</b>. Video jadi angka.', bab: 'fitur' },
      { t: 'StandardScaler', s: 'feature scaling', d: 'Samakan skala tiap fitur dengan (x − rata-rata) ÷ std. SVM <b>wajib</b> scaling.', bab: 'fitur' },
      { t: 'SVC (RBF)', s: 'model', d: 'Cari batas antar huruf. Kernel RBF bisa membuat batas melengkung. Tuning C dan gamma.', bab: 'svm' },
      { t: 'Evaluasi', s: 'akurasi data test', d: 'Uji dengan data yang belum pernah dilihat. Akurasi latih tinggi tapi test rendah berarti overfitting.', bab: 'overfitting' },
      { t: 'Huruf "A"', s: 'prediksi', d: 'Model menebak huruf. Bandingkan juga dengan Logistic Regression sebagai baseline.', bab: 'logreg' },
    ];
    const fl = ML.flow(steps.map((s) => ({ t: s.t, s: s.s })));
    const flInfo = h('div', { class: 'box bisindo' });
    const setNode = (i) => { fl.set(i); flInfo.innerHTML = `<div class="box-title">${steps[i].t}</div>${steps[i].d}<br><a href="#${steps[i].bab}">→ bab terkait</a>`; };
    fl.nodes.forEach((d, i) => { d.style.cursor = 'pointer'; d.addEventListener('mouseenter', () => setNode(i)); d.addEventListener('click', () => setNode(i)); });
    setNode(0);
    el.append(fl.el, flInfo);
    el.append(h('pre', { class: 'code' }, `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression

# X = array (jumlah_sampel, 63)  ← hasil MediaPipe
# y = huruf, misalnya ['A', 'B', ...]
svm      = make_pipeline(StandardScaler(), SVC(kernel='rbf', C=1.0, gamma='scale'))
baseline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

for nama, model in [('SVM', svm), ('LogReg', baseline)]:
    model.fit(X_train, y_train)
    print(nama, model.score(X_test, y_test))   # akurasi di data test`));

    // ---------- kuis campuran ----------
    el.append(h('h2', {}, 'Kuis Campuran (Ujian Akhir Mini)'));
    el.append(ML.quiz([
      { q: 'Urutan yang benar dalam satu putaran training adalah…', options: ['Loss → prediksi → update bobot', 'Prediksi (forward pass) → loss → gradient → update bobot', 'Update bobot → loss → prediksi'], answer: 1, explain: 'Model menebak dulu, lalu kesalahannya diukur (loss), lalu bobot diperbaiki dengan gradient descent.' },
      { q: 'z = 0.6. Berapa kira-kira σ(z)?', options: ['0.35', '0.65', '1.6'], answer: 1, explain: 'σ(0.6) = 1 ÷ (1 + e^(−0.6)) ≈ 0.646. Nilai z positif selalu menghasilkan σ di atas 0.5.' },
      { q: 'Learning rate terlalu besar akan membuat…', options: ['Training sangat lambat tapi pasti sampai', 'Bobot meloncat-loncat melewati titik terendah (bisa makin kacau)', 'Model otomatis overfitting'], answer: 1, explain: 'Langkahnya terlalu jauh, jadi melompati dasar lembah.' },
      { q: 'Akurasi data latih 100%, akurasi data test 55%. Ini tanda…', options: ['Underfitting', 'Overfitting', 'Model sempurna'], answer: 1, explain: 'Model menghafal data latih dan gagal pada data baru.' },
      { q: 'SVM dengan w = [3, 4]. Berapa lebar margin-nya?', options: ['2 ÷ 7 ≈ 0.29', '2 ÷ 5 = 0.4', '2 × 5 = 10'], answer: 1, explain: '‖w‖ = √(3² + 4²) = 5, jadi margin = 2 ÷ 5 = 0.4.' },
      { q: 'Kata yang muncul di SEMUA dokumen akan punya IDF…', options: ['Paling besar', 'Paling kecil', 'Nol selalu'], answer: 1, explain: 'df = n, sehingga ln((1+n)/(1+n)) + 1 = 1, nilai terkecil. Kata umum kurang membedakan dokumen.' },
      { q: 'Kenapa fitur MediaPipe perlu StandardScaler sebelum masuk SVM?', options: ['Supaya videonya lebih jernih', 'SVM menghitung jarak, jadi fitur berskala besar akan mendominasi', 'Agar jumlah fitur jadi 21'], answer: 1, explain: 'SVM (dan kernel RBF) memakai jarak/dot product, jadi skala fitur harus setara.' },
    ]));
  },
});
