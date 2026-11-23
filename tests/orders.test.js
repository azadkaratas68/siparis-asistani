const test = require("node:test");
const assert = require("node:assert/strict");
const {
  telefonGecerliMi,
  siparisOlustur,
  gununSiparisleri,
  gunlukCiro,
} = require("../js/orders.js");

const gecerliMusteri = {
  ad: "  Ayşe Yılmaz  ",
  telefon: "0532 123 45 67",
  adres: "Cumhuriyet Mah. No: 5",
  not: "Acısız olsun",
};

test("geçerli sipariş: kalemler, toplam, müşteri ve tarih doğru", () => {
  const sepet = { p1: 2, i1: 1 };
  const tarih = new Date(2026, 10, 23, 12, 30);
  const siparis = siparisOlustur(sepet, gecerliMusteri, tarih);

  assert.equal(siparis.toplam, 530);
  assert.equal(siparis.tarih, tarih.toISOString());
  assert.deepEqual(siparis.musteri, {
    ad: "Ayşe Yılmaz",
    telefon: "0532 123 45 67",
    adres: "Cumhuriyet Mah. No: 5",
  });
  assert.equal(siparis.not, "Acısız olsun");
  assert.deepEqual(
    siparis.kalemler.map((k) => k.adet + "x " + k.ad),
    ["2x Margarita Pizza", "1x Ayran"]
  );
  assert.ok(siparis.id);
  assert.deepEqual(sepet, { p1: 2, i1: 1 }, "sepet değişmemeli");
});

test("adres ve not boş bırakılabilir", () => {
  const siparis = siparisOlustur({ p2: 1 }, { ad: "Ali", telefon: "5321234567" });
  assert.equal(siparis.musteri.adres, "");
  assert.equal(siparis.not, "");
  assert.equal(siparis.toplam, 300);
});

test("boş sepetle sipariş oluşturulamaz", () => {
  assert.throws(() => siparisOlustur({}, gecerliMusteri), {
    message: "Sepet boş, sipariş oluşturulamaz.",
  });
});

test("müşteri adı boş veya sadece boşluksa hata verir", () => {
  for (const ad of ["", "   ", undefined]) {
    assert.throws(() => siparisOlustur({ p1: 1 }, { ...gecerliMusteri, ad }), {
      message: "Müşteri adı zorunludur.",
    });
  }
});

test("telefonGecerliMi 10 veya 11 haneyi kabul eder", () => {
  assert.equal(telefonGecerliMi("0532 123 45 67"), true);
  assert.equal(telefonGecerliMi("(532) 123-45-67"), true);
  assert.equal(telefonGecerliMi("123"), false);
  assert.equal(telefonGecerliMi(""), false);
  assert.equal(telefonGecerliMi("0532 123 45 67 89"), false);
});

test("telefon 123 iken sipariş oluşturulamaz", () => {
  assert.throws(() => siparisOlustur({ p1: 1 }, { ...gecerliMusteri, telefon: "123" }), {
    message: "Telefon numarası 10 veya 11 haneli olmalıdır.",
  });
});

test("kodsuz siparişte indirim yoktur", () => {
  const siparis = siparisOlustur({ p1: 2, i1: 1 }, gecerliMusteri);
  assert.equal(siparis.araToplam, 530);
  assert.equal(siparis.kampanyaKodu, null);
  assert.equal(siparis.indirim, 0);
  assert.equal(siparis.toplam, 530);
});

test("PIZZA10 ile kaydedilen siparişin toplamı ve ciroya yansıyan tutar indirimlidir", () => {
  const siparis = siparisOlustur({ p1: 2, i1: 1 }, gecerliMusteri, new Date(), undefined, "pizza10");
  assert.equal(siparis.araToplam, 530);
  assert.equal(siparis.kampanyaKodu, "PIZZA10");
  assert.equal(siparis.indirim, 53);
  assert.equal(siparis.toplam, 477);
  assert.equal(gunlukCiro([siparis]), 477);
});

test("geçersiz kampanya koduyla sipariş oluşturulamaz", () => {
  assert.throws(
    () => siparisOlustur({ p1: 1 }, gecerliMusteri, new Date(), undefined, "YANLIS"),
    { message: "Geçersiz kampanya kodu." }
  );
});

test("günün siparişleri ve ciro yalnızca o günü kapsar", () => {
  const sepet = { p1: 1 }; // 250 ₺
  const dun = siparisOlustur(sepet, gecerliMusteri, new Date(2026, 10, 22, 23, 59));
  const bugunSabah = siparisOlustur(sepet, gecerliMusteri, new Date(2026, 10, 23, 0, 5));
  const bugunAksam = siparisOlustur({ p2: 2 }, gecerliMusteri, new Date(2026, 10, 23, 21, 0));
  const tumu = [dun, bugunSabah, bugunAksam];

  const bugunku = gununSiparisleri(tumu, new Date(2026, 10, 23, 15, 0));
  assert.deepEqual(bugunku, [bugunSabah, bugunAksam]);
  assert.equal(gunlukCiro(bugunku), 850);

  assert.deepEqual(gununSiparisleri(tumu, new Date(2026, 10, 22)), [dun]);
  assert.equal(gunlukCiro([]), 0);
});
