/* =============================================
   GAME.JS — Oyun Motoru (yeniden tasarım)
   ============================================= */

const Game = (() => {

  const ALFABE     = 'ABCDEFGHİKLMNOPRSTUYZ'.split('');
  const MAX_YANLIS = 3;
  const SURE_SANIYE = 15; // Her kelime için süre

  let durum = _basDurum();
  let _sureInterval = null;
  let _sureKalan    = SURE_SANIYE;

  function _basDurum() {
    return {
      puan:            0,
      can:             5,
      seviye:          1,
      kelimeSira:      0,
      seviyeKelimeler: [],
      tamamlananlar:   [],
      aktifBorular:    [],
      oyunBitti:       false,
      dogruIndex:      -1,
      yanlisSecim:     0,
      combo:           0,
      enIyiCombo:      0,
      toplamKelime:    0,
    };
  }

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init() {
    _sureDurdur();
    durum = _basDurum();
    UI.setCanlar(durum.can);
    UI.setPuan(durum.puan);
    UI.setKelimeSayisi(0, 1);
    UI.setSeviye(durum.seviye);
    UI.yanlisTemizle();
    UI.sozAlaniTemizle();
    _seviyeBaslat(durum.seviye);
  }

  // ══════════════════════════════
  // SEVİYE BAŞLAT
  // ══════════════════════════════

  function _seviyeBaslat(sevNo) {
    const temalar = [
      'sabah','sabah','sabah','sabah',
      'oglen','oglen','oglen','oglen',
      'aksam','aksam','aksam','aksam',
      'gece','gece','gece','gece',
      'geceyarisi','geceyarisi','geceyarisi','geceyarisi'
    ];
    document.body.dataset.tema = temalar[Math.min(sevNo - 1, temalar.length - 1)];

    durum.seviyeKelimeler = Words.getKelimeler(sevNo);
    durum.tamamlananlar  = durum.seviyeKelimeler.map(() => false);
    durum.kelimeSira     = 0;

    const sozVeri = Words.getSoz(sevNo);
    UI.sozAlaniOlustur(durum.seviyeKelimeler, sozVeri.soz, sozVeri.kaynak);
    UI.setKelimeSayisi(0, durum.seviyeKelimeler.length);

    Grid.temizle();
    _yeniKelimeYukle();
    _yeniBorular();
  }

  // ══════════════════════════════
  // KELİME YÜKLEME
  // ══════════════════════════════

  function _yeniKelimeYukle() {
    if (durum.kelimeSira >= durum.seviyeKelimeler.length) return;
    const veri = durum.seviyeKelimeler[durum.kelimeSira];
    durum.yanlisSecim = 0;
    Grid.init(veri.kelime, veri.eksik, _kelimeTamam);
    _sureBaslat();
  }

  // ══════════════════════════════
  // SÜRE YÖNETİMİ
  // ══════════════════════════════

  function _sureBaslat() {
    _sureDurdur();
    _sureKalan = SURE_SANIYE;
    UI.sureSifirla(SURE_SANIYE);

    // 1 frame bekle, sonra animasyonu başlat
    setTimeout(() => {
      UI.setSureBar(1);
      _sureInterval = setInterval(() => {
        _sureKalan--;
        UI.setSureSayi(_sureKalan);
        UI.setSureBar(_sureKalan / SURE_SANIYE);

        if (_sureKalan <= 0) {
          _sureDoldur();
        }
      }, 1000);
    }, 50);
  }

  function _sureDurdur() {
    if (_sureInterval) {
      clearInterval(_sureInterval);
      _sureInterval = null;
    }
  }

  function _sureDoldur() {
    _sureDurdur();
    if (durum.oyunBitti) return;
    if (typeof Ses !== 'undefined') Ses.sureDoldu();

    // Can kır
    durum.can--;
    UI.setCanlar(durum.can);
    UI.canTitret();

    // Combo sıfırla
    durum.combo = 0;

    // Kelime atla — atasözünde gri yaz
    _kelimeAtla(true /* sureDoldu */);
  }

  // ══════════════════════════════
  // KELİME TAMAMLANDI
  // ══════════════════════════════

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;
    _sureDurdur();

    // Combo
    durum.combo++;
    if (durum.combo > durum.enIyiCombo) durum.enIyiCombo = durum.combo;

    // Puan: kelime uzunluğu × seviye × combo çarpanı
    const comboCarpar = Math.min(durum.combo, 5); // max 5x
    const puan = kelime.length * 10 * durum.seviye * comboCarpar;
    durum.puan += puan;
    durum.toplamKelime++;
    UI.setPuan(durum.puan);

    // Combo badge (2'den itibaren göster)
    if (durum.combo >= 2) UI.comboBadgeGoster(durum.combo);

    UI.sozKutucukAc(kelime);

    durum.tamamlananlar[durum.kelimeSira] = true;
    UI.setKelimeSayisi(
      durum.tamamlananlar.filter(Boolean).length,
      durum.seviyeKelimeler.length
    );

    durum.kelimeSira++;

    if (durum.tamamlananlar.every(Boolean)) {
      _seviyeBitti();
      return;
    }

    // Tüm kelimeler denendi mi?
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
  // TEZGAH YANLIŞ (grid.js'den)
  // ══════════════════════════════

  function tezgahYanlis(harfler) {
    if (durum.oyunBitti) return;
    if (typeof Ses !== 'undefined') Ses.yanlis();
    UI.yanlisEkle(harfler);
    _oyunBitiKontrol();
  }

  // ══════════════════════════════
  // SEVİYE BİTTİ
  // ══════════════════════════════

  function _seviyeBitti() {
    _sureDurdur();
    const sozVeri = Words.getSoz(durum.seviye);
    if (typeof Ses !== 'undefined') Ses.seviyeGecis();

    UI.seviyeSonuGoster(durum.seviye, sozVeri.soz, sozVeri.kaynak, () => {
      if (durum.seviye < Words.toplamSeviye()) {
        durum.seviye++;
        UI.setSeviye(durum.seviye);
      }
      durum.can += 2;
      UI.setCanlar(durum.can);
      durum.combo = 0;
      UI.yanlisTemizle();
      UI.sozAlaniTemizle();
      Grid.temizle();
      _seviyeBaslat(durum.seviye);
    });
  }

  // ══════════════════════════════
  // KELİME ATLAMA
  // Hem süre dolunca hem MAX_YANLIS'ta çağrılır
  // atlandı = true → atasözünde gri yaz
  // ══════════════════════════════

  function _kelimeAtla(sureDoldu) {
    if (durum.oyunBitti) return;
    _sureDurdur();

    // Atasözünde mevcut kelimeyi gri yaz
    const mevcutKelime = durum.seviyeKelimeler[durum.kelimeSira];
    if (mevcutKelime) {
      UI.sozKutucukAtla(mevcutKelime.kelime);
    }

    UI.tezgahSalla();
    if (!sureDoldu && typeof Ses !== 'undefined') Ses.sureDoldu();

    // Combo sıfırla
    durum.combo = 0;

    durum.kelimeSira++;
    if (durum.kelimeSira >= durum.seviyeKelimeler.length) {
      setTimeout(() => _seviyeBitti(), 400);
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
  // HARF SEÇİMİ (borulardan)
  // ══════════════════════════════

  function harfSec(index) {
    if (durum.oyunBitti) return;

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      UI.boruSonuc(index, true);
      if (typeof Ses !== 'undefined') Ses.dogru();
      Grid.harfEkle(secilen.harfler[0]);
      _yeniBorular();

    } else {
      UI.boruSonuc(index, false);
      if (typeof Ses !== 'undefined') Ses.yanlis();
      UI.yanlisEkle(secilen.harfler);

      // Can kır
      durum.can--;
      UI.setCanlar(durum.can);
      UI.canTitret();

      // Combo sıfırla
      durum.combo = 0;

      durum.yanlisSecim++;
      if (durum.yanlisSecim >= MAX_YANLIS) {
        setTimeout(() => _kelimeAtla(false), 500);
      } else {
        _oyunBitiKontrol();
        _yeniBorular();
      }
    }
  }

  // ══════════════════════════════
  // İPUCU
  // ══════════════════════════════

  function ipucuKullan() {
    if (durum.oyunBitti) return;
    if (durum.can <= 0)  return;
    const basarili = Grid.ipucuYerlestir();
    if (basarili) {
      durum.can--;
      UI.setCanlar(durum.can);
      if (typeof Ses !== 'undefined') Ses.dogru();
      _yeniBorular();
    }
  }

  // ══════════════════════════════
  // OYUN BİTİŞİ — can 0'a düşünce
  // ══════════════════════════════

  function _oyunBitiKontrol() {
    if (durum.can <= 0) {
      _oyunBitti();
      return;
    }
    // Eski zone-d dolu kontrolü de tut
    const zoneD  = document.getElementById('zone-d');
    const yanlis = document.getElementById('yanlis-grid');
    if (!zoneD || !yanlis) return;
    const satirSayisi    = Math.ceil(yanlis.children.length / 8);
    const hucreYukseklik = zoneD.clientWidth / 8;
    const doluYukseklik  = satirSayisi * (hucreYukseklik + 3);
    if (doluYukseklik >= zoneD.clientHeight) _oyunBitti();
  }

  function _oyunBitti() {
    if (durum.oyunBitti) return;
    _sureDurdur();
    durum.oyunBitti = true;
    if (typeof Ses !== 'undefined') Ses.oyunBitti();
    setTimeout(() => {
      UI.oyunBittiGoster(
        durum.puan,
        durum.toplamKelime,
        durum.seviye,
        durum.enIyiCombo,
        init
      );
    }, 500);
  }

  // ══════════════════════════════
  // BAŞLAT
  // ══════════════════════════════

  window.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('ipucu-btn').addEventListener('click', ipucuKullan);
  });

  return { init, harfSec, tezgahYanlis, ipucuKullan };

})();
