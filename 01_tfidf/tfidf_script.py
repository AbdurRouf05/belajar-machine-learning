import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# 1. Dataset Dokumen Contoh
dokumen = [
    "Kecerdasan buatan dan machine learning berkembang sangat pesat di era digital.",
    "Mahasiswa belajar machine learning untuk menyelesaikan tugas akhir dan skripsi.",
    "Python adalah bahasa pemrograman yang populer untuk data science dan machine learning.",
    "Teknologi kecerdasan buatan memudahkan pengolahan data dalam skala besar."
]

# Stopword sederhana (tanpa bergantung pada dependency luar)
STOPWORDS_ID = set([
    "dan", "di", "era", "untuk", "adalah", "yang", "dalam", "sangat"
])

def preprocess_teks(teks):
    teks = teks.lower()
    teks = re.sub(r'[^a-z\s]', '', teks)
    words = [w for w in teks.split() if w not in STOPWORDS_ID]
    return ' '.join(words)

dokumen_clean = [preprocess_teks(d) for d in dokumen]

print("=== DATASET BERSIH ===")
for i, d in enumerate(dokumen_clean, 1):
    print(f"Dokumen {i}: {d}")

# 2. Menggunakan Scikit-Learn (TfidfVectorizer)
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(dokumen_clean)
feature_names = vectorizer.get_feature_names_out()

df_sklearn = pd.DataFrame(
    tfidf_matrix.toarray(),
    columns=feature_names,
    index=[f'Dokumen {i+1}' for i in range(len(dokumen))]
)

print("\n=== HASIL TF-IDF DENGAN SCIKIT-LEARN ===")
print(df_sklearn.round(4))

# 3. Kata Kunci Utama per Dokumen
print("\n=== KATA KUNCI UTAMA SETIAP DOKUMEN ===")
for doc_name, row in df_sklearn.iterrows():
    top_words = row[row > 0].sort_values(ascending=False).head(3)
    print(f"\n{doc_name}:")
    for word, score in top_words.items():
        print(f"  - {word:<15}: {score:.4f}")

# 4. Contoh Cosine Similarity (Search Query)
query = "belajar bahasa python untuk data science"
query_clean = preprocess_teks(query)
query_vec = vectorizer.transform([query_clean])
similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

print(f"\n=== PENCARIAN RELEVANSI UNTUK QUERY: '{query}' ===")
for i, sim in enumerate(similarities, 1):
    print(f"Dokumen {i}: {sim:.4f}")
