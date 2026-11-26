# Restoran Sipariş Kontrolü

[![CI](https://github.com/azadkaratas68/siparis-asistani/actions/workflows/ci.yml/badge.svg)](https://github.com/azadkaratas68/siparis-asistani/actions/workflows/ci.yml)

> MTH001 – Güncel Yazılım Geliştirme Süreçleri ve DevOps dersi bireysel projesi.

Restoranlarda sipariş alan çalışanlar için tarayıcıda açılan, tek ekranlık bir sipariş kontrol ve takip uygulaması. Kurulum veya sunucu gerekmez.

## Problem

Küçük bir restoranda telefonla ya da tezgâhta gelen siparişler kâğıda yazılıyor ve tutar elle toplanıyor. Bunun sonucunda:

- hesap hataları oluyor,
- sipariş notları (ör. "acısız olsun", "zil çalışmıyor") kayboluyor,
- menüdeki ürün veya fiyat değişiklikleri hızla güncellenemiyor,
- gün sonunda kaç sipariş alındığı ve ne kadar ciro yapıldığı bilinmiyor.

## Hedef kullanıcı

Restoran ve kafelerde sipariş alan **kasiyer ve çalışanlar**.

## Çözüm

Çalışan tek bir ekranda:

1. menüden ürün seçip sepete ekler (isterse menüye yeni ürün ekler veya mevcut ürünleri siler), tutar otomatik hesaplanır;
2. müşteri bilgileri ve sipariş notuyla siparişi kaydeder, gerekirse fiş yazdırır;
3. günün siparişlerini, sipariş sayısını ve cirosunu görür.

Uygulama saf HTML, CSS ve JavaScript ile yazıldı. Siparişler ve menü değişiklikleri tarayıcının `localStorage` alanında saklanır, bu yüzden sayfa yenilense de kaybolmaz.

## Proje panosu

**GitHub Projects panosu:** https://github.com/users/azadkaratas68/projects/1

Pano "Yapılacak / Devam Ediyor / Tamamlandı" sütunlarından oluşur. Her görev bir issue'dur ve kabul kriterleri issue içinde yazılıdır.

| # | Görev | Durum |
|---|-------|-------|
| [#1](https://github.com/azadkaratas68/siparis-asistani/issues/1) | Menü ve sepet | ✅ Tamamlandı |
| [#2](https://github.com/azadkaratas68/siparis-asistani/issues/2) | Sipariş kaydetme ve günlük liste | ✅ Tamamlandı |
| [#3](https://github.com/azadkaratas68/siparis-asistani/issues/3) | İndirim / kampanya kodu | ✅ Tamamlandı |
| [#4](https://github.com/azadkaratas68/siparis-asistani/issues/4) | Sipariş fişi yazdırma | ✅ Tamamlandı |
| [#5](https://github.com/azadkaratas68/siparis-asistani/issues/5) | GitHub Actions ile otomatik test (CI) | ✅ Tamamlandı |
| [#6](https://github.com/azadkaratas68/siparis-asistani/issues/6) | Menüyü JSON dosyasından okuma | ✅ Tamamlandı |
| [#7](https://github.com/azadkaratas68/siparis-asistani/issues/7) | Docker ile çalıştırma | ✅ Tamamlandı |
| [#8](https://github.com/azadkaratas68/siparis-asistani/issues/8) | Restoran sipariş kontrolü ve dinamik menü yönetimi | ✅ Tamamlandı |

Geliştirilen iki görevin her biri ayrı bir commit'tir ve commit mesajındaki `(#1)` / `(#2)` ile ilgili issue'ya bağlıdır.

## Projeyi çalıştırma

1. Depoyu klonlayın:

   ```powershell
   git clone https://github.com/azadkaratas68/siparis-asistani.git
   cd siparis-asistani
   ```

2. `index.html` dosyasına çift tıklayarak tarayıcıda açın. Sunucu, kurulum veya internet bağlantısı gerekmez.

### Docker ile çalıştırma

Bilgisayarda yalnızca [Docker Desktop](https://www.docker.com/products/docker-desktop/) kurulu olması yeterlidir; Node.js gerekmez.

```powershell
docker compose up --build -d
```

Ardından tarayıcıda **http://localhost:8080** adresini açın. Durdurmak için:

```powershell
docker compose down
```

İmaj iki aşamada oluşturulur: önce Node imajında testler çalışır, testler geçerse uygulama dosyaları küçük bir nginx imajına kopyalanıp sunulur. Testlerden biri kırılırsa imaj oluşmaz.

> Not: Siparişler tarayıcının `localStorage` alanında tutulduğu için `http://localhost:8080` ile `index.html`'e çift tıklayarak açılan sayfa birbirinin siparişlerini görmez.

### Sürekli entegrasyon (CI)

`.github/workflows/ci.yml` her push ve pull request'te GitHub Actions üzerinde iki iş çalıştırır:

1. **Testler:** `npm test` (Node 22).
2. **Docker imajı:** imaj derlenir, konteyner başlatılır ve sayfa ile JS/CSS dosyalarının sunulduğu kontrol edilir.

Sonuçlar deponun **Actions** sekmesinde ve README'nin başındaki rozette görünür.

### Testleri çalıştırma

Testler için **Node.js 18 veya üstü** gerekir. Ek paket kurulmaz, Node'un dahili test aracı (`node:test`) kullanılır.

```powershell
npm test
```

Beklenen çıktı: 41 testin tamamı geçer (`pass 41`, `fail 0`).

## Özellikleri deneme

### #1 – Menü ve sepet

1. `index.html`'i açın. Sepet panelinde "Sepet boş. Menüden ürün ekleyin." yazısı görünür.
2. **Margarita Pizza**'ya iki kez, **Ayran**'a bir kez **Ekle** deyin. Toplam **530 ₺** olur.
3. Sepette Margarita satırındaki **−** butonuna basın. Toplam **280 ₺** olur.
4. **−** butonuna bir kez daha basın. Margarita sepetten kalkar.
5. **Sepeti temizle** butonuna basın. Toplam **0 ₺** olur ve boş sepet yazısı geri gelir.

### #2 – Sipariş kaydetme ve günlük liste

1. Sepete birkaç ürün ekleyin (ör. 2 × Margarita + 1 × Ayran = 530 ₺).
2. **Ad soyad** alanını boş bırakıp **Siparişi kaydet**'e basın. Kırmızı renkte "Müşteri adı zorunludur." uyarısı çıkar.
3. Bir ad yazın, **Telefon** alanına `123` girip kaydedin. Kırmızı renkte "Telefon numarası 10 veya 11 haneli olmalıdır." uyarısı çıkar.
4. Telefonu `0532 123 45 67` yapın, isterseniz adres ve not ekleyip kaydedin. Ardından:
   - yeşil renkte "Sipariş kaydedildi: 530 ₺" mesajı görünür,
   - sipariş "Bugünkü siparişler" paneline düşer (saat, ad, tutar, telefon, adres, ürünler, not),
   - sipariş sayısı **1**, ciro **530 ₺** olur,
   - sepet ve form sıfırlanır.
5. Sayfayı yenileyin (F5). Siparişler ve özet olduğu gibi durur.

### #3 – İndirim / kampanya kodu

1. Sepete 2 × Margarita + 1 × Ayran ekleyin (530 ₺).
2. Kampanya kodu alanına `XYZ` yazıp **Uygula**'ya basın. Kırmızı renkte "Geçersiz kampanya kodu." uyarısı çıkar, toplam değişmez.
3. `PIZZA10` yazıp **Uygula**'ya basın. Ara toplam **530 ₺**, indirim **−53 ₺**, toplam **477 ₺** görünür. Kod büyük/küçük harf fark etmeksizin kabul edilir (`pizza10`, `PİZZA10`).
4. Sepetteki ürünleri değiştirin. İndirim yeni toplama göre yeniden hesaplanır.
5. Müşteri bilgilerini girip siparişi kaydedin. Kaydedilen tutar ve ciro indirimli tutardır; listede indirim satırı görünür.
6. **Kaldır** butonu kodu iptal eder; **Sepeti temizle** ve başarılı kayıt da kodu sıfırlar.

### #4 – Sipariş fişi yazdırma

1. Bir sipariş kaydedin (ör. 2 × Margarita + 1 × Ayran = 530 ₺, isteğe bağlı `PIZZA10` ile 477 ₺).
2. "Bugünkü siparişler" listesindeki sipariş kartında **Fiş yazdır** butonuna basın.
3. Tarayıcının yazdırma önizlemesi açılır; yalnızca fiş görünür ve fişte dükkân başlığı, sipariş/müşteri bilgileri, ürünler, adetler, varsa indirim ve genel toplam yer alır.

### #6 – Menüyü JSON dosyasından okuma

1. Uygulamayı bir sunucu üzerinden açın (ör. `docker compose up --build -d` → `http://localhost:8080`).
2. `menu.json` içinde herhangi bir ürünün fiyatını değiştirin (ör. `Margarita Pizza`: `250` → `275`).
3. Docker kullanıyorsanız imajı yeniden derleyin (`docker compose up --build -d`) ve sayfayı yenileyin; menüde yeni fiyat görünür. (`index.html` doğrudan `file://` ile açılırsa tarayıcı CORS kısıtı nedeniyle yerleşik varsayılan menü yedek olarak kullanılır.)

### #8 – Restoran sipariş kontrolü ve dinamik menü yönetimi

1. Menü panelinin sağ üstündeki **Menüyü düzenle** butonuna basın.
2. **Yeni ürün ekle** formuna bir ürün girin (ör. Ad: `Izgara Köfte`, Kategori: `Ana Yemek`, Fiyat: `280`) ve **Ürün ekle**'ye basın. Ürün yeni kategorisiyle birlikte menüye eklenir.
3. Herhangi bir ürünün yanındaki **Sil** butonuna basın. Ürün menüden (ve varsa aktif sepetten) kaldırılır; daha önce kaydedilmiş siparişler etkilenmez.
4. Sayfayı yenileyin (F5). Eklediğiniz ve sildiğiniz ürünler `localStorage` sayesinde korunur.
5. **Varsayılan menüyü yükle** butonuna basarak başlangıçtaki örnek menüye (pizzalar, burgerler, makarna, tavuk, içecekler) geri dönebilirsiniz.
6. Kampanya kodu alanında `PIZZA10` yanında `INDIRIM10` kodu da `%10` indirim uygular.

## Proje yapısı

```
siparis-asistani/
├── index.html          Arayüz: Menü | Sepet + müşteri formu | Bugünkü siparişler
├── style.css           Stiller
├── menu.json           Dışarıdan düzenlenebilir menü verisi
├── package.json        Sadece "test" script'i, bağımlılık yok
├── Dockerfile          Test + nginx ile sunum (iki aşamalı)
├── compose.yaml        docker compose ile tek komutla çalıştırma
├── .github/workflows/
│   └── ci.yml          GitHub Actions: testler + Docker imajı kontrolü
├── js/
│   ├── cart.js         Menü verisi ve sepet mantığı (saf fonksiyonlar)
│   ├── discount.js     Kampanya kodları ve indirim hesabı (saf fonksiyonlar)
│   ├── orders.js       Sipariş oluşturma, doğrulama, günlük özet (saf fonksiyonlar)
│   ├── receipt.js      Sipariş fişi verisi ve metni (saf fonksiyonlar)
│   └── app.js          Ekrana çizme, buton/form olayları, localStorage
└── tests/
    ├── cart.test.js      Sepet testleri
    ├── discount.test.js  İndirim testleri
    ├── orders.test.js    Sipariş testleri
    └── receipt.test.js   Fiş yazdırma testleri
```

Hesaplama ve doğrulama mantığı `cart.js`, `discount.js`, `orders.js` ve `receipt.js` içinde, sayfaya (DOM) dokunmayan saf fonksiyonlar olarak durur. Bu sayede aynı kod hem tarayıcıda çalışır hem de Node'da test edilir. `app.js` yalnızca ekrana çizer ve olayları bağlar. Kullanıcının yazdığı metinler sayfaya `textContent` ile basıldığı için HTML olarak çalıştırılamaz.
