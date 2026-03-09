/* =============================================
   GRID.JS — Tezgah Durum Yöneticisi
   YENİ: Tap sistemi — sürükle-bırak yok
   Üst satır: kelime slotları (dolu + eksik)
   Alt havuz: karışık harfler, dokunarak yerleştir
   ============================================= */

const Grid = (() => {

  let hedefKelime   = '';
  let onKelimeTamam = null;

  // Üst satır: [ { harf, durum: 'dolu'|'eksik'|'bos' } ]
  let slotlar = [];

  // Alt havuz: [ { harf, id, yerlestirildi: bool } ]
  let havuz = [];

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime   = kelime;
    onKelimeTamam = kelimeTamamCallback;

    const harfler      = kelime.split('');
    const kelimeIndexler = harfler.map((_, i) => i);
    const eksikIndexler  = _rastgeleSecim(kelimeIndexler, eksikSayisi);

    // Slotları oluştur
    slotlar = harfler.map((h, i) => ({
      harf:   eksikIndexler.includes(i) ? null : h,
      durum:  eksikIndexler.includes(i) ? 'eksik' : 'dolu',
      dogruHarf: h,
    }));

    // Havuzu oluştur: sadece dolu harfler karışık olarak
    const doluHarfler = harfler
      .filter((_, i) => !eksikIndexler.includes(i));

    const karisik = _karistir(doluHarfler);

    havuz = karisik.map((h, i) => ({
      harf: h,
      id: 'h_' + i + '_' + Math.random().toString(36).slice(2),
      yerlestirildi: false,
    }));

    _render();
  }

  // ══════════════════════════════
  // HAVUZA HARF EKLE (borulardan)
  // ══════════════════════════════

  function havuzaEkle(harf) {
    havuz.push({
      harf,
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      yerlestirildi: false,
      borudan: true,
    });
    _render();
  }

  // ══════════════════════════════
  // TAP — havuzdan slot'a
  // ══════════════════════════════

  function havuzHarfTap(id) {
    const item = havuz.find(h => h.id === id && !h.yerlestirildi);
    if (!item) return;

    // İlk boş eksik slotu bul
    const hedefSlot = slotlar.findIndex(s => s.durum === 'eksik');
    if (hedefSlot === -1) return;

    item.yerlestirildi = true;
    slotlar[hedefSlot].harf  = item.harf;
    slotlar[hedefSlot].durum = 'gelen';   // dolu ama henüz doğrulanmamış

    _render();
    _kontrol();
  }

  // ══════════════════════════════
  // GERİ AL — son girilen harfi havuza geri döndür
  // ══════════════════════════════

  function geriAl() {
    // Son 'gelen' slotu bul (sondan başa)
    let sonIndex = -1;
    for (let i = slotlar.length - 1; i >= 0; i--) {
      if (slotlar[i].durum === 'gelen') { sonIndex = i; break; }
    }
    if (sonIndex === -1) return;

    const harf = slotlar[sonIndex].harf;
    slotlar[sonIndex].harf  = null;
    slotlar[sonIndex].durum = 'eksik';

    // Havuzda bu harfe ait son yerleştirilmiş öğeyi geri al
    for (let i = havuz.length - 1; i >= 0; i--) {
      if (havuz[i].yerlestirildi && havuz[i].harf === harf) {
        havuz[i].yerlestirildi = false;
        break;
      }
    }

    _render();
  }

  // ══════════════════════════════
  // HEPSİNİ GERİ AL
  // ══════════════════════════════

  function hepsiniGeriAl() {
    slotlar.forEach(s => {
      if (s.durum === 'gelen') {
        s.harf  = null;
        s.durum = 'eksik';
      }
    });
    havuz.forEach(h => { h.yerlestirildi = false; });
    _render();
  }

  // ══════════════════════════════
  // İPUCU
  // ══════════════════════════════

  function ipucuYerlestir() {
    const hedefSlot = slotlar.findIndex(s => s.durum === 'eksik');
    if (hedefSlot === -1) return false;

    const dogruHarf = slotlar[hedefSlot].dogruHarf;

    // Havuzda bu harfi bul (yerleştirilmemiş)
    const havuzItem = havuz.find(h => !h.yerlestirildi && h.harf === dogruHarf);
    if (havuzItem) {
      havuzItem.yerlestirildi = true;
    } else {
      // Borulardan gelmişse ya da havuzda yoksa direkt ekle
      havuz.push({
        harf: dogruHarf,
        id: 'ipucu_' + Date.now(),
        yerlestirildi: true,
        borudan: true,
      });
    }

    slotlar[hedefSlot].harf  = dogruHarf;
    slotlar[hedefSlot].durum = 'gelen';

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
      // Flash animasyonu
      UI.tezgahFlash();
      setTimeout(() => {
        if (onKelimeTamam) onKelimeTamam(hedefKelime);
      }, 300);
    } else {
      // Yanlış sıra — salla ve sıfırla
      UI.tezgahSalla();
      setTimeout(() => hepsiniGeriAl(), 400);
    }
  }

  // ══════════════════════════════
  // TEMİZLE
  // ══════════════════════════════

  function temizle() {
    slotlar = [];
    havuz   = [];
    UI.tezgahRender([], [], null, null);
  }

  // ══════════════════════════════
  // RENDER
  // ══════════════════════════════

  function _render() {
    UI.tezgahRender(slotlar, havuz, havuzHarfTap, geriAl, hepsiniGeriAl);
  }

  // ══════════════════════════════
  // YARDIMCILAR
  // ══════════════════════════════

  function _rastgeleSecim(dizi, n) {
    return [...dizi].sort(() => Math.random() - 0.5).slice(0, n);
  }

  function _karistir(dizi) {
    const arr = [...dizi];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ── Eski API — game.js uyumluluğu ──

  function getEksikVar() {
    return slotlar.some(s => s.durum === 'eksik');
  }

  function getEksikHarfler() {
    return slotlar
      .filter(s => s.durum === 'eksik')
      .map(s => s.dogruHarf);
  }

  // Artık kullanılmıyor ama game.js çağırabilir
  function harfEkle(harf)            { havuzaEkle(harf); return true; }
  function harfEkleIndex(harf, idx)  { havuzaEkle(harf); return true; }

  return {
    init,
    havuzaEkle,
    temizle,
    getEksikVar,
    getEksikHarfler,
    ipucuYerlestir,
    geriAl,
    hepsiniGeriAl,
    // uyumluluk
    harfEkle,
    harfEkleIndex,
  };

})();
