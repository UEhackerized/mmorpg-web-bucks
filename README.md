# ⚔️ Metin2 Web Legacy: 3D Browser MMORPG

![Game Version](https://img.shields.io/badge/Version-1.0.0-gold)
![Tech Stack](https://img.shields.io/badge/Tech-React_%7C_Three.js_%7C_Zustand-blue)
![Open Source](https://img.shields.io/badge/Open_Source-❤️-red)

**Metin2 Web Legacy**, efsanevi MMORPG deneyimini modern web teknolojileriyle tarayıcıya taşıyan, yüksek performanslı bir 3D klon projesidir. **React**, **Three.js (Fiber/Drei)** ve **Zustand** kullanılarak sıfırdan inşa edilmiştir.
<img width="1295" height="744" alt="metin2nick" src="https://github.com/user-attachments/assets/7360030f-8c9d-46f9-8e95-b44f31cd0738" />

---


## 🎯 Projenin Amacı (Vision)

Bu projenin temel amacı, nostaljik MMORPG mekaniklerini modern tarayıcı standartlarına (WebGl/WebGPU) entegre ederek, **tamamen açık kaynaklı, modüler ve topluluk tarafından geliştirilebilir bir MMORPG altyapısı** oluşturmaktır. Sadece bir oyun değil; aynı zamanda karmaşık oyun mantığının, AI entegrasyonunun ve 3D grafik optimizasyonlarının web ortamında nasıl yönetilebileceğini gösteren bir "Living Sandbox" (Yaşayan Kum Havuzu) olmayı hedeflemektedir.

---
<img width="1408" height="756" alt="game" src="https://github.com/user-attachments/assets/214d141d-0dcc-41b5-bbc9-927c5c341b83" />

## 🤝 Birlikte Geliştirelim! (Contribution)

**Bu proje tek bir kişinin değil, bu klasiğe gönül veren herkesin projesidir.** Projeyi daha ileriye taşımak için sizin desteğinize ihtiyacım var! Eğer aşağıdaki konularda deneyimliyseniz veya öğrenmek istiyorsanız lütfen geliştirmeme yardımcı olun:

-   **Frontend:** React ve Three.js optimizasyonları, UI/UX iyileştirmeleri.
-   **Backend:** Socket.io veya WebRTC ile çok oyunculu (Multiplayer) sistemlerin kurulması.
-   **3D Sanat:** Low-poly modeller, animasyonlar ve efektler (VFX).
-   **Oyun Tasarımı:** Yeni görevler, karakter sınıfları ve dengelemeler (Balancing).
-   **AI:** Gemini API entegrasyonu ile daha zeki ve etkileşimli NPC sistemleri.

Her türlü "Pull Request" ve öneriye açığız. Gelin, bu efsaneyi modern web dünyasında beraber yaşatalım!

---
<img width="1415" height="756" alt="m2m22" src="https://github.com/user-attachments/assets/6b0d8578-2a30-47e7-aeb8-d378e8e7c2bd" />

## 🎮 Temel Özellikler

- **Klasik Mekanikler:** Orijinal Metin2 hissiyatını veren WASD hareket sistemi ve sağ tık kontrollü kamera açısı.
- **Dinamik Savaş Sistemi:** 4 aşamalı kombo sistemi ve Alan Etkili (AoE) yetenekler.
- **RPG Sistemleri:** Level, Stat (STR, VIT...), Envanter, Ekipman ve Demirci (Upgrade) sistemi.
- **Metin Taşları:** Haritaya düşen, canavar dalgaları çağıran dinamik objeler.
- **AI Destekli NPC'ler:** Google Gemini API ile gardiyan ve köylülerle doğal dilde sohbet.
- **Performans:** GPU Instancing ve Culling teknikleri ile binlerce objenin akıcı render edilmesi.

---

## 🚀 Teknik Detaylar

Web tabanlı 3D oyunlardaki darboğazları aşmak için:
1.  **GPU Instancing:** Tek bir çizim çağrısı ile binlerce ağaç/çimen çizimi.
2.  **Zustand State Management:** Oyun mantığını React döngüsünden ayırarak yüksek hızda yönetim.
3.  **Shared Geometries:** Bellek verimliliği için ortak model kullanımı.

---

## 🛠️ Kurulum

1.  Repoyu klonlayın: `git clone https://github.com/kullaniciadi/metin2-web-legacy.git`
2.  Bağımlılıkları yükleyin: `npm install`
3.  `.env` dosyasına Gemini API anahtarınızı ekleyin: `API_KEY=your_key`
4.  Başlatın: `npm run dev`

---

## ⌨️ Kontroller

| Tuş | İşlem |
| :--- | :--- |
| **W, A, S, D** | Hareket Et |
| **Space** | Saldırı (Basılı tutulabilir) |
| **1 - 4** | Yetenek Kullanımı |
| **Mouse Sağ Tık** | Kamera Döndürme |
| **I / C / K / M** | Envanter / Karakter / Beceri / Harita |
| **F / Z** | Toplama / Etkileşim |
| **ESC** | Sistem Menüsü |

---

## 📜 Lisans

Bu proje eğitim ve topluluk amaçlı bir klon çalışmasıdır.

⭐ **Bu yolculukta bana katılmak için projeyi yıldızlayabilir ve "Issue" üzerinden iletişime geçebilirsiniz!**
