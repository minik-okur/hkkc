/* =============================================
   WORDS.JS — Kelime + Söz Kütüphanesi
   Bağlı: index.html
   Kullanır: game.js

   YENİ YAPI:
   - Her seviyede 1 atasözü/söz
   - Atasözündeki ana kelimeler = oyun kelimeleri
   - Bağlaçlar/edatlar otomatik filtrelenir (tezgaha gelmez)
   - Her kelimede ayrı eksik harf sayısı (eksik)
   - Seviye yükseldikçe eksik sayısı artar
   ============================================= */

const Words = (() => {

  // Tezgaha gelmeyecek küçük kelimeler
  const FILTRE = new Set([
    'VE','İLE','DE','DA','Kİ','BİR','BU','ŞU','O','EN',
    'HER','HİÇ','İÇİN','AMA','FAKAT','LAKIN','ÇÜNKÜ',
    'EĞER','GİBİ','KADAR','GÖRE','DAHA','YA','VEYA',
    'NE','MI','MU','Mİ','MÜ','İSE','DE','GE'
  ]);

  // ── YARDIMCI: atasözünden oynanabilir kelimeleri çıkar ──
  // noktalama temizler, büyük harfe çevirir, filtreyi uygular
  function _kelimeCikar(soz) {
    return soz
      .split(' ')
      .map(p => p.replace(/[,\.!?;:\-—«»""'']/g, '').toUpperCase().trim())
      .filter(k => k.length >= 3 && !FILTRE.has(k));
  }

  /*
    EKSİK HARF KURALI (kelime bazında):
    Seviye 1-2  : ilk kelime 1 eksik, geri kalanlar 1-2
    Seviye 3-4  : 1-2 eksik
    Seviye 5-8  : 2-3 eksik
    Seviye 9-12 : 3-4 eksik
    Seviye 13+  : 4-5 eksik
    Kısa kelimeler (≤4 harf) max 1-2 eksik alır
  */
  function _eksikHesapla(kelime, sevNo, sira) {
    const uzunluk = kelime.length;
    let taban;

    if      (sevNo <= 2)  taban = 1;
    else if (sevNo <= 4)  taban = sira === 0 ? 1 : 2;
    else if (sevNo <= 8)  taban = sira <= 1  ? 2 : 3;
    else if (sevNo <= 12) taban = sira <= 1  ? 3 : 4;
    else                  taban = sira <= 1  ? 4 : 5;

    // Kısa kelimede çok eksik harf olmaz
    const maksEksik = Math.max(1, Math.floor(uzunluk * 0.6));
    return Math.min(taban, maksEksik);
  }

  // ── SEVİYELER ──
  // Her seviye: soz, kaynak
  // kelimeler atasözünden otomatik türetilir
  // Ek tanim alanı: sözlükteki açıklama (isteğe bağlı)
  const SOZLER = [

    // ── SEVİYE 1 ──
    {
      soz: 'Korku, karanlık tarafa giden yoldur.',
      kaynak: 'Yoda — Star Wars',
      tanimlar: {
        'KORKU':    'Tehlike karşısında duyulan his',
        'KARANLIK': 'Işığın olmadığı yer',
        'TARAFA':   'Yön, taraf',
        'GİDEN':    'İlerleyen, yola çıkan',
        'YOLDUR':   'Yol olan, yoldur',
      }
    },

    // ── SEVİYE 2 ──
    {
      soz: 'Bilgelik, bildiklerini unutmakla başlar.',
      kaynak: 'Sokrates',
      tanimlar: {
        'BİLGELİK':   'Derin ve olgun anlayış',
        'BİLDİKLERİNİ': 'Öğrenilmiş şeyler',
        'UNUTMAKLA':  'Bellekten silmek suretiyle',
        'BAŞLAR':     'Başlangıç noktası',
      }
    },

    // ── SEVİYE 3 ──
    {
      soz: 'Sabır, acının sessiz biçimidir.',
      kaynak: 'Ambrose Bierce',
      tanimlar: {
        'SABIR':   'Dayanma gücü',
        'ACININ':  'Acıya ait olan',
        'SESSİZ':  'Ses çıkarmayan',
        'BİÇİMİDİR': 'Şeklidir, halidir',
      }
    },

    // ── SEVİYE 4 ──
    {
      soz: 'Özgürlük, sorumlulukla ölçülür.',
      kaynak: 'George Bernard Shaw',
      tanimlar: {
        'ÖZGÜRLÜK':     'Bağımsızlık hali',
        'SORUMLULUKLA': 'Sorumluluk ile birlikte',
        'ÖLÇÜLÜR':      'Değeri belirlenir',
      }
    },

    // ── SEVİYE 5 ──
    {
      soz: 'Zaman, tüm yaraları sarar.',
      kaynak: 'Atasözü',
      tanimlar: {
        'ZAMAN':   'Geçen süre',
        'TÜM':     'Hepsi, tamamı',
        'YARALARI': 'Acıları, izleri',
        'SARAR':   'İyileştirir, sarar',
      }
    },

    // ── SEVİYE 6 ──
    {
      soz: 'Güç, kendini yenmekten doğar.',
      kaynak: 'Konfüçyüs',
      tanimlar: {
        'GÜÇ':       'Kuvvet, iktidar',
        'KENDİNİ':   'Kendi özünü',
        'YENMEKTEN': 'Galip gelmekten',
        'DOĞAR':     'Ortaya çıkar',
      }
    },

    // ── SEVİYE 7 ──
    {
      soz: 'Söz, kılıçtan keskindir.',
      kaynak: 'Edward Bulwer-Lytton',
      tanimlar: {
        'SÖZ':       'Dile getirilen ifade',
        'KILIÇTAN':  'Kılıçla karşılaştırıldığında',
        'KESKİNDİR': 'Sivri ve etkilidir',
      }
    },

    // ── SEVİYE 8 ──
    {
      soz: 'Işık olmadan gölge olmaz.',
      kaynak: 'Carl Jung',
      tanimlar: {
        'IŞIK':   'Aydınlık kaynağı',
        'OLMADAN': 'Yokluğunda',
        'GÖLGE':  'Karanlık yansıma',
        'OLMAZ':  'Var olamaz',
      }
    },

    // ── SEVİYE 9 ──
    {
      soz: 'Umut, insanı ayakta tutan son şeydir.',
      kaynak: 'Pandora Efsanesi',
      tanimlar: {
        'UMUT':    'İyiye olan inanç',
        'İNSANI':  'İnsana ait',
        'AYAKTA':  'Dik duran',
        'TUTAN':   'Destekleyen',
        'ŞEYDİR':  'Şeydir, olgudur',
      }
    },

    // ── SEVİYE 10 ──
    {
      soz: 'Sessizlik, güçlü cevaptır.',
      kaynak: 'Lao Tzu',
      tanimlar: {
        'SESSİZLİK': 'Konuşmama hali',
        'GÜÇLÜ':     'Etkili, kuvvetli',
        'CEVAPTıR':  'Yanıttır',
      }
    },

    // ── SEVİYE 11 ──
    {
      soz: 'Her düşüş, yeni yükselişin habercisidir.',
      kaynak: 'Rumi',
      tanimlar: {
        'DÜŞÜŞ':        'Aşağı inme',
        'YENİ':         'Taze, baştan',
        'YÜKSELİŞİN':  'Yükselmeye ait',
        'HABERCİSİDİR': 'Müjdecisidir',
      }
    },

    // ── SEVİYE 12 ──
    {
      soz: 'Cesaret, korkuya rağmen yürümektir.',
      kaynak: 'Mark Twain',
      tanimlar: {
        'CESARET':    'Yüreklilik',
        'KORKUYA':    'Korkuya karşın',
        'RAĞMEN':     'Karşın, buna karşı',
        'YÜRÜMEKTİR': 'İlerleme eylemidir',
      }
    },

    // ── SEVİYE 13 ──
    {
      soz: 'Sevgi, her şeyin başlangıcı sonudur.',
      kaynak: 'Konfüçyüs',
      tanimlar: {
        'SEVGİ':       'Bağlılık duygusu',
        'BAŞLANGICI':  'İlk noktası',
        'SONUDUR':     'Bitiş noktasıdır',
      }
    },

    // ── SEVİYE 14 ──
    {
      soz: 'Alçakgönüllülük, bilginin kapısıdır.',
      kaynak: 'Sokrates',
      tanimlar: {
        'ALÇAKGÖNÜLLÜLÜK': 'Tevazu, mütevazılık',
        'BİLGİNİN':        'Bilgeye ait olan',
        'KAPISIDıR':       'Girişidir',
      }
    },

    // ── SEVİYE 15 ──
    {
      soz: 'Kader, karakterdir.',
      kaynak: 'Heraklitos',
      tanimlar: {
        'KADER':     'Alın yazısı',
        'KARAKTERDİR': 'Kişiliktir, huydur',
      }
    },

    // ── SEVİYE 16 ──
    {
      soz: 'Gerçek, söylenmesi zor olan şeydir.',
      kaynak: 'Tolstoy',
      tanimlar: {
        'GERÇEK':     'Doğru olan',
        'SÖYLENMESİ': 'Dile getirilmesi',
        'ZOR':        'Güç, zorlu',
        'ŞEYDİR':     'Olgudur',
      }
    },

    // ── SEVİYE 17 ──
    {
      soz: 'Yalnızlık, kendini bulmanın mekânıdır.',
      kaynak: 'Paul Tillich',
      tanimlar: {
        'YALNIZLIK':  'Tek başınalık hali',
        'KENDİNİ':    'Kendi özünü',
        'BULMANIN':   'Keşfetmenin',
        'MEKÂNIDUR':  'Yeri, ortamıdır',
      }
    },

    // ── SEVİYE 18 ──
    {
      soz: 'Değişmeyen tek şey değişimin kendisidir.',
      kaynak: 'Heraklitos',
      tanimlar: {
        'DEĞİŞMEYEN':  'Sabit kalan',
        'ŞEY':         'Olgu, nesne',
        'DEĞİŞİMİN':   'Değişime ait olan',
        'KENDİSİDİR':  'Bizzat odur',
      }
    },

    // ── SEVİYE 19 ──
    {
      soz: 'İnsan, anlamını kendisi yaratır.',
      kaynak: 'Jean-Paul Sartre',
      tanimlar: {
        'İNSAN':    'Akıl sahibi varlık',
        'ANLAMINI': 'Manasını, amacını',
        'KENDİSİ':  'Bizzat kendisi',
        'YARATIR':  'Ortaya çıkarır',
      }
    },

    // ── SEVİYE 20 ──
    {
      soz: 'Akıl, kalbin hizmetçisi olmalıdır.',
      kaynak: 'Blaise Pascal',
      tanimlar: {
        'AKIL':        'Mantık, us',
        'KALBİN':      'Kalbe ait olan',
        'HİZMETÇİSİ':  'Yardımcısı, hizmetkârı',
        'OLMALıDıR':   'Olması gerekir',
      }
    },
  ];

  // ── API ──

  function getSeviye(sevNo) {
    const idx = Math.min(sevNo - 1, SOZLER.length - 1);
    return SOZLER[idx];
  }

  // Seviyedeki oynanabilir kelimeleri (filtrelenmiş + eksik hesaplanmış) döner
  function getKelimeler(sevNo) {
    const sev     = getSeviye(sevNo);
    const anaList = _kelimeCikar(sev.soz);

    return anaList.map((kelime, sira) => ({
      kelime,
      eksik:  _eksikHesapla(kelime, sevNo, sira),
      tanim:  sev.tanimlar?.[kelime] || '',
    }));
  }

  // Tek kelime getir (game.js uyumluluğu için)
  function getKelime(sevNo, sira) {
    const liste = getKelimeler(sevNo);
    return liste[sira % liste.length];
  }

  // Kelime bazında eksik sayısı (game.js uyumluluğu)
  function getEksikSayisi(sevNo, sira) {
    const kelime = getKelime(sevNo, sira);
    return kelime ? kelime.eksik : 1;
  }

  function getBoruHarfSayisi(sevNo) {
    // Eksik artınca boru havuzu da büyür
    const maxEksik = sevNo <= 2 ? 1 : sevNo <= 4 ? 2 : sevNo <= 8 ? 3 : sevNo <= 12 ? 4 : 5;
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
    getKelimeler,   // YENİ — tüm kelime listesi
    getKelime,      // game.js uyumluluğu
    getEksikSayisi, // game.js uyumluluğu
    getBoruHarfSayisi,
    getSoz,
    toplamSeviye,
  };

})();
