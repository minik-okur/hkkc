/* =============================================
   GRID.JS — Tezgah Durum Yöneticisi
   YENİ: Sekizgen slotlar, bekleme yok
   Borudan gelen harf direkt ilk boş slota girer
   ============================================= */

const Grid = (() => {

  let hedefKelime   = '';
  let onKelimeTamam = null;

  // slotlar: [ { harf, durum: 'dolu'|'eksik'|'gelen', dogruHarf } ]
  let slotlar = [];

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime   = kelime;
    onKelimeTamam = kelimeTamamCallback;

    const harfler        = kelime.split('');
    const kelimeIndexler = harfler.map((_, i) => i);
    const eksikIndexler  = _rastgeleSecim(kelimeIndexler, eksikSayisi);

    slotlar = harfler.map((h, i) => ({
      harf:      eksikIndexler.includes(i) ? null : h,
      durum:     eksikIndexler.includes(i) ? 'eksik' : 'dolu',
      dogruHarf: h,
    }));

    _render();
  }

  // ══════════════════════════════
  // BORUDAN HARF EKLE — direkt ilk boş slota
  // ══════════════════════════════

  function harfEkle(harf) {
    const i = slotlar.findIndex(s => s.durum === 'eksik');
    if (i === -1) return false;

    slotlar[i].harf  = harf;
    slotlar[i].durum = 'gelen';

    _render();
    _kontrol();
    return true;
  }

  function harfEkleIndex(harf) { return harfEkle(harf); }
  function havuzaEkle(harf)    { return harfEkle(harf); }

  // ══════════════════════════════
  // İPUCU
  // ══════════════════════════════

  function ipucuYerlestir() {
    const i = slotlar.findIndex(s => s.durum === 'eksik');
    if (i === -1) return false;

    slotlar[i].harf  = slotlar[i].dogruHarf;
    slotlar[i].durum = 'gelen';

    _render();
    _kontrol();
    return true;
  }

  // ══════════════════════════════
  // KONTROL
  // ══════════════════════════════

  function _kontrol() {
    const tamDolu = slotlar.every(s => s.durum !== 'eksik');
    if (!tamDolu) return;

    const olusanKelime = slotlar.map(s => s.harf).join('');
    if (olusanKelime === hedefKelime) {
      setTimeout(() => {
        if (onKelimeTamam) onKelimeTamam(hedefKelime);
      }, 300);
    }
  }

  // ══════════════════════════════
  // TEMİZLE
  // ══════════════════════════════

  function temizle() {
    slotlar = [];
    _render();
  }

  function _render() {
    UI.tezgahRender(slotlar);
  }

  function _rastgeleSecim(dizi, n) {
    return [...dizi].sort(() => Math.random() - 0.5).slice(0, n);
  }

  function getEksikVar()    { return slotlar.some(s => s.durum === 'eksik'); }

  function getEksikHarfler() {
    return slotlar.filter(s => s.durum === 'eksik').map(s => s.dogruHarf);
  }

  return {
    init, harfEkle, harfEkleIndex, havuzaEkle,
    temizle, getEksikVar, getEksikHarfler, ipucuYerlestir,
  };

})();
