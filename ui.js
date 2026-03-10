/* =============================================
   UI.JS — Arayüz Modülü (yeniden tasarım)
   ============================================= */

const UI = (() => {

  // ══════════════════════════════
  // ZONE A — CAN (sayı + tek kalp)
  // ══════════════════════════════

  function setCanlar(n) {
    const ikon  = document.getElementById('can-kalp-ikon');
    const sayi  = document.getElementById('can-sayi');
    if (!ikon || !sayi) return;

    sayi.textContent = n;

    // Renk: az / orta / iyi
    sayi.classList.remove('az','orta','iyi');
    if      (n <= 3)  sayi.classList.add('az');
    else if (n <= 8)  sayi.classList.add('orta');
    else              sayi.classList.add('iyi');

    // Kalp ikonu
    ikon.textContent = n > 0 ? '❤️' : '🖤';
  }

  function canTitret() {
    const ikon = document.getElementById('can-kalp-ikon');
    if (!ikon) return;
    ikon.classList.remove('titrek');
    void ikon.offsetWidth;
    ikon.classList.add('titrek');
    setTimeout(() => ikon.classList.remove('titrek'), 450);
  }

  // ══════════════════════════════
  // ZONE A — PUAN
  // ══════════════════════════════

  function setPuan(n) {
    const el = document.getElementById('puan');
    if (!el) return;
    el.textContent = n;
    el.classList.remove('puan-pop');
    void el.offsetWidth;
    el.classList.add('puan-pop');
  }

  // ══════════════════════════════
  // ZONE A — SEVİYE + PROGRESS
  // ══════════════════════════════

  function setSeviye(n) {
    const el = document.getElementById('seviye-etiket');
    if (el) el.textContent = 'SEVİYE ' + n;
  }

  function setProgress(tamamlanan, toplam) {
    const bar = document.getElementById('progress-bar');
    if (!bar || !toplam) return;
    bar.style.width = Math.round((tamamlanan / toplam) * 100) + '%';
  }

  // Eski setKelimeSayisi — progress bar'ı da günceller
  function setKelimeSayisi(tamamlanan, toplam) {
    setProgress(tamamlanan, toplam || 1);
  }

  // ══════════════════════════════
  // COMBO BADGE
  // ══════════════════════════════

  let _comboTimer = null;

  function comboBadgeGoster(streak) {
    const el = document.getElementById('combo-badge');
    if (!el) return;
    const mesajlar = ['','','🔥 2X COMBO!','🔥 3X COMBO!','⚡ 4X COMBO!','⚡ 5X COMBO!','💥 6X COMBO!','💥 7X COMBO!','🌟 8X COMBO!'];
    const mesaj = mesajlar[Math.min(streak, mesajlar.length - 1)] || '🌟 ' + streak + 'X COMBO!';
    el.textContent = mesaj;
    el.classList.remove('gorunum');
    void el.offsetWidth;
    el.classList.add('gorunum');
    if (_comboTimer) clearTimeout(_comboTimer);
    _comboTimer = setTimeout(() => {
      el.classList.remove('gorunum');
    }, 1400);
  }

  // ══════════════════════════════
  // ZONE SÜRE — ZAMANLAYICI
  // ══════════════════════════════

  function setSureBar(oran) {
    // oran: 0.0 - 1.0
    const bar  = document.getElementById('sure-bar');
    const sayi = document.getElementById('sure-sayi');
    if (!bar || !sayi) return;

    bar.style.transition = 'none';
    void bar.offsetWidth;
    bar.style.transition = 'width 1s linear';
    bar.style.width = Math.max(0, oran * 100) + '%';
  }

  function setSureSayi(n) {
    const sayi = document.getElementById('sure-sayi');
    const bar  = document.getElementById('sure-bar');
    if (!sayi || !bar) return;
    sayi.textContent = n;
    const kritik = n <= 5;
    sayi.classList.toggle('kritik', kritik);
    bar.classList.toggle('kritik', kritik);
  }

  function sureSifirla(saniye) {
    const bar  = document.getElementById('sure-bar');
    const sayi = document.getElementById('sure-sayi');
    if (!bar || !sayi) return;
    bar.style.transition = 'none';
    bar.style.width = '100%';
    bar.classList.remove('kritik');
    sayi.classList.remove('kritik');
    sayi.textContent = saniye;
    void bar.offsetWidth;
  }

  // ══════════════════════════════
  // ZONE B — SEÇİM KARTLARI
  // ══════════════════════════════

  let _boruTimeout = null;

  function setBorular(borular) {
    const el = document.getElementById('borular');
    if (!el) return;
    if (_boruTimeout) { clearTimeout(_boruTimeout); _boruTimeout = null; }

    const eskiler = el.querySelectorAll('.boru-wrap');
    if (eskiler.length > 0) {
      eskiler.forEach(w => { w.classList.remove('giris'); w.classList.add('cikis'); });
      _boruTimeout = setTimeout(() => {
        el.innerHTML = '';
        _boruOlustur(el, borular);
      }, 220);
    } else {
      _boruOlustur(el, borular);
    }
  }

  function _boruOlustur(el, borular) {
    borular.forEach((boru, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'boru-wrap giris';

      const kutu = document.createElement('button');
      kutu.className = 'boru-harf';
      kutu.dataset.index = i;
      kutu.textContent = boru.harfler[0];

      kutu.addEventListener('click', () => {
        if (typeof Game !== 'undefined') Game.harfSec(i);
      });

      wrap.appendChild(kutu);
      el.appendChild(wrap);
    });
  }

  function boruSonuc(index, dogruMu) {
    const kartlar = document.querySelectorAll('.boru-harf');
    if (kartlar[index]) {
      kartlar[index].classList.add(dogruMu ? 'dogru' : 'yanlis');
    }
  }

  // ══════════════════════════════
  // ZONE C — TEZGAH
  // ══════════════════════════════

  function tezgahRender(hucreler, _unused) {
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
        btn.addEventListener('click', () => { if (onTiklandi) onTiklandi(i); });
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
    ',','.','!','?',';',':','—','-'
  ]);

  function sozAlaniOlustur(kelimeler, soz, kaynak) {
    const kutucuklar = document.getElementById('soz-kutucuklar');
    const kaynakEl   = document.getElementById('soz-kaynak');
    if (!kutucuklar) return;
    kutucuklar.innerHTML = '';

    soz.split(' ').filter(p => p.length > 0).forEach((parca) => {
      const temiz = parca.replace(/[,\.!?;:\-—«»""'']/g,'').toUpperCase().trim();

      if (!temiz || ACIK_KELIMELER.has(temiz)) {
        const span = document.createElement('span');
        span.className = 'soz-acik-kelime';
        span.textContent = parca.trim();
        kutucuklar.appendChild(span);
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

    if (kaynakEl) kaynakEl.textContent = kaynak ? '— ' + kaynak : '';
  }

  // Kelime tamamlandı — mor animasyon
  function sozKutucukAc(kelime) {
    const kutu = document.getElementById('soz-kutu-' + kelime.toUpperCase());
    if (!kutu) return;
    const slotlar = kutu.querySelectorAll('.soz-harf-slot');
    kelime.toUpperCase().split('').forEach((h, i) => {
      if (slotlar[i]) { slotlar[i].textContent = h; slotlar[i].classList.remove('bos'); }
    });
    kutu.classList.add('acik');
  }

  // Kelime atlandı — gri animasyonla doğru cevabı yaz
  function sozKutucukAtla(kelime) {
    const kutu = document.getElementById('soz-kutu-' + kelime.toUpperCase());
    if (!kutu) return;
    const slotlar = kutu.querySelectorAll('.soz-harf-slot');
    kelime.toUpperCase().split('').forEach((h, i) => {
      if (slotlar[i]) {
        slotlar[i].textContent = h;
        slotlar[i].classList.remove('bos');
        slotlar[i].classList.add('atlandi-harf');
      }
    });
    kutu.classList.add('atlandi');
  }

  function sozAlaniTemizle() {
    const el = document.getElementById('soz-kutucuklar');
    if (el) el.innerHTML = '';
    const k = document.getElementById('soz-kaynak');
    if (k) k.textContent = '';
  }

  // ══════════════════════════════
  // ZONE D — YANLIŞ HARFLER
  // ══════════════════════════════

  const RENKLER = ['yh-r','yh-g','yh-y'];

  function yanlisEkle(harfler) {
    const grid = document.getElementById('yanlis-grid');
    if (!grid) return;
    harfler.forEach(h => {
      const div = document.createElement('div');
      div.className = 'yanlis-harf ' + RENKLER[Math.floor(Math.random() * RENKLER.length)];
      div.textContent = h;
      grid.appendChild(div);
    });
  }

  function yanlisTemizle() {
    const el = document.getElementById('yanlis-grid');
    if (el) el.innerHTML = '';
  }

  function yanlisYukseklik() {
    const el = document.getElementById('yanlis-grid');
    return el ? el.scrollHeight : 0;
  }

  // ══════════════════════════════
  // SEVİYE SONU OVERLAY
  // ══════════════════════════════

  function seviyeSonuGoster(seviye, soz, kaynak, devamCallback) {
    const overlay = document.getElementById('seviye-sonu');
    if (!overlay) return;
    document.getElementById('ss-seviye').textContent  = 'SEVİYE ' + seviye + ' TAMAMLANDI';
    document.getElementById('ss-soz').textContent     = '« ' + soz + ' »';
    document.getElementById('ss-kaynak').textContent  = '— ' + kaynak;
    overlay.classList.remove('gizli');
    overlay.classList.add('aktif');
    document.getElementById('ss-devam').onclick = () => {
      overlay.classList.remove('aktif');
      overlay.classList.add('gizli');
      if (devamCallback) devamCallback();
    };
  }

  // ══════════════════════════════
  // OYUN BİTTİ OVERLAY
  // ══════════════════════════════

  function oyunBittiGoster(puan, kelimeSayisi, seviye, enIyiCombo, devamCallback) {
    const overlay = document.getElementById('oyun-bitti-overlay');
    if (!overlay) return;
    document.getElementById('ob-puan').textContent   = puan;
    document.getElementById('ob-kelime').textContent = kelimeSayisi;
    document.getElementById('ob-seviye').textContent = seviye;
    document.getElementById('ob-combo').textContent  = enIyiCombo;
    overlay.classList.add('aktif');
    document.getElementById('ob-tekrar').onclick = () => {
      overlay.classList.remove('aktif');
      if (devamCallback) devamCallback();
    };
  }

  // ══════════════════════════════
  // STUB'LAR
  // ══════════════════════════════
  function bekleyenGoster(){}
  function bekleyenGizle() {}
  function hikayeEkle()    {}
  function hikayeTemizle() {}
  function setSiradaki()   {}

  return {
    setCanlar, canTitret,
    setPuan,
    setSeviye, setKelimeSayisi, setProgress,
    comboBadgeGoster,
    setSureBar, setSureSayi, sureSifirla,
    setBorular, boruSonuc,
    tezgahRender, tezgahFlash, tezgahSalla, tezgahSallaKirmizi,
    havuzRender,
    sozAlaniOlustur, sozKutucukAc, sozKutucukAtla, sozAlaniTemizle,
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    seviyeSonuGoster,
    oyunBittiGoster,
    bekleyenGoster, bekleyenGizle, hikayeEkle, hikayeTemizle, setSiradaki,
  };

})();
