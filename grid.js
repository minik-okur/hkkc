/* =============================================
   GRID.JS — Tezgah Durum Yöneticisi
   Bağlı: index.html
   Kullanır: UI, Words
   ============================================= */

const Grid = (() => {

  let tezgah = [];
  let hedefKelime = '';
  let onKelimeTamam = null;
  let onDrop = null;

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime = kelime;
    onKelimeTamam = kelimeTamamCallback;

    const harfler = kelime.split('');
    const baslangic = Math.floor((8 - harfler.length) / 2);

    tezgah = Array(8).fill(null).map(() => ({ harf: null, eksik: false, bos: true }));

    const kelimeIndexler = harfler.map((_, i) => i);
    const eksikIndexler = _rastgeleSecim(kelimeIndexler, eksikSayisi);

    harfler.forEach((h, i) => {
      const pos = baslangic + i;
      if (eksikIndexler.includes(i)) {
        tezgah[pos] = { harf: null, eksik: true, bos: false };
      } else {
        tezgah[pos] = { harf: h, eksik: false, bos: false };
      }
    });

    // ── YENİ: Dolu harfleri karıştır ──
    const doluIndexler = [];
    const doluHarfler = [];
    tezgah.forEach((h, i) => {
      if (h.harf) {
        doluIndexler.push(i);
        doluHarfler.push(h.harf);
      }
    });
    // Fisher-Yates shuffle
    for (let i = doluHarfler.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doluHarfler[i], doluHarfler[j]] = [doluHarfler[j], doluHarfler[i]];
    }
    // Doğru sırada kaldıysa tekrar karıştır
    const halaDogruMu = doluIndexler.every((idx, k) => {
      return doluHarfler[k] === harfler[idx - baslangic];
    });
    if (halaDogruMu && doluHarfler.length > 1) {
      [doluHarfler[0], doluHarfler[1]] = [doluHarfler[1], doluHarfler[0]];
    }
    doluIndexler.forEach((idx, k) => {
      tezgah[idx].harf = doluHarfler[k];
    });

    _render();
  }

  function _rastgeleSecim(dizi, n) {
    const karistir = [...dizi].sort(() => Math.random() - 0.5);
    return karistir.slice(0, n);
  }

  function _render() {
    UI.tezgahRender(tezgah, _suruklemeDrop);
  }

  function _suruklemeDrop(kaynakIndex, hedefIndex) {
    const kaynak = tezgah[kaynakIndex];
    const hedef  = tezgah[hedefIndex];

    if (!kaynak.harf) return;

    const tmpHarf   = hedef.harf;
    const tmpEksik  = hedef.eksik;
    const tmpBos    = hedef.bos;

    tezgah[hedefIndex].harf   = kaynak.harf;
    tezgah[hedefIndex].eksik  = false;
    tezgah[hedefIndex].bos    = false;

    tezgah[kaynakIndex].harf  = tmpHarf;
    tezgah[kaynakIndex].eksik = tmpHarf ? false : tmpEksik;
    tezgah[kaynakIndex].bos   = tmpHarf ? false : tmpBos;

    _render();
    _kontrol();
  }

  function harfEkle(harf) {
    const i = tezgah.findIndex(h => h.eksik);
    if (i === -1) return false;
    tezgah[i].harf  = harf;
    tezgah[i].eksik = false;
    tezgah[i].bos   = false;
    _render();
    _kontrol();
    return true;
  }

  function harfEkleIndex(harf, index) {
    if (index < 0 || index >= tezgah.length) return false;
    const h = tezgah[index];
    if (!h.eksik) return false;
    h.harf  = harf;
    h.eksik = false;
    h.bos   = false;
    _render();
    _kontrol();
    return true;
  }

  // ── YENİ: İPUCU — bir eksik harfi doğru yerine koy ──
  function ipucuYerlestir() {
    const hedefHarfler = hedefKelime.split('');
    const baslangic = Math.floor((8 - hedefHarfler.length) / 2);

    for (let i = 0; i < tezgah.length; i++) {
      if (tezgah[i].eksik) {
        const kelimeIndex = i - baslangic;
        if (kelimeIndex >= 0 && kelimeIndex < hedefHarfler.length) {
          tezgah[i].harf = hedefHarfler[kelimeIndex];
          tezgah[i].eksik = false;
          tezgah[i].bos = false;
          _render();
          _kontrol();
          return true;
        }
      }
    }
    return false;
  }

  function _kontrol() {
    const harfler = tezgah.filter(h => h.harf).map(h => h.harf);
    const olusanKelime = harfler.join('');

    const hedefHarfler = hedefKelime.split('');
    const baslangic = tezgah.findIndex(h => !h.bos);
    const tezgahDilim = tezgah.slice(baslangic, baslangic + hedefHarfler.length);

    const eslesen = tezgahDilim.every((h, i) => h.harf === hedefHarfler[i]);

    if (eslesen && !tezgahDilim.some(h => h.eksik || !h.harf)) {
      if (onKelimeTamam) onKelimeTamam(hedefKelime);
    }
  }

  function temizle() {
    tezgah = Array(8).fill(null).map(() => ({ harf: null, eksik: false, bos: true }));
    _render();
  }

  function getEksikVar() {
    return tezgah.some(h => h.eksik);
  }

  function getEksikHarfler() {
    const harfler = [];
    const hedefHarfler = hedefKelime.split('');
    const baslangic = Math.floor((8 - hedefHarfler.length) / 2);
    tezgah.forEach((h, i) => {
      if (h.eksik) {
        harfler.push(hedefHarfler[i - baslangic]);
      }
    });
    return harfler;
  }

  return { init, harfEkle, harfEkleIndex, temizle, getEksikVar, getEksikHarfler, ipucuYerlestir };

})();
