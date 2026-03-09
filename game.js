/* =============================================
   GAME.JS — Oyun Motoru
   ============================================= */

const Game = (() => {

  const ALFABE     = 'ABCDEFGHİKLMNOPRSTUYZ'.split('');
  const MAX_YANLIS = 3;

  let durum = _basDurum();

  function _basDurum() {
    return {
      puan:            0,
      can:             3,
      seviye:          1,
      kelimeSira:      0,
      seviyeKelimeler: [],
      tamamlananlar:   [],
      aktifBorular:    [],
      oyunBitti:       false,
      dogruIndex:      -1,
      yanlisSecim:     0,
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
  }

  // ══════════════════════════════
  // KELİME TAMAMLANDI
  // ══════════════════════════════

  function _kelimeTamam(kelime) {
    if (durum.oyunBitti) return;

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
  // TEZGAH YANLIŞ (grid.js'den çağrılır)
  // 2. yanlış sırada — harfler zone D'ye
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
    const sozVeri = Words.getSoz(durum.seviye);
    if (typeof Ses !== 'undefined') Ses.seviyeGecis();

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
  // KELİME ATLAMA
  // ══════════════════════════════

  function _kelimeAtla() {
    if (durum.oyunBitti) return;
    UI.tezgahSalla();
    if (typeof Ses !== 'undefined') Ses.sureDoldu();

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
  // HARF SEÇİMİ (borulardan)
  // ══════════════════════════════

  function harfSec(index) {
    if (durum.oyunBitti) return;

    const secilen = durum.aktifBorular[index];
    if (!secilen) return;

    if (secilen.dogru) {
      UI.boruSonuc(index, true);
      if (typeof Ses !== 'undefined') Ses.dogru();

      if (durum.can < 5) { durum.can++; UI.setCanlar(durum.can); }

      // Direkt halkaya — bekleyen alan yok
      Grid.harfEkle(secilen.harfler[0]);
      _yeniBorular();

    } else {
      UI.boruSonuc(index, false);
      if (typeof Ses !== 'undefined') Ses.yanlis();
      UI.yanlisEkle(secilen.harfler);

      durum.yanlisSecim++;
      if (durum.yanlisSecim >= MAX_YANLIS) {
        setTimeout(() => _kelimeAtla(), 500);
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
  // OYUN BİTİŞİ
  // ══════════════════════════════

  function _oyunBitiKontrol() {
    const zoneD  = document.getElementById('zone-d');
    const yanlis = document.getElementById('yanlis-grid');
    if (!zoneD || !yanlis) return;

    const satirSayisi    = Math.ceil(yanlis.children.length / 8);
    const hucreYukseklik = zoneD.clientWidth / 8;
    const doluYukseklik  = satirSayisi * (hucreYukseklik + 3);

    if (doluYukseklik >= zoneD.clientHeight) _oyunBitti();
  }

  function _oyunBitti() {
    durum.oyunBitti = true;
    if (typeof Ses !== 'undefined') Ses.oyunBitti();
    setTimeout(() => {
      alert(
        'OYUN BİTTİ!\n' +
        'Puan: '   + durum.puan + '\n' +
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

  return { init, harfSec, tezgahYanlis, ipucuKullan };

})();
