/* =============================================
   WORDS.JS — Kelime Listesi
   Bağlı: index.html
   Kullanır: game.js
   ============================================= */

const Words = (() => {

  // Her seviye 5 kelime
  // eksik: o seviyede kaç harf eksik gelir
  const SEVIYELER = [
    // Seviye 1 — 1 eksik harf
    {
      eksik: 1,
      kelimeler: [
        { kelime: 'KASAP', harf: ['K','A','S','A','P'], tanim: 'Etin efendisi, satırın ustası.' },
        { kelime: 'KİTAP', harf: ['K','İ','T','A','P'], tanim: 'Bilginin kapısı, dünyanın anahtarı.' },
        { kelime: 'KALEM', harf: ['K','A','L','E','M'], tanim: 'Düşüncenin kılıcı.' },
        { kelime: 'ELMA',  harf: ['E','L','M','A'],     tanim: 'Bahçenin en sevilen misafiri.' },
        { kelime: 'MASA',  harf: ['M','A','S','A'],     tanim: 'Fikirlerin toplandığı düz zemin.' },
      ]
    },
    // Seviye 2 — 2 eksik harf
    {
      eksik: 2,
      kelimeler: [
        { kelime: 'ARABA',  harf: ['A','R','A','B','A'], tanim: 'Dört tekerlek, bin yol.' },
        { kelime: 'SOKAK',  harf: ['S','O','K','A','K'], tanim: 'Komşuların ortak bahçesi.' },
        { kelime: 'TABAK',  harf: ['T','A','B','A','K'], tanim: 'Yemeğin sahnesi.' },
        { kelime: 'YANAK',  harf: ['Y','A','N','A','K'], tanim: 'Sevinç kızarır, utanç solar.' },
        { kelime: 'KONAK',  harf: ['K','O','N','A','K'], tanim: 'Zamanın taş bellediği ev.' },
      ]
    },
    // Seviye 3 — 3 eksik harf
    {
      eksik: 3,
      kelimeler: [
        { kelime: 'SABAH',  harf: ['S','A','B','A','H'], tanim: 'Gecenin teslim olduğu an.' },
        { kelime: 'KANAT',  harf: ['K','A','N','A','T'], tanim: 'Özgürlüğün iskeleti.' },
        { kelime: 'KAPAK',  harf: ['K','A','P','A','K'], tanim: 'Gizlenen şeyin yüzü.' },
        { kelime: 'MUTFAK', harf: ['M','U','T','F','A','K'], tanim: 'Sevginin pişirildiği yer.' },
        { kelime: 'KILIK',  harf: ['K','I','L','I','K'], tanim: 'Dışarıya açılan pencere.' },
      ]
    },
    // Seviye 4 — 4 eksik harf
    {
      eksik: 4,
      kelimeler: [
        { kelime: 'TOPRAK', harf: ['T','O','P','R','A','K'], tanim: 'Her şeyin başladığı ve bittiği yer.' },
        { kelime: 'YILDIZ', harf: ['Y','I','L','D','I','Z'], tanim: 'Gecenin sessiz tanıkları.' },
        { kelime: 'KÖPRÜ',  harf: ['K','Ö','P','R','Ü'],    tanim: 'İki yakayı buluşturan düşünce.' },
        { kelime: 'FIRTINA',harf: ['F','I','R','T','I','N','A'], tanim: 'Denizin öfkeli nefesi.' },
        { kelime: 'ÇARŞI',  harf: ['Ç','A','R','Ş','I'],    tanim: 'Seslerin ve renklerin buluşma noktası.' },
      ]
    },
    // Seviye 5 — 5 eksik harf
    {
      eksik: 5,
      kelimeler: [
        { kelime: 'PENCERE', harf: ['P','E','N','C','E','R','E'], tanim: 'Dışarıyı içeriye taşıyan çerçeve.' },
        { kelime: 'ÇIÇEK',   harf: ['Ç','İ','Ç','E','K'],        tanim: 'Toprağın gülümsemesi.' },
        { kelime: 'DENIZ',   harf: ['D','E','N','İ','Z'],        tanim: 'Ufkun kaybolduğu yer.' },
        { kelime: 'BULUT',   harf: ['B','U','L','U','T'],        tanim: 'Gökyüzünün gezgin sakinleri.' },
        { kelime: 'KELEBEK', harf: ['K','E','L','E','B','E','K'], tanim: 'Dönüşümün en güzel ispatı.' },
      ]
    },
  ];

  function getSeviye(sevNo) {
    // sevNo 1'den başlar
    return SEVIYELER[sevNo - 1] || SEVIYELER[SEVIYELER.length - 1];
  }

  function getKelime(sevNo, sira) {
    const sev = getSeviye(sevNo);
    return sev.kelimeler[sira % sev.kelimeler.length];
  }

  function getEksikSayisi(sevNo) {
    return getSeviye(sevNo).eksik;
  }

  function toplamSeviye() {
    return SEVIYELER.length;
  }

  return { getSeviye, getKelime, getEksikSayisi, toplamSeviye };

})();
