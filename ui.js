/* =============================================
   UI.JS — Arayüz Modülü
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
    el.textContent = toplam !== undefined ? tamamlanan + '/' + toplam : tamamlanan;
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
    if (_boruTimeout) { clearTimeout(_boruTimeout); _boruTimeout = null; }

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
  // ZONE C — TEZGAH
  // ══════════════════════════════

  function tezgahRender(hucreler, _onDrop) {
    const el = document.getElementById('tezgah');
    if (!el) return;
    el.innerHTML = '';

    hucreler.forEach((h, i) => {
      const div = document.createElement('div');
      div.className = 'tezgah-hucre';
      div.dataset.index = i;

      if (h.harf) {
        div.classList.add('dolu');
        div.textContent = h.harf;
      } else if (h.eksik) {
        div.classList.add('eksik');
        div.textContent = '?';
      }

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
    if (!el) return;
    el.classList.remove('salla');
    void el.offsetWidth;
    el.classList.add('salla');
    setTimeout(() => el.classList.remove('salla'), 400);
  }

  function tezgahSallaKirmizi() {
    document.querySelectorAll('.tezgah-hucre.dolu').forEach(h => {
      h.classList.add('yanlis-kelime');
      setTimeout(() => h.classList.remove('yanlis-kelime'), 500);
    });
    tezgahSalla();
  }

  // ══════════════════════════════
  // ZONE H — HARF HAVUZU
  // ══════════════════════════════

  function havuzRender(havuzHarfleri, onTiklandi) {
    const el = document.getElementById('harf-havuzu');
    if (!el) return;
    el.innerHTML = '';

    havuzHarfleri.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'havuz-harf';
      btn.textContent = item.harf;

      if (item.kullanildi) {
        btn.classList.add('kullanildi');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          if (onTiklandi) onTiklandi(i);
        });
      }

      el.appendChild(btn);
    });
  }

  // ══════════════════════════════
  // ZONE SOZ — ATASÖZÜ
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

    const sozParcalar = soz.split(' ').filter(p => p.length > 0);

    sozParcalar.forEach((parca) => {
      const temiz = parca.replace(/[,\.!?;:\-—]/g, '').toUpperCase().trim();

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
    kelime.toUpperCase().split('').forEach((h, i) => {
      if (slotlar[i]) { slotlar[i].textContent = h; slotlar[i].classList.remove('bos'); }
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

  function yanlisTemizle() { document.getElementById('yanlis-grid').innerHTML = ''; }
  function yanlisYukseklik() { return document.getElementById('yanlis-grid').scrollHeight; }

  // ══════════════════════════════
  // SEVİYE SONU — TAM EKRAN KART
  // ══════════════════════════════

  const ROZET_EMOJILERI = ['🏆','⭐','🌟','💫','✨','🎯','🎖️','🥇','🎊','🎉','🔥','💎','👑','🦋','🌈'];
  const TEMA_RENKLERI = {
    sabah:      { bg: 'linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)', accent: '#60c8f5', accent2: '#34d399' },
    oglen:      { bg: 'linear-gradient(135deg, #3d1a00 0%, #1a0a00 100%)', accent: '#fbbf24', accent2: '#f97316' },
    aksam:      { bg: 'linear-gradient(135deg, #2d0050 0%, #1a0030 100%)', accent: '#e879f9', accent2: '#a78bfa' },
    gece:       { bg: 'linear-gradient(135deg, #0a0a2e 0%, #050518 100%)', accent: '#818cf8', accent2: '#38bdf8' },
    geceyarisi: { bg: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', accent: '#94a3b8', accent2: '#6366f1' },
  };

  function seviyeSonuGoster(seviye, soz, kaynak, devamCallback) {
    // Mevcut overlay'i tamamen yeniden oluştur
    let overlay = document.getElementById('seviye-sonu');
    overlay.innerHTML = '';
    overlay.className = '';

    const tema = document.body.dataset.tema || 'sabah';
    const renkler = TEMA_RENKLERI[tema] || TEMA_RENKLERI.sabah;
    const rozet = ROZET_EMOJILERI[(seviye - 1) % ROZET_EMOJILERI.length];

    // Arka plan
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: ${renkler.bg};
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s ease;
      overflow: hidden;
    `;

    // Parlayan ışık efekti — arka plan
    const isikEl = document.createElement('div');
    isikEl.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 50% at 50% 30%, ${renkler.accent}22 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 30% 70%, ${renkler.accent2}18 0%, transparent 55%);
    `;
    overlay.appendChild(isikEl);

    // Yıldız parçacıkları
    for (let i = 0; i < 18; i++) {
      const yildiz = document.createElement('div');
      const boyut = 3 + Math.random() * 5;
      yildiz.style.cssText = `
        position: absolute;
        width: ${boyut}px; height: ${boyut}px;
        border-radius: 50%;
        background: ${Math.random() > 0.5 ? renkler.accent : renkler.accent2};
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.3 + Math.random() * 0.6};
        animation: yildizAt ${2 + Math.random() * 3}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 2}s;
        filter: blur(${Math.random() > 0.6 ? '1px' : '0px'});
      `;
      overlay.appendChild(yildiz);
    }

    // ANA KART
    const kart = document.createElement('div');
    kart.style.cssText = `
      position: relative; z-index: 2;
      width: min(88vw, 380px);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 28px;
      padding: 36px 28px 32px;
      display: flex; flex-direction: column; align-items: center;
      gap: 0;
      box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow: hidden;
    `;

    // Kart iç parlaklık çizgisi
    const parlak = document.createElement('div');
    parlak.style.cssText = `
      position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(90deg, transparent, ${renkler.accent}88, transparent);
      pointer-events: none;
    `;
    kart.appendChild(parlak);

    // Rozet
    const rozetEl = document.createElement('div');
    rozetEl.textContent = rozet;
    rozetEl.style.cssText = `
      font-size: 64px; line-height: 1; margin-bottom: 16px;
      filter: drop-shadow(0 0 20px ${renkler.accent}99) drop-shadow(0 8px 16px rgba(0,0,0,0.4));
      animation: rozetGel 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    `;
    kart.appendChild(rozetEl);

    // Seviye etiketi
    const sevEl = document.createElement('div');
    sevEl.textContent = `SEVİYE ${seviye} TAMAMLANDI`;
    sevEl.style.cssText = `
      font-family: 'Fredoka One', cursive;
      font-size: 11px; letter-spacing: 3.5px;
      color: ${renkler.accent};
      text-shadow: 0 0 20px ${renkler.accent}88;
      margin-bottom: 20px;
      animation: fadeUp 0.5s 0.2s ease both;
      opacity: 0;
    `;
    kart.appendChild(sevEl);

    // Ayırıcı çizgi
    const cizgi = document.createElement('div');
    cizgi.style.cssText = `
      width: 60px; height: 2px;
      background: linear-gradient(90deg, transparent, ${renkler.accent}88, transparent);
      margin-bottom: 20px;
      animation: fadeUp 0.5s 0.3s ease both; opacity: 0;
    `;
    kart.appendChild(cizgi);

    // Söz metni
    const sozEl = document.createElement('div');
    sozEl.textContent = soz;
    sozEl.style.cssText = `
      font-family: 'Nunito', sans-serif;
      font-size: clamp(15px, 4vw, 19px);
      font-weight: 700;
      color: rgba(255,255,255,0.92);
      line-height: 1.6;
      text-align: center;
      margin-bottom: 14px;
      text-shadow: 0 2px 12px rgba(0,0,0,0.4);
      animation: fadeUp 0.5s 0.38s ease both; opacity: 0;
      padding: 0 8px;
    `;
    kart.appendChild(sozEl);

    // Kaynak
    const kaynakEl = document.createElement('div');
    kaynakEl.textContent = '— ' + kaynak;
    kaynakEl.style.cssText = `
      font-family: 'Nunito Sans', sans-serif;
      font-size: 13px;
      color: ${renkler.accent2};
      font-style: italic;
      margin-bottom: 28px;
      opacity: 0;
      animation: fadeUp 0.5s 0.5s ease both;
      text-shadow: 0 0 16px ${renkler.accent2}66;
    `;
    kart.appendChild(kaynakEl);

    // Devam butonu
    const devamBtn = document.createElement('button');
    devamBtn.innerHTML = 'DEVAM &nbsp;→';
    devamBtn.style.cssText = `
      background: linear-gradient(135deg, ${renkler.accent}, ${renkler.accent2});
      border: none; border-radius: 999px;
      color: #fff; font-family: 'Fredoka One', cursive;
      font-size: 17px; letter-spacing: 1px;
      padding: 14px 52px; cursor: pointer;
      box-shadow: 0 6px 0 rgba(0,0,0,0.3), 0 8px 24px ${renkler.accent}55, inset 0 1px 0 rgba(255,255,255,0.3);
      transition: transform 0.12s, box-shadow 0.12s;
      animation: fadeUp 0.5s 0.65s ease both; opacity: 0;
      position: relative; overflow: hidden;
      text-shadow: 0 1px 4px rgba(0,0,0,0.25);
    `;

    // Buton iç parlaklık
    const btnParlak = document.createElement('span');
    btnParlak.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 50%;
      background: rgba(255,255,255,0.2);
      border-radius: 999px 999px 50% 50%;
      pointer-events: none;
    `;
    devamBtn.appendChild(btnParlak);

    devamBtn.addEventListener('mouseenter', () => {
      devamBtn.style.transform = 'translateY(-2px)';
      devamBtn.style.boxShadow = `0 8px 0 rgba(0,0,0,0.3), 0 12px 28px ${renkler.accent}77, inset 0 1px 0 rgba(255,255,255,0.3)`;
    });
    devamBtn.addEventListener('mouseleave', () => {
      devamBtn.style.transform = '';
      devamBtn.style.boxShadow = `0 6px 0 rgba(0,0,0,0.3), 0 8px 24px ${renkler.accent}55, inset 0 1px 0 rgba(255,255,255,0.3)`;
    });
    devamBtn.addEventListener('mousedown', () => {
      devamBtn.style.transform = 'translateY(5px)';
      devamBtn.style.boxShadow = `0 1px 0 rgba(0,0,0,0.3), 0 2px 8px ${renkler.accent}44`;
    });

    devamBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.04)';
      setTimeout(() => {
        overlay.style.display = 'none';
        if (devamCallback) devamCallback();
      }, 450);
    });

    kart.appendChild(devamBtn);
    overlay.appendChild(kart);

    // CSS animasyon keyframe'lerini sayfaya ekle (bir kez)
    if (!document.getElementById('ss-keyframes')) {
      const stil = document.createElement('style');
      stil.id = 'ss-keyframes';
      stil.textContent = `
        @keyframes rozetGel {
          from { transform: scale(0) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.18) rotate(8deg); }
          to   { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeUp {
          from { transform: translateY(22px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes yildizAt {
          from { transform: translateY(0) scale(1); opacity: 0.3; }
          to   { transform: translateY(-12px) scale(1.4); opacity: 0.9; }
        }
      `;
      document.head.appendChild(stil);
    }

    // Göster
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    });
  }

  // ══════════════════════════════
  // STUB'LAR
  // ══════════════════════════════
  function bekleyenGoster() {}
  function bekleyenGizle()  {}
  function hikayeEkle()     {}
  function hikayeTemizle()  {}
  function setSiradaki()    {}

  return {
    setPuan, setKelimeSayisi, setSeviye, setCanlar,
    setSiradaki, setBorular, boruSonuc,
    bekleyenGoster, bekleyenGizle,
    tezgahRender, tezgahFlash, tezgahSalla, tezgahSallaKirmizi,
    havuzRender,
    sozAlaniOlustur, sozKutucukAc, sozAlaniTemizle,
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    seviyeSonuGoster,
    hikayeEkle, hikayeTemizle,
  };

})();
