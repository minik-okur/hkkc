/* =============================================
   UI.JS — Arayüz Modülü
   YENİ: Sekizgen tezgah, bekleyen alan YOK
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
  // BEKLEYEN HARF — artık sadece stub, HTML'de alan gizli kalacak
  // ══════════════════════════════

  function bekleyenGoster() {}
  function bekleyenGizle()  {
    const el = document.getElementById('bekleyen-alan');
    if (el) el.style.display = 'none';
  }

  // ══════════════════════════════
  // ZONE C — TEZGAH (SEKİZGEN)
  // ══════════════════════════════

  function tezgahRender(slotlar) {
    const el = document.getElementById('tezgah');
    el.innerHTML = '';

    if (!slotlar || slotlar.length === 0) return;

    // Kelime uzunluğuna göre sekizgen boyutu
    const adet  = slotlar.length;
    const boyut = adet <= 4 ? 60
                : adet <= 6 ? 54
                : adet <= 8 ? 46
                : adet <= 10 ? 40
                : 34;

    el.style.setProperty('--hex-boyut', boyut + 'px');

    slotlar.forEach((s) => {
      const wrap = document.createElement('div');
      wrap.className = 'sekizgen-wrap';

      const sekizgen = document.createElement('div');
      sekizgen.className = 'sekizgen-slot';

      if (s.durum === 'dolu') {
        sekizgen.classList.add('slot-dolu');
      } else if (s.durum === 'gelen') {
        sekizgen.classList.add('slot-gelen');
      } else {
        sekizgen.classList.add('slot-eksik');
      }

      const harf = document.createElement('span');
      harf.className = 'slot-harf';
      harf.textContent = s.harf || '';

      sekizgen.appendChild(harf);
      wrap.appendChild(sekizgen);
      el.appendChild(wrap);
    });
  }

  function tezgahFlash() {
    document.querySelectorAll('.slot-dolu, .slot-gelen').forEach(h => {
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
  // ZONE SOZ
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

    soz.split(' ').filter(p => p.length > 0).forEach((parca) => {
      const temiz = parca.replace(/[,\.!?;:\-—«»""'']/g, '').toUpperCase().trim();

      if (!temiz || ACIK_KELIMELER.has(temiz)) {
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
    const k = document.getElementById('soz-kutucuklar');
    if (k) k.innerHTML = '';
    const r = document.getElementById('soz-kaynak');
    if (r) r.textContent = '';
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

  function yanlisTemizle()   { document.getElementById('yanlis-grid').innerHTML = ''; }
  function yanlisYukseklik() { return document.getElementById('yanlis-grid').scrollHeight; }

  // ══════════════════════════════
  // SEVİYE SONU OVERLAY
  // ══════════════════════════════

  function seviyeSonuGoster(seviye, soz, kaynak, devamCallback) {
    const overlay  = document.getElementById('seviye-sonu');
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

  // Uyumluluk
  function hikayeEkle()   {}
  function hikayeTemizle(){}
  function setSiradaki()  {}

  return {
    setPuan, setKelimeSayisi, setSeviye, setCanlar,
    setSiradaki, setBorular, boruSonuc,
    bekleyenGoster, bekleyenGizle,
    tezgahRender, tezgahFlash, tezgahSalla,
    sozAlaniOlustur, sozKutucukAc, sozAlaniTemizle,
    yanlisEkle, yanlisTemizle, yanlisYukseklik,
    seviyeSonuGoster,
    hikayeEkle, hikayeTemizle,
  };

})();
