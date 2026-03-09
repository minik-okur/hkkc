/* =============================================
   GAME.JS — Oyun Motoru
   Bağlı: index.html
   Kullanır: Words, UI, Grid, Ses
   ============================================= */

const Game = (() => {

  const ALFABE       = 'ABCDEFGHİKLMNOPRSTUYZ'.split('');
  const BEKLEME_SURE = 5;
  const MAX_YANLIS   = 3;

  let durum = _basDurum();

  function _basDurum() {
    return {
      puan:          0,
      can:           3,
      seviye:        1,
      kelimeSira:    0,       // seviyedeki kaçıncı kelime
      seviyeKelimeler: [],    // Words.getKelimeler() çıktısı — tüm kelimeler
      tamamlananlar: [],      // hangi kelimeler tamamlandı [bool, bool, ...]
      aktifBorular:  [],
      bekleyenHarf:  null,
      oyunBitti:     false,
      dogruIndex:    -1,
      yanlisSecim:   0,
    };
  }

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init() {
    durum = _basDurum();

    UI.setCanlar(durum.can);
    UI.setPuan(durum.puan);
    UI.setKelimeSayisi(0);
    UI.setSeviye(durum.seviye);
    UI.yanlisTemizle();
    UI.bekleyenGizle();
    UI.sozAlaniTemizle();

    _seviyeBaslat(durum.seviye);
  }

  // ══════════════════════════════
  // SEVİYE BAŞLAT
  // ══════════════════════════════

  function _seviyeBaslat(sevNo) {
    // Seviyedeki tüm oyun kelimelerini al
    durum.seviyeKelimeler = Words.getKelimeler(sevNo);
    durum.tamamlananlar  = durum.seviyeKelimeler.map(() => false);
    durum.kelimeSira     = 0;

    // Atasözü alanını kur
    const sozVeri = Words.getSoz(sevNo);
    UI.sozAlaniOlustur(
      durum.seviyeKelimeler,
      sozVeri.soz,
      sozVeri.kaynak
    );

    UI.setKelimeSayisi(0, durum.seviyeKelimeler.length);

    Grid.temizle();
    _yeniKelimeYukle();
    _yeniBorular();
  }

  // ══════════════════════════════
  // KELİME YÜKLEme
  // ══════════════════════════════

  function _yeniKelimeYukle() {
    if (durum.kelimeSira >= durum.seviyeKelimeler.length) return;

    const veri  = durum.seviyeKelimeler[durum.kelimeSira];
    durum.yanlisSecim = 0;

    Grid.init(veri.kelime, veri.eksik, _kelimeTamam);
  }

  // ══════════════════════════════
  // KELİME TAMAMLANDI
  // ══════════════════════════════

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

    UI.tezgahFlash();
    Ses.kelimeTamam();

    // Puan
    const puan = kelime.length * 10 * durum.seviye;
    durum.puan += puan;
    UI.setPuan(durum.puan);

    // Can bonusu
    durum.can++;
    UI.setCanlar(durum.can);

    // Atasözü alanında kutuyu aç
    UI.sozKutucukAc(kelime);

    // Tamamlananları güncelle
    durum.tamamlananlar[durum.kelimeSira] = true;
    UI.setKelimeSayisi(
      durum.tamamlananlar.filter(Boolean).length,
      durum.seviyeKelimeler.length
    );

    durum.kelimeSira++;

    // Tüm kelimeler tamamlandı mı?
    if (durum.tamamlananlar.every(Boolean)) {
      _seviyeBitti();
      return;
    }

    // Sonraki kelimeye geç
    setTimeout(() => {
      Grid.temizle();
      _yeniKelimeYukle();
      _yeniBorular();
    }, 700);
  }

  // ══════════════════════════════
  // SEVİYE BİTTİ
  // ══════════════════════════════

  function _seviyeBitti() {
    const sozVeri = Words.getSoz(durum.seviye);
    Ses.seviyeGecis();

    UI.seviyeSonuGoster(durum.seviye, sozVeri.soz, sozVeri.kaynak, () => {
      // Sonraki seviyeye geç
      if (durum.seviye < Words.toplamSeviye()) {
        durum.seviye++;
        UI.setSeviye(durum.seviye);
      }

      // Seviye sonu can bonusu
      durum.can += 2;
      UI.setCanlar(durum.can);

      UI.yanlisTemizle();
      UI.sozAlaniTemizle();
      Grid.temizle();

      _seviyeBaslat(durum.seviye);
    });
  }

  // ══════════════════════════════
  // KELİME ATLAMA (3 yanlış)
  // ══════════════════════════════

  function _kelimeAtla() {
    if (durum.oyunBitti) return;

    UI.tezgahSalla();
    Ses.sureDoldu();
    _tezgahHarfleriniDusur();

    durum.kelimeSira++;

    // Tüm kelimeler bitti mi (atlanarak da olsa)
    if (durum.kelimeSira >= durum.seviyeKelimeler.length) {
      _seviyeBitti();
      return;
    }

    setTimeout(() => {
      Grid.temizle();
      _yeniKelimeYukle();
      _yeniBorular();
    }, 700);
  }

  // ══════════════════════════════
  // BORULAR
  // ══════════════════════════════

  function _yeniBorular() {
    if (durum.oyunBitti) return;

    const eksikHarfler = Grid.getEksikHarfler();
    if (eksikHarfler.length === 0) return;

    // Her boruda tek harf — doğru harf + 2 yanlış
    const BORU_SAYISI = 3;
    const dogru       = eksikHarfler[Math.floor(Math.random() * eksikHarfler.length)];
    durum.dogruIndex  = Math.floor(Math.random() * BORU_SAYISI);

    const borular = [];
    for (let i = 0; i < BORU_SAYISI; i++) {
      const harf = i === durum.dogruIndex
        ? dogru
        : _rastgeleHarf([...eksikHarfler, dogru]);

      borular.push({ harfler: [harf], dogru: i === durum.dogruIndex });
    }

    durum.aktifBorular = borular;
    UI.setBorular(borular);
  }

  function _rastgeleHarf(haric) {
    let h;
    do { h = ALFABE[Math.floor(Math.random() * ALFABE.length)]; }
    while (haric.includes(h));
    return h;
  }

  // ══════════════════════════════
  // HARF SEÇİMİ
  // ══════════════════════════════

  function harfSec(index) {
    if (durum.oyunBitti)    return;
    if (durum.bekleyenHarf) return;

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      UI.boruSonuc(index, true);
      Ses.dogru();

      // Can az ise +1
      if (durum.can < 5) {
        durum.can++;
        UI.setCanlar(durum.can);
      }

      const dogruHarf = secilen.harfler[0];
      const yanlislar = secilen.harfler.slice(1);
      if (yanlislar.length > 0) _yanlisHarflerDus(yanlislar);

      durum.bekleyenHarf = dogruHarf;
      UI.bekleyenGoster(dogruHarf, BEKLEME_SURE, _bekleyenSureDoldu);
      _yeniBorular();

    } else {
      UI.boruSonuc(index, false);
      Ses.yanlis();
      _yanlisHarflerDus(secilen.harfler);

      durum.yanlisSecim++;
      if (durum.yanlisSecim >= MAX_YANLIS) {
        setTimeout(() => _kelimeAtla(), 500);
      } else {
        _yeniBorular();
      }
    }
  }

  // ══════════════════════════════
  // BEKLEYEN HARF
  // ══════════════════════════════

  function _bekleyenSureDoldu() {
    Ses.sureDoldu();
    if (durum.bekleyenHarf) {
      _yanlisHarflerDus([durum.bekleyenHarf]);
    }
    durum.bekleyenHarf = null;
    UI.bekleyenGizle();

    _tezgahHarfleriniDusur();
    _yeniKelimeYukle();
    _yeniBorular();
  }

  function bekleyenYerlestir(hedefIndex) {
    if (!durum.bekleyenHarf) return;
    const basarili = Grid.harfEkleIndex(durum.bekleyenHarf, hedefIndex);
    if (basarili) {
      durum.bekleyenHarf = null;
      UI.bekleyenGizle();
      _yeniBorular();
    }
  }

  function _tezgahHarfleriniDusur() {
    const hucreler = document.querySelectorAll('.tezgah-hucre.dolu');
    const harfler  = Array.from(hucreler).map(h => h.textContent);
    if (harfler.length > 0) _yanlisHarflerDus(harfler);
    Grid.temizle();
  }

  // ══════════════════════════════
  // İPUCU
  // ══════════════════════════════

  function ipucuKullan() {
    if (durum.oyunBitti)  return;
    if (durum.can <= 0)   return;

    const basarili = Grid.ipucuYerlestir();
    if (basarili) {
      durum.can--;
      UI.setCanlar(durum.can);
      Ses.dogru();
      _yeniBorular();
    }
  }

  // ══════════════════════════════
  // YANLIŞ HARFLER & OYUN BİTİŞİ
  // ══════════════════════════════

  function _yanlisHarflerDus(harfler) {
    UI.yanlisEkle(harfler);
    _oyunBitiKontrol();
  }

  function _oyunBitiKontrol() {
    const zoneD  = document.getElementById('zone-d');
    const yanlis = document.getElementById('yanlis-grid');
    if (!zoneD || !yanlis) return;

    const satirSayisi   = Math.ceil(yanlis.children.length / 8);
    const hucreYukseklik = zoneD.clientWidth / 8;
    const doluYukseklik  = satirSayisi * (hucreYukseklik + 3);

    if (doluYukseklik >= zoneD.clientHeight) {
      _oyunBitti();
    }
  }

  function _oyunBitti() {
    durum.oyunBitti = true;
    UI.bekleyenGizle();
    Ses.oyunBitti();
    setTimeout(() => {
      alert(
        'OYUN BİTTİ!\n' +
        'Puan: '   + durum.puan    + '\n' +
        'Kelime: ' + durum.tamamlananlar.filter(Boolean).length + '\n' +
        'Seviye: ' + durum.seviye
      );
      init();
    }, 500);
  }

  // ══════════════════════════════
  // BAŞLAT
  // ══════════════════════════════

  window.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('ipucu-btn').addEventListener('click', ipucuKullan);
  });

  return { init, harfSec, bekleyenYerlestir, ipucuKullan };

})();
