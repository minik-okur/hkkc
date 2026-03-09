/* =============================================
   GRID.JS — Halka Tezgah Yöneticisi
   Bağlı: index.html
   Kullanır: UI
   ============================================= */

const Grid = (() => {

  // ── STATE ──
  let hedefKelime    = '';
  let halkaDizi      = [];   // [{ harf, bos, merkez, index }]  index = kelime pozisyonu
  let onKelimeTamam  = null;

  // Seçim zinciri
  let zincir         = [];   // seçilen halka indexleri (sıralı)
  let secimAktif     = false;

  // SVG çizgi elementi (ui.js ile koordineli)
  let svgEl          = null;
  let containerEl    = null;

  // ══════════════════════════════
  // INIT
  // ══════════════════════════════

  function init(kelime, eksikSayisi, kelimeTamamCallback) {
    hedefKelime   = kelime;
    onKelimeTamam = kelimeTamamCallback;
    zincir        = [];
    secimAktif    = false;

    _halkaOlustur(kelime, eksikSayisi);
    _render();
  }

  // ── Halka dizisini kur ──
  // Dış halka: 8 slot (index 0-7)
  // Merkez:    2 slot (index 8-9)
  // Kelime harfleri dıştan içe doldurulur
  function _halkaOlustur(kelime, eksikSayisi) {
    const harfler = kelime.split('');
    const toplam  = harfler.length;

    // Hangi pozisyonlar eksik?
    const tumIdx      = harfler.map((_, i) => i);
    const eksikPozlar = _rastgeleSecim(tumIdx, eksikSayisi);

    // Dış 8 + merkez 2 = 10 slot
    halkaDizi = [];
    for (let i = 0; i < 10; i++) {
      halkaDizi.push({ harf: null, bos: true, eksik: false, merkez: i >= 8, kelimePos: -1 });
    }

    // Harfleri yerleştir: ilk 8'i dış halkaya, taşanları merkeze
    harfler.forEach((h, ki) => {
      const slotIdx = ki < 8 ? ki : ki - 8 + 8; // 0-7 dış, 8-9 merkez
      const slot    = halkaDizi[slotIdx];
      slot.kelimePos = ki;

      if (eksikPozlar.includes(ki)) {
        slot.eksik = true;
        slot.bos   = false;
        slot.harf  = null;
      } else {
        slot.harf = h;
        slot.bos  = false;
        slot.eksik = false;
      }
    });
  }

  function _rastgeleSecim(dizi, n) {
    return [...dizi].sort(() => Math.random() - 0.5).slice(0, n);
  }

  // ══════════════════════════════
  // RENDER
  // ══════════════════════════════

  function _render() {
    UI.halkaRender(halkaDizi, {
      onPointerDown:  _basla,
      onPointerEnter: _gecis,
      onPointerUp:    _birak,
    });
    // SVG referansını al
    svgEl       = document.getElementById('halka-svg');
    containerEl = document.getElementById('halka-alan');
  }

  // ══════════════════════════════
  // DOKUNMA / SEÇİM
  // ══════════════════════════════

  function _basla(slotIdx) {
    const slot = halkaDizi[slotIdx];
    // Sadece dolu harf olan slottan başlanabilir
    if (!slot.harf) return;

    secimAktif = true;
    zincir     = [slotIdx];
    _zinciGuncelle();
  }

  function _gecis(slotIdx) {
    if (!secimAktif) return;
    const slot = halkaDizi[slotIdx];

    // Zaten zincirde varsa geri al (geri kaydırma)
    const zinciIdx = zincir.indexOf(slotIdx);
    if (zinciIdx !== -1 && zinciIdx === zincir.length - 2) {
      zincir.pop();
      _zinciGuncelle();
      return;
    }

    // Zincirin son elemanından komşu mu? (halka için hepsi geçerli)
    if (zinciIdx !== -1) return; // zaten var, atla

    // Slot dolu mu?
    if (!slot.harf) return;

    zincir.push(slotIdx);
    _zinciGuncelle();
  }

  function _birak() {
    if (!secimAktif) return;
    secimAktif = false;

    if (zincir.length === 0) return;

    // Seçilen harfleri sırayla oluştur
    const secilenHarfler = zincir.map(i => halkaDizi[i].harf);
    const secilenKelime  = secilenHarfler.join('');

    // Hedef kelimede bu harfler doğru sırada mı?
    // Eksik pozisyonları bul
    const eksikPozlar = halkaDizi
      .filter(s => s.eksik && s.kelimePos >= 0)
      .map(s => s.kelimePos)
      .sort((a, b) => a - b);

    if (eksikPozlar.length === 0) {
      // Eksik yok — kelime zaten tam mı kontrol et
      _zinciTemizle('dogru');
      _kontrol();
      return;
    }

    // Seçilen harflerin hedef kelimede doğru sırada gelmesi lazım
    const beklenenHarfler = eksikPozlar.map(p => hedefKelime[p]);

    // Zincir uzunluğu ile eksik harf sayısını karşılaştır
    // Tam doğru mu?
    const tamDogru = secilenHarfler.length === beklenenHarfler.length &&
      secilenHarfler.every((h, i) => h === beklenenHarfler[i]);

    // Kısmi doğru mu? (kelimeyi tamamlamak için yeterli)
    // Zincirdeki harfler hedef sıraya uyuyor mu?
    const kismiDogru = _kismiKontrol(secilenHarfler, beklenenHarfler);

    if (tamDogru || kismiDogru) {
      // Doğru seçim — harfleri eksik pozisyonlara yerleştir
      _zinciTemizle('dogru');
      _harfleriYerlestir(secilenHarfler, eksikPozlar);
      setTimeout(() => _kontrol(), 300);
    } else {
      // Yanlış seçim
      _zinciTemizle('yanlis');
      if (typeof Game !== 'undefined') {
        Game.zincirYanlis(secilenHarfler);
      }
    }
  }

  // Seçilen harfler beklenen sıranın başından bir alt kümesi mi?
  function _kismiKontrol(secilen, beklenen) {
    if (secilen.length === 0) return false;
    if (secilen.length > beklenen.length) return false;
    return secilen.every((h, i) => h === beklenen[i]);
  }

  function _harfleriYerlestir(harfler, eksikPozlar) {
    // Sırayla eksik pozisyonlara yerleştir
    harfler.forEach((h, i) => {
      if (i < eksikPozlar.length) {
        const pos  = eksikPozlar[i];
        const slot = halkaDizi.find(s => s.kelimePos === pos && s.eksik);
        if (slot) {
          slot.harf  = h;
          slot.eksik = false;
        }
      }
    });
    _render();
  }

  function _zinciGuncelle() {
    UI.halkaZincirGuncelle(zincir, halkaDizi, false);
  }

  function _zinciTemizle(sonuc) {
    UI.halkaZincirGuncelle(zincir, halkaDizi, sonuc);
    setTimeout(() => {
      zincir = [];
      UI.halkaZincirGuncelle([], halkaDizi, false);
    }, sonuc === 'yanlis' ? 500 : 300);
  }

  // ══════════════════════════════
  // KONTROL — kelime tamamlandı mı?
  // ══════════════════════════════

  function _kontrol() {
    // Tüm kelime pozisyonları dolu mu?
    const harfler = hedefKelime.split('');
    const tamam = harfler.every((h, ki) => {
      const slot = halkaDizi.find(s => s.kelimePos === ki);
      return slot && slot.harf === h;
    });

    if (tamam && onKelimeTamam) {
      onKelimeTamam(hedefKelime);
    }
  }

  // ══════════════════════════════
  // DIŞ API
  // ══════════════════════════════

  // Borulardan gelen harfi halkaya ekle
  function harfEkle(harf) {
    // Önce eksik slot ara
    const eksikSlot = halkaDizi.find(s => s.eksik);
    if (eksikSlot) {
      eksikSlot.harf  = harf;
      eksikSlot.eksik = false;
      _render();
      _kontrol();
      return true;
    }
    // Boş dış slot ara
    const bosSlot = halkaDizi.find(s => s.bos && !s.merkez);
    if (bosSlot) {
      bosSlot.harf = harf;
      bosSlot.bos  = false;
      _render();
      return true;
    }
    // Merkeze koy
    const merkezSlot = halkaDizi.find(s => s.bos && s.merkez);
    if (merkezSlot) {
      merkezSlot.harf = harf;
      merkezSlot.bos  = false;
      _render();
      return true;
    }
    return false;
  }

  // İpucu: bir eksik harfi doğru yerine koy
  function ipucuYerlestir() {
    const eksikSlot = halkaDizi.find(s => s.eksik);
    if (!eksikSlot) return false;
    eksikSlot.harf  = hedefKelime[eksikSlot.kelimePos];
    eksikSlot.eksik = false;
    _render();
    _kontrol();
    return true;
  }

  function temizle() {
    halkaDizi     = [];
    hedefKelime   = '';
    zincir        = [];
    secimAktif    = false;
    UI.halkaRender([], {});
  }

  function getEksikVar() {
    return halkaDizi.some(s => s.eksik);
  }

  function getEksikHarfler() {
    return halkaDizi
      .filter(s => s.eksik && s.kelimePos >= 0)
      .map(s => hedefKelime[s.kelimePos]);
  }

  // pointer event'leri global olarak dinle (touch için)
  document.addEventListener('pointerup',     () => { if (secimAktif) _birak(); });
  document.addEventListener('pointercancel', () => { if (secimAktif) _birak(); });

  return {
    init,
    harfEkle,
    harfEkleIndex: harfEkle, // geriye dönük uyumluluk
    temizle,
    getEksikVar,
    getEksikHarfler,
    ipucuYerlestir,
  };

})();
