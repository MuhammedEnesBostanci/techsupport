# Tech Support Hub 🛠️

Kullanıcı dostu, modern ve çevrimdışı destekli teknik destek uygulaması.

## 🌟 Özellikler

- **Progressive Web App (PWA)** - Çevrimdışı çalışabilir, cihaza kurulabilir
- **Responsive Design** - Her cihazda mükemmel görünüm
- **Hızlı Performance** - Service Worker ile hızlı yükleme
- **Bilgisayar Desteği** - Windows, macOS, Linux sorunları
- **İnternet & Ağ** - WiFi, modem, bağlantı sorunları
- **Yazılım Desteği** - Uygulama ve program hataları
- **Arama Fonksiyonu** - Hızlı çözüm bulma
- **İletişim Seçenekleri** - Email, telefon, form desteği

## 📁 Dosya Yapısı

```
techsupport-hub/
├── index.html           # Ana sayfa
├── about.html           # Hakkımızda
├── contact.html         # İletişim
├── services.html        # Hizmetler
├── detail.html          # Detay sayfası
├── offline.html         # Çevrimdışı sayfası
├── manifest.json        # PWA manifesti
├── service-worker.js    # Service Worker
├── README.md            # Bu dosya
│
├── css/
│   └── style.css        # Ana stil dosyası
│
├── js/
│   ├── app.js          # Ana uygulama mantığı
│   ├── api.js          # API işlemleri
│   └── install.js      # PWA kurulum yönetimi
│
├── data/
│   └── sample.json     # Örnek veri
│
└── images/
    └── (resim dosyaları)
```

## 🚀 Hızlı Başlangıç

### Çevrimiçi Kullanım
1. Klasörü bir web sunucusunda barındırın
2. Tarayıcıda açın
3. "Kur" butonuna tıklayın

### Yerel Geliştirme
```bash
# Basit Python HTTP sunucusu
python -m http.server 8000

# Veya Node.js http-server
npm install -g http-server
http-server
```

Tarayıcıda açın: `http://localhost:8000`

## 📱 PWA Özellikleri

### Kurulum
- Anasayfada "Kur" butonu ile kurulabilir
- Chrome, Edge, Firefox'ta desteklenmiştir
- iOS Safari'de sınırlı destek

### Çevrimdışı Destek
- Service Worker temel sayfaları önbelleğe alır
- `offline.html` çevrimdışı durumunda gösterilir
- API çağrıları çevrimdışıda depolanır

### Bildirimler
- Güncelleme bildirimleri
- Bağlantı durumu bildirimleri
- Başarı/hata bildirimleri

## 🛠️ Teknolojiler

- **HTML5** - Semantik işaretleme
- **CSS3** - Responsive tasarım, Grid, Flexbox
- **JavaScript (Vanilla)** - Service Workers, Cache API
- **JSON** - Veri depolama
- **PWA API** - Web App Manifest, Service Workers

## 📋 Sayfalar

### Ana Sayfa (`index.html`)
- Hoşgeldin mesajı
- Hizmetler özeti
- Popüler çözümler
- İletişim CTA

### Hakkımızda (`about.html`)
- Şirket bilgisi
- Takım tanıtımı
- Misyon ve vizyon
- Başarı hikâyeleri

### Hizmetler (`services.html`)
- Kategori listesi
- Hizmet açıklamaları
- Fiyatlandırma (isteğe bağlı)
- Karşılaştırma tablosu

### İletişim (`contact.html`)
- İletişim formu
- Telefon numarası
- Email adresi
- Konum haritası

### Detay (`detail.html`)
- Sorun/çözüm detayları
- Adım adım rehberler
- İlgili makaleler
- Referans bağlantıları

## 🔧 Konfigürasyon

### manifest.json
Uygulama adı, ikonu, renkleri özelleştirebilirsiniz:

```json
{
  "name": "Tech Support Hub",
  "short_name": "Support",
  "theme_color": "#667eea"
}
```

### service-worker.js
Önbelleğe alınacak dosyaları ve stratejileri düzenleyebilirsiniz.

## 📊 Veri Yönetimi

`data/sample.json` örnek veri içerir:

```javascript
// API.js kullanarak veri yükleyin
const api = new APIManager();
const categories = await api.getCategories();
```

## 🎨 Özelleştirme

### Renkler (style.css)
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

### Font
```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

### Logo
`index.html` dosyasında logo URL'sini değiştirin

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1199px
- Mobile: < 768px

## 🔒 Güvenlik

- CSP (Content Security Policy) başlıkları ekleyin
- HTTPS kullanın (PWA için zorunlu)
- Form girdilerini valide edin
- XSS koruması için içeriği temizleyin

## 🚀 Deployment

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/techsupport-hub
git push -u origin main
```

### Netlify
- Direktifler dosyasını yükle
- HTTPS otomatik

### Vercel
- Projeyi git'ten bağla
- Otomatik deployment

## 📊 Analytics (İsteğe Bağlı)

Google Analytics eklemek için:

```javascript
// app.js'e ekle
gtag('event', 'page_view', {
  'page_path': window.location.pathname
});
```

## 🐛 Sorun Giderme

### PWA Kurulmuyor
- HTTPS kullanıyor musunuz? (localhost hariç)
- manifest.json geçerli mi?
- Icons erişilebilir mi?

### Çevrimdışı Çalışmıyor
- Service Worker kayıtlı mı?
- Cache API destekleniyor mu?
- İnternet bağlantısını kapatıp deneyin

### Yavaş Yükleme
- Resimleri optimize edin
- Minify CSS/JS dosyalarını
- CDN kullanın

## 📚 Kaynaklar

- [MDN PWA Dokümantasyonu](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 📝 Lisans

Bu proje **MIT Lisansı** altında dağıtılır.

## 👥 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch'i oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'i push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📧 İletişim

- Email: destek@techsupport.com
- Telefon: +90 (212) 555-1234
- Web: https://techsupport-hub.example.com

## 🎯 Gelecek Planları

- [ ] Çok dil desteği
- [ ] Dark mode
- [ ] Ses destekli rehberler
- [ ] Video tutorialleri
- [ ] Canlı sohbet desteği
- [ ] Mobil uygulama (React Native)
- [ ] AI chatbot

## ✨ Sürüm Geçmişi

### v1.0 (Mevcut)
- İlk release
- Temel sayfalar
- PWA desteği
- Responsive tasarım

---

**Son Güncelleme:** 12 Ocak 2026

Tech Support Hub ile ilgili sorularınız için bizimle iletişime geçin! 🚀
