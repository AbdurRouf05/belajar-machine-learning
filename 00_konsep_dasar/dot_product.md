# Dot Product (Perkalian Titik)

Dot product adalah operasi untuk mengalikan **dua vektor** dan menghasilkan **satu angka** (skalar). Ini salah satu operasi paling dasar di machine learning.

## Cara Menghitung

Kalikan elemen yang posisinya sama, lalu **jumlahkan semuanya**:

$$\mathbf{a} \cdot \mathbf{b} = a_1b_1 + a_2b_2 + \dots + a_nb_n$$

**Contoh:**

```
 a = [  1     2     3  ]
        ×     ×     ×          ① kalikan yang posisinya sama
 b = [  4     5     6  ]
        ↓     ↓     ↓
     [  4    10    18  ]
        └─────┼─────┘          ② jumlahkan semuanya
              ▼
             32                ← hasil: SATU angka (skalar)
```

> Syarat: kedua vektor harus punya **panjang (dimensi) yang sama**.

## Arti Geometris: Mengukur "Kemiripan Arah"

Dot product juga bisa ditulis dengan sudut $\theta$ di antara dua vektor:

$$\mathbf{a} \cdot \mathbf{b} = \|\mathbf{a}\| \, \|\mathbf{b}\| \cos\theta$$

| Hasil dot product | Artinya |
|-------------------|---------|
| **Positif besar** | Arah kedua vektor mirip (sudut kecil) |
| **Nol** | Tegak lurus, tidak berhubungan (sudut 90°) |
| **Negatif** | Arahnya berlawanan (sudut > 90°) |

```
   SEARAH                    TEGAK LURUS                BERLAWANAN
   a · b  POSITIF            a · b = 0                  a · b  NEGATIF

          b                        b
         ↗                         ↑
        /                          │
       /  sudut kecil              │ 90°
      ●──────────► a               ●──────────► a       b ◄──────●──────► a
                                                            180°

   "mirip"                   "tidak berhubungan"        "berlawanan"
```

## Cosine Similarity

Kalau dot product dibagi panjang kedua vektor, hasilnya hanya mengukur **arah** dan tidak dipengaruhi besar vektor:

$$\text{cosine similarity} = \frac{\mathbf{a} \cdot \mathbf{b}}{\|\mathbf{a}\| \, \|\mathbf{b}\|}$$

Nilainya berada di rentang **-1 sampai 1**.

#### Contoh Hitung Cosine Similarity

Pakai vektor yang sama: `a = [1, 2, 3]` dan `b = [4, 5, 6]`

```
 Langkah 1: dot product (sudah dihitung di atas)
            a · b = 32

 Langkah 2: panjang vektor a  = akar dari jumlah kuadrat isinya
            ‖a‖ = √(1² + 2² + 3²) = √(1 + 4 + 9)   = √14 = 3.742

 Langkah 3: panjang vektor b
            ‖b‖ = √(4² + 5² + 6²) = √(16 + 25 + 36) = √77 = 8.775

 Langkah 4: bagi
            cosine = 32 ÷ (3.742 × 8.775)
                   = 32 ÷ 32.833
                   = 0.97        ← sangat dekat ke 1 → arahnya hampir sama
```

> "Panjang vektor" ($\|a\|$) itu sama dengan rumus Pythagoras, hanya saja untuk lebih dari 2 sisi.

```
  -1 ──────────────────── 0 ──────────────────── 1
  berlawanan          tidak mirip          arahnya sama
                           ▲                 ▲
                           │                 │
       "raja" vs "pesawat" ≈ 0.05     "raja" vs "ratu" ≈ 0.85
``` Inilah yang dipakai untuk mencari kata mirip di **Word2Vec** (`model.wv.most_similar(...)`) dan membandingkan dokumen **TF-IDF**.

## Di Mana Dot Product Dipakai dalam ML?

| Tempat | Bentuknya |
|--------|-----------|
| **Neuron / neural network** | $z = \mathbf{w} \cdot \mathbf{x} + b$ (input dikali bobot lalu dijumlah). Lihat [konsep_dasar_ml.md](konsep_dasar_ml.md) bagian "Cara Kerja Satu Neuron" |
| **Linear & Logistic Regression** | $z = \mathbf{w} \cdot \mathbf{x} + b$, lalu (untuk logistic) masuk ke sigmoid. Lihat [logistic_regression.md](../05_logistic_regression/logistic_regression.md) |
| **SVM** | Hyperplane: $\mathbf{w} \cdot \mathbf{x} + b = 0$. Kernel pada dasarnya adalah "dot product di dimensi yang lebih tinggi". Lihat [svm.md](../04_svm/svm.md) |
| **Word2Vec / TF-IDF** | Cosine similarity untuk mengukur kemiripan kata/dokumen |
| **Transformer (attention)** | Dot product antara Query dan Key untuk menentukan kata mana yang diperhatikan |

Jadi rumus $z = w_1x_1 + w_2x_2 + \dots + b$ yang muncul di banyak catatan lain **sebenarnya adalah dot product** $\mathbf{w} \cdot \mathbf{x}$ ditambah bias.

## Contoh di Python (NumPy)

```python
import numpy as np

a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(np.dot(a, b))   # 32
print(a @ b)          # 32 (cara singkat)

# Cosine similarity
cos_sim = (a @ b) / (np.linalg.norm(a) * np.linalg.norm(b))
print(cos_sim)        # 0.9746... → arahnya sangat mirip
```

## Ringkasan

- Dot product = **kalikan per elemen, lalu jumlahkan**, dan hasilnya satu angka.
- Secara geometris mengukur **seberapa searah** dua vektor.
- Jadi dasar dari neuron, regresi, SVM, cosine similarity, sampai attention di Transformer.
