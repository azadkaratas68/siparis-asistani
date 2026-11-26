const test = require("node:test");
const assert = require("node:assert/strict");
const { siparisOlustur } = require("../js/orders.js");
const { fisTarihBicimle, fisVerisiHazirla, fisMetniOlustur } = require("../js/receipt.js");

const ornekMusteri = {
  ad: "Ayşe Yılmaz",
  telefon: "0532 123 45 67",
  adres: "Cumhuriyet Mah. No: 5",
  not: "Acısız olsun",
};

test("fisVerisiHazirla normal siparişte ürünler, adetler ve toplamı hazırlar", () => {
  const tarih = new Date(2026, 10, 26, 14, 15);
  const siparis = siparisOlustur({ p1: 2, i1: 1 }, ornekMusteri, tarih);
  const fis = fisVerisiHazirla(siparis);

  assert.equal(fis.baslik, "Restoran Sipariş Kontrolü");
  assert.equal(fis.siparisId, siparis.id);
  assert.equal(fis.tarih, "26.11.2026 14:15");
  assert.deepEqual(fis.musteri, {
    ad: "Ayşe Yılmaz",
    telefon: "0532 123 45 67",
    adres: "Cumhuriyet Mah. No: 5",
  });
  assert.equal(fis.not, "Acısız olsun");
  assert.deepEqual(fis.kalemler, [
    { ad: "Margarita Pizza", adet: 2, birimFiyat: 250, tutar: 500 },
    { ad: "Ayran", adet: 1, birimFiyat: 30, tutar: 30 },
  ]);
  assert.equal(fis.araToplam, 530);
  assert.equal(fis.indirim, 0);
  assert.equal(fis.kampanyaKodu, null);
  assert.equal(fis.toplam, 530);
});

test("fisVerisiHazirla indirimli siparişte ara toplam ve indirimi korur", () => {
  const siparis = siparisOlustur({ p1: 2, i1: 1 }, ornekMusteri, new Date(2026, 10, 26, 14, 15), undefined, "PIZZA10");
  const fis = fisVerisiHazirla(siparis);

  assert.equal(fis.araToplam, 530);
  assert.equal(fis.kampanyaKodu, "PIZZA10");
  assert.equal(fis.indirim, 53);
  assert.equal(fis.toplam, 477);

  const metin = fisMetniOlustur(siparis);
  assert.match(metin, /2x Margarita Pizza - 500 ₺/);
  assert.match(metin, /1x Ayran - 30 ₺/);
  assert.match(metin, /Ara toplam: 530 ₺/);
  assert.match(metin, /İndirim \(PIZZA10\): −53 ₺/);
  assert.match(metin, /Toplam: 477 ₺/);
});

test("fisMetniOlustur boş adres ve not için ekstra satır eklemez", () => {
  const siparis = siparisOlustur(
    { p2: 1 },
    { ad: "Ali", telefon: "5321234567", adres: "", not: "" },
    new Date(2026, 10, 26, 10, 5)
  );
  const metin = fisMetniOlustur(siparis);

  assert.doesNotMatch(metin, /^Adres:/m);
  assert.doesNotMatch(metin, /^Not:/m);
  assert.doesNotMatch(metin, /^Ara toplam:/m);
  assert.match(metin, /1x Karışık Pizza - 300 ₺/);
  assert.match(metin, /Toplam: 300 ₺/);
});

test("fisVerisiHazirla eski formatlı (araToplam/indirim alanı olmayan) kayıtla da çalışır", () => {
  const eskiKayit = {
    id: "eski-1",
    tarih: new Date(2026, 10, 20, 18, 0).toISOString(),
    musteri: { ad: "Veli", telefon: "05320000000" },
    kalemler: [{ ad: "Margarita Pizza", adet: 2, birimFiyat: 250, tutar: 500 }],
    toplam: 500,
  };
  const fis = fisVerisiHazirla(eskiKayit);

  assert.equal(fis.araToplam, 500);
  assert.equal(fis.indirim, 0);
  assert.equal(fis.toplam, 500);
  assert.equal(fis.musteri.adres, "");
  assert.equal(fis.not, "");
});

test("fisVerisiHazirla geçersiz veya boş sipariş için hata fırlatır", () => {
  for (const gecersiz of [null, undefined, {}, { kalemler: [] }]) {
    assert.throws(() => fisVerisiHazirla(gecersiz), {
      message: "Fiş oluşturmak için geçerli bir sipariş gerekir.",
    });
  }
});

test("fisTarihBicimle geçersiz tarihte boş metin döndürür", () => {
  assert.equal(fisTarihBicimle("gecersiz-tarih"), "");
});
