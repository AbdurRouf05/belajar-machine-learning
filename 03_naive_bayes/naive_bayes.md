# Naive Bayes

## Apa itu Naive Bayes?

**Naive Bayes** adalah algoritma **klasifikasi** (mengelompokkan data ke kategori) yang bekerja dengan **menghitung peluang (probabilitas)**.

Pertanyaan yang dijawab:
> "Dengan melihat ciri-ciri data ini, **kategori mana yang paling mungkin**?"

Contoh penggunaan:
- Email ini **spam** atau **bukan spam**?
- Ulasan ini **positif** atau **negatif**? (analisis sentimen)
- Berita ini termasuk **olahraga**, **politik**, atau **teknologi**?

Naive Bayes sangat populer untuk **klasifikasi teks** karena sederhana, cepat, dan hasilnya cukup bagus walaupun datanya sedikit.

---

## Analogi Sederhana

Kamu menerima pesan: **"Selamat! Anda menang hadiah GRATIS, klaim sekarang!"**

Tanpa berpikir panjang, kamu langsung curiga itu penipuan. Kenapa? Karena dari **pengalaman** (data masa lalu), kata seperti *gratis*, *hadiah*, dan *klaim* **sering muncul di pesan penipuan** dan **jarang muncul di pesan teman**.

Naive Bayes melakukan hal yang sama, hanya saja dengan **angka peluang**.

```
 PENGALAMAN (data latih)                       PESAN BARU
 ┌─────────────────────────────────────┐
 │ kata "gratis" muncul di:            │       "Selamat! Anda menang hadiah
 │   pesan PENIPUAN  ██████████ sering │ ───►  GRATIS, klaim sekarang!"
 │   pesan TEMAN     ▏          jarang │                   │
 └─────────────────────────────────────┘                   ▼
                                               kemungkinan besar PENIPUAN
```

---

## Teorema Bayes (Dasar Rumusnya)

$$
P(\text{Kelas} \mid \text{Data}) = \frac{P(\text{Data} \mid \text{Kelas}) \times P(\text{Kelas})}{P(\text{Data})}
$$

Dalam bahasa sehari-hari:

| Simbol | Nama | Artinya | Contoh |
|--------|------|---------|--------|
| `P(Kelas \| Data)` | **Posterior** | Peluang kelas **setelah** melihat data. **Ini yang dicari** | Peluang pesan ini spam, setelah tahu isinya |
| `P(Data \| Kelas)` | **Likelihood** | Seberapa sering data seperti ini muncul di kelas itu | Seberapa sering kata "gratis" muncul di pesan spam |
| `P(Kelas)` | **Prior** | Peluang kelas **sebelum** melihat data | Dari semua pesan, berapa persen yang spam |
| `P(Data)` | **Evidence** | Peluang data itu muncul secara umum | Sama untuk semua kelas, jadi **boleh diabaikan** saat membandingkan |

```
   PRIOR                 LIKELIHOOD                    POSTERIOR
   (sebelum lihat isi)   (setelah lihat isi pesan)      (kesimpulan)

   "60% pesan        ×   "kata 'gratis' sering     ──►  "pesan INI kemungkinan
    biasanya spam"        muncul di spam"                besar spam"
```

Karena `P(Data)` sama untuk semua kelas, kita cukup membandingkan:

$$
\text{Skor kelas} = P(\text{Kelas}) \times P(\text{Data} \mid \text{Kelas})
$$

**Kelas dengan skor tertinggi = jawabannya.**

---

## Kenapa Disebut "Naive" (Naif)?

Karena algoritma ini **berasumsi bahwa setiap fitur (kata) saling bebas**, tidak saling memengaruhi.

Contoh: kata **"machine"** dan **"learning"** sebenarnya sering muncul bersama. Tapi Naive Bayes menganggap keduanya muncul sendiri-sendiri, tidak berhubungan.

```
 KENYATAAN (kata saling berhubungan)        ANGGAPAN NAIVE BAYES (kata berdiri sendiri)

      machine ◄────────► learning               machine       learning
          ▲                  ▲                     │             │
          └──── sering ──────┘                     ▼             ▼
               bersama                         P(machine)  ×  P(learning)
                                               dihitung terpisah, lalu dikalikan
```

Asumsi ini **tidak realistis** (makanya disebut naif). Tapi justru asumsi inilah yang membuat perhitungannya jadi **sangat mudah**, karena tinggal dikalikan:

$$
P(\text{kata}_1, \text{kata}_2, \dots \mid \text{Kelas}) = P(\text{kata}_1 \mid \text{Kelas}) \times P(\text{kata}_2 \mid \text{Kelas}) \times \dots
$$

Walaupun naif, di praktiknya hasilnya **sering tetap bagus**, terutama untuk teks.

---

## Contoh Perhitungan Manual (Deteksi Spam)

### Data Latih

| No | Pesan | Kelas |
|----|-------|-------|
| 1 | gratis hadiah | spam |
| 2 | gratis pulsa gratis | spam |
| 3 | klaim hadiah | spam |
| 4 | rapat besok pagi | bukan spam |
| 5 | kirim tugas besok | bukan spam |

**Pesan baru yang mau ditebak: `"gratis besok"`**

### Langkah 1: Hitung Prior (Peluang Awal)

- `P(spam)` = 3 dari 5 pesan = **0.6**
- `P(bukan spam)` = 2 dari 5 pesan = **0.4**

### Langkah 2: Hitung Kemunculan Kata

| Kata | Jumlah di **spam** | Jumlah di **bukan spam** |
|------|-------------------|-------------------------|
| gratis | 3 | 0 |
| hadiah | 2 | 0 |
| pulsa | 1 | 0 |
| klaim | 1 | 0 |
| rapat | 0 | 1 |
| besok | 0 | 2 |
| pagi | 0 | 1 |
| kirim | 0 | 1 |
| tugas | 0 | 1 |
| **Total kata** | **7** | **6** |

Jumlah kata unik (kosakata) = **9**

### Masalah: Peluang Nol

Kata **"besok"** tidak pernah muncul di spam, sehingga `P(besok | spam) = 0/7 = 0`.

Karena semuanya dikalikan, **skor spam langsung jadi 0**, padahal kata "gratis" sangat menunjukkan spam. Satu kata yang belum pernah terlihat menghancurkan seluruh perhitungan.

### Solusi: Laplace Smoothing (+1)

Setiap hitungan **ditambah 1**, supaya tidak ada peluang yang nol:

$$
P(\text{kata} \mid \text{Kelas}) = \frac{\text{jumlah kata di kelas} + 1}{\text{total kata di kelas} + \text{jumlah kosakata}}
$$

### Langkah 3: Hitung Likelihood

**Kelas spam** (penyebut = 7 + 9 = 16):
- `P(gratis | spam)` = (3 + 1) / 16 = **0.25**
- `P(besok | spam)` = (0 + 1) / 16 = **0.0625**

**Kelas bukan spam** (penyebut = 6 + 9 = 15):
- `P(gratis | bukan spam)` = (0 + 1) / 15 = **0.0667**
- `P(besok | bukan spam)` = (2 + 1) / 15 = **0.2**

### Langkah 4: Hitung Skor Tiap Kelas

```
Skor spam       = 0.6 × 0.25   × 0.0625 = 0.009375
Skor bukan spam = 0.4 × 0.0667 × 0.2    = 0.005333
```

Gambaran seluruh langkah perhitungan:

```
                         PRIOR       P(gratis|kelas)  P(besok|kelas)      SKOR
                       ┌───────┐     ┌──────────┐     ┌──────────┐
             ┌─► SPAM  │  0.6  │  ×  │   0.25   │  ×  │  0.0625  │  =  0.009375 ─┐
"gratis      │         └───────┘     └──────────┘     └──────────┘               │
 besok"  ────┤                                                                   ├─► bandingkan
             │         ┌───────┐     ┌──────────┐     ┌──────────┐               │   → SPAM menang
             └─► BUKAN │  0.4  │  ×  │  0.0667  │  ×  │   0.2    │  =  0.005333 ─┘     (64% vs 36%)
                 SPAM  └───────┘     └──────────┘     └──────────┘
```

### Langkah 5: Bandingkan

**Skor spam lebih besar**, sehingga pesan `"gratis besok"` diprediksi **SPAM**.

Kalau diubah ke persen (skor dibagi total skor):
- Spam: 0.009375 / (0.009375 + 0.005333) ≈ **64%**
- Bukan spam ≈ **36%**

---

## Kode Python (scikit-learn)

Perhitungan di atas bisa dilakukan otomatis. Hasil kode ini **sama persis** dengan hitungan manual.

```python
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB

# 1. Data
pesan = ["gratis hadiah", "gratis pulsa gratis", "klaim hadiah",
         "rapat besok pagi", "kirim tugas besok"]
label = ["spam", "spam", "spam", "bukan spam", "bukan spam"]

# 2. Feature engineering: ubah teks menjadi jumlah kemunculan kata
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(pesan)

# 3. Training: alpha=1.0 adalah Laplace smoothing (+1)
model = MultinomialNB(alpha=1.0)
model.fit(X, label)

# 4. Prediksi pesan baru
pesan_baru = vectorizer.transform(["gratis besok"])
print(model.predict(pesan_baru))        # ['spam']
print(model.classes_)                   # ['bukan spam' 'spam']
print(model.predict_proba(pesan_baru))  # [[0.363 0.637]]  → 64% spam
```

> Bisa juga memakai `TfidfVectorizer` (dari materi [TF-IDF](../01_tfidf/)) sebagai pengganti `CountVectorizer`.

---

## Jenis-jenis Naive Bayes

| Jenis | Cocok untuk data | Contoh |
|-------|------------------|--------|
| **Multinomial NB** | **Jumlah/frekuensi** (berapa kali kata muncul) | Klasifikasi teks, spam, sentimen (paling sering dipakai) |
| **Bernoulli NB** | **Ada/tidak ada** (0 atau 1) | Teks pendek, cukup tahu kata muncul atau tidak |
| **Gaussian NB** | **Angka kontinu** (desimal) | Data tinggi badan, suhu, data tabular seperti dataset Iris |

---

## Naive Bayes dalam Alur ML

Bandingkan dengan alur di [konsep_dasar_ml.md](../00_konsep_dasar/konsep_dasar_ml.md):

| Tahap ML | Di Naive Bayes |
|----------|----------------|
| Data | Kumpulan pesan + labelnya |
| Feature Engineering | Teks diubah menjadi angka (`CountVectorizer` / `TfidfVectorizer`) |
| Algoritma | `MultinomialNB` |
| **Parameter** (dipelajari mesin) | Prior `P(Kelas)` dan likelihood `P(kata \| Kelas)` |
| **Hyperparameter** (diatur manusia) | `alpha` (besar smoothing) |
| Loss Function, Gradient Descent, Optimizer, Epoch | **Tidak dipakai!** |

```
 MODEL BIASA (Logistic Regression, Neural Network, Word2Vec)
 ┌──────┐   ┌─────────┐   ┌───────┐   ┌──────┐   ┌──────────┐   ┌───────────┐
 │ DATA │ ► │ FEATURE │ ► │ MODEL │ ► │ LOSS │ ► │ GRADIENT │ ► │ OPTIMIZER │ ─┐
 └──────┘   │ ENG.    │   └───────┘   └──────┘   └──────────┘   └───────────┘  │
            └─────────┘       ▲                                                │
                              └────────── diulang ratusan EPOCH ───────────────┘

 NAIVE BAYES
 ┌──────┐   ┌─────────┐   ┌─────────────────────────────┐
 │ DATA │ ► │ FEATURE │ ► │ MODEL: HITUNG peluang       │ ► SELESAI ✓
 └──────┘   │ ENG.    │   │ sekali jalan (counting)     │
            └─────────┘   └─────────────────────────────┘
                          tidak ada loss, gradient, optimizer, epoch
```

**Naive Bayes tidak butuh gradient descent dan epoch.** "Belajarnya" cukup dengan **menghitung (counting)** sekali jalan melewati data, lalu langsung jadi. Karena itulah Naive Bayes **sangat cepat**.

Bandingkan dengan Word2Vec atau neural network yang harus mengulang ratusan epoch.

---

## Kelebihan dan Kekurangan

| Kelebihan | Kekurangan |
|-----------|------------|
| Sangat **cepat**, baik saat training maupun prediksi | Asumsi "kata saling bebas" tidak realistis |
| Bagus walaupun **data sedikit** | Tidak paham urutan kata ("tidak bagus" vs "bagus tidak") |
| Mudah dipahami dan dihitung manual | Nilai peluangnya kurang akurat (tapi tebakan kelasnya sering tetap benar) |
| Cocok sebagai **baseline** (pembanding awal) | Kalah dari model modern untuk tugas yang rumit |

---

## Ringkasan

1. Naive Bayes = klasifikasi berdasarkan **peluang** (Teorema Bayes).
2. **Skor kelas = Prior × Likelihood**, lalu pilih kelas dengan skor tertinggi.
3. **"Naive"** karena menganggap setiap kata saling bebas.
4. **Laplace smoothing** (+1) mencegah peluang nol untuk kata yang belum pernah terlihat.
5. Tidak butuh gradient descent atau epoch; cukup **menghitung** sekali.
6. Sangat cocok untuk **klasifikasi teks** (spam, sentimen, kategori berita).
