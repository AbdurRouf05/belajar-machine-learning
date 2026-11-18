# Konsep Feature Engineering, Fitur, Label, dan Hubungannya dengan Model

Dokumen ini menjelaskan hubungan mendasar antara Fitur, Label, Feature Engineering, dan Model/Algoritma dalam Machine Learning, khususnya pada konteks pemrosesan teks (NLP) maupun data tabular.

---

## 1. Definisi Fitur (Feature) dan Label (Target)

Dalam pembelajaran terawasi (*Supervised Learning*), setiap baris data memiliki dua komponen utama:

```
            FITUR (X)  ── input                            LABEL (y) ── jawaban
 ┌─────────────────────────────────────────────────┐   ┌──────────────┐
 │ luas tanah │ jumlah kamar │ jarak ke kota (km)  │   │ harga rumah  │
 ├────────────┼──────────────┼─────────────────────┤   ├──────────────┤
 │    120     │      3       │        5            │   │   500 juta   │
 │     90     │      2       │       12            │   │   300 juta   │
 └─────────────────────────────────────────────────┘   └──────────────┘
          model belajar memetakan  X  ───────────────►  y
```

### A. Fitur (Feature / Variabel $X$)
Fitur adalah karakteristik, atribut, atau variabel independen dari data yang digunakan sebagai masukan (*input*) bagi model untuk belajar mengenali pola.
- Notasi matematis: $X$
- Contoh pada data teks: 
  - Frekuensi kemunculan kata (TF)
  - Nilai bobot kata (TF-IDF)
  - Vektor semantik kata (Word2Vec)
  - Panjang karakter teks
- Contoh pada data tabular (prediksi harga rumah): 
  - Luas tanah, jumlah kamar tidur, jarak ke pusat kota.

### B. Label (Target / Ground Truth / Variabel $y$)
Label adalah jawaban, luaran (*output*), atau variabel dependen yang ingin dipelajari dan diprediksi oleh model.
- Notasi matematis: $y$
- Contoh pada klasifikasi teks:
  - Sentimen ulasan: `Positif` atau `Negatif`
  - Kategori email: `Spam` atau `Bukan Spam`
  - Topik berita: `Politik`, `Teknologi`, `Olahraga`
- Contoh pada data tabular:
  - Nilai riil harga rumah (misalnya Rp 500.000.000).

---

## 2. Apa itu Feature Engineering?

**Feature Engineering** adalah proses memilih, membersihkan, mentransformasikan, dan merekayasa data mentah (*raw data*) menjadi fitur-fitur representatif berbentuk angka (*numerik*) yang siap dipelajari oleh model/algoritma machine learning.

### Mengapa Feature Engineering Mutlak Diperlukan?
1. **Algoritma Hanya Mengerti Angka**: Model machine learning pada dasarnya adalah fungsi matematis. Algoritma tidak dapat membaca teks mentah seperti kalimat `"skripsi saya belum selesai"`. Teks tersebut harus diubah menjadi matriks angka.
2. **Kualitas Data Menentukan Kualitas Hasil**: Ada pepatah terkenal dalam dunia data:
   > *"Garbage In, Garbage Out"* (Data masukan buruk akan menghasilkan prediksi yang buruk).
   > *"Better features beat better algorithms"* (Fitur yang dirancang dengan baik jauh lebih berpengaruh terhadap akurasi dibanding mengganti-ganti jenis algoritma).

### Isi Feature Engineering: Apakah Feature Extraction Termasuk?

**Ya.** Feature engineering adalah **payung besar**, dan **feature extraction** adalah salah satu bagiannya:

```
FEATURE ENGINEERING  (payung besar: data mentah → fitur yang siap dipakai model)
│
├── 1. Preprocessing ........ membersihkan data mentah
│                             (huruf kecil, hapus tanda baca, tokenisasi, stopword)
│
├── 2. Feature Extraction ... MEMBUAT fitur angka baru dari data mentah
│                             (TF-IDF, Word2Vec, landmark tangan MediaPipe)
│
├── 3. Feature Creation ..... membuat fitur tambahan secara manual pakai logika sendiri
│                             (panjang teks, jumlah tanda seru, jarak antar jari)
│
├── 4. Feature Selection .... MEMILIH fitur yang berguna, membuang sisanya
│                             (buang kata yang terlalu jarang, buang fitur tidak relevan)
│
└── 5. Feature Scaling ...... menyamakan skala angka antar fitur
                              (StandardScaler, MinMaxScaler, normalisasi L2)
```

#### Beda Feature Extraction dan Feature Selection

Dua istilah ini paling sering tertukar:

```
FEATURE EXTRACTION = MEMBUAT fitur baru (bentuk data berubah)

  "pelayanannya ramah sekali"  ──── TF-IDF ────►  [0.00, 0.58, 0.00, 0.58, 0.58]
       (teks, bukan angka)                              (vektor angka baru)


FEATURE SELECTION = MEMILIH dari fitur yang sudah ada (bentuk data tetap)

  [ f1   f2   f3   f4   f5 ]  ──── pilih ────►  [ f1   f3   f5 ]
    ✓    ✗    ✓    ✗    ✓                       (f2, f4 dibuang karena tidak berguna)
```

| | Feature Extraction | Feature Selection |
|---|---|---|
| Yang dilakukan | **Membuat** fitur baru | **Memilih** sebagian fitur |
| Input | Data mentah (teks, gambar, video) | Fitur yang sudah berupa angka |
| Contoh | TF-IDF, Word2Vec, PCA, MediaPipe | Buang stopword, `SelectKBest`, buang fitur yang korelasinya rendah |

> Catatan istilah: sebagian buku membedakan *feature engineering* (dirancang manual oleh manusia dengan pengetahuan domain) dari *feature extraction* (transformasi otomatis seperti TF-IDF atau CNN). Di catatan ini keduanya dianggap satu keluarga, dengan feature engineering sebagai payungnya.

#### Contoh Feature Extraction pada Proyek BISINDO (Data Video)

```
 VIDEO GESTUR                                        FITUR
 ┌─────────────┐   ambil     ┌──────────┐  MediaPipe  ┌─────────────────────────────┐
 │  ▶ isyarat  │ ──────────► │  frame   │ ──────────► │ 21 titik landmark tangan    │
 │   "A"       │   per frame │  (gambar)│  Hands      │ × (x, y, z) = 63 angka      │
 └─────────────┘             └──────────┘             │ [0.41, 0.62, -0.03, ...]    │
                                                      └─────────────────────────────┘
   jutaan piksel (terlalu besar,                       63 angka saja, sudah berisi
   banyak info tidak penting)                          posisi jari → siap untuk SVM
```

Ini **feature extraction**: dari data mentah berupa gambar, dibuat fitur angka yang ringkas dan bermakna.

#### Contoh Hitung Feature Scaling

**Masalahnya:** fitur yang skalanya besar akan "mendominasi" fitur yang skalanya kecil.

```
            jam belajar    gaji orang tua (rupiah)
 Mhs A           2              3.000.000
 Mhs B           8              3.100.000
        selisih: 6          selisih: 100.000   ← bagi model, angka ini terlihat JAUH lebih penting,
                                                  padahal belum tentu
```

**Cara 1: Min-Max Scaling** → semua dipaksa ke rentang 0 sampai 1

$$x_{baru} = \frac{x - \min}{\max - \min}$$

Data jam belajar: `[2, 4, 6, 8]` → min = 2, max = 8, jadi max − min = 6

```
  x    hitung              hasil
  2    (2 − 2) ÷ 6    =    0.00    ← paling kecil jadi 0
  4    (4 − 2) ÷ 6    =    0.33
  6    (6 − 2) ÷ 6    =    0.67
  8    (8 − 2) ÷ 6    =    1.00    ← paling besar jadi 1
```

**Cara 2: Standardization (`StandardScaler`)** → rata-rata jadi 0, sebaran jadi 1

$$x_{baru} = \frac{x - \text{rata-rata}}{\text{standar deviasi}}$$

```
 Langkah 1: rata-rata        = (2 + 4 + 6 + 8) ÷ 4 = 5

 Langkah 2: standar deviasi  = akar dari rata-rata (x − 5)²
            (2−5)² = 9   (4−5)² = 1   (6−5)² = 1   (8−5)² = 9
            rata-rata = (9 + 1 + 1 + 9) ÷ 4 = 5
            akar(5)   = 2.236

 Langkah 3: hitung tiap data
  x    hitung                 hasil
  2    (2 − 5) ÷ 2.236   =   −1.34   ← di bawah rata-rata → negatif
  4    (4 − 5) ÷ 2.236   =   −0.45
  6    (6 − 5) ÷ 2.236   =    0.45
  8    (8 − 5) ÷ 2.236   =    1.34   ← di atas rata-rata → positif
```

Setelah di-scaling, jam belajar dan gaji orang tua sama-sama berada di skala kecil, jadi model menilai keduanya secara adil. **SVM dan Logistic Regression sangat butuh langkah ini.**

```python
from sklearn.preprocessing import MinMaxScaler, StandardScaler
import numpy as np
x = np.array([[2], [4], [6], [8]])
print(MinMaxScaler().fit_transform(x).ravel())    # [0.   0.33 0.67 1.  ]
print(StandardScaler().fit_transform(x).ravel())  # [-1.34 -0.45 0.45 1.34]
```

### Bentuk Feature Engineering pada Teks (NLP):
1. **Text Preprocessing**: Lowercasing, pembersihan tanda baca, penghapusan stopword, stemming/lemmatization.
2. **Representasi Berbasis Frekuensi**:
   - **Bag of Words / Count Vectorizer**: Menghitung frekuensi kemunculan kata secara mentah.
   - **TF-IDF**: Memberikan pembobotan kata berdasarkan frekuensi lokal dan keunikan global kata di seluruh korpus.
3. **Representasi Berbasis Semantik (Word Embedding)**:
   - **Word2Vec / GloVe / FastText**: Memetakan kata ke dalam ruang vektor berdimensi padat (*dense vector*) di mana kata dengan makna serupa berada di koordinat yang berdekatan (misalnya operasi analogi: `Raja - Pria + Wanita = Ratu`).

---

## 3. Hubungan Feature Engineering dengan Model / Algoritma

Model atau algoritma (seperti Naive Bayes, SVM, Logistic Regression, Random Forest, atau Neural Network) adalah mesin pencari pola matematis:

$$y = f(X)$$

- **$X$ (Fitur)** disiapkan oleh proses **Feature Engineering**.
- **$f$ (Fungsi / Model)** dipelajari oleh **Algoritma**.
- **$y$ (Label)** adalah target kebenaran yang dicocokkan selama proses pelatihan (*training*).

### Mengapa Feature Engineering dan Model Saling Bergantung?

1. **Kesesuaian Representasi dengan Algoritma**:
   - **Model Linear & SVM**: Sangat sensitif terhadap skala angka dan korelasi fitur. Model ini bekerja sangat baik jika teks diubah ke vektor bernormalisasi (seperti TF-IDF dengan normalisasi L2).
   - **Model Probabilistik (Naive Bayes)**: Bekerja optimal dengan fitur hitungan diskrit (seperti Multinomial Naive Bayes pada frekuensi kata) atau fitur keberadaan kata (Bernoulli Naive Bayes).
   - **Deep Learning / Jaringan Saraf Tiruan**: Memerlukan representasi vektor padat dan berkesinambungan (seperti Word2Vec atau Transformer Embedding) agar dapat menangkap hubungan semantik antarkata.

2. **Mengurangi Dimensi dan Overfitting**:
   Feature engineering yang baik membuang fitur tidak relevan (misalnya stopword atau kata yang terlalu jarang muncul), sehingga model tidak menghafal derau (*noise*) dan tidak mengalami *overfitting*.

---

## 4. Alur Integrasi Keseluruhan (End-to-End Pipeline)

Berikut gambaran integrasi seluruh konsep dari awal hingga akhir:

```
 ┌────────────────────────────────────────────────────────────┐
 │ 1. DATA MENTAH                                             │
 │    teks : "Pelayanannya ramah sekali!"                     │
 │    label: Positif                                          │
 └────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────────┐
 │ 2. FEATURE ENGINEERING                                     │
 │    a. preprocessing  → "pelayanannya ramah sekali"         │
 │    b. extraction     → TF-IDF / Word2Vec → vektor angka    │
 │    c. selection      → buang kata tidak berguna            │
 │    d. scaling        → normalisasi                         │
 └────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────────┐
 │ 3. PASANGAN FITUR & LABEL                                  │
 │    X (fitur) = [0.00, 0.45, 0.00, 0.78, ...]               │
 │    y (label) = 1  (Positif)                                │
 └────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────────┐
 │ 4. MODEL / ALGORITMA  (SVM, Logistic Regression, dll.)     │
 │    mempelajari bobot w supaya f(X) ≈ y                     │
 └────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────────┐
 │ 5. PREDIKSI DATA BARU                                      │
 │    teks baru → feature engineering YANG SAMA → model       │
 │    → "Positif" (87%)                                       │
 └────────────────────────────────────────────────────────────┘
```

> Penting: data baru **harus** melewati feature engineering yang **sama persis** dengan data training (vectorizer/scaler yang sama, cukup `.transform()`, bukan `.fit_transform()` lagi).

---

## 5. Ringkasan Singkat

| Komponen | Istilah Lain | Peran Utama | Contoh Nyata (Kasus Teks) |
| :--- | :--- | :--- | :--- |
| **Fitur ($X$)** | Feature, Predictor, Input | Variabel masukan yang digunakan model untuk mengenali pola | Vektor angka hasil TF-IDF atau Word2Vec |
| **Label ($y$)** | Target, Ground Truth, Output | Nilai kebenaran yang ingin diprediksi | Kelas sentimen: `Positif` atau `Negatif` |
| **Feature Engineering** | Data Transformation, Vectorization | Jembatan pengubah data mentah menjadi bentuk fitur matematis yang bernilai tinggi | Mengubah kalimat teks menjadi representasi TF-IDF |
| **Model / Algoritma** | Estimator, Classifier, $f(X)$ | Mesin matematika yang memetakan hubungan antara Fitur ($X$) dan Label ($y$) | Naive Bayes, Support Vector Machine (SVM) |