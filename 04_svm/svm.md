# SVM (Support Vector Machine)

SVM adalah algoritma **supervised learning** yang umumnya dipakai untuk **klasifikasi**, tapi juga bisa untuk regresi (disebut **SVR**).

## Ide Utama

SVM mencari **garis pemisah terbaik** antar kelas. Kalau datanya 2D, pemisahnya berupa garis. Kalau dimensinya lebih tinggi, pemisahnya disebut **hyperplane**.

Yang dianggap "terbaik" adalah hyperplane dengan **margin terbesar**, yaitu jarak paling lebar antara hyperplane dan titik data terdekat dari tiap kelas.

```
  Banyak garis BISA memisahkan,             SVM memilih garis dengan
  tapi mana yang terbaik?                   MARGIN (jalan) PALING LEBAR

   ○  ○    \    │    /    ●  ●              ○  ○        ┆     ┃     ┆    ●
     ○      \   │   /   ●                     ○         ○     ┃     ┆       ●
   ○   ○     \  │  /       ●                            ┆     ┃     ┆   ●
     ○        \ │ /      ●   ●              ○   ○       ┆     ┃     ●      ●
               \│/                            ○         ┆     ┃     ┆    ●
          garis A, B, C ... ?                  margin   ◄─────┼─────►
                                                         hyperplane
                                                        ↑           ↑
                                                    support vector
                                                    (titik di tepi jalan)
```

Titik yang paling dekat ke hyperplane (yang dalam kurung `[ ]`) disebut **support vectors**. Hanya titik-titik ini yang menentukan posisi hyperplane, makanya algoritmanya bernama "Support Vector" Machine.

## Konsep Penting

### 1. Kernel Trick
Kalau data tidak bisa dipisah dengan garis lurus, SVM memetakan data ke dimensi yang lebih tinggi supaya bisa dipisah.

```
 SEBELUM: data 1 dimensi (hanya sumbu x)

        ●    ●    ○    ○    ○    ●    ●
     ────────────────────────────────────► x
       -3   -2   -1    0    1    2    3

 ● di kiri dan kanan, ○ di tengah → TIDAK BISA dipisah dengan satu titik potong

 SESUDAH: tambah dimensi baru  x²  (kernel trick)
 x²
  9 │   ●                             ●
    │
    │
    │
    │
  4 │        ●                   ●
    │- - - - - - - - - - - - - - - - - - -  ← garis lurus BISA memisahkan!
    │
  1 │             ○         ○
  0 │                  ○
    └────────────────────────────────────► x
       -3   -2   -1    0    1    2    3
```

Kernel melakukan "penambahan dimensi" ini secara otomatis dan efisien. Kernel yang umum dipakai:

| Kernel | Kapan dipakai |
|--------|---------------|
| `linear` | Data yang terpisah secara linear |
| `rbf` (Gaussian) | Paling sering dipakai dan jadi default |
| `poly` | Polinomial |

### 2. Parameter C
Mengatur seberapa ketat model menghukum kesalahan klasifikasi.
- **C besar**: margin sempit dan berusaha tidak ada data yang salah, sehingga lebih rawan **overfitting**.
- **C kecil**: margin lebar dan lebih toleran terhadap kesalahan, sehingga model lebih general.

```
        C KECIL (toleran)                           C BESAR (ketat)

  ○         ┆       ┃       ┆   ●               ○       ┆ ┃ ┆                 ●
     ○      ┆   ●   ┃       ┆      ●               ○    ┆ ┃ ●                    ●
   ○        ┆       ┃       ┆    ●               ○      ┆ ┃ ┆                  ●
       ○    ┆       ┃       ┆       ●                ○  ┆ ┃ ┆                     ●
            ◄──── margin ───►                           ◄───►

  1 titik ● boleh masuk jalan,                  margin dipersempit supaya ●
  margin tetap lebar                            itu tidak salah posisi
  → lebih general ✓                             → rawan overfitting ✗
```

### 3. Gamma (khusus kernel RBF)
Mengatur seberapa jauh pengaruh tiap titik data. Gamma yang terlalu besar membuat model rawan overfitting.

```
        GAMMA KECIL                                 GAMMA BESAR
   (pengaruh tiap titik luas)                 (pengaruh tiap titik sempit)

   ○  ○  ○    ╭────────────╮                  ○  ○  ○    ╭───╮  ╭───╮
   ○  ○  ○    │ ●   ●   ●  │                  ○  ○  ○    │ ● │  │ ● │
   ○  ○  ○    │ ●   ●   ●  │                  ○  ○  ○    ╰───╯  ╰───╯
   ○  ○  ○    ╰────────────╯                  ○  ○  ○    ╭───╮  ╭───╮
                                                         │ ● │  │ ● │
                                                         ╰───╯  ╰───╯

   batas halus, satu wilayah                  batas mengelilingi tiap titik
   → general ✓                                → menghafal (overfitting) ✗
```

## Contoh Hitung Manual

### 1. Menentukan Kelas: Lihat Tanda + atau −

Hyperplane SVM juga memakai rumus $w \cdot x + b$ (lihat [dot_product.md](../00_konsep_dasar/dot_product.md)). Bedanya dengan Logistic Regression, SVM **tidak** memakai sigmoid. SVM cukup melihat **tandanya**:

$$\text{kelas} = \begin{cases} ● & \text{jika } w \cdot x + b > 0 \\ ○ & \text{jika } w \cdot x + b < 0 \end{cases}$$

Misalnya hasil training memberi $w = [1, 1]$ dan $b = -4$, jadi hyperplane-nya adalah garis $x_1 + x_2 = 4$.

```
 titik (x1, x2)   w·x + b = 1·x1 + 1·x2 − 4     tanda    kelas
 (1, 1)           1 + 1 − 4 = −2                 −        ○
 (3, 3)           3 + 3 − 4 = +2                 +        ●
 (4, 1)           4 + 1 − 4 = +1                 +        ●
 (2, 2)           2 + 2 − 4 =  0                 0        tepat di garis (ragu-ragu)
```

```
 x2
  4 │ ╲
    │    ╲
  3 │       ╲           ● (3,3)
    │          ╲
  2 │             ◆ (2,2) tepat di garis
    │                ╲
  1 │       ○ (1,1)     ╲     ● (4,1)
    │                      ╲
  0 │                         ╲
    └──────────────────────────────► x1
      0     1     2     3     4
    garis ╲ : x1 + x2 = 4  (hyperplane)
    ○ di bawah garis (hasil −),  ● di atas garis (hasil +)
```

Semakin jauh angkanya dari 0, semakin "yakin" SVM dengan jawabannya.

### 2. Menghitung Lebar Margin

Dalam SVM, support vector adalah titik yang hasilnya **tepat +1 atau −1**. Lebar margin dihitung dengan:

$$\text{margin} = \frac{2}{\|w\|}$$

```
 Langkah 1: panjang w    ‖w‖ = √(1² + 1²) = √2 = 1.414
 Langkah 2: margin       2 ÷ 1.414 = 1.414

 Cek: support vector ○ di (1.5, 1.5) → 1.5 + 1.5 − 4 = −1 ✓
      support vector ● di (2.5, 2.5) → 2.5 + 2.5 − 4 = +1 ✓
      jarak keduanya = √(1² + 1²) = 1.414 ✓  (sama dengan rumus)
```

Artinya: **w yang kecil menghasilkan margin yang lebar.** Itulah yang dicari SVM saat training, yaitu w sekecil mungkin tapi semua titik tetap di sisi yang benar.

### 3. Menghitung Kernel RBF (dan Pengaruh Gamma)

Kernel RBF mengukur **kemiripan dua titik** berdasarkan jaraknya:

$$K(a, b) = e^{-\gamma \cdot \text{jarak}^2}$$

Contoh titik $a = (1, 1)$ dan $b = (2, 2)$:

```
 Langkah 1: jarak²  = (2 − 1)² + (2 − 1)² = 1 + 1 = 2

 Langkah 2: gamma KECIL (γ = 0.5)
            K = e^(−0.5 × 2) = e^(−1)  = 0.37         ← masih dianggap "cukup mirip"

            gamma BESAR (γ = 5)
            K = e^(−5 × 2)   = e^(−10) = 0.00005      ← dianggap "sama sekali tidak mirip"
```

Ini menjelaskan visual gamma di atas. Dengan gamma besar, titik yang sedikit saja berjauhan sudah dianggap asing, sehingga batasnya mengelilingi tiap titik (overfitting).

## Contoh di Python (scikit-learn)

```python
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

model = make_pipeline(StandardScaler(), SVC(kernel='rbf', C=1.0, gamma='scale'))
model.fit(X_train, y_train)
print(model.score(X_test, y_test))
```

> **Penting:** SVM **sensitif terhadap skala fitur**, jadi selalu lakukan scaling (misalnya dengan `StandardScaler`) sebelum training.

## Kelebihan dan Kekurangan

| Kelebihan | Kekurangan |
|-----------|------------|
| Bekerja baik di data berdimensi tinggi | Lambat untuk dataset sangat besar (puluhan ribu sampel lebih) |
| Efektif walaupun datanya sedikit | Perlu tuning C dan gamma |
| Tahan overfitting kalau parameternya tepat | Tidak langsung menghasilkan probabilitas |

## Kaitan dengan Proyek BISINDO

SVM cocok jadi **baseline** untuk klasifikasi gestur. Misalnya, ekstrak koordinat landmark tangan dengan MediaPipe, lalu klasifikasikan dengan SVM. Dataset seperti ini biasanya tidak terlalu besar, dan di situlah SVM kuat.

```
 ┌─────────┐   feature extraction   ┌──────────────┐  feature   ┌─────────────┐     ┌──────────┐
 │  video  │ ─────────────────────► │ 63 angka     │  scaling   │ SVC (RBF)   │ ──► │ huruf    │
 │ isyarat │   MediaPipe Hands      │ (21 titik ×  │ ─────────► │ cari hyper- │     │ "A"      │
 └─────────┘                        │  x, y, z)    │ Standard-  │ plane antar │     └──────────┘
                                    └──────────────┘ Scaler     │ huruf       │
                                                                └─────────────┘
```

Lihat juga: [Logistic Regression](../05_logistic_regression/logistic_regression.md) untuk perbandingan.
