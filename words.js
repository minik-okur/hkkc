/* =============================================
   WORDS.JS — Kelime Listesi + Söz Kütüphanesi
   Bağlı: index.html
   Kullanır: game.js
   ============================================= */

const Words = (() => {

  // Her seviye = 1 söz, 5 kelime (uzunluğa göre kısa→uzun sıralı)
  // eksik: her 4 seviyede 1 artış (3,4,5,6,7)
  const SEVIYELER = [
    // ── SEVİYE 1-4: 3 eksik harf ──
    {
      soz: 'Korku, karanlık tarafa giden yoldur.',
      kaynak: 'Yoda — Star Wars',
      eksik: 3,
      kelimeler: [
        { kelime: 'ÜRKME',    tanim: 'Korkunun içsel hali' },
        { kelime: 'ÇÖKÜŞ',    tanim: 'Karanlık tarafa gidişin sonu' },
        { kelime: 'ZULMET',   tanim: 'Derin karanlık' },
        { kelime: 'ESARET',   tanim: 'Korkunun insanı hapsetmesi' },
        { kelime: 'GÜZERGAH', tanim: 'Yol, gidilen istikamet' },
      ]
    },
    {
      soz: 'Bilgelik, bildiklerini unutmakla başlar.',
      kaynak: 'Sokrates',
      eksik: 3,
      kelimeler: [
        { kelime: 'SIFIR',    tanim: 'Her şeyi unutup yeniden başlamak' },
        { kelime: 'YANILGI',  tanim: 'Önceki yanlış bilgiler' },
        { kelime: 'ARINMA',   tanim: 'Zihnin temizlenmesi' },
        { kelime: 'OLGUNLUK', tanim: 'Bilgeliğin meyvesi' },
        { kelime: 'KAVRAYIŞ', tanim: 'Yeni anlayışa ulaşmak' },
      ]
    },
    {
      soz: 'Sabır, acının sessiz biçimidir.',
      kaynak: 'Ambrose Bierce',
      eksik: 3,
      kelimeler: [
        { kelime: 'SIZI',     tanim: 'İçten gelen hafif acı' },
        { kelime: 'SÜKUT',    tanim: 'Sessizlik, susan kişi' },
        { kelime: 'DAYANÇ',   tanim: 'Dayanma gücü' },
        { kelime: 'BEKLEME',  tanim: 'Sabrın eylemi' },
        { kelime: 'DİRENİŞ',  tanim: 'Acıya karşı durma' },
      ]
    },
    {
      soz: 'Özgürlük, sorumlulukla ölçülür.',
      kaynak: 'George Bernard Shaw',
      eksik: 3,
      kelimeler: [
        { kelime: 'ÖLÇÜ',     tanim: 'Değer biçme' },
        { kelime: 'SINIR',    tanim: 'Özgürlüğün sınırı' },
        { kelime: 'HESAP',    tanim: 'Sorumluluğun karşılığı' },
        { kelime: 'YÜKÜM',    tanim: 'Sorumluluk, yük' },
        { kelime: 'BAĞIMSIZ', tanim: 'Özgür olan' },
      ]
    },

    // ── SEVİYE 5-8: 4 eksik harf ──
    {
      soz: 'Zaman, tüm yaraları sarar.',
      kaynak: 'Atasözü',
      eksik: 4,
      kelimeler: [
        { kelime: 'YARA',   tanim: 'Ruhsal acı' },
        { kelime: 'ŞIFA',   tanim: 'İyileşme' },
        { kelime: 'AKIŞ',   tanim: 'Zamanın geçişi' },
        { kelime: 'UNUTUŞ', tanim: 'Zamanla silinme' },
        { kelime: 'GEÇMİŞ', tanim: 'Arkada kalan' },
      ]
    },
    {
      soz: 'Güç, kendini yenmekten doğar.',
      kaynak: 'Konfüçyüs',
      eksik: 4,
      kelimeler: [
        { kelime: 'AŞIM',  tanim: 'Kendini aşma eylemi' },
        { kelime: 'YENGI', tanim: 'Zafer' },
        { kelime: 'NEFİS', tanim: 'İçindeki düşman' },
        { kelime: 'DOĞUŞ', tanim: 'Bir şeyin ortaya çıkması' },
        { kelime: 'İRADE', tanim: 'İç güç, kararlılık' },
      ]
    },
    {
      soz: 'Söz, kılıçtan keskindir.',
      kaynak: 'Edward Bulwer-Lytton',
      eksik: 4,
      kelimeler: [
        { kelime: 'YARA',     tanim: 'Sözün bıraktığı iz' },
        { kelime: 'ÇELİK',   tanim: 'Kılıç, sertlik' },
        { kelime: 'LÂFIZ',   tanim: 'Söylenen söz' },
        { kelime: 'KESKİN',  tanim: 'Sivri, acıtıcı' },
        { kelime: 'DERİNLİK', tanim: 'Sözün ağırlığı' },
      ]
    },
    {
      soz: 'Işık olmadan gölge de olmaz.',
      kaynak: 'Carl Jung',
      eksik: 4,
      kelimeler: [
        { kelime: 'DENGE',    tanim: 'İkisi arasındaki ilişki' },
        { kelime: 'ZITLIK',   tanim: 'Karşıtların birlikteliği' },
        { kelime: 'VARLIK',   tanim: 'Bir şeyin var olması' },
        { kelime: 'KARALTI',  tanim: 'Gölge, loşluk' },
        { kelime: 'AYDINLIK', tanim: 'Işığın hali' },
      ]
    },

    // ── SEVİYE 9-12: 5 eksik harf ──
    {
      soz: 'Umut, insanı ayakta tutan son şeydir.',
      kaynak: 'Pandora Efsanesi',
      eksik: 5,
      kelimeler: [
        { kelime: 'SON',     tanim: 'Geriye kalan tek şey' },
        { kelime: 'IŞIK',    tanim: 'Umudun sembolü' },
        { kelime: 'DİLEK',  tanim: 'İçten gelen istek' },
        { kelime: 'KALIM',   tanim: 'Hayatta kalma' },
        { kelime: 'TUTUNMA', tanim: 'Ayakta kalma çabası' },
      ]
    },
    {
      soz: 'Sessizlik, en güçlü cevaptır.',
      kaynak: 'Lao Tzu',
      eksik: 5,
      kelimeler: [
        { kelime: 'SÜKUT',     tanim: 'Derin sessizlik' },
        { kelime: 'YANIT',     tanim: 'Cevap verme' },
        { kelime: 'GÜÇLÜLÜK',  tanim: 'Sessizliğin gücü' },
        { kelime: 'DİNGİNLİK', tanim: 'İçsel huzur' },
        { kelime: 'BİLGELİK',  tanim: 'Konuşmama erdemi' },
      ]
    },
    {
      soz: 'Her düşüş, yeni bir yükselişin habercisidir.',
      kaynak: 'Rumi',
      eksik: 5,
      kelimeler: [
        { kelime: 'DÖNGÜ',    tanim: 'Düşüp kalkmanın tekrarı' },
        { kelime: 'HABER',    tanim: 'İşaret, müjde' },
        { kelime: 'DOĞUŞ',    tanim: 'Yeniden başlangıç' },
        { kelime: 'YIKILMA',  tanim: 'Düşüş anı' },
        { kelime: 'YÜKSELİŞ', tanim: 'Toparlanma ve ilerleme' },
      ]
    },
    {
      soz: 'Cesaret, korkunun yokluğu değil, korkuya rağmen yürümektir.',
      kaynak: 'Mark Twain',
      eksik: 5,
      kelimeler: [
        { kelime: 'AŞIM',     tanim: 'Engeli geçme' },
        { kelime: 'İRADE',    tanim: 'Korkuya rağmen devam etmek' },
        { kelime: 'YÜRÜYÜŞ',  tanim: 'İlerleme eylemi' },
        { kelime: 'TİTREME',  tanim: 'Korkunun bedendeki hali' },
        { kelime: 'YİĞİTLİK', tanim: 'Cesaret, yüreklilik' },
      ]
    },

    // ── SEVİYE 13-16: 6 eksik harf ──
    {
      soz: 'Sevgi, her şeyin başlangıcı ve sonudur.',
      kaynak: 'Konfüçyüs',
      eksik: 6,
      kelimeler: [
        { kelime: 'BAĞ',      tanim: 'İnsanları birleştiren' },
        { kelime: 'SON',       tanim: 'Her şeyin bitişi' },
        { kelime: 'KÖKEN',     tanim: 'Başlangıç noktası' },
        { kelime: 'DÖNGÜ',    tanim: 'Başlayıp biten şey' },
        { kelime: 'MUHABBET', tanim: 'Sevgi, sıcaklık' },
      ]
    },
    {
      soz: 'Alçakgönüllülük, bilginin kapısıdır.',
      kaynak: 'Sokrates',
      eksik: 6,
      kelimeler: [
        { kelime: 'KAPI',     tanim: 'Girişin sembolü' },
        { kelime: 'İRFAN',    tanim: 'Derin bilgi' },
        { kelime: 'TEVAZU',   tanim: 'Alçakgönüllülük' },
        { kelime: 'AÇIKLIK',  tanim: 'Yeni şeylere açık olmak' },
        { kelime: 'YOLCULUK', tanim: 'Öğrenme süreci' },
      ]
    },
    {
      soz: 'Kader, karakterdir.',
      kaynak: 'Heraklitos',
      eksik: 6,
      kelimeler: [
        { kelime: 'HUY',       tanim: 'Karakter, tabiat' },
        { kelime: 'EYLEM',     tanim: 'Karakterin dışa vurumu' },
        { kelime: 'YAZGI',     tanim: 'Kader, alın yazısı' },
        { kelime: 'VAROLUŞ',   tanim: 'Olduğun şey' },
        { kelime: 'ÖZDEŞLİK', tanim: 'İkisinin aynı şey olması' },
      ]
    },
    {
      soz: 'Gerçek, söylenmesi en zor olan şeydir.',
      kaynak: 'Tolstoy',
      eksik: 6,
      kelimeler: [
        { kelime: 'SÖYLEM',    tanim: 'Dile getirme' },
        { kelime: 'GÜÇLÜK',    tanim: 'Zorlanma hali' },
        { kelime: 'CESARET',   tanim: 'Gerçeği söyleme yüreği' },
        { kelime: 'HAKİKAT',   tanim: 'Gerçek, doğru olan' },
        { kelime: 'YÜZLEŞME',  tanim: 'Gerçekle karşılaşma' },
      ]
    },

    // ── SEVİYE 17-20: 7 eksik harf ──
    {
      soz: 'Yalnızlık, kendini bulmanın mekânıdır.',
      kaynak: 'Paul Tillich',
      eksik: 7,
      kelimeler: [
        { kelime: 'MEKAN',    tanim: 'Yer, ortam' },
        { kelime: 'KEŞİF',    tanim: 'Bulma eylemi' },
        { kelime: 'ISSIZLIK', tanim: 'Yalnızlık hali' },
        { kelime: 'ÖZSEZGİ',  tanim: 'Kendini anlama' },
        { kelime: 'İÇEDÖNÜŞ', tanim: 'Kendine bakma' },
      ]
    },
    {
      soz: 'Değişmeyen tek şey değişimin kendisidir.',
      kaynak: 'Heraklitos',
      eksik: 7,
      kelimeler: [
        { kelime: 'AKIŞ',     tanim: 'Her şeyin aktığı fikri' },
        { kelime: 'DÖNGÜ',    tanim: 'Tekrarlayan değişim' },
        { kelime: 'DÖNÜŞÜM',  tanim: 'Değişim süreci' },
        { kelime: 'ÇELİŞKİ',  tanim: 'Değişmeyen değişim paradoksu' },
        { kelime: 'SABİTLİK', tanim: 'Değişmeyen şey' },
      ]
    },
    {
      soz: 'İnsan, anlamını kendisi yaratır.',
      kaynak: 'Jean-Paul Sartre',
      eksik: 7,
      kelimeler: [
        { kelime: 'ANLAM',       tanim: 'Hayatın amacı' },
        { kelime: 'YARATIM',     tanim: 'Ortaya çıkarma eylemi' },
        { kelime: 'VAROLUŞ',     tanim: 'Var olma hali' },
        { kelime: 'ÖZGÜRLÜK',    tanim: 'Seçim hakkı' },
        { kelime: 'SORUMLULUK',  tanim: 'Anlam yaratmanın bedeli' },
      ]
    },
    {
      soz: 'Akıl, kalbin hizmetçisi olmalıdır.',
      kaynak: 'Blaise Pascal',
      eksik: 7,
      kelimeler: [
        { kelime: 'USUL',     tanim: 'Akıl, mantık' },
        { kelime: 'DENGE',    tanim: 'Akıl ve kalbin uyumu' },
        { kelime: 'GÖNÜL',    tanim: 'Kalp, his merkezi' },
        { kelime: 'HİZMET',   tanim: 'Birine bağlı çalışmak' },
        { kelime: 'ÖNCELİK',  tanim: 'Hangisinin önde gelmesi' },
      ]
    },
  ];

  function getSeviye(sevNo) {
    return SEVIYELER[sevNo - 1] || SEVIYELER[SEVIYELER.length - 1];
  }

  function getKelime(sevNo, sira) {
    const sev = getSeviye(sevNo);
    return sev.kelimeler[sira % sev.kelimeler.length];
  }

  function getEksikSayisi(sevNo) {
    return getSeviye(sevNo).eksik;
  }

  function getBoruHarfSayisi(sevNo) {
    const eksik = getEksikSayisi(sevNo);
    return Math.max(5, eksik + 2);
  }

  function getSoz(sevNo) {
    const sev = getSeviye(sevNo);
    return { soz: sev.soz, kaynak: sev.kaynak };
  }

  function toplamSeviye() {
    return SEVIYELER.length;
  }

  return { getSeviye, getKelime, getEksikSayisi, getBoruHarfSayisi, getSoz, toplamSeviye };

})();
