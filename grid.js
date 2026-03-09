/* =============================================
   GRID.JS — Tezgah + Harf Havuzu Yöneticisi

   MANTIK:
   - Üstte tezgah: kelime slotları
   - Altta harf havuzu: tüm harfler KARISIK büyük buton
   - Oyuncu havuzdan harflere TIKLAYARAK sırayla seçer
   - Her tıklamada: bu harf sıradaki doğru harf mi?
     → EVET: slota oturur, devam
     → HAYIR: 1. yanlış → kırmızı flash, yerleşenler geri döner
              2. yanlış → harfler zone D'ye düşer
   - Sürükle-bırak YOK
   ============================================= */

const Grid = (() => {

  let hedefKelime   = '';
  let tezgah        = [];
  let havuzHarfleri = [];
  let onKelimeTamam = null;
  let yanlisCount   = 0;
  // kaçıncı slota yerleştirme bekleniyor (sıra takibi)
  let siradakiPos   = 0;

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(kelime, eksikSayisi, tamamCb) {
    hedefKelime   = kelime;
    onKelimeTamam = tamamCb;
    yanlisCount   = 0;
    siradakiPos   = 0;

    const harfler = kelime.split('');
    const tumIdx  = harfler.map((_, i) => i);
    const eksikIdx = _karistir([...tumIdx]).slice(0, eksikSayisi);

    // Tezgah slotları — hepsi başta boş
    tezgah = harfler.map((h, i) => ({
      harf:    null,
      eksik:   eksikIdx.includes(i),  // boru bekliyor
      bos:     !eksikIdx.includes(i), // havuzdan seçilecek
      slotIdx: i,
    }));

    // Havuz: eksik olmayan harfler karışık sırada
    const havuzListesi = harfler
      .map((h, i) => ({ harf: h, kelimePos: i, kullanildi: false }))
      .filter((_, i) => !eksikIdx.includes(i));

    havuzHarfleri = _karistir(havuzListesi);

    // siradakiPos: ilk boş (havuzdan bekleyen) slot indeksi
    siradakiPos = _sonrakiBosSiradaki(-1);

    _renderTezgah();
    _renderHavuz();
  }

  function _karistir(dizi) {
    const k = [...dizi];
    for (let i = k.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [k[i], k[j]] = [k[j], k[i]];
    }
    return k;
  }

  // Bir sonraki boş (havuzdan bekleyen) slot'un tezgah indeksini döner
  // mevcuttan sonraki ilk bos && !eksik && harf===null
  function _sonrakiBosSiradaki(mevcutSlotIdx) {
    for (let i = 0; i < tezgah.length; i++) {
      const s = tezgah[i];
      if (s.bos && !s.eksik && s.harf === null) return s.slotIdx;
    }
    return -1;
  }

  // ══════════════════════════════
  // RENDER
  // ══════════════════════════════

  function _renderTezgah() {
    UI.tezgahRender(tezgah, null);
  }

  function _renderHavuz() {
    UI.havuzRender(havuzHarfleri, _havuzHarfTiklandi);
  }

  // ══════════════════════════════
  // HARF TIKLAMA — her tıklamada sıra kontrolü
  // ══════════════════════════════

  function _havuzHarfTiklandi(havuzIdx) {
    const havuzEl = havuzHarfleri[havuzIdx];
    if (!havuzEl || havuzEl.kullanildi) return;

    // Sıradaki boş slot hangisi?
    const hedefSlot = tezgah.find(s => s.bos && !s.eksik && s.harf === null);
    if (!hedefSlot) return;

    // Bu pozisyonda doğru harf ne?
    const beklenenHarf = hedefKelime[hedefSlot.slotIdx];

    if (havuzEl.harf === beklenenHarf) {
      // ✅ DOĞRU — slota yerleştir
      havuzEl.kullanildi = true;
      hedefSlot.harf     = havuzEl.harf;
      hedefSlot.bos      = false;

      _renderTezgah();
      _renderHavuz();

      // Tüm havuz slotları doldu mu?
      const bosKaldi   = tezgah.some(s => s.bos && !s.eksik && s.harf === null);
      const eksikKaldi = tezgah.some(s => s.eksik);
      if (!bosKaldi && !eksikKaldi) {
        setTimeout(_kontrolEt, 150);
      }

    } else {
      // ❌ YANLIŞ SIRADA
      yanlisCount++;

      if (yanlisCount >= 2) {
        // 2. yanlış: yerleşmiş harfleri zone D'ye düşür
        const yanliHarfler = tezgah
          .filter(s => !s.eksik && s.harf !== null)
          .map(s => s.harf);

        UI.tezgahSallaKirmizi();
        setTimeout(() => {
          if (typeof Game !== 'undefined') Game.tezgahYanlis(yanliHarfler);
          _sifirla();
        }, 500);

      } else {
        // 1. yanlış: kırmızı flash, yerleşenler geri döner
        UI.tezgahSallaKirmizi();
        setTimeout(_sifirla, 500);
      }
    }
  }

  // ══════════════════════════════
  // KONTROL — tüm slotlar dolunca
  // (bu noktada sıra zaten doğru olmalı çünkü her adımda kontrol ettik)
  // ══════════════════════════════

  function _kontrolEt() {
    const tamDolu = tezgah.every(s => s.harf !== null);
    if (!tamDolu) return;

    UI.tezgahFlash();
    if (typeof Ses !== 'undefined') Ses.kelimeTamam();
    setTimeout(() => { if (onKelimeTamam) onKelimeTamam(hedefKelime); }, 400);
  }

  // Yerleşmiş harfleri geri al, havuzu sıfırla
  function _sifirla() {
    tezgah.forEach(s => {
      if (!s.eksik) { s.harf = null; s.bos = true; }
    });
    havuzHarfleri.forEach(h => { h.kullanildi = false; });
    _renderTezgah();
    _renderHavuz();
  }

  // ══════════════════════════════
  // BORULARDAN GELEN HARF
  // ══════════════════════════════

  function harfEkle(harf) {
    const slot = tezgah.find(s => s.eksik);
    if (!slot) return false;
    slot.harf  = harf;
    slot.eksik = false;
    slot.bos   = false;
    _renderTezgah();
    const bosKaldi   = tezgah.some(s => s.bos && s.harf === null);
    const eksikKaldi = tezgah.some(s => s.eksik);
    if (!bosKaldi && !eksikKaldi) setTimeout(_kontrolEt, 150);
    return true;
  }

  // ══════════════════════════════
  // İPUCU
  // ══════════════════════════════

  function ipucuYerlestir() {
    const slot = tezgah.find(s => s.bos && !s.eksik && s.harf === null);
    if (!slot) return false;

    const dogruHarf = hedefKelime[slot.slotIdx];
    const havuzEl = havuzHarfleri.find(
      h => !h.kullanildi && h.harf === dogruHarf && h.kelimePos === slot.slotIdx
    ) || havuzHarfleri.find(h => !h.kullanildi && h.harf === dogruHarf);

    if (havuzEl) havuzEl.kullanildi = true;
    slot.harf = dogruHarf;
    slot.bos  = false;

    _renderTezgah();
    _renderHavuz();

    const bosKaldi   = tezgah.some(s => s.bos && s.harf === null);
    const eksikKaldi = tezgah.some(s => s.eksik);
    if (!bosKaldi && !eksikKaldi) setTimeout(_kontrolEt, 150);
    return true;
  }

  // ══════════════════════════════
  // DIŞ API
  // ══════════════════════════════

  function temizle() {
    tezgah = []; havuzHarfleri = []; hedefKelime = ''; yanlisCount = 0;
    UI.tezgahRender([], null);
    UI.havuzRender([], null);
  }

  function getEksikVar()     { return tezgah.some(s => s.eksik); }
  function getEksikHarfler() {
    return tezgah.filter(s => s.eksik).map(s => hedefKelime[s.slotIdx]).filter(Boolean);
  }

  return { init, harfEkle, harfEkleIndex: harfEkle, temizle, getEksikVar, getEksikHarfler, ipucuYerlestir };

})();
