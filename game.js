/* =============================================
   GAME.JS — Oyun Motoru
   Bağlı: index.html
   Kullanır: Words, UI, Grid
   ============================================= */

const Game = (() => {

  const ALFABE = 'ABCDEFGHIİKLMNOPRSTUYZ'.split('');
  const BORU_SAYISI = 3;
  const BEKLEME_SURE = 5;

  let durum = {};

  function init() {
    durum = {
      puan:         0,
      can:          3,
      seviye:       1,
      kelimeSira:   0,
      aktifHarfler: [],   // 3 boru harfi
      dogruIndex:   -1,
      bekleyenHarf: null,
      secimYapildi: false,
      oyunBitti:    false,
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
    const veri  = Words.getKelime(durum.seviye, durum.kelimeSira);
    const eksik = Words.getEksikSayisi(durum.seviye);
    Grid.init(veri.kelime, eksik, _kelimeTamam);
  }

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

    UI.tezgahFlash();
    const puan = kelime.length * 10 * durum.seviye;
    durum.puan += puan;
    UI.setPuan(durum.puan);

    const veri = Words.getKelime(durum.seviye, durum.kelimeSira);
    UI.hikayeEkle(kelime, veri.tanim);
    durum.kelimeSira++;
    UI.setKelimeSayisi(durum.kelimeSira);

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

    durum.secimYapildi = false;

    // Doğru harf: mevcut kelimeden rastgele bir harf
    const veri     = Words.getKelime(durum.seviye, durum.kelimeSira);
    const dogru    = veri.harf[Math.floor(Math.random() * veri.harf.length)];
    durum.dogruIndex = Math.floor(Math.random() * BORU_SAYISI);

    const harfler = Array(BORU_SAYISI).fill(null).map((_, i) => {
      return i === durum.dogruIndex ? dogru : _rastgeleHarf([dogru]);
    });

    durum.aktifHarfler = harfler;

    // Siradaki gösterim
    const siradaki = Array(3).fill(null).map(() => _rastgeleHarf([]));
    UI.setSiradaki(siradaki);
    UI.setBorular(harfler);
  }

  function _rastgeleHarf(haric) {
    let h;
    do { h = ALFABE[Math.floor(Math.random() * ALFABE.length)]; }
    while (haric.includes(h));
    return h;
  }

  // ── SEÇİM ──
  function harfSec(index) {
    if (durum.oyunBitti || durum.secimYapildi || durum.bekleyenHarf) return;

    durum.secimYapildi = true;
    const dogru = index === durum.dogruIndex;

    // Renk göster
    UI.boruRenkGoster(index, dogru);

    if (dogru) {
      // Can kazan
      if (durum.can < 3) {
        durum.can++;
        UI.setCanlar(durum.can);
      }
      // Harf bekleyen alana gel
      durum.bekleyenHarf = durum.aktifHarfler[index];
      UI.bekleyenGoster(durum.bekleyenHarf, BEKLEME_SURE, _bekleyenSureDoldu);
    } else {
      // Yanlış — kısa bekleyip düş
      setTimeout(() => {
        _yanlisHarflerDus([durum.aktifHarfler[index]]);
        _yeniBorular();
      }, 400);
    }
  }

  // ── BEKLEYEN ──
  function bekleyenTezgahaKoy(hedefIndex) {
    if (!durum.bekleyenHarf) return;

    const basarili = Grid.bekleyenKoy(durum.bekleyenHarf, hedefIndex);
    if (basarili) {
      durum.bekleyenHarf = null;
      UI.bekleyenGizle();
      // Eğer hâlâ eksik hücre varsa yeni boru getirme — bekle
      // Eksik kalmadıysa grid kontrol zaten çalıştı
      if (!Grid.getEksikVar()) {
        _yeniBorular();
      } else {
        _yeniBorular();
      }
    }
  }

  function _bekleyenSureDoldu() {
    // 5sn doldu — bekleyen harf + tezgahtaki harfler düşer
    if (durum.bekleyenHarf) {
      const tezgahHarfleri = Grid.getTumHarfler();
      _yanlisHarflerDus([durum.bekleyenHarf, ...tezgahHarfleri]);
    }
    durum.bekleyenHarf = null;

    Grid.temizle();
    _yeniKelimeYukle();
    _yeniBorular();
  }

  // ── YANLIŞ ──
  function _yanlisHarflerDus(harfler) {
    if (!harfler || harfler.length === 0) return;
    UI.yanlisEkle(harfler);
    _oyunBitiKontrol();
  }

  function _oyunBitiKontrol() {
    const zoneD  = document.getElementById('zone-d');
    const yanlis = document.getElementById('yanlis-grid');
    if (!zoneD || !yanlis) return;

    const hucreW   = zoneD.clientWidth / 8;
    const satirSay = Math.ceil(yanlis.children.length / 8);
    const doluH    = satirSay * (hucreW + 2);

    if (doluH >= zoneD.clientHeight) {
      _oyunBitti();
    }
  }

  function _oyunBitti() {
    if (durum.oyunBitti) return;
    durum.oyunBitti = true;
    UI.bekleyenGizle();
    setTimeout(() => {
      alert(`OYUN BİTTİ!\nPuan: ${durum.puan}\nKelime: ${durum.kelimeSira}\nSeviye: ${durum.seviye}`);
      init();
    }, 500);
  }

  window.addEventListener('DOMContentLoaded', () => init());

  return { init, harfSec, bekleyenTezgahaKoy };

})();
