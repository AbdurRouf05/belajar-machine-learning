/* Bab 12 — TF-IDF & pencarian dokumen dengan cosine similarity */
ML.chapter({
  id: 'tfidf',
  num: 12,
  group: 'Teks & Kata',
  title: 'TF-IDF & Pencarian Dokumen',
  lead: 'Mengubah teks menjadi angka: kata yang <b>sering di dokumen ini</b> tapi <b>jarang di dokumen lain</b> mendapat bobot besar.',
  render(el) {
    const { h, box, steps } = ML;
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const f2 = (x) => x.toFixed(2), f3 = (x) => x.toFixed(3);
    const r3 = (x) => Math.round(x * 1000) / 1000;
    const STOP = new Set(['dan', 'di', 'yang', 'untuk', 'dari', 'itu', 'ini', 'sangat', 'ke', 'adalah', 'dengan', 'juga', 'akan', 'pada', 'sedang', 'atau', 'saya', 'kamu', 'sudah', 'telah']);

    // ---------- analogi ----------
    el.append(box('analogi', null, `
      Bayangkan kamu mencari buku tentang <b>kucing</b> di perpustakaan. Kata <b>"yang"</b> ada di <i>semua</i> buku,
      jadi tidak membantu sama sekali. Kata <b>"kucing"</b> hanya ada di sedikit buku, jadi kata itu adalah <b>ciri khas</b>.<br><br>
      TF-IDF memberi nilai pada tiap kata dengan logika yang sama:
      <b>sering di dokumen ini</b> (TF besar) <b>dan jarang di dokumen lain</b> (IDF besar) → kata itu penting.`));

    // ---------- peta library ----------
    el.append(h('h2', {}, 'Peta: Library Mana Dipakai di Tahap Mana?'));
    el.append(h('p', {}, 'Di praktikum Python, teks melewati 5 tahap. Arahkan mouse atau klik tiap kotak.'));
    const libs = [
      { t: 're', s: 'bersihkan teks', d: 'Modul bawaan Python. <code>re.sub(r\'[^a-z\\s]\', \'\', teks)</code> menghapus tanda baca dan angka, hanya menyisakan huruf kecil dan spasi.', ex: '"Kucing itu SANGAT lucu!!" → "kucing itu sangat lucu"' },
      { t: 'Sastrawi', s: 'hapus stopword', d: '<b>PySastrawi</b>: library khusus bahasa Indonesia. Menghapus <b>stopword</b> = kata umum seperti "dan", "di", "yang", "itu" yang tidak membedakan dokumen.', ex: '"kucing itu sangat lucu" → "kucing lucu"' },
      { t: 'TfidfVectorizer', s: 'teks → angka', d: 'Dari <b>scikit-learn</b>. Memecah kata, membuat kosakata, menghitung TF, IDF, lalu menormalkan panjang vektor jadi 1.', ex: '"kucing lucu" → [0, 0.71, 0.71, 0]' },
      { t: 'cosine_similarity', s: 'bandingkan', d: 'Dari <b>scikit-learn</b>. Mengukur seberapa mirip vektor query dengan vektor tiap dokumen (0 = tidak mirip, 1 = identik).', ex: 'query vs 3 dokumen → [1.00, 0.43, 0.43]' },
      { t: 'pandas + numpy', s: 'tampilkan tabel', d: '<b>pandas</b> menyusun hasil jadi tabel dan mengurutkan ranking. <b>numpy</b> mengurus operasi array di belakang layar (misalnya <code>.flatten()</code>).', ex: 'Ranking: Dok 1 (1.00) > Dok 2 (0.43) = Dok 3 (0.43)' },
    ];
    const fl = ML.flow(libs.map((n) => ({ t: n.t, s: n.s })), 0);
    const flInfo = h('div', { class: 'box info' });
    const setLib = (i) => { fl.set(i); flInfo.innerHTML = `<b>${libs[i].t}</b><br>${libs[i].d}<br><span class="small">Contoh: <code>${esc(libs[i].ex)}</code></span>`; };
    fl.nodes.forEach((d, i) => { d.style.cursor = 'pointer'; d.addEventListener('mouseenter', () => setLib(i)); d.addEventListener('click', () => setLib(i)); });
    setLib(0);
    el.append(fl.el, flInfo);
    el.append(ML.html(`<div class="small muted">Tahap: <b>preprocessing</b> (re, Sastrawi) → <b>feature extraction</b> (TfidfVectorizer) → <b>pencarian</b> (cosine_similarity) → <b>penyajian</b> (pandas).</div>`));

    // ---------- konsep ----------
    el.append(h('h2', {}, 'TF, IDF, dan TF-IDF'));
    el.append(ML.html(`<div class="grid3">
      <div class="stat"><div class="k">TF — Term Frequency</div><div style="font-size:15px;margin-top:4px">Seberapa <b>sering</b> kata muncul di dokumen <b>ini</b>.</div><div class="d">"term" = kata, "frequency" = frekuensi</div></div>
      <div class="stat"><div class="k">IDF — Inverse Document Frequency</div><div style="font-size:15px;margin-top:4px">Seberapa <b>langka</b> kata di <b>semua</b> dokumen.</div><div class="d">makin jarang muncul → makin besar</div></div>
      <div class="stat"><div class="k">TF-IDF</div><div style="font-size:15px;margin-top:4px">TF × IDF, lalu panjang vektornya dijadikan 1.</div><div class="d">besar = kata ciri khas dokumen itu</div></div>
    </div>`));
    el.append(box('rumus', 'Rumus (versi scikit-learn)', (() => {
      const d = h('div');
      d.append(ML.formula(`IDF(<span class="var">kata</span>) = ln ${ML.frac('1 + <span class="var">n</span>', '1 + <span class="var">df</span>')} + 1`));
      d.append(ML.formula(`TF-IDF = TF × IDF &nbsp;&nbsp;→&nbsp;&nbsp; lalu dibagi ${ML.sqrt('jumlah semua (TF×IDF)²')}`, [
        ['n', 'jumlah dokumen'],
        ['df', '<b>document frequency</b>: di berapa dokumen kata itu muncul'],
        ['ln', 'logaritma natural (tombol "ln" di kalkulator). ln(1) = 0, makin besar isinya makin besar hasilnya'],
        ['TF', 'berapa kali kata muncul di dokumen itu'],
        ['√ …', '<b>panjang vektor</b> (L2). Membagi dengan panjang = <b>normalisasi L2</b>, supaya dokumen panjang tidak otomatis menang'],
      ]));
      return d;
    })()));
    el.append(box('info', 'Rumus di buku teks berbeda sedikit', `Buku teks sering menulis <b>IDF = log(n / df)</b>.
      Idenya sama (kata langka → nilai besar), tapi angkanya berbeda dengan scikit-learn. Versi scikit-learn menambah 1
      di atas-bawah (supaya tidak membagi nol) dan +1 di akhir (supaya kata yang ada di semua dokumen tidak bernilai 0).
      Tabel IDF di bawah menampilkan keduanya untuk perbandingan.`));

    // ---------- kalkulator ----------
    el.append(h('h2', {}, 'Coba Sendiri: Kalkulator TF-IDF & Mesin Pencari Mini'));
    el.append(box('coba', null, `Tulis dokumen di kotak kiri (<b>satu dokumen per baris</b>) dan kata kunci pencarian (<b>query</b>) di kanan.
      Semua tabel dihitung ulang langsung. <b>Klik baris dokumen</b> di matriks TF-IDF untuk melihat cara menghitungnya.`));
    const DEF_DOCS = 'kucing lucu\nkucing tidur\nanjing lucu';
    const ta = h('textarea', { rows: 5, 'aria-label': 'dokumen', spellcheck: 'false' });
    ta.value = DEF_DOCS;
    const qIn = h('input', { type: 'text', value: 'kucing lucu', 'aria-label': 'query', style: 'width:100%' });
    const stopCb = h('input', { type: 'checkbox', checked: true, id: 'tf-stop' });
    el.append(h('div', { class: 'grid2' },
      h('div', { class: 'ctl' }, h('label', {}, 'Dokumen (satu per baris → Dok 1, Dok 2, …)'), ta),
      h('div', {},
        h('div', { class: 'ctl' }, h('label', {}, 'Query (kata kunci pencarian)'), qIn),
        h('label', { for: 'tf-stop', style: 'display:flex;gap:8px;align-items:center;margin:10px 0 4px' }, stopCb, 'Hapus stopword (versi mini Sastrawi)'),
        h('div', { class: 'small muted' }, 'Tanda baca & angka dihapus otomatis (seperti re.sub). Coba tambah dokumen "kucing itu sangat lucu sekali!!"'),
        h('button', { style: 'margin-top:8px', onclick: () => { ta.value = DEF_DOCS; qIn.value = 'kucing lucu'; stopCb.checked = true; sel = 1; update(); } }, '↺ Kembalikan contoh awal'))));
    const out = h('div');
    el.append(out);
    let sel = 1; // Dok 2 dipilih awal (sesuai catatan)

    const clean = (s) => {
      let w = s.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);
      if (stopCb.checked) w = w.filter((x) => !STOP.has(x));
      return w;
    };

    function compute() {
      const raw = ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
      const docs = raw.map((t) => ({ text: t, w: clean(t) }));
      const n = docs.length;
      const vocab = [...new Set(docs.flatMap((d) => d.w))].sort();
      const df = vocab.map((v) => docs.filter((d) => d.w.includes(v)).length);
      const idf = df.map((d) => Math.log((1 + n) / (1 + d)) + 1);
      const vec = (words) => {
        const tf = vocab.map((v) => words.filter((x) => x === v).length);
        const ti = tf.map((t, i) => t * idf[i]);
        const len = Math.sqrt(ti.reduce((s, x) => s + x * x, 0));
        return { tf, ti, len, nv: ti.map((x) => (len ? x / len : 0)) };
      };
      docs.forEach((d) => Object.assign(d, vec(d.w)));
      const qw = clean(qIn.value);
      const q = Object.assign({ w: qw, unknown: [...new Set(qw.filter((x) => !vocab.includes(x)))] }, vec(qw));
      docs.forEach((d) => { d.cos = ML.dot(d.nv, q.nv); });
      return { docs, n, vocab, df, idf, q };
    }

    const shade = (v) => `background:color-mix(in srgb, var(--c1) ${Math.round(v * 60)}%, var(--surface));color:var(--text)`;

    function update() {
      const r = compute();
      out.innerHTML = '';
      if (!r.n || !r.vocab.length) { out.append(box('info', 'Belum ada dokumen', 'Tulis minimal satu dokumen berisi kata.')); return; }
      if (sel >= r.n) sel = 0;

      // kosakata
      out.append(h('h3', {}, `1. Kosakata (${r.vocab.length} kata unik, diurutkan abjad)`));
      out.append(h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px' }, ...r.vocab.map((v) => h('code', { style: 'font-size:14px' }, v))));

      // df & idf
      out.append(h('h3', {}, '2. IDF: seberapa langka tiap kata?'));
      out.append(h('p', { class: 'small muted', html: `n = ${r.n} dokumen. df kecil (jarang) → IDF besar.` }));
      out.append(ML.table(['Kata', 'df (ada di … dokumen)', 'Hitung (scikit-learn)', 'IDF', 'IDF buku teks ln(n/df)'],
        r.vocab.map((v, i) => [esc(v), r.df[i], `ln(${1 + r.n}/${1 + r.df[i]}) + 1 = ${f3(Math.log((1 + r.n) / (1 + r.df[i])))} + 1`, '<b>' + f3(r.idf[i]) + '</b>',
          `<span class="muted">${f3(Math.log(r.n / r.df[i]))}</span>`])));

      // matriks
      out.append(h('h3', {}, '3. Matriks TF-IDF (baris = dokumen, kolom = kata)'));
      out.append(h('p', { class: 'small muted' }, 'Makin gelap warnanya, makin besar bobotnya. Klik sebuah baris untuk melihat langkah hitungnya.'));
      const t = h('table', { class: 'tbl' });
      t.append(h('tr', {}, h('th', { class: 'l' }, 'Dokumen'), ...r.vocab.map((v) => h('th', {}, v))));
      r.docs.forEach((d, i) => {
        const on = i === sel;
        const tr = h('tr', { style: 'cursor:pointer' + (on ? ';outline:2.5px solid var(--accent);outline-offset:-1px' : ''), title: 'klik untuk lihat langkah hitung',
          onclick: () => { sel = i; update(); } },
        h('td', { class: 'l', html: `${on ? '' : ''}<b>Dok ${i + 1}</b> <span class="muted">"${esc(d.text)}"</span>` }),
        ...d.nv.map((x) => h('td', { class: 'mono', style: shade(x) + ';font-family:var(--mono)' }, f2(x))));
        t.append(tr);
      });
      out.append(h('div', { class: 'tbl-scroll' }, t));

      // langkah hitung dokumen terpilih
      const d = r.docs[sel];
      const idx = r.vocab.map((_, i) => i).filter((i) => d.tf[i] > 0);
      const name = `Dok ${sel + 1} "${esc(d.text)}"`;
      const sq = idx.map((i) => r3(d.ti[i]) ** 2);
      const sumSq = sq.reduce((a, b) => a + b, 0);
      const st = [
        ['<b>TF</b>: berapa kali tiap kata muncul di ' + name, idx.map((i) => `${r.vocab[i]} = ${d.tf[i]}`).join(',  ') || '(kosong setelah dibersihkan)'],
        ['<b>IDF</b>: kata langka → nilainya besar',
          idx.map((i) => `${r.vocab[i]} ada di ${r.df[i]} dokumen:  ln(${1 + r.n}/${1 + r.df[i]}) + 1 = ${f3(Math.log((1 + r.n) / (1 + r.df[i])))} + 1 = ${f3(r.idf[i])}`).join('\n')],
        ['<b>TF × IDF</b>', idx.map((i) => `${r.vocab[i]} = ${d.tf[i]} × ${f3(r.idf[i])} = ${f3(d.ti[i])}`).join('\n')],
        ['<b>Normalisasi L2</b>: bagi dengan panjang vektor supaya panjangnya = 1',
          `panjang = √(${idx.map((i) => f3(d.ti[i]) + '²').join(' + ')}) = √(${sq.map(f3).join(' + ')}) = √${f3(sumSq)} = ${f3(Math.sqrt(sumSq))}\n`
          + idx.map((i) => `${r.vocab[i]} = ${f3(d.ti[i])} ÷ ${f3(Math.sqrt(sumSq))} = ${f2(d.nv[i])}`).join('\n')],
      ];
      if (r.q.len > 0) {
        const terms = r.vocab.map((v, i) => [v, r.q.nv[i], d.nv[i]]).filter(([, a, b]) => a > 0 || b > 0);
        st.push(['<b>Cosine dengan query</b>: kalikan bobot kata yang sama lalu jumlahkan (karena panjang keduanya sudah 1)',
          `cosine = ${terms.map(([, a, b]) => f2(a) + '×' + f2(b)).join(' + ')} = ${f2(d.cos)}`]);
      }
      out.append(box('langkah', 'Langkah Hitung untuk ' + name, steps(st)));

      // query + ranking
      out.append(h('h3', {}, '4. Pencarian: query dibandingkan dengan tiap dokumen'));
      const qt = ML.table(['', ...r.vocab.map(esc)], [[`<b>query</b> "${esc(qIn.value.trim())}"`, ...r.q.nv.map((x) => f2(x))]]);
      qt.querySelectorAll('td').forEach((td, i) => { if (i) { td.setAttribute('style', shade(r.q.nv[i - 1]) + ';font-family:var(--mono)'); } else td.className = 'l'; });
      out.append(qt);
      if (r.q.unknown.length) out.append(h('div', { class: 'small muted', html: 'Kata query yang tidak ada di kosakata diabaikan (<code>.transform()</code> tidak menambah kata baru): ' + r.q.unknown.map((w) => '<code>' + esc(w) + '</code>').join(', ') }));
      if (!r.q.len) out.append(box('info', 'Query tidak cocok', 'Tidak ada kata query yang dikenal, jadi semua skor = 0.'));

      const order = r.docs.map((x, i) => i).sort((a, b) => r.docs[b].cos - r.docs[a].cos);
      const wrap = h('div', { class: 'canvas-wrap', style: 'padding:10px 14px' });
      wrap.append(h('div', { class: 'small muted', style: 'margin-bottom:6px' }, 'Ranking cosine similarity (0 = tidak mirip, 1 = identik). Arahkan mouse ke batang untuk melihat hitungannya.'));
      const g = h('div', { style: 'display:grid;grid-template-columns:minmax(120px,max-content) 1fr 48px;gap:8px 10px;align-items:center' });
      order.forEach((i, rank) => {
        const dd = r.docs[i];
        const track = h('div', { style: 'background:var(--surface-2);border-radius:4px;height:22px;cursor:help' },
          h('div', { style: `width:${Math.max(0, dd.cos * 100).toFixed(2)}%;height:100%;background:var(--c1);border-radius:4px` }));
        const terms = r.vocab.map((v, k) => [v, r.q.nv[k], dd.nv[k]]).filter(([, a, b]) => a > 0 && b > 0);
        const tipHtml = `<b>Dok ${i + 1}</b> "${esc(dd.text)}"<br>` + (terms.length ? terms.map(([v, a, b]) => `${esc(v)}: ${f2(a)} × ${f2(b)}`).join('<br>') + `<br>jumlah = <b>${f2(dd.cos)}</b>` : 'tidak ada kata yang sama → 0');
        track.addEventListener('mousemove', (e) => ML.tip.show(e.clientX, e.clientY, tipHtml));
        track.addEventListener('mouseleave', () => ML.tip.hide());
        g.append(h('span', { style: 'font-size:14.5px', html: `${rank + 1}. <b>Dok ${i + 1}</b> <span class="muted">"${esc(dd.text)}"</span>` }), track,
          h('span', { style: 'font-family:var(--mono);font-weight:700' }, f2(dd.cos)));
      });
      wrap.append(g);
      out.append(wrap);
    }
    ta.addEventListener('input', update);
    qIn.addEventListener('input', update);
    stopCb.addEventListener('change', update);
    update();

    el.append(box('info', 'Apa yang perlu diingat dari contoh awal?', `Di Dok 2 "kucing tidur", kata <b>tidur</b> (0.80) lebih besar dari <b>kucing</b> (0.61)
      karena "tidur" <b>hanya</b> ada di Dok 2, sedangkan "kucing" ada di 2 dokumen. Kata yang langka lebih menjadi ciri khas.
      Untuk query "kucing lucu", Dok 1 identik (1.00), sedangkan Dok 2 dan Dok 3 masing-masing hanya berbagi satu kata (0.43).`));

    // ---------- kode ----------
    el.append(h('h2', {}, 'Kode Python'));
    el.append(h('pre', { class: 'code' }, `import re
import pandas as pd
from Sastrawi.StopWordRemover.StopWordRemoverFactory import StopWordRemoverFactory
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

dokumen = ["kucing lucu", "kucing tidur", "anjing lucu"]
stopword = StopWordRemoverFactory().create_stop_word_remover()

def bersihkan(teks):
    teks = re.sub(r'[^a-z\\s]', '', teks.lower())   # 1. hapus tanda baca & angka
    return stopword.remove(teks)                    # 2. hapus stopword

bersih = [bersihkan(d) for d in dokumen]
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(bersih)                # 3. teks -> matriks TF-IDF
print(pd.DataFrame(X.toarray(), columns=vectorizer.get_feature_names_out()).round(2))

q = vectorizer.transform([bersihkan("kucing lucu")])  # query, kosakata tidak berubah
skor = cosine_similarity(q, X).flatten()             # 4. [1.0, 0.43, 0.43]
hasil = pd.DataFrame({"dokumen": dokumen, "skor": skor})
print(hasil.sort_values("skor", ascending=False))    # 5. ranking`));
    el.append(ML.table(['Method', 'Gunanya'], [
      ['<code>.fit_transform(dokumen)</code>', 'Mempelajari kosakata + IDF, sekaligus mengubah dokumen jadi matriks'],
      ['<code>.transform(query)</code>', 'Mengubah teks baru memakai kosakata yang <b>sudah ada</b> (kata baru diabaikan)'],
      ['<code>.get_feature_names_out()</code>', 'Daftar kata sesuai urutan kolom matriks'],
    ]));

    el.append(box('bisindo', null, `Proyek BISINDO tidak memakai teks, tapi idenya sama: <b>ubah data jadi vektor angka</b> (di sana 63 angka koordinat tangan),
      lalu bandingkan vektor. Cosine similarity yang kamu lihat di sini juga bisa dipakai untuk mengukur seberapa mirip dua pose tangan.`));

    // ---------- kuis ----------
    el.append(h('h2', {}, 'Kuis Singkat'));
    el.append(ML.quiz([
      { q: 'Kata yang muncul di <b>semua</b> dokumen akan punya IDF…', options: ['Paling besar', 'Paling kecil', 'Selalu 0 di scikit-learn'], answer: 1, explain: 'df = n, jadi ln((1+n)/(1+n)) + 1 = 0 + 1 = 1, nilai IDF terkecil. Kata itu tidak membedakan dokumen.' },
      { q: 'Di Dok 2 "kucing tidur", kenapa bobot "tidur" (0.80) lebih besar dari "kucing" (0.61)?', options: ['Karena "tidur" lebih panjang hurufnya', 'Karena "tidur" hanya muncul di 1 dokumen (lebih langka)', 'Karena "tidur" muncul 2 kali'], answer: 1, explain: 'TF keduanya sama (1). Bedanya di IDF: tidur 1.693 vs kucing 1.288.' },
      { q: 'Kenapa cosine similarity cukup dihitung dengan dot product (kalikan lalu jumlahkan)?', options: ['Karena vektor TF-IDF sudah dinormalisasi panjangnya jadi 1', 'Karena cosine selalu sama dengan dot product', 'Karena dokumennya pendek'], answer: 0, explain: 'cosine = dot ÷ (panjang × panjang). Kalau kedua panjang = 1, pembaginya 1.' },
      { q: 'Library apa yang menghapus stopword bahasa Indonesia seperti "dan", "yang", "di"?', options: ['pandas', 'PySastrawi', 'cosine_similarity'], answer: 1, explain: 'PySastrawi dibuat khusus untuk bahasa Indonesia.' },
    ]));
  },
});
