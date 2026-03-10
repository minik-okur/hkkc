/* =============================================
   GAME.JS — Oyun Motoru
   ============================================= */

const Game = (() => {

  const ALFABE     = 'ABCDEFGHİKLMNOPRSTUYZ'.split('');
  const MAX_YANLIS = 3;
  const KAYIT_KEY  = 'sozcuk_durum_v1';

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
      yanlisHarfler:   [],   // zone-d'ye düşen harfler kaydedilir
    };
  }

  // ══════════════════════════════
  // KAYIT / YÜKLEME
  // ══════════════════════════════

  function _kaydet() {
    try {
      const kayit = {
        puan:          durum.puan,
        can:           durum.can,
        seviye:        durum.seviye,
        kelimeSira:    durum.kelimeSira,
        tamamlananlar: durum.tamamlananlar,
        yanlisHarfler: durum.yanlisHarfler,
      };
      localStorage.setItem(KAYIT_KEY, JSON.stringify(kayit));
    } catch(e) {}
  }

  function _yukle() {
    try {
      const ham = localStorage.getItem(KAYIT_KEY);
      if (!ham) return null;
      return JSON.parse(ham);
    } catch(e) { return null; }
  }

  function _kayitSil() {
    try { localStorage.removeItem(KAYIT_KEY); } catch(e) {}
  }

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(sifirla) {
    if (sifirla) {
      _kayitSil();
      durum = _basDurum();
    } else {
      const kayit = _yukle();
      if (kayit) {
        durum = _basDurum();
        durum.puan          = kayit.puan          ?? 0;
        durum.can           = kayit.can           ?? 3;
        durum.seviye        = kayit.seviye        ?? 1;
        durum.kelimeSira    = kayit.kelimeSira    ?? 0;
        durum.tamamlananlar = kayit.tamamlananlar ?? [];
        durum.yanlisHarfler = kayit.yanlisHarfler ?? [];
      } else {
        durum = _basDurum();
      }
    }

    UI.setCanlar(durum.can);
    UI.setPuan(durum.puan);
    UI.setSeviye(durum.seviye);
    UI.yanlisTemizle();
    UI.sozAlaniTemizle();

    // Kaydedilmiş yanlış harfleri geri yükle
    if (durum.yanlisHarfler.length > 0) {
      UI.yanlisEkle(durum.yanlisHarfler);
    }

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

    // Kayıttan gelen tamamlananlar dizisi — aynı seviyedeyse kullan
    if (!durum.tamamlananlar || durum.tamamlananlar.length !== durum.seviyeKelimeler.length) {
      durum.tamamlananlar = durum.seviyeKelimeler.map(() => false);
    }

    const sozVeri = Words.getSoz(sevNo);
    UI.sozAlaniOlustur(durum.seviyeKelimeler, sozVeri.soz, sozVeri.kaynak);

    // Daha önce tamamlanmış kelimeleri atasözü alanında aç
    durum.tamamlananlar.forEach((tamam, i) => {
      if (tamam) UI.sozKutucukAc(durum.seviyeKelimeler[i].kelime);
    });

    UI.setKelimeSayisi(
      durum.tamamlananlar.filter(Boolean).length,
      durum.seviyeKelimeler.length
    );

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
    _kaydet();

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
  // TEZGAH YANLIŞ
  // ══════════════════════════════

  function tezgahYanlis(harfler) {
    if (durum.oyunBitti) return;
    if (typeof Ses !== 'undefined') Ses.yanlis();
    durum.yanlisHarfler = (durum.yanlisHarfler || []).concat(harfler);
    UI.yanlisEkle(harfler);
    _kaydet();
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
      durum.tamamlananlar = [];
      durum.kelimeSira    = 0;
      durum.yanlisHarfler = [];
      UI.setCanlar(durum.can);
      UI.yanlisTemizle();
      UI.sozAlaniTemizle();
      Grid.temizle();
      _kaydet();
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
    _kaydet();

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

      Grid.harfEkle(secilen.harfler[0]);
      _yeniBorular();
      _kaydet();

    } else {
      UI.boruSonuc(index, false);
      if (typeof Ses !== 'undefined') Ses.yanlis();

      durum.yanlisHarfler = (durum.yanlisHarfler || []).concat(secilen.harfler);
      UI.yanlisEkle(secilen.harfler);

      durum.yanlisSecim++;
      if (durum.yanlisSecim >= MAX_YANLIS) {
        _kaydet();
        setTimeout(() => _kelimeAtla(), 500);
      } else {
        _oyunBitiKontrol();
        _yeniBorular();
        _kaydet();
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
      _kaydet();
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
      init(true); // sıfırdan başla
    }, 500);
  }

  // ══════════════════════════════
  // BAŞLAT
  // ══════════════════════════════

  window.addEventListener('DOMContentLoaded', () => {
    init();  // kayıt varsa yükle, yoksa sıfırdan başla
    document.getElementById('ipucu-btn').addEventListener('click', ipucuKullan);
  });

  return { init, harfSec, tezgahYanlis, ipucuKullan };

})();
