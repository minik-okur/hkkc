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
      const temiz = parca.replace(/[,\.!?;:\-—]/g, '').toLocaleUpperCase('tr-TR').trim();

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
    const kutu = document.getElementById('soz-kutu-' + kelime.toLocaleUpperCase('tr-TR'));
    if (!kutu) return;
    const slotlar = kutu.querySelectorAll('.soz-harf-slot');
    kelime.toLocaleUpperCase('tr-TR').split('').forEach((h, i) => {
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

  // ── UNVAN SİSTEMİ ──
  const UNVANLAR = [
    { rozet: '🌱', unvan: 'Sözcük Tohumu'    },
    { rozet: '📖', unvan: 'Sözcük Öğrencisi' },
    { rozet: '✍️', unvan: 'Sözcük Ustası'    },
    { rozet: '🔥', unvan: 'Sözcük Avcısı'    },
    { rozet: '💎', unvan: 'Sözcük Efendisi'  },
    { rozet: '👑', unvan: 'Sözcük Sultanı'   },
  ];

  // ── KAYNAK BAZLI ATMOSFER ──
  const KAYNAK_ATMOSFER = {
    // Antik / Doğu Filozofları — altın, kadim
    'Heraklitos':      { bg: 'linear-gradient(135deg, #2a1a00 0%, #1a0e00 100%)', accent: '#f59e0b', accent2: '#fbbf24', desen: '✦' },
    'Konfüçyüs':       { bg: 'linear-gradient(135deg, #1a2a00 0%, #0e1a00 100%)', accent: '#84cc16', accent2: '#d4a017', desen: '☯' },
    'Lao Tzu':         { bg: 'linear-gradient(135deg, #001a2a 0%, #000e1a 100%)', accent: '#38bdf8', accent2: '#7dd3fc', desen: '☯' },
    'Sokrates':        { bg: 'linear-gradient(135deg, #2a2000 0%, #1a1400 100%)', accent: '#d4a017', accent2: '#fbbf24', desen: '⚡' },
    'Rumi':            { bg: 'linear-gradient(135deg, #2a0a1a 0%, #1a0010 100%)', accent: '#f43f5e', accent2: '#fda4af', desen: '✿' },
    'Pandora Efsanesi':{ bg: 'linear-gradient(135deg, #1a002a 0%, #0e001a 100%)', accent: '#a855f7', accent2: '#d8b4fe', desen: '✦' },
    // Batı Filozofları — derin, dramatik
    'Friedrich Nietzsche': { bg: 'linear-gradient(135deg, #0a0a1a 0%, #050510 100%)', accent: '#818cf8', accent2: '#c7d2fe', desen: '⚡' },
    'Jean-Paul Sartre':    { bg: 'linear-gradient(135deg, #0f0f0f 0%, #050505 100%)', accent: '#94a3b8', accent2: '#cbd5e1', desen: '∞' },
    'Blaise Pascal':       { bg: 'linear-gradient(135deg, #1a1000 0%, #0f0800 100%)', accent: '#f59e0b', accent2: '#fde68a', desen: '✦' },
    'Sigmund Freud':       { bg: 'linear-gradient(135deg, #1a0a00 0%, #0f0500 100%)', accent: '#fb923c', accent2: '#fed7aa', desen: '∞' },
    'Baruch Spinoza':      { bg: 'linear-gradient(135deg, #001a1a 0%, #000f0f 100%)', accent: '#2dd4bf', accent2: '#99f6e4', desen: '⚡' },
    'Carl Jung':           { bg: 'linear-gradient(135deg, #1a001a 0%, #0f000f 100%)', accent: '#e879f9', accent2: '#f0abfc', desen: '☯' },
    'Paul Tillich':        { bg: 'linear-gradient(135deg, #0a1a1a 0%, #050f0f 100%)', accent: '#06b6d4', accent2: '#67e8f9', desen: '∞' },
    // Yazarlar / Edebiyat — sıcak, sepia
    'Franz Kafka':         { bg: 'linear-gradient(135deg, #1a1000 0%, #0f0800 100%)', accent: '#d97706', accent2: '#fbbf24', desen: '✦' },
    'Tolstoy':             { bg: 'linear-gradient(135deg, #1a0800 0%, #0f0500 100%)', accent: '#dc2626', accent2: '#fca5a5', desen: '✿' },
    'George Bernard Shaw': { bg: 'linear-gradient(135deg, #001a00 0%, #000f00 100%)', accent: '#16a34a', accent2: '#86efac', desen: '✦' },
    'Mark Twain':          { bg: 'linear-gradient(135deg, #1a0e00 0%, #0f0800 100%)', accent: '#ea580c', accent2: '#fdba74', desen: '✦' },
    'Niccolò Machiavelli': { bg: 'linear-gradient(135deg, #0f0000 0%, #080000 100%)', accent: '#b91c1c', accent2: '#fca5a5', desen: '⚡' },
    'Ambrose Bierce':      { bg: 'linear-gradient(135deg, #0a0a0a 0%, #050505 100%)', accent: '#64748b', accent2: '#94a3b8', desen: '∞' },
    'Edward Bulwer-Lytton':{ bg: 'linear-gradient(135deg, #1a1a00 0%, #0f0f00 100%)', accent: '#ca8a04', accent2: '#fde68a', desen: '✦' },
    'Theodor Adorno':      { bg: 'linear-gradient(135deg, #001010 0%, #000808 100%)', accent: '#0891b2', accent2: '#67e8f9', desen: '∞' },
    'Ahmet Telli':         { bg: 'linear-gradient(135deg, #1a0a00 0%, #0f0500 100%)', accent: '#c2410c', accent2: '#fb923c', desen: '✿' },
    'Wiesław Brudziński':  { bg: 'linear-gradient(135deg, #0a001a 0%, #050010 100%)', accent: '#7c3aed', accent2: '#c4b5fd', desen: '⚡' },
    'Joanne Greenberg':    { bg: 'linear-gradient(135deg, #001a0a 0%, #000f05 100%)', accent: '#059669', accent2: '#6ee7b7', desen: '✿' },
    // Pop Kültür — renkli, eğlenceli
    'Yoda — Star Wars':    { bg: 'linear-gradient(135deg, #001a00 0%, #000f00 100%)', accent: '#22c55e', accent2: '#86efac', desen: '✦' },
    'Shrek':               { bg: 'linear-gradient(135deg, #0a1a00 0%, #050f00 100%)', accent: '#65a30d', accent2: '#bef264', desen: '✿' },
    'Fizik Kuralı / Anonim':{ bg: 'linear-gradient(135deg, #001020 0%, #000810 100%)', accent: '#3b82f6', accent2: '#93c5fd', desen: '∞' },
    // Atasözü — sıcak, geleneksel
    'Atasözü':             { bg: 'linear-gradient(135deg, #1a0800 0%, #0f0500 100%)', accent: '#ea580c', accent2: '#fed7aa', desen: '✿' },
  };

  const ATMOSFER_VARSAYILAN = { bg: 'linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)', accent: '#60c8f5', accent2: '#34d399', desen: '✦' };

  function _atmosferBul(kaynak) {
    if (KAYNAK_ATMOSFER[kaynak]) return KAYNAK_ATMOSFER[kaynak];
    // Kısmi eşleşme dene
    const anahtar = Object.keys(KAYNAK_ATMOSFER).find(k => kaynak.includes(k) || k.includes(kaynak));
    return anahtar ? KAYNAK_ATMOSFER[anahtar] : ATMOSFER_VARSAYILAN;
  }

  function _unvanBul(seviye) {
    return UNVANLAR[Math.min(seviye - 1, UNVANLAR.length - 1)];
  }

  function seviyeSonuGoster(seviye, soz, kaynak, devamCallback) {
    let overlay = document.getElementById('seviye-sonu');
    overlay.innerHTML = '';
    overlay.className = '';

    const atm    = _atmosferBul(kaynak);
    const unvan  = _unvanBul(seviye);

    // Arka plan
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: ${atm.bg};
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 1000; opacity: 0;
      transition: opacity 0.5s ease;
      overflow: hidden;
    `;

    // Işık efekti
    const isikEl = document.createElement('div');
    isikEl.style.cssText = `
      position: absolute; inset: 0; pointer-events: none;
      background:
        radial-gradient(ellipse 70% 50% at 50% 30%, ${atm.accent}22 0%, transparent 60%),
        radial-gradient(ellipse 50% 40% at 30% 70%, ${atm.accent2}18 0%, transparent 55%);
    `;
    overlay.appendChild(isikEl);

    // Desen parçacıkları (kaynak bazlı sembol)
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('div');
      const boyut = 10 + Math.random() * 16;
      p.textContent = atm.desen;
      p.style.cssText = `
        position: absolute;
        font-size: ${boyut}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.04 + Math.random() * 0.1};
        color: ${Math.random() > 0.5 ? atm.accent : atm.accent2};
        animation: yildizAt ${3 + Math.random() * 4}s ease-in-out infinite alternate;
        animation-delay: ${Math.random() * 2}s;
        pointer-events: none;
      `;
      overlay.appendChild(p);
    }

    // ANA KART
    const kart = document.createElement('div');
    kart.style.cssText = `
      position: relative; z-index: 2;
      width: min(88vw, 380px);
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 28px;
      padding: 32px 28px 28px;
      display: flex; flex-direction: column; align-items: center;
      box-shadow: 0 40px 100px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      overflow: hidden;
    `;

    // Kart üst çizgisi
    const parlak = document.createElement('div');
    parlak.style.cssText = `
      position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
      background: linear-gradient(90deg, transparent, ${atm.accent}88, transparent);
      pointer-events: none;
    `;
    kart.appendChild(parlak);

    // Rozet
    const rozetEl = document.createElement('div');
    rozetEl.textContent = unvan.rozet;
    rozetEl.style.cssText = `
      font-size: 60px; line-height: 1; margin-bottom: 8px;
      filter: drop-shadow(0 0 20px ${atm.accent}99) drop-shadow(0 8px 16px rgba(0,0,0,0.4));
      animation: rozetGel 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    `;
    kart.appendChild(rozetEl);

    // Unvan
    const unvanEl = document.createElement('div');
    unvanEl.textContent = unvan.unvan.toLocaleUpperCase('tr-TR');
    unvanEl.style.cssText = `
      font-family: 'Fredoka One', cursive;
      font-size: 18px; letter-spacing: 2px;
      color: ${atm.accent};
      text-shadow: 0 0 24px ${atm.accent}99;
      margin-bottom: 4px;
      animation: fadeUp 0.5s 0.15s ease both; opacity: 0;
    `;
    kart.appendChild(unvanEl);

    // Seviye etiketi
    const sevEl = document.createElement('div');
    sevEl.textContent = `SEVİYE ${seviye} TAMAMLANDI`;
    sevEl.style.cssText = `
      font-family: 'Fredoka One', cursive;
      font-size: 10px; letter-spacing: 3px;
      color: rgba(255,255,255,0.35);
      margin-bottom: 20px;
      animation: fadeUp 0.5s 0.25s ease both; opacity: 0;
    `;
    kart.appendChild(sevEl);

    // Ayırıcı
    const cizgi = document.createElement('div');
    cizgi.style.cssText = `
      width: 60px; height: 2px;
      background: linear-gradient(90deg, transparent, ${atm.accent}88, transparent);
      margin-bottom: 18px;
      animation: fadeUp 0.5s 0.3s ease both; opacity: 0;
    `;
    kart.appendChild(cizgi);

    // Söz
    const sozEl = document.createElement('div');
    sozEl.textContent = soz;
    sozEl.style.cssText = `
      font-family: 'Nunito', sans-serif;
      font-size: clamp(14px, 3.8vw, 18px);
      font-weight: 700;
      color: rgba(255,255,255,0.92);
      line-height: 1.6; text-align: center;
      margin-bottom: 12px;
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
      font-size: 13px; color: ${atm.accent2};
      font-style: italic; margin-bottom: 24px;
      opacity: 0; animation: fadeUp 0.5s 0.5s ease both;
      text-shadow: 0 0 16px ${atm.accent2}66;
    `;
    kart.appendChild(kaynakEl);

    // BUTON SATIRI
    const butonSatir = document.createElement('div');
    butonSatir.style.cssText = `
      display: flex; gap: 10px; align-items: center;
      animation: fadeUp 0.5s 0.65s ease both; opacity: 0;
    `;

    // Paylaş butonu
    const paylasBtn = document.createElement('button');
    paylasBtn.innerHTML = '🔗 PAYLAŞ';
    paylasBtn.style.cssText = `
      background: rgba(255,255,255,0.1);
      border: 1.5px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      color: rgba(255,255,255,0.85);
      font-family: 'Fredoka One', cursive;
      font-size: 14px; letter-spacing: 1px;
      padding: 12px 22px; cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      position: relative; overflow: hidden;
    `;
    paylasBtn.addEventListener('click', () => {
      const metin =
        `${unvan.rozet} ${unvan.unvan} — Seviye ${seviye}\n\n` +
        `"${soz}"\n` +
        `— ${kaynak}\n\n` +
        `#Sözcük #Atasözü`;
      navigator.clipboard.writeText(metin).then(() => {
        paylasBtn.innerHTML = '✅ KOPYALANDI';
        paylasBtn.style.background = `rgba(34,197,94,0.25)`;
        paylasBtn.style.borderColor = `#22c55e`;
        setTimeout(() => {
          paylasBtn.innerHTML = '🔗 PAYLAŞ';
          paylasBtn.style.background = 'rgba(255,255,255,0.1)';
          paylasBtn.style.borderColor = 'rgba(255,255,255,0.25)';
        }, 2000);
      }).catch(() => {
        paylasBtn.innerHTML = '📋 KOPYALA';
      });
    });

    // Devam butonu
    const devamBtn = document.createElement('button');
    devamBtn.innerHTML = 'DEVAM →';
    devamBtn.style.cssText = `
      background: linear-gradient(135deg, ${atm.accent}, ${atm.accent2});
      border: none; border-radius: 999px;
      color: #fff; font-family: 'Fredoka One', cursive;
      font-size: 17px; letter-spacing: 1px;
      padding: 12px 36px; cursor: pointer;
      box-shadow: 0 6px 0 rgba(0,0,0,0.3), 0 8px 24px ${atm.accent}55, inset 0 1px 0 rgba(255,255,255,0.3);
      transition: transform 0.12s, box-shadow 0.12s;
      position: relative; overflow: hidden;
      text-shadow: 0 1px 4px rgba(0,0,0,0.25);
    `;
    const btnParlak = document.createElement('span');
    btnParlak.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0; height: 50%;
      background: rgba(255,255,255,0.2);
      border-radius: 999px 999px 50% 50%;
      pointer-events: none;
    `;
    devamBtn.appendChild(btnParlak);
    devamBtn.addEventListener('mousedown', () => {
      devamBtn.style.transform = 'translateY(5px)';
      devamBtn.style.boxShadow = `0 1px 0 rgba(0,0,0,0.3), 0 2px 8px ${atm.accent}44`;
    });
    devamBtn.addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(1.04)';
      setTimeout(() => {
        overlay.style.display = 'none';
        if (devamCallback) devamCallback();
      }, 450);
    });

    butonSatir.appendChild(paylasBtn);
    butonSatir.appendChild(devamBtn);
    kart.appendChild(butonSatir);
    overlay.appendChild(kart);

    // Keyframe'ler
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

    overlay.className = '';
    overlay.style.opacity = '0';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'auto';
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
