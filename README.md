# Catatan Kuliah Machine Learning

Urutan belajar yang disarankan: mulai dari folder `00` lalu lanjut ke folder berikutnya.

## [web_belajar_ml/](web_belajar_ml/index.html) — Web Interaktif
Buka **`web_belajar_ml/index.html`** (klik dua kali, tanpa internet, tanpa install). Isinya 14 bab dari dasar sampai Word2Vec. Tiap bab punya analogi, rumus, langkah hitung yang angkanya berubah langsung saat input diubah, grafik interaktif (geser slider, klik/drag titik), kuis, dan progres belajar yang tersimpan otomatis.

## [00_konsep_dasar/](00_konsep_dasar/)
| File | Isi |
|------|-----|
| [konsep_dasar_ml.md](00_konsep_dasar/konsep_dasar_ml.md) | Apa itu ML dan alurnya (dengan diagram visual): Data → Feature Engineering (preprocessing, extraction, selection, scaling) → Algoritma → Loss → Gradient Descent → Optimizer → Epoch, plus hyperparameter dan fungsi aktivasi. **Contoh hitung:** MSE, cross-entropy, softmax, ReLU/sigmoid, dan 1 model belajar dari nol (gradient descent manual) |
| [feature_engineering.md](00_konsep_dasar/feature_engineering.md) | Fitur, label, feature engineering, beda feature extraction vs selection, contoh ekstraksi landmark BISINDO. **Contoh hitung:** Min-Max Scaling dan StandardScaler |
| [bobot_bias_sigmoid.md](00_konsep_dasar/bobot_bias_sigmoid.md) | Bobot, bias, dan sigmoid dengan satu contoh hitung lengkap (prediksi lulus ujian), sigmoid langkah demi langkah, latihan 3 mahasiswa |
| [dot_product.md](00_konsep_dasar/dot_product.md) | Dot product: cara hitung, arti geometris, cosine similarity, dan pemakaiannya di neuron, regresi, SVM, Word2Vec. **Contoh hitung:** cosine similarity |

## [01_tfidf/](01_tfidf/)
| File | Isi |
|------|-----|
| [tfidf_google_colab.ipynb](01_tfidf/tfidf_google_colab.ipynb) | Praktikum TF-IDF (Google Colab) |
| [tfidf_script.py](01_tfidf/tfidf_script.py) | Versi script Python |
| [penjelasan_library.md](01_tfidf/penjelasan_library.md) | Penjelasan library yang dipakai (PySastrawi, scikit-learn, dll.), peta library per tahap. **Contoh hitung:** TF-IDF dan cosine similarity manual |

## [02_word2vec/](02_word2vec/)
| File | Isi |
|------|-----|
| [word2vec.md](02_word2vec/word2vec.md) | Konsep Word2Vec (word embedding), CBOW vs Skip-Gram. **Contoh hitung:** analogi raja − pria + wanita, cosine similarity, pembuatan pasangan latih Skip-Gram |
| [word2vec_google_colab.ipynb](02_word2vec/word2vec_google_colab.ipynb) | Praktikum Word2Vec (Google Colab), termasuk visualisasi PCA |
| [word2vec_script.py](02_word2vec/word2vec_script.py) | Versi script Python (tanpa visualisasi) |
| [Salinan_dari_MLday2.ipynb](02_word2vec/Salinan_dari_MLday2.ipynb) | Notebook kelas ML Day 2 (Word2Vec + NLTK) |

## [03_naive_bayes/](03_naive_bayes/)
| File | Isi |
|------|-----|
| [naive_bayes.md](03_naive_bayes/naive_bayes.md) | Konsep Naive Bayes, Teorema Bayes, contoh hitung manual deteksi spam, dan kode scikit-learn |

## [04_svm/](04_svm/)
| File | Isi |
|------|-----|
| [svm.md](04_svm/svm.md) | Konsep SVM: hyperplane, margin, support vectors, kernel trick, parameter C dan gamma, kode scikit-learn. **Contoh hitung:** menentukan kelas, lebar margin, kernel RBF |

## [05_logistic_regression/](05_logistic_regression/)
| File | Isi |
|------|-----|
| [logistic_regression.md](05_logistic_regression/logistic_regression.md) | Konsep Logistic Regression: sigmoid, threshold, log loss, multi-kelas, kode scikit-learn, perbandingan dengan SVM. **Contoh hitung:** 3 putaran training (sigmoid, loss, gradient, update bobot) |
