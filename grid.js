/* =============================================
   GRID.JS — Tezgah Durum Yöneticisi
   Bağlı: index.html
   Kullanır: UI, Words
   ============================================= */

const Grid = (() => {

  let tezgah = [];
  let hedefKelime = '';
  let hedefHarfler = [];
  let baslangicPos = 0;
  let onKelimeTamam = null;

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime  = kelime;
    hedefHarfler = kelime.split('');
    onKelimeTamam = kelimeTamamCallback;

    const n = hedefHarfler.length;
    baslangicPos = Math.floor((8 - n) / 2);

    // Boş 8 hücre
    tezgah = Array(8).fill(null).map(() => ({ harf: null, eksik: false, bos: true }));

    // Eksik pozisyonları rastgele seç
    const tumIndexler = hedefHarfler.map((_, i) => i);
    const eksikIndexler = _rastgeleSecim(tumIndexler, eksikSayisi);

    hedefHarfler.forEach((h, i) => {
      const pos = baslangicPos + i;
      if (eksikIndexler.includes(i)) {
        tezgah[pos] = { harf: null, eksik: true, bos: false };
      } else {
        tezgah[pos] = { harf: h, eksik: false, bos: false };
      }
    });

    _render();
  }

  function _rastgeleSecim(dizi, n) {
    return [...dizi].sort(() => Math.random() - 0.5).slice(0, n);
  }

  function _render() {
    UI.tezgahRender(tezgah, _drop);
  }

  function _drop(kaynakIndex, hedefIndex) {
    const k = tezgah[kaynakIndex];
    const h = tezgah[hedefIndex];
    if (!k || !k.harf) return;

    // Sadece tezgah içi hücrelerle takas
    if (h.bos) return;

    const tmpHarf  = h.harf;
    const tmpEksik = h.eksik;

    tezgah[hedefIndex].harf  = k.harf;
    tezgah[hedefIndex].eksik = false;

    tezgah[kaynakIndex].harf  = tmpHarf;
    tezgah[kaynakIndex].eksik = tmpHarf ? false : tmpEksik;

    _render();
    _kontrol();
  }

  function bekleyenKoy(harf, hedefIndex) {
    // Bekleyen harfi belirli bir hücreye koy
    const h = tezgah[hedefIndex];
    if (!h || !h.eksik) return false;

    tezgah[hedefIndex].harf  = harf;
    tezgah[hedefIndex].eksik = false;

    _render();
    _kontrol();
    return true;
  }

  function ilkEksigeBekleyenKoy(harf) {
    // Eksik yok veya oyuncu sürüklemeden tıkladıysa ilk eksiğe koy
    const i = tezgah.findIndex(h => h.eksik);
    if (i === -1) return false;
    return bekleyenKoy(harf, i);
  }

  function _kontrol() {
    // Tüm hücrelerde eksik kalmamalı
    if (tezgah.some(h => h.eksik)) return;

    // Kelime alanındaki harfleri sırayla oku
    const dilim = tezgah.slice(baslangicPos, baslangicPos + hedefHarfler.length);
    if (dilim.some(h => !h.harf)) return;

    const olusan = dilim.map(h => h.harf).join('');
    if (olusan === hedefKelime) {
      if (onKelimeTamam) onKelimeTamam(hedefKelime);
    }
  }

  function getEksikVar() {
    return tezgah.some(h => h.eksik);
  }

  function temizle() {
    tezgah = Array(8).fill(null).map(() => ({ harf: null, eksik: false, bos: true }));
    _render();
  }

  function getTumHarfler() {
    return tezgah.filter(h => h.harf).map(h => h.harf);
  }

  return { init, bekleyenKoy, ilkEksigeBekleyenKoy, getEksikVar, temizle, getTumHarfler };

})();
