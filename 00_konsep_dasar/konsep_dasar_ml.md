# Konsep Dasar Machine Learning (ML)

## Apa itu Machine Learning?

**Machine Learning (ML)** = **mesin belajar dari data**.

Pada pemrograman biasa, manusia yang menulis aturannya:

```
Aturan (ditulis manusia) + Data  →  Jawaban
```

Pada Machine Learning, mesin yang mencari aturannya sendiri dari contoh-contoh:

```
Data + Jawaban (contoh)  →  Aturan (dipelajari mesin)
```

Contoh: kita tidak menulis aturan "kalau ada kata *gratis* berarti spam". Kita memberi ribuan contoh email spam dan bukan spam, lalu mesin menemukan polanya sendiri.

---

## Alur Kerja ML

```
 ┌──────────┐     ┌──────────────────────────────────────┐
 │ 1. DATA  │ ──► │ 2. FEATURE ENGINEERING               │
 └──────────┘     │                                      │
                  │  a. Preprocessing                    │
                  │     bersihkan data mentah            │
                  │            │                         │
                  │            ▼                         │
                  │  b. Feature Extraction               │
                  │     ubah data jadi angka (fitur)     │
                  │            │                         │
                  │            ▼                         │
                  │  c. Feature Selection                │
                  │     pilih fitur yang berguna         │
                  │            │                         │
                  │            ▼                         │
                  │  d. Feature Scaling                  │
                  │     samakan skala angka              │
                  └──────────────────────────────────────┘
                              │  fitur x (vektor angka)
                              ▼
        ┌───────────────────────────────────────────┐
        │ 3. ALGORITMA (Model)                      │
        │    forward pass:                          │
        │                                           │
        │   z = w·x + b                             │◄───┐
        │   (dot product: bobot × input + bias)     │    │ bobot & bias baru
        │            │                              │    │
        │            ▼                              │    │
        │   σ(z) = fungsi aktivasi                  │    │
        │   (sigmoid / softmax)                     │    │
        │            │                              │    │
        │            ▼                              │    │
        │   PREDIKSI (mis. 0.65 = 65% lulus)        │    │
        └───────────────────────────────────────────┘    │
                              │                          │
                              ▼                          │
                  ┌───────────────────────┐        ┌─────┴────────────────┐
                  │ 4. LOSS FUNCTION      │        │ 6. OPTIMIZER         │
                  │ prediksi vs jawaban   │        │ update bobot & bias  │
                  │ asli → seberapa salah │        └──────────────────────┘
                  └───────────────────────┘              ▲
                              │                          │
                              ▼                          │
                  ┌───────────────────────┐              │
                  │ 5. GRADIENT DESCENT   │──────────────┘
                  │ arah perbaikan bobot  │
                  └───────────────────────┘

        Putaran 3 → 4 → 5 → 6 → 3 diulang terus.
        Satu kali seluruh data selesai dilewati = 1 EPOCH (7).
```

---

### 1. Data

Bahan utama ML. Tanpa data, mesin tidak bisa belajar apa pun.

- Data bisa berupa teks, angka, gambar, suara, dll.
- Semakin banyak dan berkualitas datanya, semakin baik hasil belajarnya.
- Prinsipnya: *garbage in, garbage out*. Data jelek menghasilkan model jelek.

> Contoh di kode kita: `korpus_mentah` berisi 22 kalimat bahasa Indonesia.

---

### 2. Feature Engineering (dan Preprocessing)

Mengolah data mentah menjadi bentuk yang bisa dipahami mesin, yaitu **angka**. Feature engineering adalah **payung besar** yang isinya beberapa tahap:

| Tahap | Tugasnya | Contoh |
|-------|----------|--------|
| **a. Preprocessing** | Membersihkan data mentah | Huruf kecil, hapus tanda baca, tokenisasi, hapus stopword |
| **b. Feature Extraction** | **Membuat** fitur angka dari data mentah | TF-IDF, Word2Vec, landmark tangan MediaPipe |
| **c. Feature Selection** | **Memilih** fitur yang berguna, membuang sisanya | Buang kata yang terlalu jarang muncul |
| **d. Feature Scaling** | Menyamakan skala angka antar fitur | `StandardScaler`, normalisasi L2 |

```
"Raja adalah pemimpin!"                         ← data mentah
        │ a. preprocessing
        ▼
['raja', 'pemimpin']                            ← sudah bersih
        │ b. feature extraction (mis. TF-IDF)
        ▼
[0.71, 0.00, 0.71, 0.00, ...]                   ← sudah jadi angka = FITUR
        │ c. selection + d. scaling
        ▼
siap masuk ke 3. MODEL
```

> Contoh di kode kita: fungsi `bersihkan_dan_tokenisasi()` mengubah
> `"Raja adalah pemimpin"` menjadi `['raja', 'adalah', 'pemimpin']`.
>
> Penjelasan lengkap (termasuk beda extraction vs selection): [feature_engineering.md](feature_engineering.md).

---

### 3. Algoritma (Model)

"Otak" yang belajar. Di dalamnya ada **bobot (weight)**, yaitu angka-angka yang akan terus disesuaikan selama belajar.

- Awalnya bobot diisi **acak**, jadi tebakan model masih ngawur.
- Model menerima input lalu mengeluarkan **prediksi**.

Contoh algoritma: Linear Regression, Decision Tree, Naive Bayes, SVM, Neural Network, Word2Vec.

> Contoh di kode kita: `Word2Vec(...)`. Bobotnya adalah vektor 50 angka untuk setiap kata.

#### Apa yang terjadi di dalam model sebelum masuk ke Loss?

Untuk model berbasis bobot (Logistic Regression, Neural Network), proses dari input sampai prediksi disebut **forward pass**:

```
input x
  │ × bobot, + bias      → z = w·x + b   (dot product)
  ▼
z (angka bebas, mis. 0.6)
  │ fungsi aktivasi       → sigmoid / softmax
  ▼
prediksi (probabilitas, mis. 0.65)  ──► baru masuk ke 4. LOSS FUNCTION
```

Jadi **sigmoid/softmax bukan langkah terpisah**. Fungsi ini adalah **bagian akhir dari model**, dan harus dijalankan sebelum loss karena loss seperti cross-entropy butuh input berupa probabilitas (0–1).

| Tugas | Aktivasi di output | Loss yang dipakai |
|-------|--------------------|-------------------|
| Klasifikasi 2 kelas | Sigmoid | Binary Cross-Entropy |
| Klasifikasi banyak kelas | Softmax | Cross-Entropy |
| Regresi (menebak angka) | Tanpa aktivasi (linear) | MSE |

> Penjelasan detail bobot, bias, dan sigmoid: [bobot_bias_sigmoid.md](bobot_bias_sigmoid.md). Dot product: [dot_product.md](dot_product.md).

---

### 4. Loss Function (Fungsi Kerugian)

Alat ukur **seberapa salah** prediksi model dibandingkan jawaban sebenarnya.

```
          jawaban asli (y)        prediksi model (ŷ)
          ────────────────        ──────────────────
 Data 1:        1          vs          0.95          → beda sedikit  → loss KECIL ✓
 Data 2:        1          vs          0.20          → beda jauh     → loss BESAR ✗
```

```
Loss besar  →  model masih banyak salah
Loss kecil  →  model sudah bagus
```

Tujuan belajar = **membuat loss sekecil mungkin**.

Contoh loss function:
- **MSE (Mean Squared Error)**: untuk regresi (menebak angka)
- **Cross-Entropy**: untuk klasifikasi (menebak kategori)

#### Contoh Hitung MSE (untuk menebak angka)

Rumus: **selisihkan → kuadratkan → rata-ratakan**

$$\text{MSE} = \frac{1}{N}\sum (y - \hat{y})^2$$

Kasus: menebak nilai ujian (dalam puluhan) 3 mahasiswa.

```
            asli (y)   tebakan (ŷ)   selisih (y − ŷ)   dikuadratkan
 Mhs 1        3           2.5            0.5              0.25
 Mhs 2        5           5.0            0.0              0.00
 Mhs 3        2           4.0           −2.0              4.00
                                                        ───────── +
                                                 jumlah   4.25
                                     MSE = 4.25 ÷ 3  =    1.42
```

Kenapa dikuadratkan? Supaya selisih negatif tidak "membatalkan" selisih positif, dan kesalahan besar (−2.0 → 4.00) dihukum jauh lebih berat daripada kesalahan kecil (0.5 → 0.25).

#### Contoh Hitung Cross-Entropy (untuk menebak kelas)

Rumus (jika jawaban asli = 1): **loss = −ln(ŷ)**, yaitu minus logaritma natural dari probabilitas yang diberikan ke jawaban yang benar.

```
 Jawaban asli: LULUS (1)

 Model A menebak 0.95 lulus  →  loss = −ln(0.95) = 0.05   ← yakin & benar, loss kecil ✓
 Model B menebak 0.20 lulus  →  loss = −ln(0.20) = 1.61   ← salah, loss besar ✗
```

> Cara hitung `ln` di kalkulator: tombol **ln** (bukan log). Di Python: `math.log(0.95)`.

---

### 5. Gradient Descent

Cara mencari **arah perubahan bobot** supaya loss turun.

**Analogi:** kamu berada di atas gunung dalam keadaan gelap dan ingin turun ke lembah (loss terkecil). Kamu meraba tanah, mencari arah yang paling menurun, lalu melangkah sedikit ke arah itu. Ulangi terus sampai tiba di bawah.

```
 loss
  ▲
  │ ● ← mulai (bobot acak, loss besar)
  │  \
  │   ● ← langkah 1
  │    \
  │     ● ← langkah 2
  │      \
  │       ●     ← langkah 3
  │        \_●_/  ← lembah = loss terkecil (bobot terbaik)
  └──────────────────────────► bobot
```

- **Gradient** = kemiringan, yang menunjukkan ke arah mana loss naik.
- **Descent** = turun, jadi kita melangkah ke arah **berlawanan** gradient.
- **Learning rate** = besar langkahnya.
  - Terlalu besar: bisa melompati lembah.
  - Terlalu kecil: turunnya lama sekali.

```
 Learning rate PAS          Terlalu KECIL              Terlalu BESAR
 ●                          ●                          ●           ●
  \                         ●                           \         /
   ●                         ●                           \       /
    \                         ●                           \     ●
     ●                         ●  ...masih jauh            \   /
      \_●_/  sampai ✓           \___/                       \_/  melompat-lompat ✗
```

---

### 6. Optimizer (Pembaruan Bobot)

Bagian yang **benar-benar mengubah bobot** berdasarkan hasil gradient:

```
bobot_baru = bobot_lama - learning_rate × gradient
```

Contoh angka:

```
bobot_lama = 0.8      learning_rate = 0.1      gradient = 2.0

bobot_baru = 0.8 − (0.1 × 2.0)
           = 0.8 − 0.2
           = 0.6      ← bobot digeser sedikit ke arah loss yang lebih kecil
```

Setelah bobot diperbarui, alur **kembali lagi ke algoritma (langkah 3)**. Model menebak lagi dengan bobot baru, yang seharusnya lebih baik dari sebelumnya.

Contoh optimizer: **SGD** (Gradient Descent dasar), **Momentum**, **RMSProp**, **Adam** (paling populer).

> Catatan: gradient descent sendiri sebenarnya juga termasuk optimizer (yang paling dasar).
> Optimizer seperti Adam adalah versi yang lebih pintar, karena bisa mengatur besar langkahnya sendiri.

---

### 7. Epoch (Pengulangan)

**1 epoch = model sudah melihat SELURUH data sebanyak satu kali** (melewati putaran 3 → 4 → 5 → 6 untuk semua data).

Satu kali belajar belum cukup, jadi prosesnya diulang berkali-kali:

```
 Epoch 1   │█████████████████████████  loss 2.50  (masih banyak salah)
 Epoch 10  │████████████               loss 1.20
 Epoch 50  │████                       loss 0.40
 Epoch 200 │▌                          loss 0.05  (sudah pintar)
           └──────────────────────────
            semakin banyak epoch, loss semakin kecil
```

- Epoch **terlalu sedikit** → model belum cukup belajar (*underfitting*)
- Epoch **terlalu banyak** → model malah menghafal data, bukan memahami polanya (*overfitting*)

```
 loss
     │                                                        ● = loss data TRAINING
     │ ●                                                      ○ = loss data TESTING
     │                                                 ○
     │     ●                                   ○   ○          testing naik lagi
     │         ●                           ○                  = model mulai
     │             ○               ○   ○                        MENGHAFAL
     │             ●   ●   ○   ○
     │                     ●
     │                         ●   ●   ●
     │                                     ●   ●   ●   ●
     │
     └────────────────────────────────────────────────────────► epoch
                           ↑
                 titik berhenti terbaik
      ◄──── underfitting ────►◄─────────── overfitting ───────────►
```

> Contoh di kode kita: `epochs=200`, artinya Word2Vec membaca ulang 22 kalimat itu sebanyak 200 kali.

---

## Contoh Hitung Lengkap: Melihat Mesin Belajar dari Nol

Supaya langkah 3 sampai 7 terasa nyata, kita hitung manual model **paling sederhana**.

**Soal:** harga 1 buku tidak diketahui. Kita hanya punya 1 data: **beli 2 buku → bayar 6 (ribu)**. Mesin harus menemukan harga per buku sendiri.

- Model: $\hat{y} = w \times x$ (tebakan = harga per buku × jumlah buku)
- Jawaban yang benar sebenarnya $w = 3$, tapi **mesin tidak tahu**
- Loss: $(\hat{y} - y)^2$
- Gradient (rumus turunan, cukup dipakai saja): $2 \times (\hat{y} - y) \times x$
- Learning rate = 0.05

### Putaran 1

```
 3. MODEL      w awal ditebak asal = 1
               ŷ = 1 × 2 = 2                     (tebakan: bayar 2, padahal 6)

 4. LOSS       (2 − 6)² = (−4)² = 16             (masih salah besar)

 5. GRADIENT   2 × (2 − 6) × 2 = 2 × (−4) × 2 = −16
               negatif artinya: "w harus DINAIKKAN"

 6. OPTIMIZER  w_baru = w − learning_rate × gradient
                      = 1 − 0.05 × (−16)
                      = 1 + 0.8
                      = 1.8
```

### Putaran 2

```
 3. MODEL      ŷ = 1.8 × 2 = 3.6
 4. LOSS       (3.6 − 6)² = (−2.4)² = 5.76        ← turun dari 16!
 5. GRADIENT   2 × (−2.4) × 2 = −9.6
 6. OPTIMIZER  w = 1.8 − 0.05 × (−9.6) = 1.8 + 0.48 = 2.28
```

### Kalau diteruskan

```
 putaran    w        tebakan ŷ     loss
    1      1.00        2.00       16.00   ████████████████
    2      1.80        3.60        5.76   ██████
    3      2.28        4.56        2.07   ██
    4      2.57        5.14        0.75   ▊
    5      2.74        5.48        0.27   ▎
    6      2.84        5.69        0.10   ▏
   ...      ↓           ↓           ↓
           3.00        6.00        0.00   ← mesin "menemukan" harga buku = 3
```

**Inilah inti machine learning:** tebak → ukur salahnya → cari arah perbaikan → perbaiki sedikit → ulangi. Model sungguhan hanya punya bobot yang jauh lebih banyak (ribuan sampai miliaran), tapi caranya **sama persis**.

```python
# Cek sendiri di Python
w, x, y, lr = 1.0, 2, 6, 0.05
for putaran in range(1, 7):
    y_hat = w * x
    loss = (y_hat - y) ** 2
    grad = 2 * (y_hat - y) * x
    print(putaran, round(w, 2), round(y_hat, 2), round(loss, 2))
    w = w - lr * grad
```

---

## Hyperparameter

**Epoch** dan **learning rate** termasuk **hyperparameter**.

### Parameter vs Hyperparameter

| | **Parameter** | **Hyperparameter** |
|---|---|---|
| Contoh | Bobot (weight), bias | Epoch, learning rate, batch size |
| Siapa yang menentukan? | **Mesin** (dipelajari sendiri saat training) | **Manusia** (diatur sebelum training) |
| Kapan berubah? | Terus berubah tiap putaran oleh optimizer | Tetap selama training (kecuali diatur khusus) |
| Analogi | Isi otak siswa (pengetahuannya) | Aturan belajar: berapa lama dan seberapa cepat belajar |

```
   MANUSIA mengatur (hyperparameter)          MESIN mempelajari (parameter)
  ┌──────────────────────────────┐           ┌──────────────────────────────┐
  │ epoch = 200                  │           │ bobot  w = [0.6, 2.0, ...]   │
  │ learning rate = 0.01         │ ────────► │ bias   b = -4                │
  │ batch size = 32              │  training │                              │
  └──────────────────────────────┘           └──────────────────────────────┘
     ditentukan SEBELUM training               berubah SELAMA training
```

**Analogi:** kamu sedang memasak.
- **Parameter** = rasa masakan, yang berubah sendiri selama dimasak.
- **Hyperparameter** = besar api dan lama memasak, yang **kamu atur sendiri** sebelum mulai.

### Contoh Hyperparameter

| Hyperparameter | Artinya | Kalau terlalu kecil | Kalau terlalu besar |
|---|---|---|---|
| **Epoch** | Berapa kali seluruh data diulang | Belum cukup belajar (*underfitting*) | Menghafal data (*overfitting*), lama |
| **Learning rate** | Besar langkah saat memperbarui bobot | Belajar sangat lambat | Melompat-lompat, loss tidak turun |
| **Batch size** | Berapa data diproses sebelum bobot diperbarui | Proses lambat dan tidak stabil | Butuh memori besar |
| **Pilihan optimizer** | Cara memperbarui bobot: SGD, Adam, dll. | (bukan angka, tapi pilihan) | (bukan angka, tapi pilihan) |
| **Jumlah layer / neuron** | Ukuran model (pada neural network) | Model terlalu sederhana | Mudah overfitting |

### Bagaimana Memilih Hyperparameter?

Tidak ada rumus pasti, jadi kita **mencoba-coba (tuning)**:
1. Mulai dari nilai umum (misalnya learning rate `0.001`–`0.01`).
2. Latih model, lalu lihat hasilnya (loss dan akurasi).
3. Ubah nilainya, latih lagi, lalu bandingkan.
4. Pilih kombinasi terbaik.

Cara otomatisnya: **Grid Search** (mencoba semua kombinasi) atau **Random Search** (mencoba kombinasi acak).

### Hyperparameter di Kode Word2Vec Kita

```python
model_w2v = Word2Vec(
    sentences=korpus_token,
    vector_size=50,   # hyperparameter: ukuran vektor tiap kata
    window=4,         # hyperparameter: jumlah kata tetangga yang dilihat
    min_count=1,      # hyperparameter: minimal kemunculan kata
    sg=1,             # hyperparameter: pilihan algoritma (Skip-Gram)
    epochs=200,       # hyperparameter: jumlah pengulangan
    # alpha=0.025     # hyperparameter: learning rate (nilai default gensim)
)
```

Semua angka di atas **kita tentukan sendiri**. Yang dipelajari mesin (**parameter**) adalah isi vektor tiap kata, misalnya `model_w2v.wv['raja']`.

---

## Fungsi Aktivasi (Activation Function)

Fungsi aktivasi ada **di dalam algoritma/model (langkah 3)**, khususnya pada **neural network**.

### Cara Kerja Satu Neuron

```
  INPUT        BOBOT
  x1 ───────(× w1)───┐
                     │      ┌────────────────┐     ┌──────────────┐
  x2 ───────(× w2)───┼────► │ Σ  jumlahkan   │ ──► │   FUNGSI     │ ──► output
                     │      │    + bias (b)  │  z  │   AKTIVASI   │     f(z)
  x3 ───────(× w3)───┘      └────────────────┘     │  f(z)        │
                                                   └──────────────┘
        z = w1·x1 + w2·x2 + w3·x3 + b   (= dot product w·x + b)
```

1. Setiap input **dikali bobotnya**, lalu **dijumlahkan** dan ditambah bias. Hasilnya disebut `z`.
2. Nilai `z` dimasukkan ke **fungsi aktivasi**, lalu keluarlah output neuron.

**Analogi:** neuron itu seperti saklar lampu pintar. Jumlah bobot (`z`) adalah seberapa kuat tombolnya ditekan. Fungsi aktivasi menentukan **apakah lampu menyala, dan seberapa terang**.

### Apakah Fungsi Aktivasi = Menormalisasi Total Bobot?

**Tidak tepat.** Fungsi aktivasi **tidak mengubah bobot**. Yang diubahnya adalah **hasil penjumlahan** (`z`) menjadi output neuron. Bobot hanya diubah oleh **optimizer** (langkah 6).

Kesalahpahaman ini mungkin muncul karena **sebagian** fungsi aktivasi memang "memampatkan" hasilnya ke rentang tertentu, sehingga terlihat seperti normalisasi:
- **Sigmoid** memampatkan nilai berapa pun ke rentang **0 sampai 1**.
- **Softmax** mengubah beberapa output menjadi **peluang yang totalnya = 1** (100%).

Tapi itu hanya efek samping. **Tujuan utamanya adalah memberi sifat non-linear.**

#### Contoh Hitung ReLU dan Sigmoid

```
  z       ReLU(z) = max(0, z)       Sigmoid(z) = 1 / (1 + e^(−z))
 −2       max(0, −2) = 0            1 / (1 + 7.389) = 0.12
  0       max(0,  0) = 0            1 / (1 + 1)     = 0.50
  3       max(0,  3) = 3            1 / (1 + 0.050) = 0.95
```

ReLU sangat mudah: **negatif jadi 0, positif dibiarkan**.

### Kenapa Harus Non-Linear?

Tanpa fungsi aktivasi, neural network hanya terdiri dari **perkalian dan penjumlahan biasa (linear)**. Bertumpuk 100 layer pun, hasilnya tetap setara dengan **satu garis lurus**.

Padahal pola di dunia nyata (gambar, suara, bahasa) **berkelok-kelok, tidak lurus**. Fungsi aktivasi membuat model bisa "membengkokkan garis" sehingga bisa mempelajari pola yang rumit.

```
Tanpa aktivasi:   hanya bisa membuat garis lurus   ──────
Dengan aktivasi:  bisa membuat kurva rumit         ∿∿∿∿∿∿
```

### Fungsi Aktivasi yang Umum

| Nama | Rumus sederhana | Rentang output | Dipakai untuk |
|------|-----------------|----------------|---------------|
| **ReLU** | jika z < 0 → 0, selain itu → z | 0 sampai ∞ | Hidden layer (paling populer, cepat) |
| **Sigmoid** | 1 / (1 + e^(−z)) | 0 sampai 1 | Output **klasifikasi 2 kelas** (ya/tidak, spam/bukan) |
| **Tanh** | (e^z − e^(−z)) / (e^z + e^(−z)) | −1 sampai 1 | Hidden layer (versi lama, RNN) |
| **Softmax** | e^(z_i) / Σ e^(z_j) | 0 sampai 1, **total = 1** | Output **klasifikasi banyak kelas** (kucing/anjing/singa) |

```
     ReLU                       Sigmoid                      Tanh
 out                         out                          out
  │        /                 1 │        ──────            1 │        ──────
  │       /                    │      /                     │      /
  │      /                 0.5 │- - -/- - -               0 │- - -/- - - -
  │     /                      │    /                       │    /
  │____/______ z             0 │───        z             -1 │───          z
  0 jika z<0,                 selalu di antara 0–1        selalu di antara -1–1
  z jika z≥0
```

Contoh softmax: output mentah `[2.0, 1.0, 0.1]` diubah menjadi `[0.66, 0.24, 0.10]`. Artinya 66% kucing, 24% anjing, 10% singa, dan totalnya 100%.

**Cara hitungnya** (rumus: $e^{z_i} \div$ jumlah semua $e^{z}$, dengan $e \approx 2.718$):

```
 Langkah 1: pangkatkan e          Langkah 2: jumlahkan      Langkah 3: bagi dengan jumlah
 kucing  e^2.0 = 7.389                                      7.389 ÷ 11.212 = 0.66
 anjing  e^1.0 = 2.718            7.389 + 2.718 + 1.105     2.718 ÷ 11.212 = 0.24
 singa   e^0.1 = 1.105            = 11.212                  1.105 ÷ 11.212 = 0.10
                                                                     total = 1.00 ✓
```

Kenapa pakai $e^z$? Supaya semua hasil **positif** (skor negatif pun jadi positif), dan skor yang sedikit lebih besar mendapat porsi **jauh** lebih besar.

```
 skor mentah (z)            softmax              probabilitas
 kucing  2.0  ─┐                            ┌─►  kucing  0.66  ██████████████
 anjing  1.0  ─┼──────►  e^z / Σ e^z  ──────┼─►  anjing  0.24  █████
 singa   0.1  ─┘                            └─►  singa   0.10  ██
                                                 total = 1.00
```

### Di Mana Posisinya dalam Alur ML?

```
Data → Feature Engineering → [ Model: bobot × input → FUNGSI AKTIVASI → prediksi ] → Loss → Gradient → Optimizer → ...
```

Fungsi aktivasi juga ikut dihitung saat **gradient descent** (turunannya dipakai untuk menghitung gradient). Karena itulah ReLU populer: turunannya sangat sederhana (0 atau 1), sehingga training jadi cepat.

> Contoh di Word2Vec kita: lapisan tengahnya (yang menghasilkan vektor kata) **tidak memakai fungsi aktivasi** (linear).
> Lapisan output-nya memakai **sigmoid** (bawaan gensim dengan *negative sampling*) untuk menebak
> "apakah kata ini benar tetangga kata itu?" dengan jawaban berupa peluang 0 sampai 1.

---

## Ringkasan

| No | Tahap | Pertanyaan yang Dijawab |
|----|-------|-------------------------|
| 1 | **Data** | Belajar dari apa? |
| 2 | **Feature Engineering** | Bagaimana data diubah jadi angka yang berguna? |
| 3 | **Algoritma / Model** | Siapa yang belajar dan menebak? |
| 4 | **Loss Function** | Seberapa salah tebakannya? |
| 5 | **Gradient Descent** | Ke arah mana bobot harus diubah? |
| 6 | **Optimizer** | Bagaimana bobot diperbarui? |
| 7 | **Epoch** | Berapa kali seluruh proses diulang? |

**Kalimat kunci:**
> Mesin menebak → diukur salahnya (loss) → dicari arah perbaikan (gradient descent) → bobot diperbarui (optimizer) → menebak lagi → diulang per **epoch** sampai loss kecil.
>
> **Bobot** dipelajari mesin (parameter). **Epoch, learning rate, dll.** diatur manusia (hyperparameter).

---

## Hubungan dengan Kode Word2Vec Kita

| Konsep ML | Di [word2vec_google_colab.ipynb](../02_word2vec/word2vec_google_colab.ipynb) |
|-----------|----------------------------------------------------------|
| Data | `korpus_mentah` (22 kalimat) |
| Feature Engineering | `bersihkan_dan_tokenisasi()` |
| Algoritma | `Word2Vec(sg=1)` (Skip-Gram, sebuah neural network sederhana) |
| Bobot | Vektor 50 dimensi tiap kata (`vector_size=50`) |
| Loss Function | Dihitung otomatis di dalam gensim (negative sampling) |
| Gradient Descent + Optimizer | Dihitung otomatis di dalam gensim (SGD) |
| Epoch | `epochs=200` |
| Fungsi Aktivasi | Lapisan tengah linear (tanpa aktivasi), output memakai sigmoid |
| Hyperparameter | `vector_size`, `window`, `min_count`, `sg`, `epochs`, `alpha` (learning rate) |
| Hasil belajar | `model_w2v.wv['raja']`, `similarity`, `most_similar`, grafik PCA |
