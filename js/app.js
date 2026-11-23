// Arayüz katmanı: menüyü ve sepeti ekrana çizer, butonları bağlar.
// Hesaplamaların hepsi cart.js içindeki saf fonksiyonlarda yapılır.

let sepet = {};

const menuAlani = document.getElementById("menu");
const sepetListesi = document.getElementById("sepet-listesi");
const sepetToplamAlani = document.getElementById("sepet-toplam");
const temizleButonu = document.getElementById("sepeti-temizle");

// Metinler textContent ile basıldığı için HTML olarak yorumlanmaz.
function elemanOlustur(etiket, sinif, metin) {
  const eleman = document.createElement(etiket);
  if (sinif) eleman.className = sinif;
  if (metin !== undefined) eleman.textContent = metin;
  return eleman;
}

function butonOlustur(metin, sinif, veri, etiket) {
  const buton = elemanOlustur("button", sinif, metin);
  buton.type = "button";
  Object.assign(buton.dataset, veri);
  if (etiket) buton.setAttribute("aria-label", etiket);
  return buton;
}

function menuyuCiz() {
  menuAlani.replaceChildren();
  const kategoriler = [...new Set(MENU.map((urun) => urun.kategori))];

  for (const kategori of kategoriler) {
    const bolum = elemanOlustur("section", "kategori");
    bolum.append(elemanOlustur("h3", "kategori-baslik", kategori));

    const liste = elemanOlustur("ul", "urun-listesi");
    for (const urun of MENU.filter((u) => u.kategori === kategori)) {
      const satir = elemanOlustur("li", "urun");
      satir.append(
        elemanOlustur("span", "urun-ad", urun.ad),
        elemanOlustur("span", "urun-fiyat", paraBicimle(urun.fiyat)),
        butonOlustur("Ekle", "btn btn-ekle", { islem: "ekle", id: urun.id }, urun.ad + " ekle")
      );
      liste.append(satir);
    }
    bolum.append(liste);
    menuAlani.append(bolum);
  }
}

function sepetiCiz() {
  sepetListesi.replaceChildren();

  if (sepetBosMu(sepet)) {
    sepetListesi.append(elemanOlustur("li", "sepet-bos", "Sepet boş. Menüden ürün ekleyin."));
  } else {
    for (const kalem of sepetKalemleri(sepet)) {
      const adetKutusu = elemanOlustur("div", "adet-kutusu");
      adetKutusu.append(
        butonOlustur("−", "btn btn-adet", { islem: "azalt", id: kalem.id }, kalem.ad + " adedini azalt"),
        elemanOlustur("span", "adet", String(kalem.adet)),
        butonOlustur("+", "btn btn-adet", { islem: "ekle", id: kalem.id }, kalem.ad + " adedini artır")
      );

      const satir = elemanOlustur("li", "sepet-satiri");
      satir.append(
        elemanOlustur("span", "kalem-ad", kalem.ad),
        adetKutusu,
        elemanOlustur("span", "kalem-tutar", paraBicimle(kalem.tutar))
      );
      sepetListesi.append(satir);
    }
  }

  sepetToplamAlani.textContent = paraBicimle(sepetToplami(sepet));
  temizleButonu.disabled = sepetBosMu(sepet);
}

// Menüdeki "Ekle" ve sepetteki −/+ butonları aynı işleyiciyi kullanır.
function sepetButonunaTiklandi(olay) {
  const buton = olay.target.closest("button[data-islem]");
  if (!buton) return;

  if (buton.dataset.islem === "ekle") {
    sepet = sepeteEkle(sepet, buton.dataset.id);
  } else if (buton.dataset.islem === "azalt") {
    sepet = adetAzalt(sepet, buton.dataset.id);
  }
  sepetiCiz();
}

menuAlani.addEventListener("click", sepetButonunaTiklandi);
sepetListesi.addEventListener("click", sepetButonunaTiklandi);
temizleButonu.addEventListener("click", () => {
  sepet = {};
  sepetiCiz();
});

menuyuCiz();
sepetiCiz();
