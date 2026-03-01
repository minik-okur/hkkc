/* =============================================
   GAME.JS — Oyun Motoru
   Bağlı: index.html
   Kullanır: Words, UI, Grid
   ============================================= */

const Game = (() => {

  const ALFABE = 'ABCDEFGHIİKLMNOPRSTUYZ'.split('');
  const BORU_SAYISI = 3;
  const BEKLEME_SURE = 5; // saniye

  let durum = {
    puan:        0,
    can:         3,
    seviye:      1,
    kelimeSira:  0,   // seviyedeki kaçıncı kelime
    aktifBorular: [], // [{ harf, dogru }]
    siradaki:    [],  // sonraki 3 harf (gösterim için)
    bekleyenHarf: null,
    bekleyenTimer: null,
    oyunBitti:   false,
    dogruIndex:  -1,
  };

  function init() {
    durum = {
      puan: 0, can: 3, seviye: 1, kelimeSira: 0,
      aktifBorular: [], siradaki: [],
      bekleyenHarf: null, bekleyenTimer: null,
      oyunBitti: false, dogruIndex: -1,
    };

    UI.setCanlar(3);
    UI.setPuan(0);
    UI.setKelimeSayisi(0);
    UI.setSeviye(1);
    UI.hikayeTemizle();
    UI.yanlisTemizle();
    UI.bekleyenGizle();

    _yeniKelimeYukle();
    _yeniBorular();
  }

  // ── KELİME ──
  function _yeniKelimeYukle() {
    const veri = Words.getKelime(durum.seviye, durum.kelimeSira);
    const eksik = Words.getEksikSayisi(durum.seviye);

    Grid.init(veri.kelime, eksik, _kelimeTamam);
  }

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

    // Flash + puan
    UI.tezgahFlash('yesil');
    const puan = kelime.length * 10 * durum.seviye;
    durum.puan += puan;
    UI.setPuan(durum.puan);

    // Hikayeye ekle
    const veri = Words.getKelime(durum.seviye, durum.kelimeSira);
    UI.hikayeEkle(kelime, veri.tanim);
    UI.setKelimeSayisi(durum.kelimeSira + 1);

    durum.kelimeSira++;

    // Seviye geçişi
    const sevVeri = Words.getSeviye(durum.seviye);
    if (durum.kelimeSira >= sevVeri.kelimeler.length) {
      durum.kelimeSira = 0;
      if (durum.seviye < Words.toplamSeviye()) {
        durum.seviye++;
        UI.setSeviye(durum.seviye);
      }
    }

    setTimeout(() => {
      Grid.temizle();
      _yeniKelimeYukle();
    }, 700);
  }

  // ── BORULAR ──
  function _yeniBorular() {
    if (durum.oyunBitti) return;

    // 3 harf üret, 1 tanesi doğru (kelimeyle alakalı veya rastgele)
    const veri = Words.getKelime(durum.seviye, durum.kelimeSira);
    const eksikHarfler = Grid.getEksikHarfler();
    if (eksikHarfler.length === 0) return;
    const dogru = eksikHarfler[Math.floor(Math.random() * eksikHarfler.length)];
    durum.dogruIndex = Math.floor(Math.random() * BORU_SAYISI);

    const harfler = Array(BORU_SAYISI).fill(null).map((_, i) => {
      if (i === durum.dogruIndex) return dogru;
      return _rastgeleHarf([dogru]);
    });

    durum.aktifBorular = harfler.map((h, i) => ({
      harf: h,
      dogru: i === durum.dogruIndex,
    }));

    // Siradaki 3 (gösterim)
    durum.siradaki = Array(3).fill(null).map(() => _rastgeleHarf([]));

    UI.setSiradaki(durum.siradaki);
    UI.setBorular(harfler, durum.dogruIndex);
  }

  function _rastgeleHarf(haric) {
    let h;
    do { h = ALFABE[Math.floor(Math.random() * ALFABE.length)]; }
    while (haric.includes(h));
    return h;
  }

  // ── SEÇİM ──
  function harfSec(index) {
    if (durum.oyunBitti) return;
    if (durum.bekleyenHarf) return; // zaten bekliyor

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      // Can kazan (max 3)
      if (durum.can < 3) {
        durum.can++;
        UI.setCanlar(durum.can);
      }
      // Harf bekleyen alana gel, 5sn ver
      durum.bekleyenHarf = secilen.harf;
      UI.bekleyenGoster(secilen.harf, BEKLEME_SURE, _bekleyenSureDoldu);
    } else {
      // Yanlış — o harf + tezgahtaki harfler zone d'ye
      _yanlisHarflerDus([secilen.harf]);
      _yeniBorular();
    }
  }

  function _bekleyenSureDoldu() {
    // 5sn doldu, oyuncu yerleştirmedi
    // Bekleyen harf + tezgahtaki tüm harfler zone d'ye
    if (durum.bekleyenHarf) {
      _yanlisHarflerDus([durum.bekleyenHarf]);
    }
    durum.bekleyenHarf = null;
    UI.bekleyenGizle();

    // Tezgahtaki harfleri de düşür
    _tezgahHarfleriniDusur();
    _yeniKelimeYukle();
    _yeniBorular();
  }

  function _tezgahHarfleriniDusur() {
    // Tezgahtaki dolu harfleri zone d'ye ekle
    const hucreler = document.querySelectorAll('.tezgah-hucre.dolu');
    const harfler = Array.from(hucreler).map(h => h.textContent);
    if (harfler.length > 0) _yanlisHarflerDus(harfler);
    Grid.temizle();
  }

  // Bekleyen harf tezgaha tıklanınca (UI'dan çağrılacak)
  // Şimdilik: bekleyen harfi ilk eksik yere otomatik koy
  // İleride: oyuncu sürükleyerek koyacak
  function bekleyenYerlestir() {
    if (!durum.bekleyenHarf) return;
    const basarili = Grid.harfEkle(durum.bekleyenHarf);
    if (basarili) {
      durum.bekleyenHarf = null;
      UI.bekleyenGizle();
      _yeniBorular();
    }
  }

  // ── YANLIŞ HARFLER ──
  function _yanlisHarflerDus(harfler) {
    UI.yanlisEkle(harfler);
    _oyunBitiKontrol();
  }

  function _oyunBitiKontrol() {
    // Zone d yüksekliği zone b'ye dayanıyor mu?
    const zoneD = document.getElementById('zone-d');
    const zoneB = document.getElementById('zone-b');
    const yanlis = document.getElementById('yanlis-grid');

    if (!zoneD || !zoneB || !yanlis) return;

    const dRect = zoneD.getBoundingClientRect();
    const yanlisDolu = yanlis.children.length;

    // Yaklaşık hesap: her satır 8 hücre
    const satirSayisi = Math.ceil(yanlisDolu / 8);
    const hucreYukseklik = zoneD.clientWidth / 8; // kare hücre
    const doluYukseklik = satirSayisi * (hucreYukseklik + 2);

    if (doluYukseklik >= zoneD.clientHeight) {
      _oyunBitti();
    }
  }

  function _oyunBitti() {
    durum.oyunBitti = true;
    UI.bekleyenGizle();
    setTimeout(() => {
      alert(`OYUN BİTTİ!\nPuan: ${durum.puan}\nKelime: ${durum.kelimeSira}\nSeviye: ${durum.seviye}`);
      init();
    }, 500);
  }

  // DOMContentLoaded
  window.addEventListener('DOMContentLoaded', () => {
    // Bekleyen harfe tıklanınca yerleştir
    document.getElementById('bekleyen-harf').addEventListener('click', () => {
      bekleyenYerlestir();
    });

    init();
  });

  return { init, harfSec, bekleyenYerlestir };

})();
