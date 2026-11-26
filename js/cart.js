// Menü verisi ve sepet mantığı.
// Buradaki fonksiyonlar saftır: DOM'a dokunmaz, verilen sepeti değiştirmez,
// her zaman yeni bir sepet döndürür. Bu sayede Node'da test edilebilir.
//
// Sepet biçimi: { urunId: adet }   örnek: { p1: 2, i1: 1 }

const MENU = [
  { id: "p1", ad: "Margarita Pizza", kategori: "Pizza", fiyat: 250 },
  { id: "p2", ad: "Karışık Pizza", kategori: "Pizza", fiyat: 300 },
  { id: "p3", ad: "Sucuklu Pizza", kategori: "Pizza", fiyat: 290 },
  { id: "b1", ad: "Klasik Burger", kategori: "Burger", fiyat: 220 },
  { id: "b2", ad: "Cheeseburger", kategori: "Burger", fiyat: 240 },
  { id: "m1", ad: "Penne Arrabbiata", kategori: "Makarna", fiyat: 200 },
  { id: "t1", ad: "Çıtır Tavuk (6 adet)", kategori: "Tavuk", fiyat: 180 },
  { id: "i1", ad: "Ayran", kategori: "İçecek", fiyat: 30 },
  { id: "i2", ad: "Kola (330 ml)", kategori: "İçecek", fiyat: 45 },
];

function urunBul(urunId, menu = MENU) {
  return menu.find((urun) => urun.id === urunId);
}

// yeniUrun: { ad, kategori, fiyat, id? }
// Orijinal menüyü değiştirmez, yeni menü dizisi döndürür.
function urunEkle(menu, yeniUrun) {
  const veri = yeniUrun || {};
  const ad = String(veri.ad || "").trim();
  if (!ad) {
    throw new Error("Ürün adı zorunludur.");
  }

  const kategori = String(veri.kategori || "").trim();
  if (!kategori) {
    throw new Error("Kategori zorunludur.");
  }

  const hamFiyat = typeof veri.fiyat === "string" ? veri.fiyat.replace(",", ".") : veri.fiyat;
  const fiyat = Number(hamFiyat);
  if (!Number.isFinite(fiyat) || fiyat <= 0) {
    throw new Error("Fiyat 0'dan büyük bir sayı olmalıdır.");
  }

  let id = String(veri.id || "").trim();
  if (!id || menu.some((urun) => urun.id === id)) {
    do {
      id = "u-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    } while (menu.some((urun) => urun.id === id));
  }

  return [
    ...menu,
    {
      id: id,
      ad: ad,
      kategori: kategori,
      fiyat: Math.round(fiyat * 100) / 100,
    },
  ];
}

function urunSil(menu, urunId) {
  return menu.filter((urun) => urun.id !== urunId);
}

function sepettenUrunKaldir(sepet, urunId) {
  const yeniSepet = { ...sepet };
  delete yeniSepet[urunId];
  return yeniSepet;
}

function sepeteEkle(sepet, urunId, menu = MENU) {
  if (!urunBul(urunId, menu)) {
    throw new Error("Menüde böyle bir ürün yok: " + urunId);
  }
  return { ...sepet, [urunId]: (sepet[urunId] || 0) + 1 };
}

function adetAzalt(sepet, urunId) {
  const yeniSepet = { ...sepet };
  if (!yeniSepet[urunId]) {
    return yeniSepet;
  }
  if (yeniSepet[urunId] <= 1) {
    delete yeniSepet[urunId];
  } else {
    yeniSepet[urunId] -= 1;
  }
  return yeniSepet;
}

// [{ id, ad, adet, birimFiyat, tutar }] — sepete eklenme sırasıyla.
// Menüde artık bulunmayan ürünler atlanır.
function sepetKalemleri(sepet, menu = MENU) {
  const kalemler = [];
  for (const [urunId, adet] of Object.entries(sepet)) {
    const urun = urunBul(urunId, menu);
    if (!urun) continue;
    kalemler.push({
      id: urun.id,
      ad: urun.ad,
      adet: adet,
      birimFiyat: urun.fiyat,
      tutar: urun.fiyat * adet,
    });
  }
  return kalemler;
}

function sepetToplami(sepet, menu = MENU) {
  return sepetKalemleri(sepet, menu).reduce((toplam, kalem) => toplam + kalem.tutar, 0);
}

function sepetBosMu(sepet) {
  return Object.keys(sepet).length === 0;
}

function paraBicimle(tutar) {
  return tutar.toLocaleString("tr-TR") + " ₺";
}

if (typeof module !== "undefined") {
  module.exports = {
    MENU,
    urunBul,
    urunEkle,
    urunSil,
    sepeteEkle,
    adetAzalt,
    sepettenUrunKaldir,
    sepetKalemleri,
    sepetToplami,
    sepetBosMu,
    paraBicimle,
  };
}
