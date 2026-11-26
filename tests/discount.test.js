const test = require("node:test");
const assert = require("node:assert/strict");
const { indirimHesapla, kampanyaKoduDuzenle } = require("../js/discount.js");

test("PIZZA10 toplamdan %10 düşer: 530 ₺ → 477 ₺", () => {
  assert.deepEqual(indirimHesapla(530, "PIZZA10"), {
    kod: "PIZZA10",
    oran: 10,
    araToplam: 530,
    indirim: 53,
    toplam: 477,
  });
});

test("kod büyük/küçük harf ve boşluktan etkilenmez", () => {
  for (const kod of ["pizza10", "  PIZZA10  ", "Pizza10", "PİZZA10", "pızza10"]) {
    assert.equal(indirimHesapla(300, kod).toplam, 270, kod);
  }
  assert.equal(kampanyaKoduDuzenle(" pİzza10 "), "PIZZA10");
});

test("küsuratlı indirim kuruşa yuvarlanır", () => {
  const sonuc = indirimHesapla(245, "PIZZA10");
  assert.equal(sonuc.indirim, 24.5);
  assert.equal(sonuc.toplam, 220.5);
});

test("boş sepette indirim 0 olur", () => {
  const sonuc = indirimHesapla(0, "PIZZA10");
  assert.equal(sonuc.indirim, 0);
  assert.equal(sonuc.toplam, 0);
});

test("INDIRIM10 restoran genelinde %10 indirim uygular", () => {
  const sonuc = indirimHesapla(400, "indirim10");
  assert.equal(sonuc.kod, "INDIRIM10");
  assert.equal(sonuc.indirim, 40);
  assert.equal(sonuc.toplam, 360);
});

test("geçersiz kod hata verir", () => {
  for (const kod of ["PIZZA20", "INDIRIM", "constructor", "__proto__"]) {
    assert.throws(() => indirimHesapla(530, kod), { message: "Geçersiz kampanya kodu." }, kod);
  }
});

test("boş kod hata verir", () => {
  for (const kod of ["", "   ", undefined]) {
    assert.throws(() => indirimHesapla(530, kod), { message: "Kampanya kodu girin." });
  }
});
