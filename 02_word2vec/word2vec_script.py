import re
import numpy as np
import pandas as pd
from gensim.models import Word2Vec
from sklearn.decomposition import PCA

# 1. Menyiapkan Korpus Kalimat
korpus_mentah = [
    # Hubungan Kerajaan & Gender
    "raja adalah pemimpin pria di sebuah kerajaan besar",
    "ratu adalah pemimpin wanita di sebuah kerajaan besar",
    "pangeran adalah putra dari raja dan ratu istana",
    "putri adalah putri dari raja dan ratu istana",
    "seorang raja dan ratu memerintah istana megah kerajaan",
    "pria dan wanita memiliki hak yang sama sebagai manusia",
    "pria adalah laki laki dewasa sedangkan wanita adalah perempuan dewasa",
    "ayah adalah pria kepala keluarga dan ibu adalah wanita pengatur rumah tangga",
    "kakek dan nenek merawat cucu mereka dengan penuh kasih sayang",
    "ayah dan ibu menyayangi anak laki laki dan anak perempuan mereka",

    # Hubungan Teknologi & Pemrograman
    "python adalah bahasa pemrograman populer untuk data science dan machine learning",
    "programmer menulis kode menggunakan bahasa python untuk membangun aplikasi",
    "machine learning dan deep learning adalah cabang utama dari kecerdasan buatan",
    "komputer dan laptop digunakan oleh programmer untuk komputasi data",
    "algoritma kecerdasan buatan memproses data besar dalam sistem komputer modern",
    "data science membutuhkan pemahaman statistik matematika dan pemrograman python",
    "model machine learning belajar mengenali pola data secara otomatis",

    # Hubungan Hewan
    "kucing adalah hewan mamalia lucu pemakan daging",
    "anjing adalah hewan mamalia setia yang sering dipelihara manusia",
    "kucing dan anjing merupakan hewan peliharaan populer di rumah",
    "singa dan harimau adalah hewan buas pemakan daging di hutan",
    "hewan mamalia seperti kucing anjing singa dan harimau melahirkan anak"
]

# 2. Preprocessing & Tokenisasi Teks
def bersihkan_dan_tokenisasi(kalimat):
    kalimat = kalimat.lower()
    kalimat = re.sub(r'[^a-z\s]', ' ', kalimat)
    return kalimat.split()

korpus_token = [bersihkan_dan_tokenisasi(k) for k in korpus_mentah]

print("=== CONTOH TOKENISASI ===")
print("Kalimat 1:", korpus_token[0])
print(f"Total kalimat: {len(korpus_token)}")

# 3. Melatih Model Word2Vec (Gensim)
model_w2v = Word2Vec(
    sentences=korpus_token,
    vector_size=50,       # Dimensi vektor kata
    window=4,             # Jarak konteks kata
    min_count=1,          # Minimal kemunculan kata
    sg=1,                 # 1 = Skip-Gram, 0 = CBOW
    epochs=200,           # Jumlah iterasi pelatihan
    seed=42,
    workers=4
)

print("\n=== MODEL WORD2VEC SELESAI DILATIH ===")
print(f"Jumlah kosakata yang dipelajari: {len(model_w2v.wv.index_to_key)}")

# 4. Eksplorasi Vektor Kata
vektor_raja = model_w2v.wv['raja']
print(f"\nBentuk vektor kata 'raja': {vektor_raja.shape} dimensi")
print("5 nilai pertama vektor 'raja':", np.round(vektor_raja[:5], 4))

# 5. Cosine Similarity Antar Kata
print("\n=== KEMIRIPAN KOSINUS (COSINE SIMILARITY) ===")
pasangan = [
    ("raja", "ratu"),
    ("ayah", "ibu"),
    ("kucing", "anjing"),
    ("python", "programmer"),
    ("raja", "komputer")
]
for k1, k2 in pasangan:
    skor = model_w2v.wv.similarity(k1, k2)
    print(f"Kemiripan '{k1}' & '{k2}': {skor:.4f}")

# 6. Kata Paling Mirip (Most Similar)
print("\n=== KATA PALING MIRIP DENGAN 'raja' ===")
for kata, skor in model_w2v.wv.most_similar("raja", topn=3):
    print(f"  - {kata:<12}: {skor:.4f}")

# 7. Analogi Vektor (Aritmatika Semantik): Raja - Pria + Wanita = Ratu
print("\n=== ANALOGI VEKTOR: Raja - Pria + Wanita ===")
hasil_analogi = model_w2v.wv.most_similar(
    positive=["raja", "wanita"],
    negative=["pria"],
    topn=3
)
for kata, skor in hasil_analogi:
    print(f"  -> {kata:<12}: {skor:.4f}")

# 8. Outlier Detection (Doesn't Match)
outlier = model_w2v.wv.doesnt_match(["kucing", "anjing", "singa", "komputer"])
print(f"\nKata yang tidak cocok dari ['kucing', 'anjing', 'singa', 'komputer']: '{outlier}'")
