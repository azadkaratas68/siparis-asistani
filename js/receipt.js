// Sipariş fişi hazırlama ve metin biçimlendirme.
// Saf fonksiyonlar: DOM'a dokunmaz, Node'da test edilebilir.

// Tarayıcıda cart.js'teki paraBicimle zaten global; Node'da require ile alınır.
const FisYardimci =
  typeof module !== "undefined" ? require("./cart.js") : { paraBicimle };

function fisTarihBicimle(isoTarih) {
  const t = new Date(isoTarih);
  if (Number.isNaN(t.getTime())) {
    return "";
  }
  const tarih = t.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const saat = t.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return tarih + " " + saat;
}

// Sipariş nesnesinden fiş yazdırmada kullanılacak tutarlı yapıyı üretir.
// Eski kayıtlarda araToplam/indirim alanları yoksa geriye dönük uyumlu hesaplar.
function fisVerisiHazirla(siparis) {
  if (!siparis || !Array.isArray(siparis.kalemler) || siparis.kalemler.length === 0) {
    throw new Error("Fiş oluşturmak için geçerli bir sipariş gerekir.");
  }

  const kalemler = siparis.kalemler.map((kalem) => {
    const adet = Number(kalem.adet) || 0;
    const birimFiyat = Number(kalem.birimFiyat) || 0;
    const tutar = Number.isFinite(kalem.tutar) ? kalem.tutar : birimFiyat * adet;
    return {
      ad: String(kalem.ad || ""),
      adet: adet,
      birimFiyat: birimFiyat,
      tutar: tutar,
    };
  });

  const kalemToplami = kalemler.reduce((toplam, kalem) => toplam + kalem.tutar, 0);
  const indirim = Number(siparis.indirim) > 0 ? Number(siparis.indirim) : 0;
  const toplam = Number.isFinite(siparis.toplam) ? siparis.toplam : kalemToplami;
  const araToplam = Number.isFinite(siparis.araToplam) ? siparis.araToplam : toplam + indirim;

  const hamMusteri = siparis.musteri || {};
  return {
    baslik: "Restoran Sipariş Kontrolü",
    siparisId: String(siparis.id || ""),
    tarih: fisTarihBicimle(siparis.tarih),
    musteri: {
      ad: String(hamMusteri.ad || "").trim(),
      telefon: String(hamMusteri.telefon || "").trim(),
      adres: String(hamMusteri.adres || "").trim(),
    },
    not: String(siparis.not || "").trim(),
    kalemler: kalemler,
    araToplam: araToplam,
    kampanyaKodu: indirim > 0 && siparis.kampanyaKodu ? String(siparis.kampanyaKodu) : null,
    indirim: indirim,
    toplam: toplam,
  };
}

function fisMetniOlustur(siparis) {
  const veri = fisVerisiHazirla(siparis);
  const satirlar = [veri.baslik, "--------------------------------"];

  if (veri.siparisId) satirlar.push("Sipariş No: " + veri.siparisId);
  if (veri.tarih) satirlar.push("Tarih: " + veri.tarih);
  if (veri.musteri.ad) satirlar.push("Müşteri: " + veri.musteri.ad);
  if (veri.musteri.telefon) satirlar.push("Telefon: " + veri.musteri.telefon);
  if (veri.musteri.adres) satirlar.push("Adres: " + veri.musteri.adres);
  if (veri.not) satirlar.push("Not: " + veri.not);

  satirlar.push("--------------------------------");
  for (const kalem of veri.kalemler) {
    satirlar.push(kalem.adet + "x " + kalem.ad + " - " + FisYardimci.paraBicimle(kalem.tutar));
  }
  satirlar.push("--------------------------------");

  if (veri.indirim > 0) {
    satirlar.push("Ara toplam: " + FisYardimci.paraBicimle(veri.araToplam));
    const indirimEtiketi = veri.kampanyaKodu ? "İndirim (" + veri.kampanyaKodu + ")" : "İndirim";
    satirlar.push(indirimEtiketi + ": −" + FisYardimci.paraBicimle(veri.indirim));
  }

  satirlar.push("Toplam: " + FisYardimci.paraBicimle(veri.toplam));
  return satirlar.join("\n");
}

if (typeof module !== "undefined") {
  module.exports = {
    fisTarihBicimle,
    fisVerisiHazirla,
    fisMetniOlustur,
  };
}
