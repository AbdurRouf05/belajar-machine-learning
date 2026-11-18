# Konsep Dasar Word2Vec (Word Embedding)

**Word2Vec** adalah algoritma berbasis *shallow neural network* yang dikembangkan oleh Tomas Mikolov dkk. (Google, 2013) untuk mengubah kata menjadi representasi vektor numerik padat (*dense vector*) yang memuat **makna semantik** dan hubungan kontekstual antar kata.

---

## 1. Mengapa Word2Vec? (Sparse vs Dense Vector)

Sebelum adanya Word Embedding, teks direpresentasikan menggunakan:
- **One-Hot Encoding**: Menghasilkan vektor yang sangat panjang (sepanjang seluruh kosakata) dan bernilai 0 di hampir semua posisi (*sparse*). Tidak memiliki informasi kemiripan antar kata.
- **TF-IDF**: Memberikan bobot kepentingan kata berdasarkan frekuensi, namun tetap tidak memahami makna atau sinonim antar kata (vektor `kucing` dan `anjing` dianggap ortogonal / jaraknya sama jauhnya seperti `kucing` dan `pesawat`).

```
 ONE-HOT (sparse: panjang, hampir semua 0, tidak ada makna)
   kucing  = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, ... 10.000 angka]
   anjing  = [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, ... 10.000 angka]
   → kucing vs anjing sama jauhnya dengan kucing vs pesawat ✗

 WORD2VEC (dense: pendek, semua angka terisi, punya makna)
   kucing  = [ 0.62, -0.11,  0.83, ... 50 angka]
   anjing  = [ 0.58, -0.09,  0.79, ... 50 angka]   ← mirip dengan kucing ✓
   pesawat = [-0.40,  0.91, -0.22, ... 50 angka]   ← jauh berbeda ✓
```

**Word2Vec memetakan kata ke dalam ruang vektor kontinu berdimensi rendah ($D = 50, 100, 300$):**
- Kata dengan konteks atau makna serupa akan memiliki posisi koordinat yang berdekatan.
- Menghitung kemiripan menggunakan **Cosine Similarity**:
  $$\text{Cosine Similarity}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
  (penjelasan dot product dan cosine similarity: [dot_product.md](../00_konsep_dasar/dot_product.md))

```
  Ruang vektor kata (disederhanakan jadi 2 dimensi, seperti grafik PCA di notebook)

   ▲
   │   kucing ●  ● anjing                      kata yang maknanya mirip
   │        ● singa                            berkumpul berdekatan
   │
   │                          ● mobil
   │                       ● pesawat  ● kereta
   │
   │      ● raja   ● ratu
   │      ● pria   ● wanita
   └──────────────────────────────────────►
```

---

## 2. Aritmatika Vektor & Analogi Kata

Salah satu karakteristik paling terkenal dari Word2Vec adalah kemampuannya melakukan **operasi aljabar semantik**:

$$\vec{v}(\text{Raja}) - \vec{v}(\text{Pria}) + \vec{v}(\text{Wanita}) \approx \vec{v}(\text{Ratu})$$

```
            raja ●─────────────────► ● ratu
                 ▲      (+ wanita     ▲
                 │       − pria)      │
     "kerajaan"  │                    │  "kerajaan"
                 │                    │
            pria ●─────────────────► ● wanita
                      arah "gender"

  Panah pria→wanita SAMA dengan panah raja→ratu.
  Jadi: raja − pria + wanita = berjalan dari raja searah panah "gender" → sampai di ratu
```

Artinya:
- Jika dari konsep "Raja" kita kurangi komponen makna "Pria", lalu kita tambahkan komponen makna "Wanita", vektor hasil perhitungan paling mendekati vektor "Ratu".
- Contoh lain:
  $$\vec{v}(\text{Indonesia}) - \vec{v}(\text{Jakarta}) + \vec{v}(\text{Tokyo}) \approx \vec{v}(\text{Jepang})$$
  $$\vec{v}(\text{Ayah}) - \vec{v}(\text{Pria}) + \vec{v}(\text{Wanita}) \approx \vec{v}(\text{Ibu})$$

---

## 3. Dua Arsitektur Word2Vec

Word2Vec memiliki 2 metode pelatihan:

| Aspek | Continuous Bag of Words (CBOW) | Skip-Gram |
| :--- | :--- | :--- |
| **Prinsip Kerja** | Memprediksi **kata target** berdasarkan **kata-kata konteks** di sekitarnya. | Memprediksi **kata-kata konteks** di sekitar berdasarkan satu **kata target**. |
| **Analog Sederhana** | Diberikan `[... kucing ... lucu ...]`, tebak kata tengahnya (`adalah`). | Diberikan kata `kucing`, tebak kata di sekitarnya (`hewan`, `lucu`, `tidur`). |
| **Kecepatan Latih** | Jauh lebih cepat dilatih. | Relatif lebih lambat. |
| **Performa Data** | Sangat baik untuk kata-kata umum dan dataset berukuran besar. | Lebih baik untuk dataset berukuran kecil hingga menengah serta kata langka (*rare words*). |
| **Parameter Gensim** | `sg=0` | `sg=1` |

Contoh kalimat: **"kucing adalah hewan yang lucu"**, kata tengah = `hewan`, `window=2`

```
 Window (jendela konteks) yang bergeser:

   kucing   adalah  [ hewan ]   yang    lucu
   └─ konteks ──┘    target    └─ konteks ─┘
     (2 kiri)                    (2 kanan)


        CBOW (sg=0)                               SKIP-GRAM (sg=1)
   konteks → tebak target                     target → tebak konteks

   kucing ──┐                                                     ┌──► kucing
   adalah ──┤                                                     ├──► adalah
            ├──► [model] ──► hewan            hewan ──► [model] ──┤
   yang   ──┤                                                     ├──► yang
   lucu   ──┘                                                     └──► lucu
```

---

## Contoh Hitung Manual

### A. Analogi "Raja − Pria + Wanita = Ratu"

Vektor asli punya 50–300 angka. Agar mudah dihitung, anggap tiap kata hanya punya **2 angka**:
- angka ke-1 = seberapa "laki-laki"
- angka ke-2 = seberapa "kerajaan"

```
 kata      [laki-laki, kerajaan]
 raja      [   0.9   ,   0.9   ]     laki-laki ✓  kerajaan ✓
 ratu      [   0.1   ,   0.9   ]     laki-laki ✗  kerajaan ✓
 pria      [   0.9   ,   0.1   ]     laki-laki ✓  kerajaan ✗
 wanita    [   0.1   ,   0.1   ]     laki-laki ✗  kerajaan ✗
```

Hitung per posisi (seperti penjumlahan vektor biasa):

```
                 angka ke-1           angka ke-2
 raja             0.9                  0.9
 − pria         − 0.9                − 0.1
 + wanita       + 0.1                + 0.1
               ───────              ───────
 hasil            0.1                  0.9        → [0.1, 0.9] = persis vektor RATU ✓
```

Maknanya: buang sifat "laki-laki" dari raja, tambahkan sifat "perempuan", sisa sifat "kerajaan"-nya tetap → ratu.

### B. Seberapa Mirip "raja" dan "ratu"? (Cosine Similarity)

```
 Langkah 1: dot product     raja · ratu = 0.9×0.1 + 0.9×0.9 = 0.09 + 0.81 = 0.90
 Langkah 2: panjang raja    √(0.9² + 0.9²) = √1.62 = 1.273
 Langkah 3: panjang ratu    √(0.1² + 0.9²) = √0.82 = 0.906
 Langkah 4: cosine          0.90 ÷ (1.273 × 0.906) = 0.90 ÷ 1.153 = 0.78   ← cukup mirip
```

### C. Dari Mana Word2Vec Mendapat Data Latih? (Skip-Gram)

Word2Vec membuat **pasangan (kata target → kata tetangga)** sendiri dari kalimat, tanpa perlu label manual.

Kalimat: **"kucing suka ikan segar"**, `window = 1` (lihat 1 kata di kiri dan 1 di kanan)

```
 posisi target   jendela                      pasangan latih yang dibuat
 kucing          [kucing] suka                (kucing → suka)
 suka            kucing [suka] ikan           (suka → kucing), (suka → ikan)
 ikan            suka [ikan] segar            (ikan → suka),   (ikan → segar)
 segar           ikan [segar]                 (segar → ikan)
                                              ───────────────────────────────
                                              total 6 pasangan latih
```

Model lalu dilatih untuk menebak: "jika diberi **kucing**, tetangganya adalah **suka**". Kata-kata yang sering punya tetangga sama (misalnya "kucing" dan "anjing" sama-sama dekat dengan "suka", "makan", "lucu") akhirnya mendapat vektor yang mirip.

---

## 4. Parameter Penting pada Library Gensim (`Word2Vec`)

```python
from gensim.models import Word2Vec

model = Word2Vec(
    sentences=korpus_token,  # List of list tokens: [['kata1', 'kata2'], ...]
    vector_size=50,          # Dimensi vektor embedding (default: 100)
    window=5,                # Jarak konteks (jumlah kata sebelum dan sesudah)
    min_count=1,             # Batas minimal frekuensi kemunculan kata
    sg=1,                    # 0 = CBOW, 1 = Skip-Gram
    epochs=100,              # Jumlah epoch / iterasi pelatihan
    workers=4                # Jumlah thread pemrosesan CPU
)
```

---

## 5. Fitur Utama Model Gensim Word2Vec

1. **Melihat Vektor Kata**:
   ```python
   vektor = model.wv['raja']  # Menghasilkan numpy array 1D
   ```
2. **Menghitung Kemiripan Dua Kata**:
   ```python
   skor = model.wv.similarity('raja', 'ratu')
   ```
3. **Mencari Kata Paling Mirip (*Most Similar*)**:
   ```python
   mirip = model.wv.most_similar('raja', topn=5)
   ```
4. **Analogi Kata (Aritmatika Semantik)**:
   ```python
   # Raja - Pria + Wanita = Ratu
   hasil = model.wv.most_similar(positive=['raja', 'wanita'], negative=['pria'], topn=3)
   ```
5. **Mendeteksi Kata Asing/Ganjil (*Outlier*)**:
   ```python
   ganjil = model.wv.doesnt_match(['kucing', 'anjing', 'singa', 'komputer'])
   # Output: 'komputer'
   ```

---

## 6. File Terkait di Workspace

- [`word2vec_google_colab.ipynb`](word2vec_google_colab.ipynb): Notebook siap pakai untuk Google Colab (lengkap dengan visualisasi PCA 2D).
- [`word2vec_script.py`](word2vec_script.py): Script Python mandiri untuk eksperimen cepat secara lokal.
- [`tfidf_google_colab.ipynb`](../01_tfidf/tfidf_google_colab.ipynb): Praktikum pembanding berbasis pembobotan frekuensi (TF-IDF).