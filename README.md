# Pizza Dükkânı Sipariş Asistanı

> MTH001 – Güncel Yazılım Geliştirme Süreçleri ve DevOps dersi bireysel projesi.

Pizza dükkânında sipariş alan çalışanlar için tarayıcıda açılan, tek ekranlık bir sipariş asistanı. Kurulum veya sunucu gerekmez.

## Problem

Küçük bir pizza dükkânında telefonla ya da tezgâhta gelen siparişler kâğıda yazılıyor ve tutar elle toplanıyor. Bunun sonucunda:

- hesap hataları oluyor,
- sipariş notları (ör. "acısız olsun", "zil çalışmıyor") kayboluyor,
- gün sonunda kaç sipariş alındığı ve ne kadar ciro yapıldığı bilinmiyor.

## Hedef kullanıcı

Pizza dükkânında sipariş alan **kasiyer ve çalışanlar**.

## Çözüm

Çalışan tek bir ekranda:

1. menüden ürün seçip sepete ekler, tutar otomatik hesaplanır;
2. müşteri bilgileri ve sipariş notuyla siparişi kaydeder;
3. günün siparişlerini, sipariş sayısını ve cirosunu görür.

Uygulama saf HTML, CSS ve JavaScript ile yazıldı. Siparişler tarayıcının `localStorage` alanında saklanır, bu yüzden sayfa yenilense de kaybolmaz.

## Proje panosu

**GitHub Projects panosu:** https://github.com/users/azadkaratas68/projects/1

Pano "Yapılacak / Devam Ediyor / Tamamlandı" sütunlarından oluşur. Her görev bir issue'dur ve kabul kriterleri issue içinde yazılıdır.

| # | Görev | Durum |
|---|-------|-------|
| [#1](https://github.com/azadkaratas68/siparis-asistani/issues/1) | Menü ve sepet | ✅ Tamamlandı |
| [#2](https://github.com/azadkaratas68/siparis-asistani/issues/2) | Sipariş kaydetme ve günlük liste | ✅ Tamamlandı |
| [#3](https://github.com/azadkaratas68/siparis-asistani/issues/3) | İndirim / kampanya kodu | Yapılacak |
| [#4](https://github.com/azadkaratas68/siparis-asistani/issues/4) | Sipariş fişi yazdırma | Yapılacak |
| [#5](https://github.com/azadkaratas68/siparis-asistani/issues/5) | GitHub Actions ile otomatik test (CI) | Yapılacak |
| [#6](https://github.com/azadkaratas68/siparis-asistani/issues/6) | Menüyü JSON dosyasından okuma | Yapılacak |

Geliştirilen iki görevin her biri ayrı bir commit'tir ve commit mesajındaki `(#1)` / `(#2)` ile ilgili issue'ya bağlıdır.

## Projeyi çalıştırma

1. Depoyu klonlayın:

   ```powershell
   git clone https://github.com/azadkaratas68/siparis-asistani.git
   cd siparis-asistani
   ```

2. `index.html` dosyasına çift tıklayarak tarayıcıda açın. Sunucu, kurulum veya internet bağlantısı gerekmez.

### Testleri çalıştırma

Testler için **Node.js 18 veya üstü** gerekir. Ek paket kurulmaz, Node'un dahili test aracı (`node:test`) kullanılır.

```powershell
npm test
```

Beklenen çıktı: 18 testin tamamı geçer (`pass 18`, `fail 0`).

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

## Proje yapısı

```
siparis-asistani/
├── index.html          Arayüz: Menü | Sepet + müşteri formu | Bugünkü siparişler
├── style.css           Stiller
├── package.json        Sadece "test" script'i, bağımlılık yok
├── js/
│   ├── cart.js         Menü verisi ve sepet mantığı (saf fonksiyonlar)
│   ├── orders.js       Sipariş oluşturma, doğrulama, günlük özet (saf fonksiyonlar)
│   └── app.js          Ekrana çizme, buton/form olayları, localStorage
└── tests/
    ├── cart.test.js    Sepet testleri
    └── orders.test.js  Sipariş testleri
```

Hesaplama ve doğrulama mantığı `cart.js` ve `orders.js` içinde, sayfaya (DOM) dokunmayan saf fonksiyonlar olarak durur. Bu sayede aynı kod hem tarayıcıda çalışır hem de Node'da test edilir. `app.js` yalnızca ekrana çizer ve olayları bağlar. Kullanıcının yazdığı metinler sayfaya `textContent` ile basıldığı için HTML olarak çalıştırılamaz.
