/* =============================================
   UI.JS — Arayüz Modülü
   Sadece DOM günceller, mantık içermez.
   Bağlı: index.html, style.css
   ============================================= */

const UI = (() => {

  let _timerRaf    = null;
  let _timerSure   = 5000;
  let _timerBaslangic = null;

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
  // BEKLEYEN HARF
  // ══════════════════════════════

  function bekleyenGoster(harf, sureSaniye, bitisCallback) {
    const el  = document.getElementById('bekleyen-harf');
    const dol = document.getElementById('timer-fill');

    el.textContent = harf;
    el.classList.remove('gizli');

    // Artık sürükleme yok — sadece tıklama ile havuza ekle
    el.onclick = () => {
      if (typeof Game !== 'undefined') Game.bekleyenHavuzaEkle();
    };

    dol.style.transition = 'none';
    dol.style.width = '100%';

    _timerSure      = sureSaniye * 1000;
    _timerBaslangic = performance.now();

    function guncelle(now) {
      const gecen = now - _timerBaslangic;
      const kalan = Math.max(0, 1 - gecen / _timerSure);
      dol.style.width = (kalan * 100) + '%';

      const r = Math.round(255);
      const g = Math.round(200 * kalan);
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
    el.onclick = null;
    document.getElementById('timer-fill').style.width = '0%';
  }

  // ══════════════════════════════
  // ZONE C — TEZGAH (YENİ TAP SİSTEMİ)
  // ══════════════════════════════

  function tezgahRender(slotlar, havuz, onHavuzTap, onGeriAl, onHepsiniGeriAl) {
    const el = document.getElementById('tezgah');
    el.innerHTML = '';

    if (!slotlar || slotlar.length === 0) return;

    // ── ÜST KISIM: Kelime slotları ──
    const slotSatir = document.createElement('div');
    slotSatir.className = 'tezgah-slotlar';

    slotlar.forEach((s, i) => {
      const div = document.createElement('div');
      div.className = 'tezgah-slot';

      if (s.durum === 'dolu') {
        div.classList.add('slot-dolu');
        div.textContent = s.harf;
      } else if (s.durum === 'gelen') {
        div.classList.add('slot-gelen');
        div.textContent = s.harf;
      } else if (s.durum === 'eksik') {
        div.classList.add('slot-eksik');
        div.textContent = '';
      }

      slotSatir.appendChild(div);
    });

    el.appendChild(slotSatir);

    // ── ALT KISIM: Geri al butonları + Havuz harfleri ──
    const altKisim = document.createElement('div');
    altKisim.className = 'tezgah-alt';

    // Geri al butonları
    const butonlar = document.createElement('div');
    butonlar.className = 'tezgah-butonlar';

    const geriBtn = document.createElement('button');
    geriBtn.className = 'tezgah-btn geri-btn';
    geriBtn.innerHTML = '⌫';
    geriBtn.title = 'Son harfi geri al';
    geriBtn.addEventListener('click', () => { if (onGeriAl) onGeriAl(); });

    const sifirBtn = document.createElement('button');
    sifirBtn.className = 'tezgah-btn sifir-btn';
    sifirBtn.innerHTML = '↺';
    sifirBtn.title = 'Hepsini geri al';
    sifirBtn.addEventListener('click', () => { if (onHepsiniGeriAl) onHepsiniGeriAl(); });

    butonlar.appendChild(geriBtn);
    butonlar.appendChild(sifirBtn);

    // Havuz harfleri
    const havuzEl = document.createElement('div');
    havuzEl.className = 'tezgah-havuz';

    havuz.forEach(item => {
      if (item.yerlestirildi) return; // Yerleştirilmişleri gösterme

      const kart = document.createElement('div');
      kart.className = 'havuz-kart';
      if (item.borudan) kart.classList.add('havuz-boru');
      kart.textContent = item.harf;
      kart.dataset.id = item.id;

      kart.addEventListener('click', () => {
        kart.classList.add('havuz-tap');
        setTimeout(() => kart.classList.remove('havuz-tap'), 200);
        if (onHavuzTap) onHavuzTap(item.id);
      });

      havuzEl.appendChild(kart);
    });

    altKisim.appendChild(butonlar);
    altKisim.appendChild(havuzEl);
    el.appendChild(altKisim);
  }

  function tezgahFlash() {
    document.querySelectorAll('.slot-gelen, .slot-dolu').forEach(h => {
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
    const overlay   = document.getElementById('seviye-sonu');
    const sevEl     = document.getElementById('ss-seviye');
    const sozEl     = document.getElementById('ss-soz');
    const kaynakEl  = document.getElementById('ss-kaynak');
    const btn       = document.getElementById('ss-devam');

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
  // YARDIMCILAR / UYUMLULUK
  // ══════════════════════════════

  function hikayeEkle()   {}
  function hikayeTemizle(){}
  function setSiradaki()  {}

  return {
    // Zone A
    setPuan, setKelimeSayisi, setSeviye, setCanlar,
    // Zone B
    setSiradaki, setBorular, boruSonuc,
    // Bekleyen
    bekleyenGoster, bekleyenGizle,
    // Zone C
    tezgahRender, tezgahFlash, tezgahSalla,
    // Zone Söz
    sozAlaniOlustur, sozKutucukAc, sozAlaniTemizle,
    // Zone D
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    // Overlay
    seviyeSonuGoster,
    // Uyumluluk
    hikayeEkle, hikayeTemizle,
  };

})();
