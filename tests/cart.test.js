const test = require("node:test");
const assert = require("node:assert/strict");
const {
  MENU,
  urunBul,
  sepeteEkle,
  adetAzalt,
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
