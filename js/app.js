// Arayüz katmanı: menüyü, sepeti ve siparişleri ekrana çizer, olayları bağlar,
// siparişleri localStorage'da saklar.
// Hesaplama ve doğrulama cart.js, discount.js ve orders.js içindeki saf fonksiyonlarda yapılır.

const SIPARIS_ANAHTARI = "siparis_asistani_siparisler";
const MENU_ANAHTARI = "siparis_asistani_menu";

let menu = menuyuOku();
let menuDuzenlemeAcik = false;
let sepet = {};
let kampanyaKodu = ""; // Uygulanmış geçerli kod; yoksa boş.
let siparisler = siparisleriOku();

const menuAlani = document.getElementById("menu");
const menuDuzenleButonu = document.getElementById("menu-duzenle-btn");
const menuYonetimi = document.getElementById("menu-yonetimi");
const urunEkleFormu = document.getElementById("urun-ekle-formu");
const kategoriOnerileri = document.getElementById("kategori-onerileri");
const varsayilanMenuButonu = document.getElementById("varsayilan-menu-btn");
const menuMesaji = document.getElementById("menu-mesaji");
const sepetListesi = document.getElementById("sepet-listesi");
const araToplamSatiri = document.getElementById("ara-toplam-satiri");
const araToplamAlani = document.getElementById("ara-toplam");
const indirimSatiri = document.getElementById("indirim-satiri");
const indirimEtiketi = document.getElementById("indirim-etiketi");
const indirimTutari = document.getElementById("indirim-tutari");
const sepetToplamAlani = document.getElementById("sepet-toplam");
const kampanyaFormu = document.getElementById("kampanya-formu");
const kampanyaKutusu = document.getElementById("kampanya-kodu");
const kampanyaKaldirButonu = document.getElementById("kampanya-kaldir");
const kampanyaMesaji = document.getElementById("kampanya-mesaji");
const temizleButonu = document.getElementById("sepeti-temizle");
const siparisFormu = document.getElementById("siparis-formu");
const formMesaji = document.getElementById("form-mesaji");
const siparisSayisiAlani = document.getElementById("siparis-sayisi");
const gunlukCiroAlani = document.getElementById("gunluk-ciro");
const siparisListesi = document.getElementById("siparis-listesi");
const fisAlani = document.getElementById("fis-alani");

// --- localStorage ---

function varsayilanMenuKopyasi() {
  return MENU.map((urun) => ({ ...urun }));
}

function menuyuOku() {
  try {
    const ham = localStorage.getItem(MENU_ANAHTARI);
    if (ham === null) return varsayilanMenuKopyasi();
    const kayit = JSON.parse(ham);
    if (!Array.isArray(kayit)) return varsayilanMenuKopyasi();
    return kayit.filter(
      (u) =>
        u &&
        typeof u.id === "string" &&
        typeof u.ad === "string" &&
        typeof u.kategori === "string" &&
        Number.isFinite(u.fiyat) &&
        u.fiyat > 0
    );
  } catch (hata) {
    return varsayilanMenuKopyasi();
  }
}

function menuyuYaz(liste) {
  try {
    localStorage.setItem(MENU_ANAHTARI, JSON.stringify(liste));
    return true;
  } catch (hata) {
    return false;
  }
}

function siparisleriOku() {
  try {
    const kayit = JSON.parse(localStorage.getItem(SIPARIS_ANAHTARI));
    return Array.isArray(kayit) ? kayit : [];
  } catch (hata) {
    return [];
  }
}

function siparisleriYaz(liste) {
  try {
    localStorage.setItem(SIPARIS_ANAHTARI, JSON.stringify(liste));
    return true;
  } catch (hata) {
    return false;
  }
}

// --- Çizim ---

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
  const kategoriler = [...new Set(menu.map((urun) => urun.kategori))];

  if (kategoriOnerileri) {
    kategoriOnerileri.replaceChildren();
    for (const kategori of kategoriler) {
      const secenek = document.createElement("option");
      secenek.value = kategori;
      kategoriOnerileri.append(secenek);
    }
  }

  if (menu.length === 0) {
    menuAlani.append(elemanOlustur("p", "liste-bos", "Menüde ürün yok. Yeni ürün ekleyin."));
    return;
  }

  for (const kategori of kategoriler) {
    const bolum = elemanOlustur("section", "kategori");
    bolum.append(elemanOlustur("h3", "kategori-baslik", kategori));

    const liste = elemanOlustur("ul", "urun-listesi");
    for (const urun of menu.filter((u) => u.kategori === kategori)) {
      const islemKutusu = elemanOlustur("div", "urun-islem");
      islemKutusu.append(
        butonOlustur("Ekle", "btn btn-ekle", { islem: "ekle", id: urun.id }, urun.ad + " ekle")
      );
      if (menuDuzenlemeAcik) {
        islemKutusu.append(
          butonOlustur("Sil", "btn btn-sil btn-kucuk", { islem: "sil", id: urun.id }, urun.ad + " ürününü sil")
        );
      }

      const satir = elemanOlustur("li", "urun");
      satir.append(
        elemanOlustur("span", "urun-ad", urun.ad),
        elemanOlustur("span", "urun-fiyat", paraBicimle(urun.fiyat)),
        islemKutusu
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
    for (const kalem of sepetKalemleri(sepet, menu)) {
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

  const araToplam = sepetToplami(sepet, menu);
  const kampanya = kampanyaKodu ? indirimHesapla(araToplam, kampanyaKodu) : null;

  araToplamSatiri.hidden = !kampanya;
  indirimSatiri.hidden = !kampanya;
  kampanyaKaldirButonu.hidden = !kampanya;
  if (kampanya) {
    araToplamAlani.textContent = paraBicimle(araToplam);
    indirimEtiketi.textContent = "İndirim (" + kampanya.kod + ", %" + kampanya.oran + ")";
    indirimTutari.textContent = "−" + paraBicimle(kampanya.indirim);
  }

  sepetToplamAlani.textContent = paraBicimle(kampanya ? kampanya.toplam : araToplam);
  temizleButonu.disabled = sepetBosMu(sepet);
}

function saatBicimle(isoTarih) {
  return new Date(isoTarih).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function siparisleriCiz() {
  // En yeni sipariş en üstte.
  const bugunku = gununSiparisleri(siparisler).sort((a, b) => b.tarih.localeCompare(a.tarih));

  siparisSayisiAlani.textContent = String(bugunku.length);
  gunlukCiroAlani.textContent = paraBicimle(gunlukCiro(bugunku));
  siparisListesi.replaceChildren();

  if (bugunku.length === 0) {
    siparisListesi.append(elemanOlustur("li", "liste-bos", "Bugün henüz sipariş yok."));
    return;
  }

  for (const siparis of bugunku) {
    const ust = elemanOlustur("div", "siparis-ust");
    ust.append(
      elemanOlustur("span", "siparis-saat", saatBicimle(siparis.tarih)),
      elemanOlustur("strong", "siparis-ad", siparis.musteri.ad),
      elemanOlustur("span", "siparis-tutar", paraBicimle(siparis.toplam))
    );

    const iletisim = [siparis.musteri.telefon, siparis.musteri.adres].filter(Boolean).join(" · ");
    const urunler = siparis.kalemler.map((k) => k.adet + "x " + k.ad).join(", ");

    const satir = elemanOlustur("li", "siparis");
    satir.append(
      ust,
      elemanOlustur("div", "siparis-detay", iletisim),
      elemanOlustur("div", "siparis-urunler", urunler)
    );
    if (siparis.indirim > 0) {
      const metin = "İndirim (" + siparis.kampanyaKodu + "): −" + paraBicimle(siparis.indirim);
      satir.append(elemanOlustur("div", "siparis-indirim", metin));
    }
    if (siparis.not) {
      satir.append(elemanOlustur("div", "siparis-not", "Not: " + siparis.not));
    }

    const alt = elemanOlustur("div", "siparis-alt");
    alt.append(
      butonOlustur(
        "Fiş yazdır",
        "btn btn-ikincil btn-kucuk",
        { islem: "yazdir", id: siparis.id },
        siparis.musteri.ad + " sipariş fişini yazdır"
      )
    );
    satir.append(alt);
    siparisListesi.append(satir);
  }
}

function fisiCiz(siparis) {
  const veri = fisVerisiHazirla(siparis);
  fisAlani.replaceChildren();

  fisAlani.append(elemanOlustur("h2", "fis-baslik", veri.baslik));

  const meta = elemanOlustur("div", "fis-meta");
  if (veri.siparisId) meta.append(elemanOlustur("div", "", "Sipariş No: " + veri.siparisId));
  if (veri.tarih) meta.append(elemanOlustur("div", "", "Tarih: " + veri.tarih));
  if (meta.childElementCount > 0) fisAlani.append(meta);

  const musteriBolumu = elemanOlustur("div", "fis-musteri");
  if (veri.musteri.ad) musteriBolumu.append(elemanOlustur("div", "", "Müşteri: " + veri.musteri.ad));
  if (veri.musteri.telefon) musteriBolumu.append(elemanOlustur("div", "", "Telefon: " + veri.musteri.telefon));
  if (veri.musteri.adres) musteriBolumu.append(elemanOlustur("div", "", "Adres: " + veri.musteri.adres));
  if (veri.not) musteriBolumu.append(elemanOlustur("div", "", "Not: " + veri.not));
  if (musteriBolumu.childElementCount > 0) fisAlani.append(musteriBolumu);

  const kalemListesi = elemanOlustur("ul", "fis-kalemler");
  for (const kalem of veri.kalemler) {
    const satir = elemanOlustur("li", "fis-kalem");
    satir.append(
      elemanOlustur("span", "fis-kalem-ad", kalem.adet + "x " + kalem.ad),
      elemanOlustur("span", "fis-kalem-tutar", paraBicimle(kalem.tutar))
    );
    kalemListesi.append(satir);
  }
  fisAlani.append(kalemListesi);

  const ozet = elemanOlustur("div", "fis-ozet");
  if (veri.indirim > 0) {
    const araSatir = elemanOlustur("div", "fis-satir");
    araSatir.append(
      elemanOlustur("span", "", "Ara toplam"),
      elemanOlustur("span", "", paraBicimle(veri.araToplam))
    );
    ozet.append(araSatir);

    const indirimEtiketi = veri.kampanyaKodu ? "İndirim (" + veri.kampanyaKodu + ")" : "İndirim";
    const indirimSatir = elemanOlustur("div", "fis-satir");
    indirimSatir.append(
      elemanOlustur("span", "", indirimEtiketi),
      elemanOlustur("span", "", "−" + paraBicimle(veri.indirim))
    );
    ozet.append(indirimSatir);
  }

  const toplamSatir = elemanOlustur("div", "fis-toplam");
  toplamSatir.append(
    elemanOlustur("strong", "", "Toplam"),
    elemanOlustur("strong", "", paraBicimle(veri.toplam))
  );
  ozet.append(toplamSatir);

  fisAlani.append(ozet, elemanOlustur("p", "fis-alt-not", "Teşekkür ederiz!"));
}

// tur: "basari", "hata" veya boş (mesajı temizler)
function mesajGoster(eleman, metin, tur) {
  eleman.textContent = metin;
  eleman.className = "form-mesaji" + (tur ? " mesaj-" + tur : "");
}

// --- Olaylar ---

function kampanyaUygula(olay) {
  olay.preventDefault();
  try {
    const sonuc = indirimHesapla(sepetToplami(sepet, menu), kampanyaKutusu.value);
    kampanyaKodu = sonuc.kod;
    kampanyaKutusu.value = sonuc.kod;
    mesajGoster(kampanyaMesaji, sonuc.kod + " uygulandı: %" + sonuc.oran + " indirim.", "basari");
  } catch (hata) {
    mesajGoster(kampanyaMesaji, hata.message, "hata");
  }
  sepetiCiz();
}

function kampanyayiSifirla() {
  kampanyaKodu = "";
  kampanyaKutusu.value = "";
  mesajGoster(kampanyaMesaji, "");
}

function siparisiKaydet(olay) {
  olay.preventDefault();
  const veri = new FormData(siparisFormu);
  const musteri = {
    ad: veri.get("ad"),
    telefon: veri.get("telefon"),
    adres: veri.get("adres"),
    not: veri.get("not"),
  };

  let siparis;
  try {
    siparis = siparisOlustur(sepet, musteri, new Date(), menu, kampanyaKodu);
  } catch (hata) {
    mesajGoster(formMesaji, hata.message, "hata");
    return;
  }

  const yeniListe = [...siparisler, siparis];
  if (!siparisleriYaz(yeniListe)) {
    mesajGoster(formMesaji, "Sipariş kaydedilemedi: tarayıcı depolamasına yazılamıyor.", "hata");
    return;
  }

  siparisler = yeniListe;
  sepet = {};
  kampanyayiSifirla();
  siparisFormu.reset();
  sepetiCiz();
  siparisleriCiz();
  mesajGoster(formMesaji, "Sipariş kaydedildi: " + paraBicimle(siparis.toplam), "basari");
}

function menuDuzenlemeDegistir() {
  menuDuzenlemeAcik = !menuDuzenlemeAcik;
  menuYonetimi.hidden = !menuDuzenlemeAcik;
  menuDuzenleButonu.textContent = menuDuzenlemeAcik ? "Düzenlemeyi kapat" : "Menüyü düzenle";
  menuDuzenleButonu.setAttribute("aria-expanded", String(menuDuzenlemeAcik));
  mesajGoster(menuMesaji, "");
  menuyuCiz();
}

function urunEkleGonderildi(olay) {
  olay.preventDefault();
  const veri = new FormData(urunEkleFormu);
  const yeniUrun = {
    ad: veri.get("ad"),
    kategori: veri.get("kategori"),
    fiyat: veri.get("fiyat"),
  };

  let yeniMenu;
  try {
    yeniMenu = urunEkle(menu, yeniUrun);
  } catch (hata) {
    mesajGoster(menuMesaji, hata.message, "hata");
    return;
  }

  if (!menuyuYaz(yeniMenu)) {
    mesajGoster(menuMesaji, "Ürün eklenemedi: tarayıcı depolamasına yazılamıyor.", "hata");
    return;
  }

  const eklenen = yeniMenu[yeniMenu.length - 1];
  menu = yeniMenu;
  urunEkleFormu.reset();
  menuyuCiz();
  mesajGoster(menuMesaji, eklenen.ad + " menüye eklendi.", "basari");
}

function varsayilanMenuyuYukle() {
  const varsayilan = varsayilanMenuKopyasi();
  if (!menuyuYaz(varsayilan)) {
    mesajGoster(menuMesaji, "Varsayılan menü yüklenemedi.", "hata");
    return;
  }
  menu = varsayilan;
  for (const urunId of Object.keys(sepet)) {
    if (!urunBul(urunId, menu)) {
      sepet = sepettenUrunKaldir(sepet, urunId);
    }
  }
  menuyuCiz();
  sepetiCiz();
  mesajGoster(menuMesaji, "Varsayılan örnek menü yüklendi.", "basari");
}

// Menüdeki "Ekle"/"Sil" ve sepetteki −/+ butonları bu işleyiciyi kullanır.
function sepetButonunaTiklandi(olay) {
  const buton = olay.target.closest("button[data-islem]");
  if (!buton) return;

  if (buton.dataset.islem === "ekle") {
    sepet = sepeteEkle(sepet, buton.dataset.id, menu);
    sepetiCiz();
  } else if (buton.dataset.islem === "azalt") {
    sepet = adetAzalt(sepet, buton.dataset.id);
    sepetiCiz();
  } else if (buton.dataset.islem === "sil") {
    const silinen = urunBul(buton.dataset.id, menu);
    const yeniMenu = urunSil(menu, buton.dataset.id);
    if (!menuyuYaz(yeniMenu)) {
      mesajGoster(menuMesaji, "Ürün silinemedi: tarayıcı depolamasına yazılamıyor.", "hata");
      return;
    }
    menu = yeniMenu;
    sepet = sepettenUrunKaldir(sepet, buton.dataset.id);
    menuyuCiz();
    sepetiCiz();
    if (silinen) {
      mesajGoster(menuMesaji, silinen.ad + " menüden silindi.", "basari");
    }
  }
}

function fisYazdirTiklandi(olay) {
  const buton = olay.target.closest('button[data-islem="yazdir"]');
  if (!buton) return;

  const siparis = siparisler.find((s) => s.id === buton.dataset.id);
  if (!siparis) return;

  fisiCiz(siparis);
  window.print();
}

menuDuzenleButonu.addEventListener("click", menuDuzenlemeDegistir);
urunEkleFormu.addEventListener("submit", urunEkleGonderildi);
varsayilanMenuButonu.addEventListener("click", varsayilanMenuyuYukle);
menuAlani.addEventListener("click", sepetButonunaTiklandi);
sepetListesi.addEventListener("click", sepetButonunaTiklandi);
siparisListesi.addEventListener("click", fisYazdirTiklandi);
kampanyaFormu.addEventListener("submit", kampanyaUygula);
kampanyaKaldirButonu.addEventListener("click", () => {
  kampanyayiSifirla();
  sepetiCiz();
});
temizleButonu.addEventListener("click", () => {
  sepet = {};
  kampanyayiSifirla();
  sepetiCiz();
});
siparisFormu.addEventListener("submit", siparisiKaydet);

menuyuCiz();
sepetiCiz();
siparisleriCiz();
