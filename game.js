/* =============================================
   GAME.JS — Oyun Motoru
   Bağlı: index.html
   Kullanır: Words, UI, Grid
   ============================================= */

const Game = (() => {

  const ALFABE = 'ABCDEFGHİKLMNOPRSTUYZ'.split('');
  const BORU_SAYISI = 3;
  const BEKLEME_SURE = 5;
  const MAX_YANLIS = 3;   // ← YENİ

  let durum = {
    puan:        0,
    can:         3,
    seviye:      1,
    kelimeSira:  0,
    aktifBorular: [],
    siradaki:    [],
    bekleyenHarf: null,
    bekleyenTimer: null,
    oyunBitti:   false,
    dogruIndex:  -1,
    yanlisSecim: 0,      // ← YENİ
  };

  function init() {
    durum = {
      puan: 0, can: 3, seviye: 1, kelimeSira: 0,
      aktifBorular: [], siradaki: [],
      bekleyenHarf: null, bekleyenTimer: null,
      oyunBitti: false, dogruIndex: -1,
      yanlisSecim: 0,    // ← YENİ
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
    console.log('SEVİYE:', durum.seviye, 'SIRA:', durum.kelimeSira, 'KELİME:', veri.kelime, 'EKSİK:', eksik);

    durum.yanlisSecim = 0; // ← YENİ: her kelimede sıfırla
    Grid.init(veri.kelime, eksik, _kelimeTamam);
  }

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

    UI.tezgahFlash('yesil');
    Ses.kelimeTamam();
    const puan = kelime.length * 10 * durum.seviye;
    durum.puan += puan;
    UI.setPuan(durum.puan);

    // ── YENİ: Kelime tamamlayınca +1 can ──
    durum.can++;
    UI.setCanlar(durum.can);

    const veri = Words.getKelime(durum.seviye, durum.kelimeSira);
    UI.hikayeEkle(kelime, veri.tanim);
    UI.setKelimeSayisi(durum.kelimeSira + 1);

    durum.kelimeSira++;

    const sevVeri = Words.getSeviye(durum.seviye);
    if (durum.kelimeSira >= sevVeri.kelimeler.length) {
      const sozVeri = Words.getSoz(durum.seviye);
      Ses.seviyeGecis();
      UI.seviyeSonuGoster(durum.seviye, sozVeri.soz, sozVeri.kaynak, () => {
        durum.kelimeSira = 0;
        if (durum.seviye < Words.toplamSeviye()) {
          durum.seviye++;
          UI.setSeviye(durum.seviye);
        }
        // ── YENİ: Seviye sonu +2 can ──
        durum.can += 2;
        UI.setCanlar(durum.can);

        UI.yanlisTemizle();
        Grid.temizle();
        _yeniKelimeYukle();
        _yeniBorular();
      });
      return;
    }

    setTimeout(() => {
      Grid.temizle();
      _yeniKelimeYukle();
      _yeniBorular();
    }, 700);
  }

  // ── YENİ: KELİME ATLAMA ──
  function _kelimeAtla() {
    UI.tezgahFlash('kirmizi');
    UI.tezgahSalla();
    Ses.sureDoldu();

    _tezgahHarfleriniDusur();
    durum.kelimeSira++;

    const sevVeri = Words.getSeviye(durum.seviye);
    if (durum.kelimeSira >= sevVeri.kelimeler.length) {
      const sozVeri = Words.getSoz(durum.seviye);
      Ses.seviyeGecis();
      UI.seviyeSonuGoster(durum.seviye, sozVeri.soz, sozVeri.kaynak, () => {
        durum.kelimeSira = 0;
        if (durum.seviye < Words.toplamSeviye()) {
          durum.seviye++;
          UI.setSeviye(durum.seviye);
        }
        durum.can += 2;
        UI.setCanlar(durum.can);
        UI.yanlisTemizle();
        Grid.temizle();
        _yeniKelimeYukle();
        _yeniBorular();
      });
      return;
    }

    setTimeout(() => {
      Grid.temizle();
      _yeniKelimeYukle();
      _yeniBorular();
    }, 700);
  }

  // ── BORULAR ──
  function _yeniBorular() {
    if (durum.oyunBitti) return;

    const eksikHarfler = Grid.getEksikHarfler();
    if (eksikHarfler.length === 0) return;

    const dogru = eksikHarfler[Math.floor(Math.random() * eksikHarfler.length)];
    const toplamHarf = Words.getBoruHarfSayisi(durum.seviye);

    durum.dogruIndex = Math.floor(Math.random() * BORU_SAYISI);

    const boruBasinaHarf = _dagit(toplamHarf, BORU_SAYISI);

    const borular = [];
    for (let i = 0; i < BORU_SAYISI; i++) {
      const adet = boruBasinaHarf[i];
      const harfler = [];
      if (i === durum.dogruIndex) {
        harfler.push(dogru);
        for (let j = 1; j < adet; j++) {
          harfler.push(_rastgeleHarf([...eksikHarfler]));
        }
      } else {
        for (let j = 0; j < adet; j++) {
          harfler.push(_rastgeleHarf([...eksikHarfler]));
        }
      }
      borular.push({
        harfler: harfler,
        dogru: i === durum.dogruIndex,
      });
    }

    durum.aktifBorular = borular;
    UI.setBorular(borular);
  }

  function _dagit(toplam, boruSayisi) {
    const taban = Math.floor(toplam / boruSayisi);
    const kalan = toplam % boruSayisi;
    const dagitim = Array(boruSayisi).fill(taban);
    for (let i = 0; i < kalan; i++) {
      dagitim[i]++;
    }
    return dagitim.sort(() => Math.random() - 0.5);
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
    if (durum.bekleyenHarf) return;

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      UI.boruSonuc(index, true);
      Ses.dogru();
      if (durum.can < 3) {
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

      // ── YENİ: 3 yanlış → kelime atla ──
      durum.yanlisSecim++;
      if (durum.yanlisSecim >= MAX_YANLIS) {
        setTimeout(() => _kelimeAtla(), 500);
      } else {
        _yeniBorular();
      }
    }
  }

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

  function _tezgahHarfleriniDusur() {
    const hucreler = document.querySelectorAll('.tezgah-hucre.dolu');
    const harfler = Array.from(hucreler).map(h => h.textContent);
    if (harfler.length > 0) _yanlisHarflerDus(harfler);
    Grid.temizle();
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

  // ── YENİ: İPUCU ──
  function ipucuKullan() {
    if (durum.oyunBitti) return;
    if (durum.can <= 0) return;

    const basarili = Grid.ipucuYerlestir();
    if (basarili) {
      durum.can--;
      UI.setCanlar(durum.can);
      Ses.dogru();
      _yeniBorular();
    }
  }

  // ── YANLIŞ HARFLER ──
  function _yanlisHarflerDus(harfler) {
    UI.yanlisEkle(harfler);
    _oyunBitiKontrol();
  }

  function _oyunBitiKontrol() {
    const zoneD = document.getElementById('zone-d');
    const zoneB = document.getElementById('zone-b');
    const yanlis = document.getElementById('yanlis-grid');

    if (!zoneD || !zoneB || !yanlis) return;

    const yanlisDolu = yanlis.children.length;
    const satirSayisi = Math.ceil(yanlisDolu / 8);
    const hucreYukseklik = zoneD.clientWidth / 8;
    const doluYukseklik = satirSayisi * (hucreYukseklik + 2);

    if (doluYukseklik >= zoneD.clientHeight) {
      _oyunBitti();
    }
  }

  function _oyunBitti() {
    durum.oyunBitti = true;
    UI.bekleyenGizle();
    Ses.oyunBitti();
    setTimeout(() => {
      alert('OYUN BİTTİ!\nPuan: ' + durum.puan + '\nKelime: ' + durum.kelimeSira + '\nSeviye: ' + durum.seviye);
      init();
    }, 500);
  }

  window.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('ipucu-btn').addEventListener('click', ipucuKullan);
  });

  return { init, harfSec, bekleyenYerlestir, ipucuKullan };

})();
