/* =============================================
   GRID.JS — Tezgah Durum Yöneticisi
   Tezgahtaki hücrelerin state'ini tutar.
   Bağlı: index.html
   Kullanır: UI, Words
   ============================================= */

const Grid = (() => {

  // tezgah: [{ harf, eksik, bos }]
  // harf: string | null
  // eksik: bool — boş ama doldurulacak
  // bos: bool — tamamen boş hücre
  let tezgah = [];
  let hedefKelime = '';  // 'KASAP'
  let onKelimeTamam = null;
  let onDrop = null;

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime = kelime;
    onKelimeTamam = kelimeTamamCallback;

    // Tezgahı oluştur: 8 hücre
    // Kelime ortaya hizalanır
    const harfler = kelime.split('');
    const baslangic = Math.floor((8 - harfler.length) / 2);

    tezgah = Array(8).fill(null).map(() => ({ harf: null, eksik: false, bos: true }));

    // Rastgele eksik indexler seç (kelime içinden)
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

    // Sadece dolu hücreyi eksik veya dolu hücreyle takas et
    if (!kaynak.harf) return;

    // Takas
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
    // İlk eksik hücreye ekle
    const i = tezgah.findIndex(h => h.eksik);
    if (i === -1) return false; // eksik hücre yok
    tezgah[i].harf  = harf;
    tezgah[i].eksik = false;
    tezgah[i].bos   = false;
    _render();
    _kontrol();
    return true;
  }

  function harfEkleIndex(harf, index) {
    // Belirli hücreye ekle (sürükle-bırak için)
    if (index < 0 || index >= tezgah.length) return false;
    const h = tezgah[index];
    if (!h.eksik) return false; // sadece eksik hücreye bırakılabilir
    h.harf  = harf;
    h.eksik = false;
    h.bos   = false;
    _render();
    _kontrol();
    return true;
  }

  function _kontrol() {
    // Tezgahtaki harfleri oku, hedef kelimeyle karşılaştır
    const harfler = tezgah.filter(h => h.harf).map(h => h.harf);
    // Sıralı kelime
    const olusanKelime = harfler.join('');

    // Hedef kelimenin harflerinin tam konumlarını bul
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

  return { init, harfEkle, harfEkleIndex, temizle, getEksikVar, getEksikHarfler };

})();
