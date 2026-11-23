// Sipariş oluşturma, doğrulama ve günlük özet.
// Saf fonksiyonlar: DOM'a ve localStorage'a dokunmaz, Node'da test edilebilir.

// Tarayıcıda cart.js'teki tanımlar zaten global; Node'da require ile alınır.
// "var { MENU } = require(...)" yazılırsa tarayıcıda isim çakışması olur.
const Sepet =
  typeof module !== "undefined"
    ? require("./cart.js")
    : { MENU, sepetKalemleri, sepetToplami, sepetBosMu };
const Kampanya =
  typeof module !== "undefined" ? require("./discount.js") : { indirimHesapla };

// Boşluk, tire, parantez gibi karakterler atıldıktan sonra 10 veya 11 hane olmalı.
// 532 123 45 67 → 10 hane, 0532 123 45 67 → 11 hane.
function telefonGecerliMi(telefon) {
  const rakamlar = String(telefon || "").replace(/\D/g, "");
  return rakamlar.length === 10 || rakamlar.length === 11;
}

// musteri: { ad, telefon, adres, not }
// kampanyaKodu boş bırakılırsa indirim uygulanmaz; geçersizse hata fırlatılır.
function siparisOlustur(sepet, musteri, tarih = new Date(), menu = Sepet.MENU, kampanyaKodu = "") {
  const kalemler = Sepet.sepetKalemleri(sepet, menu);
  if (kalemler.length === 0) {
    throw new Error("Sepet boş, sipariş oluşturulamaz.");
  }

  const ad = String(musteri.ad || "").trim();
  if (!ad) {
    throw new Error("Müşteri adı zorunludur.");
  }

  if (!telefonGecerliMi(musteri.telefon)) {
    throw new Error("Telefon numarası 10 veya 11 haneli olmalıdır.");
  }

  const araToplam = Sepet.sepetToplami(sepet, menu);
  const kampanya = String(kampanyaKodu || "").trim()
    ? Kampanya.indirimHesapla(araToplam, kampanyaKodu)
    : null;

  return {
    id: tarih.getTime().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
    tarih: tarih.toISOString(),
    musteri: {
      ad: ad,
      telefon: String(musteri.telefon).trim(),
      adres: String(musteri.adres || "").trim(),
    },
    not: String(musteri.not || "").trim(),
    kalemler: kalemler,
    araToplam: araToplam,
    kampanyaKodu: kampanya ? kampanya.kod : null,
    indirim: kampanya ? kampanya.indirim : 0,
    toplam: kampanya ? kampanya.toplam : araToplam,
  };
}

// Verilen günle aynı takvim gününe (yerel saate göre) ait siparişler.
function gununSiparisleri(siparisler, gun = new Date()) {
  return siparisler.filter((siparis) => {
    const t = new Date(siparis.tarih);
    return (
      t.getFullYear() === gun.getFullYear() &&
      t.getMonth() === gun.getMonth() &&
      t.getDate() === gun.getDate()
    );
  });
}

function gunlukCiro(siparisler) {
  return siparisler.reduce((toplam, siparis) => toplam + siparis.toplam, 0);
}

if (typeof module !== "undefined") {
  module.exports = {
    telefonGecerliMi,
    siparisOlustur,
    gununSiparisleri,
    gunlukCiro,
  };
}
