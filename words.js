/* =============================================
   WORDS.JS — Kelime + Söz Kütüphanesi
   ============================================= */

const Words = (() => {

  const FILTRE = new Set([
    'VE','İLE','DE','DA','Kİ','BİR','BU','ŞU','O','EN',
    'HER','HİÇ','İÇİN','AMA','FAKAT','LAKIN','ÇÜNKÜ',
    'EĞER','GİBİ','KADAR','GÖRE','DAHA','YA','VEYA',
    'NE','MI','MU','Mİ','MÜ','İSE','GE','SON','TÜM',
    'ZOR','GÜÇ','YENİ','TEK','SON','TAM','İYİ','COK',
    'ÇOK','HAK','SAHİP','OLAN','OLAN','OLUR','OLARAK',
  ]);

  function _kelimeCikar(soz) {
    return soz
      .split(' ')
      .map(p => p.replace(/[,\.!?;:\-—«»""''()]/g, '').toUpperCase().trim())
      .filter(k => k.length >= 4 && !FILTRE.has(k));
  }

  // Kelime uzunluğuna göre zorluk — kısa kelimeli seviyeler önce
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

  // ══════════════════════════════════════════════════
  // SOZLER — kelime ortalama uzunluğuna göre sıralı
  // (kısa kelimeler = erken seviye, uzun = geç seviye)
  // ══════════════════════════════════════════════════
  const SOZLER = [

    // ─── SEVİYE 1 ─── ort. kelime ~4-5 harf
    {
      soz: 'Kader, karakterdir.',
      kaynak: 'Heraklitos',
    },

    // ─── SEVİYE 2 ───
    {
      soz: 'Unutan iyileşir.',
      kaynak: 'Friedrich Nietzsche',
    },

    // ─── SEVİYE 3 ───
    {
      soz: 'Söz, kılıçtan keskindir.',
      kaynak: 'Edward Bulwer-Lytton',
    },

    // ─── SEVİYE 4 ───
    {
      soz: 'Sabır, acının sessiz biçimidir.',
      kaynak: 'Ambrose Bierce',
    },

    // ─── SEVİYE 5 ───
    {
      soz: 'Korku, karanlık tarafa giden yoldur.',
      kaynak: 'Yoda — Star Wars',
    },

    // ─── SEVİYE 6 ───
    {
      soz: 'Işık olmadan gölge olmaz.',
      kaynak: 'Carl Jung',
    },

    // ─── SEVİYE 7 ───
    {
      soz: 'Sessizlik, güçlü bir cevaptır.',
      kaynak: 'Lao Tzu',
    },

    // ─── SEVİYE 8 ───
    {
      soz: 'Güç, kendini yenmekten doğar.',
      kaynak: 'Konfüçyüs',
    },

    // ─── SEVİYE 9 ───
    {
      soz: 'Zaman, tüm yaraları sarar.',
      kaynak: 'Atasözü',
    },

    // ─── SEVİYE 10 ───
    {
      soz: 'Cesaret, korkuya rağmen yürümektir.',
      kaynak: 'Mark Twain',
    },

    // ─── SEVİYE 11 ───
    {
      soz: 'Özgürlük, sorumlulukla ölçülür.',
      kaynak: 'George Bernard Shaw',
    },

    // ─── SEVİYE 12 ───
    {
      soz: 'Bir gün kafes, kuş aramaya çıkar.',
      kaynak: 'Franz Kafka',
    },

    // ─── SEVİYE 13 ───
    {
      soz: 'Sanatın görevi, düzene kaos getirmektir.',
      kaynak: 'Theodor Adorno',
    },

    // ─── SEVİYE 14 ───
    {
      soz: 'Sevgi, her şeyin başlangıcı ve sonudur.',
      kaynak: 'Konfüçyüs',
    },

    // ─── SEVİYE 15 ───
    {
      soz: 'Her düşüş, yeni yükselişin habercisidir.',
      kaynak: 'Rumi',
    },

    // ─── SEVİYE 16 ───
    {
      soz: 'İnsan, anlamını kendisi yaratır.',
      kaynak: 'Jean-Paul Sartre',
    },

    // ─── SEVİYE 17 ───
    {
      soz: 'Yalnızlık, kendini bulmanın mekânıdır.',
      kaynak: 'Paul Tillich',
    },

    // ─── SEVİYE 18 ───
    {
      soz: 'Bilgelik, bildiklerini unutmakla başlar.',
      kaynak: 'Sokrates',
    },

    // ─── SEVİYE 19 ───
    {
      soz: 'Umut, insanı ayakta tutan son şeydir.',
      kaynak: 'Pandora Efsanesi',
    },

    // ─── SEVİYE 20 ───
    {
      soz: 'Akıl, kalbin hizmetçisi olmalıdır.',
      kaynak: 'Blaise Pascal',
    },

    // ─── SEVİYE 21 ───
    {
      soz: 'Değişmeyen tek şey değişimin kendisidir.',
      kaynak: 'Heraklitos',
    },

    // ─── SEVİYE 22 ───
    {
      soz: 'Gerçek, söylenmesi zor olan şeydir.',
      kaynak: 'Tolstoy',
    },

    // ─── SEVİYE 23 ───
    {
      soz: 'Alçakgönüllülük, bilginin kapısıdır.',
      kaynak: 'Sokrates',
    },

    // ─── SEVİYE 24 ───
    {
      soz: 'Bu da dahil, bütün genellemeler yanlıştır.',
      kaynak: 'Friedrich Nietzsche',
    },

    // ─── SEVİYE 25 ───
    {
      soz: 'Sessiz kalma hakkına sahipsin ama bunun için kapasiten yok.',
      kaynak: 'Shrek',
    },

    // ─── SEVİYE 26 ───
    {
      soz: 'Hangi duvar yıkılmaz sorular doğruysa?',
      kaynak: 'Ahmet Telli',
    },

    // ─── SEVİYE 27 ───
    {
      soz: 'Gücünü göstermek zorunda kalan, onu çoktan kaybetmiştir.',
      kaynak: 'Niccolò Machiavelli',
    },

    // ─── SEVİYE 28 ───
    {
      soz: 'Dünya dediğimiz şeyi önce siz yaratmalısınız; bizzat sizin aklınızda şekil bulmalı.',
      kaynak: 'Friedrich Nietzsche',
    },

    // ─── SEVİYE 29 ───
    {
      soz: 'İnsanlar sizi eskisi gibi kullanamadıklarında, değiştiğinizi söylerler.',
      kaynak: 'Sigmund Freud',
    },

    // ─── SEVİYE 30 ───
    {
      soz: 'Bir tehlike anında gemiden uzaklaşan fareler, geminin batmamasını bir türlü affedemezler.',
      kaynak: 'Wiesław Brudziński',
    },

    // ─── SEVİYE 31 ───
    {
      soz: 'Havaya atılan taş eğer konuşabilseydi, kendi isteğiyle oraya çıktığını söylerdi.',
      kaynak: 'Baruch Spinoza',
    },

    // ─── SEVİYE 32 ───
    {
      soz: 'Size gül bahçesi vadetmiyorum. Yaşadığınız toprakların çorak olduğunu söylüyorum!',
      kaynak: 'Joanne Greenberg',
    },

    // ─── SEVİYE 33 ───
    {
      soz: 'Bir fizik kanununa göre; seni kuvvetle çeken bir şeyden uzaklaşmaya çalışırsan, etrafında dönmeye başlarsın.',
      kaynak: 'Fizik Kuralı / Anonim',
    },

  ];

  // ── API ──

  function getSeviye(sevNo) {
    const idx = Math.min(sevNo - 1, SOZLER.length - 1);
    return SOZLER[idx];
  }

  function getKelimeler(sevNo) {
    const sev     = getSeviye(sevNo);
    const anaList = _kelimeCikar(sev.soz);

    // Kelimeleri uzunluğa göre sırala: kısadan uzuna (kolay→zor sırası)
    const sirali = [...anaList].sort((a, b) => a.length - b.length);

    return sirali.map((kelime, sira) => ({
      kelime,
      eksik: _eksikHesapla(kelime, sevNo, sira),
      tanim: sev.tanimlar?.[kelime] || '',
    }));
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
    return SOZLER.length;
  }

  return {
    getSeviye,
    getKelimeler,
    getKelime,
    getEksikSayisi,
    getBoruHarfSayisi,
    getSoz,
    toplamSeviye,
  };

})();
