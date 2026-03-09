/* =============================================
   UI.JS — Arayüz Modülü
   Sadece DOM günceller, mantık içermez.
   ============================================= */

const UI = (() => {

  // ══════════════════════════════
  // ZONE A — SKOR
  // ══════════════════════════════

  function setPuan(n) {
    const el = document.getElementById('puan');
    el.textContent = n;
    el.classList.remove('puan-pop');
    void el.offsetWidth;
    el.classList.add('puan-pop');
  }

  function setKelimeSayisi(tamamlanan, toplam) {
    const el = document.getElementById('kelime-sayisi');
    el.textContent = toplam !== undefined
      ? tamamlanan + '/' + toplam
      : tamamlanan;
  }

  function setSeviye(n) {
    document.getElementById('seviye').textContent = n;
  }

  function setCanlar(n) {
    const el = document.getElementById('canlar');
    el.innerHTML = '';
    const kalp = document.createElement('span');
    kalp.className = 'can-kalp';
    kalp.textContent = n > 0 ? '❤️' : '🖤';
    el.appendChild(kalp);
    const sayi = document.createElement('span');
    sayi.className = 'can-sayi';
    sayi.textContent = n;
    el.appendChild(sayi);
  }

  // ══════════════════════════════
  // ZONE B — BORULAR
  // ══════════════════════════════

  let _boruTimeout = null;

  function setBorular(borular) {
    const el = document.getElementById('borular');

    if (_boruTimeout) {
      clearTimeout(_boruTimeout);
      _boruTimeout = null;
    }

    const eskiler = el.querySelectorAll('.boru-wrap');
    if (eskiler.length > 0) {
      eskiler.forEach(w => w.classList.add('cikis'));
      _boruTimeout = setTimeout(() => {
        el.innerHTML = '';
        _boruOlustur(el, borular);
        _boruTimeout = null;
      }, 260);
    } else {
      _boruOlustur(el, borular);
    }
  }

  function _boruOlustur(el, borular) {
    borular.forEach((boru, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'boru-wrap giris';

      const ok = document.createElement('div');
      ok.className = 'boru-ok';
      ok.textContent = '▼';

      const kutu = document.createElement('div');
      kutu.className = 'boru-harf';
      kutu.dataset.index = i;

      boru.harfler.forEach(h => {
        const span = document.createElement('span');
        span.className = 'boru-harf-tek';
        span.textContent = h;
        kutu.appendChild(span);
      });

      kutu.addEventListener('click', () => {
        if (typeof Game !== 'undefined') Game.harfSec(i);
      });

      wrap.appendChild(ok);
      wrap.appendChild(kutu);
      el.appendChild(wrap);
    });
  }

  function boruSonuc(index, dogruMu) {
    const borular = document.querySelectorAll('.boru-harf');
    const oklar   = document.querySelectorAll('.boru-ok');
    if (borular[index]) {
      borular[index].classList.add(dogruMu ? 'dogru' : 'yanlis');
      if (oklar[index]) oklar[index].classList.add(dogruMu ? 'dogru' : 'yanlis');
    }
  }

  // ══════════════════════════════
  // ZONE C — HALKA TEZGAH
  // ══════════════════════════════

  // Halka pozisyonlarını hesapla
  // 8 dış slot: çember üzerinde eşit aralıklı
  // 2 merkez slot: ortada yan yana
  function _halkaPoziyon(slotIdx, containerW, containerH) {
    if (slotIdx < 8) {
      // Dış halka — 8 eşit dilim, üstten başla (-90 derece offset)
      const aci   = (slotIdx / 8) * 2 * Math.PI - Math.PI / 2;
      const r     = Math.min(containerW, containerH) * 0.36;
      const cx    = containerW / 2;
      const cy    = containerH / 2;
      return {
        x: cx + r * Math.cos(aci),
        y: cy + r * Math.sin(aci),
      };
    } else {
      // Merkez: 2 slot yan yana
      const cx = containerW / 2;
      const cy = containerH / 2;
      const offset = slotIdx === 8 ? -22 : 22;
      return { x: cx + offset, y: cy };
    }
  }

  function halkaRender(halkaDizi, handlers) {
    const container = document.getElementById('halka-alan');
    if (!container) return;
    container.innerHTML = '';

    if (!halkaDizi || halkaDizi.length === 0) return;

    const W = container.clientWidth  || 300;
    const H = container.clientHeight || 300;

    // SVG — çizgiler için
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'halka-svg';
    svg.setAttribute('width',  W);
    svg.setAttribute('height', H);
    svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
    container.appendChild(svg);

    // Slotları oluştur
    halkaDizi.forEach((slot, i) => {
      const pos = _halkaPoziyon(i, W, H);
      const boyut = slot.merkez ? 40 : 52;

      const div = document.createElement('div');
      div.className = 'halka-hucre';
      div.dataset.index = i;

      if (slot.bos) {
        div.classList.add('halka-bos');
      } else if (slot.eksik) {
        div.classList.add('halka-eksik');
      } else if (slot.harf) {
        div.classList.add('halka-dolu');
        div.textContent = slot.harf;
      }

      if (slot.merkez) div.classList.add('halka-merkez');

      div.style.cssText = `
        position: absolute;
        width:  ${boyut}px;
        height: ${boyut}px;
        left:   ${pos.x - boyut / 2}px;
        top:    ${pos.y - boyut / 2}px;
      `;

      // Pointer event'leri
      if (slot.harf && handlers.onPointerDown) {
        div.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          handlers.onPointerDown(i);
        });
        div.addEventListener('pointerenter', (e) => {
          if (e.buttons > 0) handlers.onPointerEnter && handlers.onPointerEnter(i);
        });
        div.addEventListener('pointerup', () => {
          handlers.onPointerUp && handlers.onPointerUp();
        });
        div.style.touchAction = 'none';
        div.style.cursor = 'pointer';
      }

      container.appendChild(div);
    });

    // Dış çember (görsel kılavuz)
    const cember = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    const r = Math.min(W, H) * 0.36;
    cember.setAttribute('cx', W / 2);
    cember.setAttribute('cy', H / 2);
    cember.setAttribute('r',  r);
    cember.setAttribute('fill', 'none');
    cember.setAttribute('stroke', 'rgba(0,0,0,0.07)');
    cember.setAttribute('stroke-width', '2');
    cember.setAttribute('stroke-dasharray', '4 6');
    svg.appendChild(cember);

    // Global referans (game.js için)
    window._halkaHarflerAl = () =>
      halkaDizi.filter(s => s.harf && !s.eksik).map(s => s.harf);
  }

  // Zincir çizgisini güncelle
  function halkaZincirGuncelle(zincir, halkaDizi, sonuc) {
    const container = document.getElementById('halka-alan');
    const svg       = document.getElementById('halka-svg');
    if (!container || !svg) return;

    const W = container.clientWidth  || 300;
    const H = container.clientHeight || 300;

    // Eski çizgileri temizle
    svg.querySelectorAll('.zincir-cizgi, .zincir-nokta').forEach(el => el.remove());

    if (!zincir || zincir.length === 0) {
      // Slot renklerini sıfırla
      container.querySelectorAll('.halka-hucre').forEach(d => {
        d.classList.remove('halka-secili', 'halka-dogru', 'halka-yanlis');
      });
      return;
    }

    // Renk belirle
    const renk = sonuc === 'dogru'  ? '#58cc02' :
                 sonuc === 'yanlis' ? '#ff4b4b' :
                 '#1cb0f6'; // seçim rengi

    const kalinlik = sonuc ? 5 : 4;

    // Slotları renklendir
    container.querySelectorAll('.halka-hucre').forEach(d => {
      d.classList.remove('halka-secili', 'halka-dogru', 'halka-yanlis');
    });

    zincir.forEach(idx => {
      const div = container.querySelector(`.halka-hucre[data-index="${idx}"]`);
      if (div) {
        if (sonuc === 'dogru')       div.classList.add('halka-dogru');
        else if (sonuc === 'yanlis') div.classList.add('halka-yanlis');
        else                         div.classList.add('halka-secili');
      }
    });

    // Çizgileri çiz
    for (let i = 0; i < zincir.length - 1; i++) {
      const p1 = _halkaPoziyon(zincir[i],     W, H);
      const p2 = _halkaPoziyon(zincir[i + 1], W, H);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('stroke', renk);
      line.setAttribute('stroke-width', kalinlik);
      line.setAttribute('stroke-linecap', 'round');
      line.setAttribute('opacity', '0.85');
      line.classList.add('zincir-cizgi');
      svg.appendChild(line);
    }

    // Nokta (başlangıç)
    if (zincir.length > 0) {
      const p0 = _halkaPoziyon(zincir[0], W, H);
      const daire = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      daire.setAttribute('cx', p0.x);
      daire.setAttribute('cy', p0.y);
      daire.setAttribute('r', 7);
      daire.setAttribute('fill', renk);
      daire.setAttribute('opacity', '0.9');
      daire.classList.add('zincir-nokta');
      svg.appendChild(daire);
    }
  }

  // Flash animasyonu
  function halkaFlash(tip) {
    const container = document.getElementById('halka-alan');
    if (!container) return;
    container.querySelectorAll('.halka-hucre.halka-dolu').forEach(d => {
      d.classList.add(tip === 'dogru' ? 'halka-flash-dogru' : 'halka-flash-yanlis');
      setTimeout(() => d.classList.remove('halka-flash-dogru', 'halka-flash-yanlis'), 500);
    });
  }

  function halkaSalla() {
    const el = document.getElementById('zone-c');
    if (!el) return;
    el.classList.remove('salla');
    void el.offsetWidth;
    el.classList.add('salla');
    setTimeout(() => el.classList.remove('salla'), 400);
  }

  // Eski uyumluluk — artık kullanılmıyor ama hata vermemesi için
  function tezgahRender()  {}
  function tezgahFlash()   { halkaFlash('dogru'); }
  function tezgahSalla()   { halkaSalla(); }
  function bekleyenGoster(){}
  function bekleyenGizle() {}

  // ══════════════════════════════
  // ZONE SOZ — ATASÖZÜ İNŞA ALANI
  // ══════════════════════════════

  const ACIK_KELIMELER = new Set([
    'VE','İLE','DE','DA','Kİ','BİR','BU','ŞU','O',
    'İÇİN','AMA','FAKAT','LAKIN','ÇÜNKÜ','EĞER',
    'GİBİ','KADAR','GÖRE','DAHA','EN','HER','HİÇ',
    ',', '.', '!', '?', ';', ':', '—', '-'
  ]);

  function sozAlaniOlustur(kelimeler, soz, kaynak) {
    const kutucuklar = document.getElementById('soz-kutucuklar');
    const kaynakEl   = document.getElementById('soz-kaynak');
    kutucuklar.innerHTML = '';

    const sozParcalar = _sozParcala(soz);

    sozParcalar.forEach((parca) => {
      const temiz = parca.replace(/[,\.!?;:\-—«»""'']/g, '').toUpperCase().trim();

      if (!temiz) {
        const nokEl = document.createElement('span');
        nokEl.className = 'soz-acik-kelime';
        nokEl.textContent = parca.trim();
        kutucuklar.appendChild(nokEl);
        return;
      }

      if (ACIK_KELIMELER.has(temiz)) {
        const acikEl = document.createElement('span');
        acikEl.className = 'soz-acik-kelime';
        acikEl.textContent = parca.trim();
        kutucuklar.appendChild(acikEl);
        return;
      }

      const wrap = document.createElement('div');
      wrap.className = 'soz-kelime-wrap';
      wrap.dataset.kelime = temiz;

      const kutu = document.createElement('div');
      kutu.className = 'soz-kutu';
      kutu.id = 'soz-kutu-' + temiz;

      temiz.split('').forEach(() => {
        const slot = document.createElement('span');
        slot.className = 'soz-harf-slot bos';
        slot.textContent = '_';
        kutu.appendChild(slot);
      });

      wrap.appendChild(kutu);
      kutucuklar.appendChild(wrap);
    });

    kaynakEl.textContent = kaynak ? '— ' + kaynak : '';
  }

  function sozKutucukAc(kelime) {
    const kutu = document.getElementById('soz-kutu-' + kelime.toUpperCase());
    if (!kutu) return;

    const slotlar = kutu.querySelectorAll('.soz-harf-slot');
    const harfler = kelime.toUpperCase().split('');

    harfler.forEach((h, i) => {
      if (slotlar[i]) {
        slotlar[i].textContent = h;
        slotlar[i].classList.remove('bos');
      }
    });

    kutu.classList.add('acik');
    const wrap = kutu.closest('.soz-kelime-wrap');
    if (wrap) wrap.classList.add('tamamlandi');
  }

  function sozAlaniTemizle() {
    const kutucuklar = document.getElementById('soz-kutucuklar');
    if (kutucuklar) kutucuklar.innerHTML = '';
    const kaynakEl = document.getElementById('soz-kaynak');
    if (kaynakEl) kaynakEl.textContent = '';
  }

  function _sozParcala(soz) {
    return soz.split(' ').filter(p => p.length > 0);
  }

  // ══════════════════════════════
  // ZONE D — YANLIŞ HARFLER
  // ══════════════════════════════

  const RENKLER = ['yh-r', 'yh-g', 'yh-y'];

  function yanlisEkle(harfler) {
    const grid = document.getElementById('yanlis-grid');
    harfler.forEach(h => {
      const div = document.createElement('div');
      div.className = 'yanlis-harf ' + RENKLER[Math.floor(Math.random() * RENKLER.length)];
      div.textContent = h;
      grid.appendChild(div);
    });
  }

  function yanlisTemizle() {
    document.getElementById('yanlis-grid').innerHTML = '';
  }

  function yanlisYukseklik() {
    return document.getElementById('yanlis-grid').scrollHeight;
  }

  // ══════════════════════════════
  // SEVİYE SONU OVERLAY
  // ══════════════════════════════

  function seviyeSonuGoster(seviye, soz, kaynak, devamCallback) {
    const overlay  = document.getElementById('seviye-sonu');
    const sevEl    = document.getElementById('ss-seviye');
    const sozEl    = document.getElementById('ss-soz');
    const kaynakEl = document.getElementById('ss-kaynak');
    const btn      = document.getElementById('ss-devam');

    sevEl.textContent    = 'SEVİYE ' + seviye + ' TAMAMLANDI';
    sozEl.textContent    = '« ' + soz + ' »';
    kaynakEl.textContent = '— ' + kaynak;

    overlay.classList.remove('gizli');
    overlay.classList.add('aktif');

    btn.onclick = () => {
      overlay.classList.remove('aktif');
      overlay.classList.add('gizli');
      if (devamCallback) devamCallback();
    };
  }

  // ══════════════════════════════
  // YARDIMCILAR
  // ══════════════════════════════

  function hikayeEkle()  {}
  function hikayeTemizle(){}
  function setSiradaki() {}

  return {
    // Zone A
    setPuan, setKelimeSayisi, setSeviye, setCanlar,
    // Zone B
    setSiradaki, setBorular, boruSonuc,
    // Bekleyen (stub — kaldırıldı)
    bekleyenGoster, bekleyenGizle,
    // Zone C — Halka
    halkaRender, halkaZincirGuncelle, halkaFlash, halkaSalla,
    // Eski uyumluluk
    tezgahRender, tezgahFlash, tezgahSalla,
    // Zone Söz
    sozAlaniOlustur, sozKutucukAc, sozAlaniTemizle,
    // Zone D
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    // Overlay
    seviyeSonuGoster,
    hikayeEkle, hikayeTemizle,
  };

})();
