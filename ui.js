/* =============================================
   UI.JS — Arayüz Modülü
   Bağlı: index.html, style.css
   ============================================= */

const UI = (() => {

  const MAX_CAN = 3;
  let _timerRaf = null;
  let _timerBaslangic = null;
  let _timerSure = 5000;

  // ── ZONE A ──
  function setPuan(n) {
    const el = document.getElementById('puan');
    el.textContent = n;
    el.classList.remove('puan-pop');
    void el.offsetWidth;
    el.classList.add('puan-pop');
  }

  function setKelimeSayisi(n) {
    document.getElementById('kelime-sayisi').textContent = n;
  }

  function setSeviye(n) {
    document.getElementById('seviye').textContent = n;
  }

  function setCanlar(n) {
    const el = document.getElementById('canlar');
    el.innerHTML = '';
    for (let i = 0; i < MAX_CAN; i++) {
      const s = document.createElement('span');
      s.textContent = i < n ? '❤️' : '🖤';
      el.appendChild(s);
    }
  }

  // ── ZONE B ──
  function setSiradaki(harfler) {
    document.getElementById('siradaki-harfler').textContent = harfler.join(' · ');
  }

  function setBorular(harfler) {
    // Renksiz başlar — seçim sonrası boruRenkGoster çağrılır
    const el = document.getElementById('borular');
    el.innerHTML = '';
    harfler.forEach((harf, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'boru-wrap';

      const ok = document.createElement('div');
      ok.className = 'boru-ok';
      ok.textContent = '▼';

      const kutu = document.createElement('div');
      kutu.className = 'boru-harf';
      kutu.textContent = harf;
      kutu.dataset.index = i;
      kutu.addEventListener('click', () => {
        if (typeof Game !== 'undefined') Game.harfSec(i);
      });

      wrap.appendChild(ok);
      wrap.appendChild(kutu);
      el.appendChild(wrap);
    });
  }

  function boruRenkGoster(index, dogru) {
    const kutular = document.querySelectorAll('.boru-harf');
    const oklar   = document.querySelectorAll('.boru-ok');
    if (kutular[index]) kutular[index].classList.add(dogru ? 'dogru' : 'yanlis');
    if (oklar[index])   oklar[index].classList.add(dogru ? 'dogru' : 'yanlis');
  }

  // ── BEKLEYEN HARF ──
  function bekleyenGoster(harf, sureSaniye, bitisCallback) {
    const el  = document.getElementById('bekleyen-harf');
    const dol = document.getElementById('timer-fill');

    el.textContent = harf;
    el.classList.remove('gizli');

    // Mouse sürükleme
    el.draggable = true;
    el.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', 'bekleyen');
    };

    // Touch sürükleme
    el.ontouchstart = (e) => { e.stopPropagation(); };
    el.ontouchmove  = (e) => { e.preventDefault(); };
    el.ontouchend   = (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const hedef = document.elementFromPoint(touch.clientX, touch.clientY);
      if (hedef && hedef.classList.contains('tezgah-hucre') && hedef.classList.contains('eksik')) {
        const i = parseInt(hedef.dataset.index);
        if (!isNaN(i) && typeof Game !== 'undefined') Game.bekleyenTezgahaKoy(i);
      }
    };

    // Timer
    dol.style.transition = 'none';
    dol.style.width = '100%';
    _timerSure = sureSaniye * 1000;
    _timerBaslangic = performance.now();

    function guncelle(now) {
      const gecen = now - _timerBaslangic;
      const kalan = Math.max(0, 1 - gecen / _timerSure);
      dol.style.width = (kalan * 100) + '%';
      const r = Math.round(255 * (1 - kalan));
      const g = Math.round(255 * kalan);
      dol.style.background = `rgb(${r},${g},0)`;
      if (gecen < _timerSure) {
        _timerRaf = requestAnimationFrame(guncelle);
      } else {
        bekleyenGizle();
        if (bitisCallback) bitisCallback();
      }
    }

    if (_timerRaf) cancelAnimationFrame(_timerRaf);
    _timerRaf = requestAnimationFrame(guncelle);
  }

  function bekleyenGizle() {
    if (_timerRaf) cancelAnimationFrame(_timerRaf);
    const el = document.getElementById('bekleyen-harf');
    el.classList.add('gizli');
    el.textContent = '';
    el.draggable = false;
    document.getElementById('timer-fill').style.width = '0%';
  }

  // ── ZONE C — TEZGAH ──
  function tezgahRender(hucreler, onTezgahDrop, onBekleyenDrop) {
    const el = document.getElementById('tezgah');
    el.innerHTML = '';
    let suruklenen = null;

    hucreler.forEach((h, i) => {
      const div = document.createElement('div');
      div.className = 'tezgah-hucre';
      div.dataset.index = i;

      if (h.harf) {
        div.classList.add('dolu');
        div.textContent = h.harf;
        div.draggable = true;

        div.addEventListener('dragstart', (e) => {
          suruklenen = i;
          e.dataTransfer.setData('text/plain', 'tezgah');
        });

        div.addEventListener('touchstart', () => { suruklenen = i; }, { passive: true });
        div.addEventListener('touchend', (e) => {
          const touch = e.changedTouches[0];
          const hedef = document.elementFromPoint(touch.clientX, touch.clientY);
          if (hedef && hedef.classList.contains('tezgah-hucre')) {
            const hedefIndex = parseInt(hedef.dataset.index);
            if (!isNaN(hedefIndex) && suruklenen !== null && suruklenen !== hedefIndex) {
              onTezgahDrop(suruklenen, hedefIndex);
            }
          }
          suruklenen = null;
          document.querySelectorAll('.tezgah-hucre').forEach(d => d.classList.remove('surukle-ustu'));
        }, { passive: true });

      } else if (h.eksik) {
        div.classList.add('eksik');
      }

      // Bırakma hedefi — hem tezgah hem bekleyen
      div.addEventListener('dragover', (e) => { e.preventDefault(); div.classList.add('surukle-ustu'); });
      div.addEventListener('dragleave', () => { div.classList.remove('surukle-ustu'); });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        div.classList.remove('surukle-ustu');
        const tur = e.dataTransfer.getData('text/plain');
        if (tur === 'bekleyen') {
          // Bekleyen harfi bu hücreye koy
          if (typeof Game !== 'undefined') Game.bekleyenTezgahaKoy(i);
        } else if (tur === 'tezgah' && suruklenen !== null && suruklenen !== i) {
          onTezgahDrop(suruklenen, i);
          suruklenen = null;
        }
      });

      el.appendChild(div);
    });
  }

  function tezgahFlash() {
    document.querySelectorAll('.tezgah-hucre.dolu').forEach(h => {
      h.classList.add('dogru-kelime');
      setTimeout(() => h.classList.remove('dogru-kelime'), 600);
    });
  }

  function tezgahSalla() {
    const el = document.getElementById('zone-c');
    el.classList.remove('salla');
    void el.offsetWidth;
    el.classList.add('salla');
    setTimeout(() => el.classList.remove('salla'), 400);
  }

  // ── ZONE D ──
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
    return document.getElementById('yanlis-grid').children.length;
  }

  // ── ZONE E ──
  let hikayeListesi = [];

  function hikayeEkle(kelime, tanim) {
    hikayeListesi.push(`${kelime}: ${tanim}`);
    if (hikayeListesi.length > 5) hikayeListesi.shift();
    _hikayeGuncelle();
  }

  function _hikayeGuncelle() {
    const el     = document.getElementById('hikaye-metin');
    const sarici = document.getElementById('hikaye-sarici');
    const metin  = hikayeListesi.join('   ·   ');
    el.textContent = metin;
    el.classList.remove('kayan');
    void el.offsetWidth;
    if (el.scrollWidth > sarici.clientWidth) el.classList.add('kayan');
  }

  function hikayeTemizle() {
    hikayeListesi = [];
    document.getElementById('hikaye-metin').textContent = '';
  }

  return {
    setPuan, setKelimeSayisi, setSeviye, setCanlar,
    setSiradaki, setBorular, boruRenkGoster,
    bekleyenGoster, bekleyenGizle,
    tezgahRender, tezgahFlash, tezgahSalla,
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    hikayeEkle, hikayeTemizle,
  };

})();
