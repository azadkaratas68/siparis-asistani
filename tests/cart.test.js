const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  MENU,
  urunBul,
  urunEkle,
  urunSil,
  menuJsonOku,
  menuFiyatlariniGuncelle,
  sepeteEkle,
  adetAzalt,
  sepettenUrunKaldir,
  sepetKalemleri,
  sepetToplami,
  sepetBosMu,
  paraBicimle,
} = require("../js/cart.js");

test("menüde 9 ürün var ve urunBul id ile ürünü bulur", () => {
  assert.equal(MENU.length, 9);
  assert.equal(urunBul("p1").ad, "Margarita Pizza");
  assert.equal(urunBul("yok"), undefined);
});

test("sepeteEkle boş sepete ürünü 1 adet ekler", () => {
  assert.deepEqual(sepeteEkle({}, "p1"), { p1: 1 });
});

test("sepeteEkle sepette olan ürünün adedini artırır", () => {
  let sepet = sepeteEkle({}, "p1");
  sepet = sepeteEkle(sepet, "p1");
  assert.deepEqual(sepet, { p1: 2 });
});

test("sepeteEkle menüde olmayan ürün için hata fırlatır", () => {
  assert.throws(() => sepeteEkle({}, "x9"), /Menüde böyle bir ürün yok/);
});

test("adetAzalt adedi bir azaltır, 0'a düşen ürünü sepetten siler", () => {
  assert.deepEqual(adetAzalt({ p1: 2 }, "p1"), { p1: 1 });
  assert.deepEqual(adetAzalt({ p1: 1, i1: 1 }, "p1"), { i1: 1 });
});

test("adetAzalt sepette olmayan ürün için sepeti aynı bırakır", () => {
  assert.deepEqual(adetAzalt({ i1: 1 }, "p1"), { i1: 1 });
});

test("2 × Margarita + 1 × Ayran = 530 ₺, bir Margarita azalınca 280 ₺", () => {
  let sepet = {};
  sepet = sepeteEkle(sepet, "p1");
  sepet = sepeteEkle(sepet, "p1");
  sepet = sepeteEkle(sepet, "i1");
  assert.equal(sepetToplami(sepet), 530);

  sepet = adetAzalt(sepet, "p1");
  assert.equal(sepetToplami(sepet), 280);
});

test("sepetKalemleri ad, adet, birim fiyat ve satır tutarını verir", () => {
  const kalemler = sepetKalemleri({ p1: 2, i1: 1 });
  assert.deepEqual(kalemler, [
    { id: "p1", ad: "Margarita Pizza", adet: 2, birimFiyat: 250, tutar: 500 },
    { id: "i1", ad: "Ayran", adet: 1, birimFiyat: 30, tutar: 30 },
  ]);
});

test("boş sepet: sepetBosMu true, toplam 0, kalem yok", () => {
  assert.equal(sepetBosMu({}), true);
  assert.equal(sepetBosMu({ p1: 1 }), false);
  assert.equal(sepetToplami({}), 0);
  assert.deepEqual(sepetKalemleri({}), []);
});

test("fonksiyonlar orijinal sepeti değiştirmez", () => {
  const sepet = { p1: 1 };
  const eklenmis = sepeteEkle(sepet, "p1");
  const azaltilmis = adetAzalt(sepet, "p1");

  assert.deepEqual(sepet, { p1: 1 });
  assert.notEqual(eklenmis, sepet);
  assert.notEqual(azaltilmis, sepet);
});

test("paraBicimle Türkçe biçimde ₺ ekler", () => {
  assert.equal(paraBicimle(530), "530 ₺");
  assert.equal(paraBicimle(1250), "1.250 ₺");
});

test("urunEkle yeni ürünü menüye ekler ve orijinal menüyü değiştirmez", () => {
  const baslangic = [{ id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 250 }];
  const guncel = urunEkle(baslangic, { ad: "  Izgara Köfte  ", kategori: " Ana Yemek ", fiyat: "280,5" });

  assert.equal(baslangic.length, 1);
  assert.equal(guncel.length, 2);
  assert.equal(guncel[1].ad, "Izgara Köfte");
  assert.equal(guncel[1].kategori, "Ana Yemek");
  assert.equal(guncel[1].fiyat, 280.5);
  assert.ok(guncel[1].id);
  assert.notEqual(guncel[1].id, "p1");
});

test("urunEkle boş ad, boş kategori veya geçersiz fiyatta hata verir", () => {
  assert.throws(() => urunEkle(MENU, { ad: "   ", kategori: "Ana Yemek", fiyat: 200 }), {
    message: "Ürün adı zorunludur.",
  });
  assert.throws(() => urunEkle(MENU, { ad: "Izgara Köfte", kategori: "", fiyat: 200 }), {
    message: "Kategori zorunludur.",
  });
  for (const fiyat of [0, -50, "", "abc", NaN]) {
    assert.throws(() => urunEkle(MENU, { ad: "Izgara Köfte", kategori: "Ana Yemek", fiyat }), {
      message: "Fiyat 0'dan büyük bir sayı olmalıdır.",
    });
  }
});

test("urunSil ürünü menüden kaldırır, orijinal menüyü değiştirmez", () => {
  const baslangic = [
    { id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 250 },
    { id: "i1", ad: "Ayran", kategori: "İçecek", fiyat: 30 },
  ];
  const kalan = urunSil(baslangic, "p1");

  assert.equal(baslangic.length, 2);
  assert.deepEqual(kalan, [{ id: "i1", ad: "Ayran", kategori: "İçecek", fiyat: 30 }]);
});

test("sepettenUrunKaldir ürünü sepetten tamamen kaldırır ve orijinal sepeti değiştirmez", () => {
  const sepet = { p1: 3, i1: 1 };
  const guncel = sepettenUrunKaldir(sepet, "p1");

  assert.deepEqual(sepet, { p1: 3, i1: 1 });
  assert.deepEqual(guncel, { i1: 1 });
});

test("menu.json dosyası geçerli menü verisi içerir ve menuJsonOku ile okunur", () => {
  const dosyaYolu = path.join(__dirname, "..", "menu.json");
  const icerik = fs.readFileSync(dosyaYolu, "utf8");
  const jsonMenu = menuJsonOku(icerik);

  assert.equal(jsonMenu.length, 9);
  assert.equal(urunBul("p1", jsonMenu).ad, "Margarita Pizza");
  assert.equal(urunBul("p1", jsonMenu).fiyat, 250);
});

test("menuJsonOku bozuk JSON veya eksik ürün tanımında hata verir", () => {
  assert.throws(() => menuJsonOku("{bozuk"), { message: "Menü JSON biçimi geçersiz." });
  assert.throws(() => menuJsonOku("[]"), { message: "Menü en az bir ürün içeren bir liste olmalıdır." });
  assert.throws(() => menuJsonOku([{ id: "p1", ad: "Pizza", kategori: "Pizza", fiyat: -10 }]), {
    message: "Menüde geçersiz ürün tanımı var.",
  });
});

test("menuFiyatlariniGuncelle menu.json fiyat değişikliğini mevcut menüye yansıtır", () => {
  const mevcut = [
    { id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 250 },
    { id: "u-ozel", ad: "Izgara Köfte", kategori: "Ana Yemek", fiyat: 280 },
  ];
  const jsonMenu = [
    { id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 275 },
    { id: "i1", ad: "Ayran", kategori: "İçecek", fiyat: 35 },
  ];

  const guncel = menuFiyatlariniGuncelle(mevcut, jsonMenu);
  assert.deepEqual(guncel, [
    { id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 275 },
    { id: "u-ozel", ad: "Izgara Köfte", kategori: "Ana Yemek", fiyat: 280 },
  ]);
});
