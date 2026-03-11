// Controle simples de telas + tabuleiro hex + mensagens
// Depende de: dados-casinhas.js (casinhas[]), firebase-config.js (opcional)

(function () {
  const VALOR_CASINHA = 2.5; // usado no topo
  const TOTAL_CASAS_FALLBACK = 400;

  const $ = (id) => document.getElementById(id);

  function showScreen(id){
    ['loginScreen','characterScreen','gameScreen'].forEach(s=>{
      const el = $(s);
      if (el) el.classList.toggle('active', s === id);
    });
  }

  // ===== Toast mensagens =====
  function ensureToast(){
    let t = document.getElementById('toast');
    if (t) return t;
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.innerHTML = `<div class="toast-inner">
      <div class="toast-emoji" id="toastEmoji">💡</div>
      <div class="toast-text" id="toastText">Mensagem</div>
    </div>`;
    document.body.appendChild(t);
    return t;
  }

  function toast(emoji, text){
    const t = ensureToast();
    const e = document.getElementById('toastEmoji');
    const tx = document.getElementById('toastText');
    if (e) e.textContent = emoji || '💡';
    if (tx) tx.textContent = text || '';
    t.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
  }

  const MSG_SUCESSO = [
    ['💰','Parabéns! Você economizou R$ 2,50!'],
    ['🎯','Ótimo! Você está no caminho certo!'],
    ['⭐','Excelente! Continue economizando!'],
    ['🚀','Fantástico! Sua meta está perto!'],
    ['💡','Dica: pequenas economias viram grandes fortunas!'],
  ];

  // ===== Board =====
  function countDone(){
    if (!Array.isArray(window.casinhas)) return 0;
    return window.casinhas.filter(c=>c && c.paga).length;
  }

  function totalCasas(){
    if (Array.isArray(window.casinhas) && window.casinhas.length) return window.casinhas.length;
    return TOTAL_CASAS_FALLBACK;
  }

  function updateTop(){
    const done = countDone();
    const total = totalCasas();
    const totalR = (done * VALOR_CASINHA);
    const pct = Math.round((done/total)*100);

    const valorNumero = $('valorNumero');
    const valorPorcentagem = $('valorPorcentagem');
    if (valorNumero) valorNumero.textContent = totalR.toFixed(2);
    if (valorPorcentagem) valorPorcentagem.textContent = `${pct}%`;

    const headerPercentage = $('headerPercentage');
    const headerProgressFill = $('headerProgressFill');
    if (headerPercentage) headerPercentage.textContent = `${pct}%`;
    if (headerProgressFill) headerProgressFill.style.width = `${pct}%`;

    const casasAbertasBottom = $('casasAbertasBottom');
    if (casasAbertasBottom) casasAbertasBottom.textContent = String(done);
  }

  function buildBoard(){
    const board = document.getElementById('gameBoard');
    if (!board) return;

    board.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'hex-grid';
    board.appendChild(grid);

    const total = totalCasas();
    const tile = 86;
    const gapX = 14;
    const gapY = 18;

    const cols = 6; // semelhante ao que aparece na imagem (linha com 6)
    const stepX = tile + gapX;
    const stepY = tile * 0.82 + gapY;

    for (let i=0;i<total;i++){
      const row = Math.floor(i/cols);
      const col = i % cols;

      // offset alternado para dar "colmeia"
      const x = col * stepX + (row % 2 ? stepX/2 : 0);
      const y = row * stepY;

      const tileEl = document.createElement('div');
      tileEl.className = 'hex-tile';
      tileEl.style.left = `${x}px`;
      tileEl.style.top  = `${y}px`;
      tileEl.dataset.index = String(i);

      const done = window.casinhas?.[i]?.paga;
      if (done) tileEl.classList.add('hex-done');

      // ícones simples (você pode trocar)
      const emoji = done ? '✅' : (i%6===0 ? '🎓' : i%6===1 ? '📚' : i%6===2 ? '🧠' : i%6===3 ? '💡' : i%6===4 ? '🎯' : '🏆');

      tileEl.innerHTML = `
        <div class="hex-face">
          <div class="hex-emoji">${emoji}</div>
          <div class="hex-num">#${i+1}</div>
        </div>
      `;

      tileEl.addEventListener('click', ()=>{
        // toggle paga
        if (!window.casinhas) window.casinhas = [];
        if (!window.casinhas[i]) window.casinhas[i] = { numero:i+1, paga:false };
        window.casinhas[i].paga = !window.casinhas[i].paga;

        // UI
        if (window.casinhas[i].paga){
          tileEl.classList.add('hex-done');
          // some quando clica (como você pediu)
          setTimeout(()=> tileEl.classList.add('hex-hide'), 120);

          // mensagem
          const [em, tx] = MSG_SUCESSO[Math.floor(Math.random()*MSG_SUCESSO.length)];
          toast(em, tx);

          if (window.tocarSomClick) window.tocarSomClick();
        } else {
          tileEl.classList.remove('hex-done','hex-hide');
        }

        updateTop();
      });

      grid.appendChild(tileEl);
    }

    // define altura total da grid para scroll
    const rows = Math.ceil(total/cols);
    grid.style.height = `${rows * stepY + tile}px`;
    updateTop();
  }

  // ===== Boot =====
  function boot(){
    // Se você quiser deixar sem login real por enquanto:
    // showScreen('gameScreen'); buildBoard(); return;

    // Se existir firebase auth, tenta manter seu fluxo.
    // Caso contrário, cai em fluxo simples.
    try{
      console.log('✅ Inicializando eventos...');
    }catch(e){}

    const loginBtn = $('loginBtn');
    const registerBtn = $('registerBtn');

    if (loginBtn){
      loginBtn.addEventListener('click', ()=>{
        showScreen('characterScreen');
      });
    }
    if (registerBtn){
      registerBtn.addEventListener('click', ()=>{
        showScreen('characterScreen');
      });
    }

    // Clique no personagem entra no jogo
    document.querySelectorAll('.character-card').forEach(card=>{
      card.addEventListener('click', ()=>{
        const char = card.querySelector('.char-icon')?.textContent || '🚗';
        const characterDisplay = $('characterDisplay');
        if (characterDisplay) characterDisplay.textContent = char;
        const userName = $('userName');
        if (userName) userName.textContent = (card.querySelector('p')?.textContent || 'Usuário');

        showScreen('gameScreen');
        setTimeout(buildBoard, 50);
      });
    });

    const logoutBtn = $('logoutBtn');
    if (logoutBtn){
      logoutBtn.addEventListener('click', ()=>{
        showScreen('loginScreen');
      });
    }
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
