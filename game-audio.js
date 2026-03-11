// ===== AUDIO (stub) =====
// Este arquivo existe só para evitar 404 no Netlify.
// Se quiser som de verdade depois, a gente implementa aqui.

(function () {
  function safeLog(msg) {
    try { console.log(msg); } catch (_) {}
  }

  // chamado pelo game-board.js
  window.tocarSomClick = function () {
    // sem áudio por enquanto
    safeLog('🔊 Som de click (desativado)');
  };
})();
