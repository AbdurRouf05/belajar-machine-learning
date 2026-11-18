# Bobot, Bias, dan Sigmoid

Ketiganya bekerja bersama di dalam satu neuron (juga di Logistic Regression):

```
   INPUT              × BOBOT          JUMLAH + BIAS           SIGMOID         HASIL
 jam belajar  x1 = 5  ──(× 0.6)──► 3.0 ─┐
                                        ├─► 4.6 ──(+ −4)──► z = 0.6 ──► σ(z) ──► 0.65
 kehadiran   x2 = 0.8 ──(× 2.0)──► 1.6 ─┘                                      = 65% lulus
```

Supaya mudah, semua penjelasan di bawah memakai **satu contoh yang sama**.

> **Contoh kasus:** memprediksi apakah mahasiswa **lulus** ujian.
> - $x_1$ = jam belajar = **5** jam
> - $x_2$ = kehadiran = **0.8** (80%)

---

## 1. Bobot (Weight, $w$)

**Bobot = seberapa penting sebuah fitur.** Setiap input punya bobotnya sendiri.

| Nilai bobot | Artinya |
|-------------|---------|
| Positif besar | Fitur ini sangat **mendorong** ke arah "ya" |
| Mendekati 0 | Fitur ini hampir **tidak berpengaruh** |
| Negatif | Fitur ini **menarik** ke arah "tidak" |

Misalnya hasil training memberi:
- $w_1 = 0.6$ (jam belajar)
- $w_2 = 2.0$ (kehadiran)

```
 seberapa penting?   (panjang bar = besar bobot)

 kehadiran    w2 = 2.0  ████████████████████   ← paling berpengaruh
 jam belajar  w1 = 0.6  ██████
 warna baju   w3 = 0.0  ▏                      ← tidak berpengaruh sama sekali
 main game    w4 = -1.5 ███████████████ (−)    ← menarik ke arah "tidak lulus"
```

**Analogi:** menghitung nilai akhir kuliah. UTS bobotnya 30%, UAS 40%, tugas 30%. Bedanya, di ML **bobot tidak ditentukan manusia**. Bobot **dipelajari mesin** dari data, mulai dari angka acak lalu terus diperbaiki oleh optimizer (lihat [konsep_dasar_ml.md](konsep_dasar_ml.md)).

---

## 2. Bias ($b$)

**Bias = angka tambahan yang menggeser hasil, tanpa bergantung pada input.**

Intuisinya sama dengan persamaan garis di SMA:

$$y = mx + c$$

- $m$ adalah **bobot** (kemiringan garis).
- $c$ adalah **bias** (titik potong, menggeser garis naik/turun).

Tanpa bias ($c = 0$), garis **wajib melewati titik (0, 0)**, sehingga model jadi kaku. Bias membuat garis bisa digeser ke posisi yang paling pas.

```
   TANPA bias: y = x                    DENGAN bias: y = x + 3
   (terpaksa lewat titik 0)             (garis digeser naik 3)

 y                                    y
 6 │           /                      6 │     /
 5 │         /                        5 │   /
 4 │       /                          4 │ /
 3 │     /                            3 ●  ← mulai dari 3 (= bias)
 2 │   /                              2 │
 1 │ /                                1 │
 0 ●──────────── x                    0 └──────────── x
   ↑ wajib lewat sini
```

Cara lain memahaminya: bias adalah **nilai awal/kecenderungan dasar**. Pada contoh ini, misalnya $b = -4$, yang berarti "secara default, cenderung tidak lulus, kecuali jam belajar dan kehadirannya cukup".

Bias juga **dipelajari mesin**, sama seperti bobot. Keduanya termasuk **parameter**.

> Catatan: "bias" di sini **berbeda** dengan "bias" dalam arti model yang berprasangka/tidak adil, dan berbeda juga dengan *bias* pada istilah *bias-variance tradeoff*.

### Menghitung $z$

$$z = w_1x_1 + w_2x_2 + b = (0.6 \times 5) + (2.0 \times 0.8) + (-4)$$
$$z = 3 + 1.6 - 4 = 0.6$$

Bagian $w_1x_1 + w_2x_2$ ini adalah **dot product** $\mathbf{w} \cdot \mathbf{x}$ (lihat [dot_product.md](dot_product.md)).

Masalahnya, $z = 0.6$ itu angka apa? Nilai $z$ bisa berapa saja (-100, 0.6, 57...), jadi belum bisa dibaca sebagai peluang. Di sinilah sigmoid dipakai.

---

## 3. Sigmoid ($\sigma$)

**Sigmoid = fungsi yang mengubah angka berapa pun menjadi angka antara 0 dan 1**, sehingga bisa dibaca sebagai **probabilitas**.

$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

```
σ(z)
 1.0 |                 ________
     |              /
 0.5 |- - - - - - -/- - - - - -
     |           /
 0.0 |________/
     +-----------+-------------→ z
                 0
```

| $z$ | $\sigma(z)$ | Artinya |
|-----|-------------|---------|
| -5 | 0.007 | Hampir pasti "tidak" |
| -2 | 0.12 | Cenderung "tidak" |
| **0** | **0.5** | Ragu-ragu (50:50) |
| 2 | 0.88 | Cenderung "ya" |
| 5 | 0.993 | Hampir pasti "ya" |

Sifat penting:
- $z$ besar positif menghasilkan nilai mendekati 1.
- $z$ besar negatif menghasilkan nilai mendekati 0.
- $z = 0$ menghasilkan tepat 0.5.

### Lanjutan contoh

$$\sigma(0.6) = \frac{1}{1 + e^{-0.6}} = \frac{1}{1 + 0.549} \approx 0.65$$

Langkah demi langkah (bisa pakai kalkulator HP):

```
 Langkah 1: ubah tanda z           z = 0.6   →   −0.6
 Langkah 2: hitung e pangkat itu   e^(−0.6) = 0.549     (kalkulator: tombol eˣ, isi −0.6)
 Langkah 3: tambah 1               1 + 0.549 = 1.549
 Langkah 4: 1 dibagi hasilnya      1 ÷ 1.549 = 0.6457 ≈ 0.65
```

#### Latihan: Coba Ganti Inputnya

Bobot dan bias tetap ($w_1 = 0.6$, $w_2 = 2.0$, $b = -4$). Hanya mahasiswanya yang berbeda:

```
 Mahasiswa     jam   hadir    z = 0.6×jam + 2.0×hadir − 4        σ(z)    prediksi
 Rajin         8     1.0      4.8 + 2.0 − 4 =  2.8               0.94    LULUS
 Biasa         5     0.8      3.0 + 1.6 − 4 =  0.6               0.65    LULUS
 Malas         1     0.5      0.6 + 1.0 − 4 = −2.4               0.08    TIDAK LULUS
```

Perhatikan: semakin besar $z$, semakin dekat ke 1. Saat $z$ negatif, peluangnya di bawah 50%.

Artinya, peluang mahasiswa ini **lulus sekitar 65%**. Dengan threshold 0.5, model memprediksi **lulus**.

---

## Ringkasan

| Istilah | Singkatnya | Siapa yang menentukan? |
|---------|-----------|------------------------|
| **Bobot ($w$)** | Seberapa penting tiap fitur | Dipelajari mesin (parameter) |
| **Bias ($b$)** | Penggeser/nilai dasar, tidak bergantung input | Dipelajari mesin (parameter) |
| **Sigmoid ($\sigma$)** | Mengubah $z$ menjadi probabilitas 0–1 | Rumus tetap, dipilih manusia |

Alur lengkap contoh tadi:

```
x = [5, 0.8]
      │  × bobot [0.6, 2.0]
      ▼
3 + 1.6 = 4.6
      │  + bias (−4)
      ▼
z = 0.6
      │  sigmoid
      ▼
0.65 → 65% lulus → prediksi: LULUS
```

Alur ini **persis** cara kerja [Logistic Regression](../05_logistic_regression/logistic_regression.md) dan juga cara kerja satu neuron di neural network (kalau aktivasinya sigmoid).

## Contoh di Python

```python
import numpy as np

x = np.array([5, 0.8])     # input: jam belajar, kehadiran
w = np.array([0.6, 2.0])   # bobot
b = -4                     # bias

z = w @ x + b              # dot product + bias
p = 1 / (1 + np.exp(-z))   # sigmoid

print(z)  # 0.6
print(p)  # 0.6456...
```
