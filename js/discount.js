// Kampanya (indirim) kodları.
// Saf fonksiyonlar: DOM'a dokunmaz, Node'da test edilebilir.

const KAMPANYALAR = {
  PIZZA10: { oran: 10 },
  INDIRIM10: { oran: 10 },
};

// Boşluklar ve büyük/küçük harf fark etmez. Türkçe klavyede Caps Lock açıkken
// "i" tuşu "İ" yazdığı için "PİZZA10" da "PIZZA10" kabul edilir.
function kampanyaKoduDuzenle(kod) {
  return String(kod || "").trim().replace(/İ/g, "I").toUpperCase();
}

// → { kod, oran, araToplam, indirim, toplam }
// Tutarlar kuruşa yuvarlanır.
function indirimHesapla(araToplam, kod) {
  const temizKod = kampanyaKoduDuzenle(kod);
  if (!temizKod) {
    throw new Error("Kampanya kodu girin.");
  }
  if (!Object.hasOwn(KAMPANYALAR, temizKod)) {
    throw new Error("Geçersiz kampanya kodu.");
  }

  const oran = KAMPANYALAR[temizKod].oran;
  const indirim = Math.round(araToplam * oran) / 100;
  return {
    kod: temizKod,
    oran: oran,
    araToplam: araToplam,
    indirim: indirim,
    toplam: Math.round((araToplam - indirim) * 100) / 100,
  };
}

if (typeof module !== "undefined") {
  module.exports = {
    KAMPANYALAR,
    kampanyaKoduDuzenle,
    indirimHesapla,
  };
}
