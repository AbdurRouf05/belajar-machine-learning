# Penjelasan Library yang Digunakan dalam Praktikum TF-IDF

Dokumen ini memuat ringkasan dan penjelasan mengenai library serta modul Python yang digunakan dalam implementasi TF-IDF dan sistem pencarian teks berbasis kemiripan kosinus.

## Peta: Library Mana Dipakai di Tahap Mana?

```
 "Kucing itu SANGAT lucu!!"                              ← teks mentah
          │
          │  re.sub()            hapus tanda baca, angka    ┐
          ▼                                                 │ PREPROCESSING
 "kucing itu sangat lucu"                                   │
          │                                                 │
          │  PySastrawi          hapus stopword             │
          ▼                                                 ┘
 "kucing lucu"
          │
          │  TfidfVectorizer     teks → vektor angka        ─  FEATURE EXTRACTION
          ▼
 [0.00, 0.71, 0.00, 0.71, ...]                            ← fitur
          │
          │  cosine_similarity   bandingkan query vs dokumen ─  SIMILARITY / PENCARIAN
          ▼
 [0.82, 0.10, 0.45]                                       ← skor tiap dokumen
          │
          │  pandas + numpy      urutkan & tampilkan tabel  ─  PENYAJIAN HASIL
          ▼
 Ranking: Dok 1 (0.82) > Dok 3 (0.45) > Dok 2 (0.10)
```

---

## 1. PySastrawi

### Deskripsi
PySastrawi adalah library Python yang dikembangkan khusus untuk pemrosesan teks (Natural Language Processing / NLP) dalam Bahasa Indonesia.

### Modul yang Digunakan
- `Sastrawi.StopWordRemover.StopWordRemoverFactory`: Pabrik (*factory class*) untuk membuat objek penghapus kata umum (*stopword*).

### Fungsi dalam Program
- **Stopword Removal**: Menghapus kata-kata umum dalam bahasa Indonesia (seperti "dan", "di", "yang", "untuk", "dari") yang sering muncul tetapi tidak membawa informasi substantif atau makna pembeda antar dokumen.

---

## 2. re (Regular Expression)

### Deskripsi
`re` adalah modul bawaan (*built-in module*) dari Python yang digunakan untuk mencocokkan, mencari, dan memanipulasi string berdasarkan pola (*pattern*) tertentu.

### Fungsi yang Digunakan
- `re.sub(pattern, replacement, string)`: Mengganti substring yang sesuai pola dengan teks baru.

### Fungsi dalam Program
- **Text Cleaning**: Menghapus tanda baca, angka, dan karakter khusus dengan pola `r'[^a-z\s]'`, sehingga hanya menyisakan huruf alfabet kecil dan spasi.

---

## 3. pandas (pd)

### Deskripsi
Pandas adalah library utama dalam ekosistem Python untuk analisis, manipulasi, dan visualisasi data berbentuk tabular.

### Struktur Data yang Digunakan
- `pd.DataFrame`: Struktur data dua dimensi berupa tabel dengan baris (*index*) dan kolom (*columns*).

### Fungsi dalam Program
- Menyusun teks mentah dan teks bersih ke dalam tabel yang rapi.
- Mengonversi matriks hasil TF-IDF menjadi tabel tabular agar nama baris (dokumen) dan nama kolom (kata/token) mudah dibaca dan dianalisis.
- Mengurutkan dan memformat hasil pencarian peringkat dokumen (*ranking*).

---

## 4. numpy (np)

### Deskripsi
NumPy (*Numerical Python*) adalah library komputasi ilmiah dasar di Python yang menyediakan dukungan untuk array multidimensi dan fungsi matematika tingkat tinggi.

### Fungsi dalam Program
- Mendukung komputasi numerik di balik layar pada Scikit-Learn dan Pandas.
- Menyediakan operasi manipulasi bentuk array seperti `.flatten()` untuk mengubah matriks hasil perhitungan similaritas menjadi array satu dimensi.

---

## 5. scikit-learn (sklearn)

Scikit-Learn adalah library machine learning paling populer di Python. Pada praktikum ini, terdapat dua modul utama yang dimanfaatkan:

### A. TfidfVectorizer (`sklearn.feature_extraction.text.TfidfVectorizer`)
Class ini berfungsi mengubah kumpulan dokumen teks mentah menjadi representasi matriks fitur numerik TF-IDF.

Tahapan yang dijalankan secara otomatis oleh `TfidfVectorizer`:
1. **Tokenisasi**: Memecah kalimat menjadi daftar kata-kata individual.
2. **Ekstraksi Kosakata (Vocabulary)**: Mengidentifikasi seluruh kata unik dari seluruh dokumen.
3. **Term Frequency (TF)**: Menghitung frekuensi kemunculan setiap kata dalam dokumen.
4. **Inverse Document Frequency (IDF)**: Menghitung bobot kelangkaan kata di seluruh korpus.
5. **L2 Normalization**: Menormalisasi vektor keluaran agar panjang vektor bernilai 1, sehingga panjang dokumen tidak mendistorsi bobot kata.

```
 TF  (Term Frequency)       = seberapa SERING kata muncul di dokumen INI
 IDF (Inverse Doc Frequency) = seberapa LANGKA kata di SEMUA dokumen
 TF-IDF = TF × IDF          → tinggi jika kata sering di dokumen ini TAPI jarang di dokumen lain

 Contoh 3 dokumen:
   Dok 1: "kucing lucu"     Dok 2: "kucing tidur"     Dok 3: "anjing lucu"

            kucing   lucu   tidur   anjing
          ┌────────┬──────┬───────┬────────┐
   Dok 1  │  0.71  │ 0.71 │  0    │  0     │   kucing & lucu sama-sama muncul di 2 dok
   Dok 2  │  0.61  │ 0    │  0.80 │  0     │   ← "tidur" lebih langka → bobot lebih besar
   Dok 3  │  0     │ 0.61 │  0    │  0.80  │   ← "anjing" lebih langka → bobot lebih besar
          └────────┴──────┴───────┴────────┘
           kolom = fitur (kata), baris = dokumen
```

#### Cara Menghitung Angka di Tabel (Contoh: Dok 2 "kucing tidur")

`TfidfVectorizer` di scikit-learn memakai rumus berikut (n = jumlah dokumen = 3, df = jumlah dokumen yang memuat kata itu):

$$\text{IDF} = \ln\left(\frac{1 + n}{1 + df}\right) + 1$$

```
 Langkah 1: TF = berapa kali kata muncul di Dok 2
            kucing = 1,  tidur = 1

 Langkah 2: IDF (kata yang langka → nilainya besar)
            kucing ada di 2 dokumen (Dok 1, Dok 2):  ln(4/3) + 1 = 0.288 + 1 = 1.288
            tidur  ada di 1 dokumen (Dok 2 saja):    ln(4/2) + 1 = 0.693 + 1 = 1.693

 Langkah 3: TF × IDF
            kucing = 1 × 1.288 = 1.288
            tidur  = 1 × 1.693 = 1.693

 Langkah 4: L2 normalisasi (bagi dengan panjang vektor supaya panjangnya = 1)
            panjang = √(1.288² + 1.693²) = √(1.659 + 2.866) = √4.525 = 2.127
            kucing  = 1.288 ÷ 2.127 = 0.61   ✓ sama dengan tabel
            tidur   = 1.693 ÷ 2.127 = 0.80   ✓ sama dengan tabel
```

Kesimpulannya: "tidur" mendapat bobot lebih besar karena kata itu **hanya** muncul di Dok 2, sehingga lebih bisa menjadi ciri khas Dok 2.

> Di buku teks sering ditulis rumus IDF yang lebih sederhana: $\log(n / df)$. Idenya sama, tapi angkanya akan sedikit berbeda dari hasil scikit-learn.

Method penting yang digunakan:
- `.fit_transform(dokumen)`: Mempelajari kosakata sekaligus mentransformasikan dokumen menjadi matriks TF-IDF.
- `.transform(query)`: Mentransformasikan teks baru (query pencarian) ke dalam ruang vektor yang sama tanpa mengubah kosakata yang sudah dipelajari.
- `.get_feature_names_out()`: Mengambil daftar nama kata/fitur sesuai urutan indeks kolom matriks.

### B. cosine_similarity (`sklearn.metrics.pairwise.cosine_similarity`)
Fungsi ini digunakan untuk menghitung nilai kemiripan (*similarity score*) antara dua vektor numerik berdasarkan sudut kosinus di antara keduanya.

### Fungsi dalam Program
- Menghitung seberapa dekat orientasi vektor kata kunci pencarian (*query*) terhadap setiap vektor dokumen.
- Menghasilkan nilai rentang antara 0 (tidak ada kemiripan sama sekali) hingga 1 (identik).

```
 query: "kucing lucu"
          │  cosine_similarity terhadap tiap dokumen
          ▼
   Dok 1 "kucing lucu"    ████████████████████  1.00   ← paling mirip
   Dok 2 "kucing tidur"   ████████▋             0.43
   Dok 3 "anjing lucu"    ████████▋             0.43
```

Cara hitung skor Dok 2 (vektor TF-IDF sudah panjangnya 1, jadi cosine = dot product saja):

```
 query "kucing lucu" = [anjing 0, kucing 0.71, lucu 0.71, tidur 0   ]
 Dok 2               = [anjing 0, kucing 0.61, lucu 0,    tidur 0.80]

 cosine = 0×0 + 0.71×0.61 + 0.71×0 + 0×0.80
        = 0.43     ← hanya kata "kucing" yang sama-sama ada
```

(Penjelasan cara kerja cosine similarity: [dot_product.md](../00_konsep_dasar/dot_product.md))

---

## Ringkasan Singkat

| Library / Modul | Peran Utama | Kategori |
| :--- | :--- | :--- |
| `PySastrawi` | Menghapus kata hubung/kata umum bahasa Indonesia | NLP Preprocessing |
| `re` | Menghapus tanda baca dan karakter non-alfabet | String Manipulation |
| `pandas` | Menampilkan matriks dan data dalam format tabel | Data Manipulation |
| `numpy` | Operasi komputasi array numerik | Numerical Computation |
| `TfidfVectorizer` (sklearn) | Menghitung bobot TF-IDF otomatis | Feature Extraction |
| `cosine_similarity` (sklearn) | Mengukur tingkat kemiripan dokumen dengan query | Similarity Metric |
