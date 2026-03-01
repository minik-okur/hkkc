/* =============================================
   SES.JS — Ses Efektleri Modülü
   Web Audio API — harici dosya gerektirmez.
   Bağlı: index.html
   Kullanır: game.js (Ses.dogru(), Ses.yanlis() vb.)
   ============================================= */

const Ses = (() => {

  let ctx = null;

  function _ctx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function _nota(frekans, sure, tip, kazanc) {
    const c = _ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = tip || 'sine';
    osc.frequency.value = frekans;
    gain.gain.setValueAtTime(kazanc || 0.15, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + sure);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + sure);
  }

  // ── EFEKTLER ──

  function dogru() {
    // Kısa tatlı yükseliş
    _nota(523, 0.12, 'sine', 0.15);
    setTimeout(() => _nota(659, 0.12, 'sine', 0.15), 80);
    setTimeout(() => _nota(784, 0.18, 'sine', 0.12), 160);
  }

  function yanlis() {
    // Kısa düşük buzz
    _nota(180, 0.15, 'square', 0.08);
    setTimeout(() => _nota(140, 0.2, 'square', 0.06), 100);
  }

  function kelimeTamam() {
    // Başarı melodisi
    _nota(523, 0.1, 'sine', 0.12);
    setTimeout(() => _nota(659, 0.1, 'sine', 0.12), 100);
    setTimeout(() => _nota(784, 0.1, 'sine', 0.12), 200);
    setTimeout(() => _nota(1047, 0.25, 'sine', 0.15), 300);
  }

  function seviyeGecis() {
    // Fanfar
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => {
      setTimeout(() => _nota(f, 0.15, 'triangle', 0.13), i * 120);
    });
  }

  function sureDoldu() {
    // Uyarı — inen ton
    _nota(440, 0.15, 'sawtooth', 0.06);
    setTimeout(() => _nota(330, 0.15, 'sawtooth', 0.06), 120);
    setTimeout(() => _nota(220, 0.25, 'sawtooth', 0.05), 240);
  }

  function oyunBitti() {
    // Dramatik iniş
    [440, 370, 311, 262].forEach((f, i) => {
      setTimeout(() => _nota(f, 0.25, 'sine', 0.12), i * 200);
    });
  }

  return { dogru, yanlis, kelimeTamam, seviyeGecis, sureDoldu, oyunBitti };

})();
