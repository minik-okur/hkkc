/* =============================================
   WORDS-CORE.JS — Kelime Motoru
   Yükleme sırası (index.html):
     1. words-core.js      ← önce bu
     2. words-level1.js
     3. words-level2.js
     4. words-level3.js
     5. words-level4.js
     6. words-level5.js
   ============================================= */

// ── Veri toplayıcı — level dosyaları buraya yazar ──
const WordsData = (() => {
  const _havuz = {};   // { level1: [...], level2: [...], ... }

  function ekle(seviyeAdi, sozDizisi) {
    if (!_havuz[seviyeAdi]) _havuz[seviyeAdi] = [];
    _havuz[seviyeAdi].push(...sozDizisi);
  }

  function hepsiniAl() {
    // level1 → level2 → ... sırasıyla birleştir (zorluk sırası korunur)
    const sirali = Object.keys(_havuz).sort();
    return sirali.flatMap(k => _havuz[k]);
  }

  return { ekle, hepsiniAl };
})();

// ── Ana Words modülü ──
const Words = (() => {

  const FILTRE = new Set([
    'VE','İLE','DE','DA','Kİ','BİR','BU','ŞU','O','EN',
    'HER','HİÇ','İÇİN','AMA','FAKAT','LAKIN','ÇÜNKÜ',
    'EĞER','GİBİ','KADAR','GÖRE','DAHA','YA','VEYA',
    'NE','MI','MU','Mİ','MÜ','İSE','GE','SON','TÜM',
    'ZOR','GÜÇ','YENİ','TEK','SON','TAM','İYİ','COK',
    'ÇOK','HAK','SAHİP','OLAN','OLUR','OLARAK',
  ]);

  function _kelimeCikar(soz) {
    return soz
      .split(' ')
      .map(p => p.replace(/[,\.!?;:\-—«»""''()]/g, '').toLocaleUpperCase('tr-TR').trim())
      .filter(k => k.length >= 4 && !FILTRE.has(k));
  }

  function _eksikHesapla(kelime, sevNo, sira) {
    const uzunluk = kelime.length;
    let taban;
    if      (sevNo <= 3)  taban = 1;
    else if (sevNo <= 6)  taban = sira === 0 ? 1 : 2;
    else if (sevNo <= 10) taban = sira <= 1  ? 2 : 3;
    else if (sevNo <= 16) taban = sira <= 1  ? 3 : 4;
    else                  taban = sira <= 1  ? 4 : 5;
    const maksEksik = Math.max(1, Math.floor(uzunluk * 0.55));
    return Math.min(taban, maksEksik);
  }

  // Level dosyaları yüklendikten sonra çağrılır
  function _tumSozler() {
    return WordsData.hepsiniAl();
  }

  // ── API ──

  function getSozByIndex(idx) {
    const sozler = _tumSozler();
    const sev = sozler[Math.min(idx, sozler.length - 1)];
    return { soz: sev.soz, kaynak: sev.kaynak };
  }

  function getKelimelerByIndex(idx) {
    const sozler = _tumSozler();
    const sev    = sozler[Math.min(idx, sozler.length - 1)];
    const anaList = _kelimeCikar(sev.soz);
    const sirali  = [...anaList].sort((a, b) => a.length - b.length);
    const sevNo   = idx + 1;
    return sirali.map((kelime, sira) => ({
      kelime,
      eksik: _eksikHesapla(kelime, sevNo, sira),
      tanim: sev.tanimlar?.[kelime] || '',
    }));
  }

  function getSeviye(sevNo) {
    const sozler = _tumSozler();
    return sozler[Math.min(sevNo - 1, sozler.length - 1)];
  }

  function getKelimeler(sevNo) {
    return getKelimelerByIndex(sevNo - 1);
  }

  function getKelime(sevNo, sira) {
    const liste = getKelimeler(sevNo);
    return liste[sira % liste.length];
  }

  function getEksikSayisi(sevNo, sira) {
    const kelime = getKelime(sevNo, sira);
    return kelime ? kelime.eksik : 1;
  }

  function getBoruHarfSayisi(sevNo) {
    const maxEksik = sevNo <= 3 ? 1 : sevNo <= 6 ? 2 : sevNo <= 10 ? 3 : sevNo <= 16 ? 4 : 5;
    return Math.max(3, maxEksik + 2);
  }

  function getSoz(sevNo) {
    const sev = getSeviye(sevNo);
    return { soz: sev.soz, kaynak: sev.kaynak };
  }

  function toplamSeviye() {
    return _tumSozler().length;
  }

  return {
    getSeviye,
    getSozByIndex,
    getKelimelerByIndex,
    getKelimeler,
    getKelime,
    getEksikSayisi,
    getBoruHarfSayisi,
    getSoz,
    toplamSeviye,
  };

})();
