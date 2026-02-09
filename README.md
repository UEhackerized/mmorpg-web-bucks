# ⚔️ Metin2 Web Legacy: 3D Browser MMORPG

![Game Version](https://img.shields.io/badge/Version-1.0.0-gold)
![Tech Stack](https://img.shields.io/badge/Tech-React_%7C_Three.js_%7C_Zustand-blue)
![Performance](https://img.shields.io/badge/Performance-Optimized-green)

**Metin2 Web Legacy**, efsanevi MMORPG deneyimini modern web teknolojileriyle tarayıcıya taşıyan, yüksek performanslı bir 3D klon projesidir. **React**, **Three.js (Fiber/Drei)** ve **Zustand** kullanılarak sıfırdan inşa edilmiştir.

---

## 🎮 Temel Özellikler

- **Klasik Mekanikler:** Orijinal Metin2 hissiyatını veren WASD hareket sistemi ve sağ tık kontrollü kamera açısı.
- **Dinamik Savaş Sistemi:** 
  - 4 aşamalı kombo sistemi.
  - `Space` tuşuna basılı tutarak sürekli saldırı (Auto-attack).
  - Alan etkili (AoE) yetenekler ve yetenek ağacı.
- **RPG Sistemleri:** 
  - **Level & Stat:** STR, VIT, DEX, INT puanlama sistemi.
  - **Envanter & Ekipman:** Slot bazlı envanter ve karakter kağıdı.
  - **Blacksmith (Demirci):** +0'dan +9'a kadar eşya yükseltme sistemi (başarı şansı ve yok olma riski dahil).
  - **Loot & Yang:** Canavarlardan düşen eşyalar ve para toplama.
- **Metin Taşları:** Haritaya rastgele düşen, canavar dalgaları çağıran ve değerli ganimetler bırakan Metin taşları.
- **AI Destekli NPC'ler:** **Google Gemini API** entegrasyonu ile köylüler ve gardiyanlarla doğal dilde sohbet edebilme.
- **Görsel Dünya:** 
  - Prosedürel dağ sıraları ve genişletilmiş harita.
  - Dinamik Gece/Gündüz döngüsü ve hava durumu efektleri.
  - Level atlama (Level Up) ve kritik vuruş görsel efektleri.

---

## 🚀 Teknik Optimizasyonlar (Performans)

Web tabanlı 3D oyunlarda karşılaşılan darboğazları aşmak için aşağıdaki ileri seviye teknikler uygulanmıştır:

1.  **GPU Instancing:** Binlerce ağaç, kaya ve çimen objesi tek bir *Draw Call* ile çizilerek FPS düşüşleri engellenmiştir.
2.  **Shared Geometries:** Tüm düşman ve NPC modelleri bellekte tek bir geometriyi paylaşır, bu da GPU bellek kullanımını minimuma indirir.
3.  **Frustum & Distance Culling:** Sadece kameranın gördüğü ve oyuncuya yakın olan objeler render edilir.
4.  **Shadow Map Optimization:** Gölgeler dinamik olarak optimize edilerek düşük donanımlı cihazlarda bile akıcı deneyim sağlanır.
5.  **Zustand State Management:** Oyun mantığı (AI, Combat, Stats) React render döngüsünden bağımsız olarak yüksek hızda yönetilir.

---

## 🛠️ Kurulum

Projeyi yerel makinenizde çalıştırmak için:

1.  Repoyu klonlayın:
    ```bash
    git clone https://github.com/kullaniciadi/metin2-web-legacy.git
    ```
2.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
3.  `.env` dosyasına Gemini API anahtarınızı ekleyin (NPC sohbetleri için):
    ```env
    API_KEY=your_google_gemini_api_key
    ```
4.  Projeyi başlatın:
    ```bash
    npm run dev
    ```

---

## ⌨️ Kontroller

| Tuş | İşlem |
| :--- | :--- |
| **W, A, S, D** | Hareket Et |
| **Space** | Saldırı (Basılı tutulabilir) |
| **1, 2, 3, 4** | Yetenek Kullanımı |
| **Mouse Sağ Tık** | Kamera Döndürme |
| **I** | Envanter |
| **C** | Karakter Sayfası (Statlar) |
| **K** | Beceri Paneli |
| **M** | Büyük Harita |
| **F / Z** | Yerden Ganimet Topla / NPC ile Etkileşim |
| **ESC** | Sistem Menüsü |

---

## 🗺️ Gelecek Planları (Roadmap)

- [ ] Çok oyunculu (Multiplayer) desteği (Socket.io/WebRTC).
- [ ] At binme ve at üstünde savaş mekanikleri.
- [ ] Daha karmaşık zindan (Dungeon) sistemleri.
- [ ] Lonca (Guild) kurma ve savaşları.

---

## 📜 Lisans

Bu proje eğitim amaçlı bir klon çalışmasıdır. Görsel materyaller ve oyun mantığı ilhamını orijinal Metin2 oyunundan almaktadır.

---

⭐ **Eğer projeyi beğendiyseniz yıldız vermeyi unutmayın!**
