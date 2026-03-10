/* =============================================
   GRID.JS — Tezgah + Harf Havuzu Yöneticisi
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
    hedefKelime   = kelime.toUpperCase();
    onKelimeTamam = tamamCb;
    yanlisCount   = 0;

    const harfler  = kelime.split('');
    const tumIdx   = harfler.map((_, i) => i);
    const eksikIdx = _karistir([...tumIdx]).slice(0, eksikSayisi);

    tezgah = harfler.map((h, i) => ({
      harf:    null,
      eksik:   eksikIdx.includes(i),
      bos:     !eksikIdx.includes(i),
      slotIdx: i,
    }));

    const havuzListesi = harfler
      .map((h, i) => ({ harf: h.toUpperCase(), kelimePos: i, kullanildi: false }))
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

  function _renderTezgah() { UI.tezgahRender(tezgah, null); }
  function _renderHavuz()  { UI.havuzRender(havuzHarfleri, _havuzHarfTiklandi); }

  // ══════════════════════════════
  // HARF TIKLAMA
  // ══════════════════════════════

  function _havuzHarfTiklandi(havuzIdx) {
    const havuzEl = havuzHarfleri[havuzIdx];
    if (!havuzEl || havuzEl.kullanildi) return;

    // Sıradaki dolu olmayan slot — bos veya eksik fark etmez
    const hedefSlot = tezgah.find(s => s.harf === null);
    if (!hedefSlot) return;

    // Bu pozisyonda beklenen harf
    const beklenenHarf = hedefKelime[hedefSlot.slotIdx];

    // Doğru mu? — harf değeri aynıysa doğru, kaynak (boru/havuz) önemli değil
    if (havuzEl.harf === beklenenHarf) {
      // ✅ DOĞRU
      havuzEl.kullanildi = true;
      hedefSlot.harf     = havuzEl.harf;
      hedefSlot.bos      = false;
      hedefSlot.eksik    = false;

      _renderTezgah();
      _renderHavuz();

      // Havuzdan bekleyen boş slot kaldı mı?
      const bosKaldi   = tezgah.some(s => s.bos && s.harf === null);
      const eksikKaldi = tezgah.some(s => s.eksik);
      if (!bosKaldi && !eksikKaldi) setTimeout(_kontrolEt, 150);

    } else {
      // ❌ YANLIŞ — sıfırlama YOK, sadece kırmızı flash
      yanlisCount++;
      UI.tezgahSallaKirmizi();

      if (yanlisCount >= 2) {
        // 2. yanlış: şimdiye kadar yerleşmiş harfleri zone D'ye düşür
        const yanliHarfler = tezgah
          .filter(s => !s.eksik && s.harf !== null)
          .map(s => s.harf);

        setTimeout(() => {
          if (typeof Game !== 'undefined') Game.tezgahYanlis(yanliHarfler);
          // Tezgahı ve havuzu sıfırla (yeni kelimeye hazırla)
          _sifirla();
        }, 500);
      }
      // 1. yanlışta hiçbir şey yapma — harfler yerinde kalır
    }
  }

  // ══════════════════════════════
  // KONTROL
  // ══════════════════════════════

  function _kontrolEt() {
    const tamDolu = tezgah.every(s => s.harf !== null);
    if (!tamDolu) return;
    UI.tezgahFlash();
    if (typeof Ses !== 'undefined') Ses.kelimeTamam();
    setTimeout(() => { if (onKelimeTamam) onKelimeTamam(hedefKelime); }, 400);
  }

  function _sifirla() {
    tezgah.forEach(s => {
      if (!s.eksik) { s.harf = null; s.bos = true; }
    });
    havuzHarfleri.forEach(h => { h.kullanildi = false; });
    yanlisCount = 0;
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
    const tamDolu = tezgah.every(s => s.harf !== null);
    if (tamDolu) setTimeout(_kontrolEt, 150);
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
