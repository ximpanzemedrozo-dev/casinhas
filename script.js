// ===== SCRIPT PRINCIPAL: LOGIN -> PERSONAGEM -> JOGO + ADMIN (VIVIANE) =====

const VALOR_CASINHA = 2.5;

// defaults (persistem na sessão)
window.__META_VALOR__ = (typeof window.__META_VALOR__ === 'number') ? window.__META_VALOR__ : 350;
window.__TOTAL_CASAS_JOGO__ = (typeof window.__TOTAL_CASAS_JOGO__ === 'number') ? window.__TOTAL_CASAS_JOGO__ : Math.round(window.__META_VALOR__ / VALOR_CASINHA);

let adminLiberado = false;

function $(id) { return document.getElementById(id); }

function showScreen(screenId) {
  ['loginScreen', 'characterScreen', 'gameScreen'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.classList.toggle('active', id === screenId);
  });
}

function formatBRL(v) {
  try { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  catch { return 'R$ ' + (Number(v) || 0).toFixed(2); }
}

function clampNumber(n, min, max) {
  n = Number(n);
  if (!Number.isFinite(n)) n = min;
  return Math.max(min, Math.min(max, n));
}

function calcularTotalCasinhas(metaEmReais) {
  return Math.max(1, Math.round(metaEmReais / VALOR_CASINHA));
}

function garantirCasinhas() {
  if (!Array.isArray(window.casinhas)) window.casinhas = [];
  const total = window.__TOTAL_CASAS_JOGO__;

  if (window.casinhas.length < total) {
    for (let i = window.casinhas.length; i < total; i++) {
      window.casinhas.push({ numero: i + 1, paga: false });
    }
  } else if (window.casinhas.length > total) {
    window.casinhas.length = total;
  }

  for (let i = 0; i < window.casinhas.length; i++) {
    if (!window.casinhas[i]) window.casinhas[i] = { numero: i + 1, paga: false };
    window.casinhas[i].numero = i + 1;
    if (typeof window.casinhas[i].paga !== 'boolean') window.casinhas[i].paga = false;
  }
}

function contarPagas() {
  if (!Array.isArray(window.casinhas)) return 0;
  let c = 0;
  window.casinhas.forEach(x => { if (x && x.paga) c++; });
  return c;
}

function atualizarUIBasica() {
  const pagas = contarPagas();
  const total = window.__TOTAL_CASAS_JOGO__;
  const meta = window.__META_VALOR__;

  const totalBancado = pagas * VALOR_CASINHA;
  const percentual = total > 0 ? Math.round((pagas / total) * 100) : 0;

  // pill topo
  const valorNumero = $('valorNumero');
  if (valorNumero) valorNumero.textContent = totalBancado.toFixed(2);

  const valorPorcentagem = $('valorPorcentagem');
  if (valorPorcentagem) valorPorcentagem.textContent = percentual + '%';

  // header
  const headerPercentage = $('headerPercentage');
  if (headerPercentage) headerPercentage.textContent = percentual + '%';

  const headerProgressFill = $('headerProgressFill');
  if (headerProgressFill) headerProgressFill.style.width = percentual + '%';

  // bottom: reescreve texto todo pra atualizar /TOTAL e meta
  const statCasinhas = document.querySelector('.stats-bottom .stat-item:nth-child(1) .stat-text');
  if (statCasinhas) {
    statCasinhas.innerHTML = `Casinhas: <strong id="casasAbertasBottom">${pagas}</strong>/${total}`;
  }

  const statMeta = document.querySelector('.stats-bottom .stat-item:nth-child(2) .stat-text');
  if (statMeta) {
    statMeta.innerHTML = `Meta: <strong>${formatBRL(meta)}</strong>`;
  }

  const bonusText = $('bonusText');
  if (bonusText) bonusText.textContent = percentual >= 100 ? 'Meta Atingida!' : 'Desbloqueado!';
}

function iniciarJogo() {
  garantirCasinhas();

  // desenha a trilha
  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }

  // atualiza UI
  atualizarUIBasica();

  // tenta também chamar funções existentes do projeto (se tiver)
  if (typeof window.mostrarValorMetaFlutuante === 'function') {
    window.mostrarValorMetaFlutuante();
  }
}

// ===== ADMIN MODAL =====
function abrirAdmin() { $('adminModal')?.classList.add('show'); }
function fecharAdmin() { $('adminModal')?.classList.remove('show'); }

function ensureAdminMetaUI() {
  const panel = $('adminPanel');
  if (!panel) return;
  if ($('newMeta')) return;

  const section = panel.querySelector('.admin-section');
  if (!section) return;

  const metaWrap = document.createElement('div');
  metaWrap.className = 'admin-controls';
  metaWrap.style.marginTop = '12px';
  metaWrap.innerHTML = `
    <label>Nova meta (R$):</label>
    <input type="number" id="newMeta" min="1" max="100000" step="0.01" value="${window.__META_VALOR__}">
    <small style="display:block;opacity:.85;margin-top:6px">
      Total de casinhas = meta ÷ 2,50
    </small>
    <button id="updateMetaBtn" class="btn-success" style="margin-top:10px">Atualizar Meta</button>
  `;

  const existingControls = section.querySelector('.admin-controls');
  if (existingControls) section.insertBefore(metaWrap, existingControls);
  else section.appendChild(metaWrap);

  $('updateMetaBtn')?.addEventListener('click', aplicarNovaMeta);
}

function verificarAdmin() {
  const pass = ($('adminPassword')?.value || '').trim();
  const error = $('adminError');
  const panel = $('adminPanel');

  if (pass !== 'VIVIANE') {
    adminLiberado = false;
    if (panel) panel.style.display = 'none';
    if (error) error.textContent = 'Senha inválida.';
    return;
  }

  adminLiberado = true;
  if (error) error.textContent = '';
  if (panel) panel.style.display = 'block';

  ensureAdminMetaUI();

  // atualiza total display existente no HTML
  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(window.__TOTAL_CASAS_JOGO__);

  const newTotal = $('newTotal');
  if (newTotal) newTotal.value = String(window.__TOTAL_CASAS_JOGO__);

  const newMeta = $('newMeta');
  if (newMeta) newMeta.value = String(window.__META_VALOR__);
}

function aplicarNovaMeta() {
  if (!adminLiberado) return;

  const meta = clampNumber($('newMeta')?.value, 1, 100000);
  window.__META_VALOR__ = meta;
  window.__TOTAL_CASAS_JOGO__ = calcularTotalCasinhas(meta);

  // sincroniza input antigo
  const newTotal = $('newTotal');
  if (newTotal) newTotal.value = String(window.__TOTAL_CASAS_JOGO__);

  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(window.__TOTAL_CASAS_JOGO__);

  garantirCasinhas();
  if ($('gameScreen')?.classList.contains('active')) {
    iniciarJogo();
  }
  atualizarUIBasica();
  fecharAdmin();
}

function resetarTudo() {
  if (!adminLiberado) return;
  if (!confirm('Tem certeza que deseja resetar todas as casinhas?')) return;

  garantirCasinhas();
  window.casinhas.forEach(c => c.paga = false);

  if ($('gameScreen')?.classList.contains('active')) {
    iniciarJogo();
  }
  atualizarUIBasica();
  fecharAdmin();
}

// ===== Login / personagem =====
function bindLoginFlow() {
  $('loginBtn')?.addEventListener('click', () => {
    // aqui você pode plugar Firebase depois. por enquanto vai direto
    showScreen('characterScreen');
  });

  $('registerBtn')?.addEventListener('click', () => {
    showScreen('characterScreen');
  });

  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      const char = card.querySelector('.char-icon')?.textContent || '🚗';
      const name = card.querySelector('p')?.textContent || 'Usuario';

      const characterDisplay = $('characterDisplay');
      if (characterDisplay) characterDisplay.textContent = char;

      const userName = $('userName');
      if (userName) userName.textContent = name;

      showScreen('gameScreen');
      setTimeout(iniciarJogo, 50);
    });
  });

  $('logoutBtn')?.addEventListener('click', () => {
    showScreen('loginScreen');
  });
}

function bindAdmin() {
  $('adminBtn')?.addEventListener('click', abrirAdmin);
  $('closeAdmin')?.addEventListener('click', fecharAdmin);
  $('verifyAdminBtn')?.addEventListener('click', verificarAdmin);
  $('resetAllBtn')?.addEventListener('click', resetarTudo);

  const adminModal = $('adminModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) fecharAdmin();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ script.js carregou e está ativo');

  bindLoginFlow();
  bindAdmin();

  // se já estiver no gameScreen (caso de refresh)
  setTimeout(() => {
    if ($('gameScreen')?.classList.contains('active')) iniciarJogo();
    atualizarUIBasica();
  }, 200);
});
