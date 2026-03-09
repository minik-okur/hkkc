/* =============================================
   GRID.JS — Tezgah + Harf Havuzu Yöneticisi

   MANTIK:
   - Üstte tezgah: kelime slotları
   - Altta harf havuzu: tüm harfler KARISIK büyük buton
   - Oyuncu havuzdan harflere TIKLAYARAK sırayla seçer
   - Seçilen harf sıradaki boş slota oturur
   - Tüm slotlar dolunca kelime sıra kontrolüne girer
   - 1. yanlış sıra → kırmızı flash, harfler geri döner
   - 2. yanlış (aynı kelimede) → harfler zone D'ye düşer
   - Sürükle-bırak YOK
   ============================================= */

const Grid = (() => {

  let hedefKelime   = '';
  let tezgah        = [];
  let havuzHarfleri = [];
  let onKelimeTamam = null;
  let yanlisCount   = 0;

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(kelime, eksikSayisi, tamamCb) {
    hedefKelime   = kelime;
    onKelimeTamam = tamamCb;
    yanlisCount   = 0;

    const harfler = kelime.split('');
    const tumIdx  = harfler.map((_, i) => i);
    // eksikIdx = boru ile gelecek pozisyonlar (noktalı slot)
    const eksikIdx = _karistir([...tumIdx]).slice(0, eksikSayisi);

    // Tezgah slotları — hepsi başta boş
    tezgah = harfler.map((h, i) => ({
      harf:    null,
      eksik:   eksikIdx.includes(i),  // true = boru bekliyor
      bos:     !eksikIdx.includes(i), // true = havuzdan seçilecek
      slotIdx: i,
    }));

    // Havuz: eksik olmayan harfler karışık sırada
    const havuzListesi = harfler
      .map((h, i) => ({ harf: h, kelimePos: i, kullanildi: false }))
      .filter((_, i) => !eksikIdx.includes(i));

    havuzHarfleri = _karistir(havuzListesi);

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
  // HARF TIKLAMA
  // ══════════════════════════════

  function _havuzHarfTiklandi(havuzIdx) {
    const havuzEl = havuzHarfleri[havuzIdx];
    if (!havuzEl || havuzEl.kullanildi) return;

    // Soldan ilk boş (havuzdan bekleyen) slot
    const hedefSlot = tezgah.find(s => s.bos && !s.eksik && s.harf === null);
    if (!hedefSlot) return;

    havuzEl.kullanildi  = true;
    hedefSlot.harf      = havuzEl.harf;
    hedefSlot.bos       = false;

    _renderTezgah();
    _renderHavuz();

    // Havuzdan bekleyen tüm slotlar doldu mu?
    const bosKaldi = tezgah.some(s => s.bos && !s.eksik && s.harf === null);
    if (!bosKaldi) {
      // Eksik (boru) slot hâlâ varsa kontrol bekleme
      const eksikKaldi = tezgah.some(s => s.eksik);
      if (!eksikKaldi) {
        setTimeout(_kontrolEt, 150);
      }
    }
  }

  // ══════════════════════════════
  // KONTROL
  // ══════════════════════════════

  function _kontrolEt() {
    const hedefHarfler = hedefKelime.split('');
    const tamDolu = tezgah.every(s => s.harf !== null);
    if (!tamDolu) return;

    const dogruSira = tezgah.every((s, i) => s.harf === hedefHarfler[i]);

    if (dogruSira) {
      UI.tezgahFlash();
      if (typeof Ses !== 'undefined') Ses.kelimeTamam();
      setTimeout(() => { if (onKelimeTamam) onKelimeTamam(hedefKelime); }, 400);
    } else {
      yanlisCount++;
      UI.tezgahSallaKirmizi();

      if (yanlisCount >= 2) {
        // 2. yanlış: zone D'ye düşür
        const yanliHarfler = tezgah
          .filter(s => !s.eksik)
          .map(s => s.harf)
          .filter(Boolean);
        setTimeout(() => {
          if (typeof Game !== 'undefined') Game.tezgahYanlis(yanliHarfler);
          _sifirla();
        }, 500);
      } else {
        // 1. yanlış: geri al, tekrar dene
        setTimeout(_sifirla, 500);
      }
    }
  }

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
    // Tüm slotlar doldu mu?
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
    // Havuzda bu harfi işaretle
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
