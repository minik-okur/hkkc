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
      kelimeSira:    0,
      seviyeKelimeler: [],
      tamamlananlar: [],
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
    const temalar = ['sabah','sabah','sabah','sabah',
                     'oglen','oglen','oglen','oglen',
                     'aksam','aksam','aksam','aksam',
                     'gece','gece','gece','gece',
                     'geceyarisi','geceyarisi','geceyarisi','geceyarisi'];
    document.body.dataset.tema = temalar[Math.min(sevNo - 1, temalar.length - 1)];

    durum.seviyeKelimeler = Words.getKelimeler(sevNo);
    durum.tamamlananlar  = durum.seviyeKelimeler.map(() => false);
    durum.kelimeSira     = 0;

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

    const veri = durum.seviyeKelimeler[durum.kelimeSira];
    durum.yanlisSecim = 0;

    Grid.init(veri.kelime, veri.eksik, _kelimeTamam);
  }

  // ══════════════════════════════
  // KELİME TAMAMLANDI
  // ══════════════════════════════

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

    Ses.kelimeTamam();

    const puan = kelime.length * 10 * durum.seviye;
    durum.puan += puan;
    UI.setPuan(durum.puan);

    durum.can++;
    UI.setCanlar(durum.can);

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
      if (durum.seviye < Words.toplamSeviye()) {
        durum.seviye++;
        UI.setSeviye(durum.seviye);
      }

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
  // HARF SEÇİMİ (BORU)
  // ══════════════════════════════

  function harfSec(index) {
    if (durum.oyunBitti)    return;
    if (durum.bekleyenHarf) return;

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      UI.boruSonuc(index, true);
      Ses.dogru();

      if (durum.can < 5) {
        durum.can++;
        UI.setCanlar(durum.can);
      }

      const dogruHarf = secilen.harfler[0];
      durum.bekleyenHarf = dogruHarf;

      // Bekleyen harfi göster — tıklanınca havuza ekle
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

  // YENİ: Bekleyen harfe tıklanınca havuza ekle
  function bekleyenHavuzaEkle() {
    if (!durum.bekleyenHarf) return;
    Grid.havuzaEkle(durum.bekleyenHarf);
    durum.bekleyenHarf = null;
    UI.bekleyenGizle();
    _yeniBorular();
  }

  // Eski fonksiyon — artık kullanılmıyor ama uyumluluk için bırakıldı
  function bekleyenYerlestir() {}

  function _tezgahHarfleriniDusur() {
    // Yeni sistemde havuz harfleri yanlış alana düşer
    const harfler = [];
    document.querySelectorAll('.havuz-kart').forEach(k => harfler.push(k.textContent));
    document.querySelectorAll('.slot-gelen').forEach(k => harfler.push(k.textContent));
    if (harfler.length > 0) _yanlisHarflerDus(harfler);
    Grid.temizle();
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

    const satirSayisi    = Math.ceil(yanlis.children.length / 8);
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

  return { init, harfSec, bekleyenHavuzaEkle, bekleyenYerlestir, ipucuKullan };

})();
