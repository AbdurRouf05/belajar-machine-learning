# Logistic Regression

Logistic Regression adalah algoritma **supervised learning** untuk **klasifikasi**, walaupun namanya pakai kata "regression". Biasanya dipakai untuk klasifikasi biner (2 kelas, misalnya ya/tidak atau spam/bukan spam), tapi bisa juga untuk banyak kelas.

## Ide Utama

```
 ┌──────────┐     ┌───────────────┐     ┌───────────┐     ┌─────────────┐     ┌─────────┐
 │ fitur x  │ ──► │ z = w·x + b   │ ──► │ sigmoid   │ ──► │ threshold   │ ──► │ KELAS   │
 │ [5, 0.8] │     │ z = 0.6       │     │ σ(z)=0.65 │     │ 0.65 ≥ 0.5? │     │ 1=lulus │
 └──────────┘     └───────────────┘     └───────────┘     └─────────────┘     └─────────┘
                    bagian "linear"       ubah jadi          ubah jadi
                    (sama dengan          PROBABILITAS       KEPUTUSAN
                    linear regression)
```

1. Hitung kombinasi linear dari fitur, sama seperti linear regression:

   $$z = w_1x_1 + w_2x_2 + \dots + w_nx_n + b$$

2. Masukkan $z$ ke **fungsi sigmoid** supaya hasilnya jadi **probabilitas** antara 0 dan 1:

   $$\sigma(z) = \frac{1}{1 + e^{-z}}$$

3. Tentukan kelas pakai **threshold**, biasanya 0.5:
   - $P \geq 0.5$ → kelas 1
   - $P < 0.5$ → kelas 0

```
P(y=1)
 1.0 |              ______
     |            /
 0.5 |- - - - - -/- - - -   ← threshold
     |          /
 0.0 |______/
     +----------------------→ z
```

## Kenapa Tidak Pakai Linear Regression Saja?

Output linear regression bisa bernilai berapa saja (misalnya -3 atau 7.5), jadi tidak bisa dibaca sebagai probabilitas. Sigmoid "menekan" output itu ke rentang 0–1.

```
   LINEAR REGRESSION                      LOGISTIC REGRESSION
   (garis lurus, tembus 0–1)              (kurva S, tetap di 0–1)

  P                                      P
 1.5│              /   ← "150%"?!       1.0│            ●●●●●●●●
 1.0│- - - - - - -/- - -                   │         ●
    │           /                       0.5│- - - - ●- - - - - -
    │         /                            │      ●
  0 │- - - -/- - - - - -                   │●●●●
-0.5│     /   ← "-50%"?!                 0.0└─────────────────── z
    └─────────────────── z
     peluang tidak masuk akal ✗            selalu valid sebagai peluang ✓
```

## Cara Training

Bobot $w$ dicari dengan meminimalkan **log loss** (binary cross-entropy):

$$L = -\frac{1}{N}\sum \left[y\log(\hat{y}) + (1-y)\log(1-\hat{y})\right]$$

Intinya: **semakin yakin tapi salah, semakin besar hukumannya.** Contoh jika jawaban asli = 1 (lulus):

```
 prediksi ŷ    loss = −log(ŷ)
   0.99        0.01   ▏                          yakin & benar  → hampir tanpa hukuman
   0.90        0.11   █
   0.50        0.69   ███████
   0.10        2.30   ███████████████████████
   0.01        4.61   ██████████████████████████████████████████████  yakin & SALAH → hukuman besar
```

Proses optimasinya biasanya pakai **gradient descent** atau solver seperti `lbfgs`.

```
 bobot acak → hitung prediksi → hitung log loss → gradient descent → bobot baru → ... (ulang)
              (lihat alur lengkap di 00_konsep_dasar/konsep_dasar_ml.md)
```

## Multi-kelas

Untuk lebih dari 2 kelas (misalnya huruf A–Z), ada dua pendekatan:
- **One-vs-Rest (OvR)**: latih satu model per kelas.
- **Multinomial (softmax)**: satu model langsung menghasilkan probabilitas untuk semua kelas. Ini default di scikit-learn.

```
           ONE-VS-REST                                 MULTINOMIAL (SOFTMAX)

         ┌─► model A: "A atau bukan?" → 0.80          ┌─► z_A = 2.0 ─┐
 fitur x ┼─► model B: "B atau bukan?" → 0.30   fitur x┼─► z_B = 1.0 ─┼─► softmax ─► A: 0.66
         └─► model C: "C atau bukan?" → 0.10          └─► z_C = 0.1 ─┘              B: 0.24
                                                                                    C: 0.10
         pilih yang tertinggi → A                    total = 1 → pilih tertinggi → A
```

## Contoh Hitung Lengkap: Logistic Regression Belajar

Pakai contoh "prediksi lulus" yang sama dengan [bobot_bias_sigmoid.md](../00_konsep_dasar/bobot_bias_sigmoid.md):

- Data: jam belajar = 5, kehadiran = 0.8, **jawaban asli: LULUS (y = 1)**
- Bobot awal: $w_1 = 0.6$, $w_2 = 2.0$, bias $b = -4$
- Learning rate = 0.1

Rumus gradient Logistic Regression ternyata **sangat sederhana** (hasil turunan sigmoid + log loss):

$$\text{gradient } w = (\hat{y} - y) \times x \qquad \text{gradient } b = \hat{y} - y$$

Artinya: **"selisih tebakan dengan jawaban" dikali inputnya.**

### Putaran 1

```
 ① HITUNG z         z = 0.6×5 + 2.0×0.8 + (−4)
                      = 3.0 + 1.6 − 4 = 0.6

 ② SIGMOID          ŷ = 1 ÷ (1 + e^(−0.6)) = 0.646        (tebakan: 64.6% lulus)

 ③ LOSS             loss = −ln(0.646) = 0.44

 ④ SELISIH          ŷ − y = 0.646 − 1 = −0.354            (negatif → tebakan terlalu rendah)

 ⑤ GRADIENT         grad w1 = −0.354 × 5   = −1.77
                    grad w2 = −0.354 × 0.8 = −0.28
                    grad b  = −0.354

 ⑥ UPDATE           w1 = 0.6  − 0.1 × (−1.77) = 0.6  + 0.177 = 0.777
                    w2 = 2.0  − 0.1 × (−0.28) = 2.0  + 0.028 = 2.028
                    b  = −4   − 0.1 × (−0.354)= −4   + 0.035 = −3.965
```

Perhatikan: karena jam belajar ($x_1 = 5$) nilainya besar, bobot $w_1$ berubah paling banyak. **Fitur yang lebih "berperan" pada kesalahan mendapat koreksi lebih besar.**

### Putaran 2 dan seterusnya

```
 putaran    w1      w2      b        z       ŷ (peluang lulus)    loss
    1      0.600   2.000  −4.000    0.60       0.646              0.44  ████
    2      0.777   2.028  −3.965    1.54       0.824              0.19  ██
    3      0.865   2.042  −3.947    2.01       0.882              0.13  █
   ...                                          → mendekati 1      → mendekati 0
```

Tebakan untuk mahasiswa ini makin yakin "lulus" (sesuai jawaban asli), dan loss terus turun. Dalam training sungguhan, langkah ini dilakukan untuk **semua** data sekaligus, lalu diulang per epoch.

```python
# Cek sendiri di Python
import math
x, y = [5, 0.8], 1
w, b, lr = [0.6, 2.0], -4.0, 0.1
for putaran in range(1, 4):
    z = w[0]*x[0] + w[1]*x[1] + b
    y_hat = 1 / (1 + math.exp(-z))
    loss = -math.log(y_hat)
    print(putaran, [round(v, 3) for v in w], round(b, 3), round(z, 2), round(y_hat, 3), round(loss, 2))
    selisih = y_hat - y
    w = [w[0] - lr*selisih*x[0], w[1] - lr*selisih*x[1]]
    b = b - lr*selisih
```

## Contoh di Python (scikit-learn)

```python
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, max_iter=1000))
model.fit(X_train, y_train)

print(model.score(X_test, y_test))      # akurasi
print(model.predict_proba(X_test[:1]))  # probabilitas tiap kelas
```

Parameter `C` adalah **kebalikan** dari kekuatan regularisasi. C kecil berarti regularisasi lebih kuat, jadi model lebih sederhana.

## Kelebihan dan Kekurangan

| Kelebihan | Kekurangan |
|-----------|------------|
| Sederhana, cepat, mudah diinterpretasi (bobot = pengaruh fitur) | Hanya bisa membuat batas keputusan **linear** |
| Langsung menghasilkan probabilitas | Kurang akurat kalau pola datanya kompleks atau non-linear |
| Bagus sebagai baseline | Sensitif terhadap fitur yang saling berkorelasi tinggi |

## Dibandingkan dengan SVM

| | Logistic Regression | SVM |
|---|---|---|
| Output | Probabilitas | Kelas (jarak ke hyperplane) |
| Batas keputusan | Linear | Linear atau non-linear (kernel) |
| Fokus | Semua titik data | Hanya support vectors |

Lihat juga: [SVM](../04_svm/svm.md)

## Kaitan dengan Proyek BISINDO

Logistic Regression bisa jadi **baseline paling sederhana** untuk klasifikasi landmark tangan. Hasilnya bisa dibandingkan dengan SVM. Kalau SVM (kernel RBF) jauh lebih akurat, berarti pola gesturnya non-linear.
