// ===== SCRIPT PRINCIPAL: LOGIN -> PERSONAGEM -> JOGO + ADMIN (VIVIANE) =====
// Regras:
// - cada casinha vale R$ 2,50
// - total de casinhas = meta ÷ 2,50
// - balão flutuante mostra ARRECADADO / META
// - rodapé "Meta" sempre atualizado

const VALOR_CASINHA = 2.5;

// defaults (sessão)
window.__META_VALOR__ = (typeof window.__META_VALOR__ === 'number') ? window.__META_VALOR__ : 350;
window.__TOTAL_CASAS_JOGO__ = (typeof window.__TOTAL_CASAS_JOGO__ === 'number')
  ? window.__TOTAL_CASAS_JOGO__
  : Math.max(1, Math.round(window.__META_VALOR__ / VALOR_CASINHA));

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

function atualizarUI() {
  const pagas = contarPagas();
  const total = window.__TOTAL_CASAS_JOGO__;
  const meta = window.__META_VALOR__;

  const totalArrecadado = pagas * VALOR_CASINHA;
  const percentual = total > 0 ? Math.round((pagas / total) * 100) : 0;

  // balão: arrecadado / meta
  const valorNumero = $('valorNumero');
  if (valorNumero) valorNumero.textContent = totalArrecadado.toFixed(2);

  const metaNumero = $('metaNumero');
  if (metaNumero) metaNumero.textContent = formatBRL(meta);

  const valorPorcentagem = $('valorPorcentagem');
  if (valorPorcentagem) valorPorcentagem.textContent = percentual + '%';

  // header
  const headerPercentage = $('headerPercentage');
  if (headerPercentage) headerPercentage.textContent = percentual + '%';

  const headerProgressFill = $('headerProgressFill');
  if (headerProgressFill) headerProgressFill.style.width = percentual + '%';

  // bottom
  const casasAbertasBottom = $('casasAbertasBottom');
  if (casasAbertasBottom) casasAbertasBottom.textContent = pagas;

  const totalCasinhasBottom = $('totalCasinhasBottom');
  if (totalCasinhasBottom) totalCasinhasBottom.textContent = total;

  const metaBottomText = $('metaBottomText');
  if (metaBottomText) metaBottomText.textContent = formatBRL(meta);

  const bonusText = $('bonusText');
  if (bonusText) bonusText.textContent = percentual >= 100 ? 'Meta Atingida!' : 'Desbloqueado!';

  // admin displays
  const metaAtualDisplay = $('metaAtualDisplay');
  if (metaAtualDisplay) metaAtualDisplay.textContent = formatBRL(meta);

  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(total);
}

function iniciarJogo() {
  garantirCasinhas();

  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }

  atualizarUI();
}

// ===== ADMIN MODAL =====
function abrirAdmin() { $('adminModal')?.classList.add('show'); }
function fecharAdmin() { $('adminModal')?.classList.remove('show'); }

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

  const newMeta = $('newMeta');
  if (newMeta) newMeta.value = String(window.__META_VALOR__.toFixed(2));

  atualizarUI();
}

function aplicarNovaMeta() {
  if (!adminLiberado) return;

  const meta = clampNumber($('newMeta')?.value, 1, 100000);
  window.__META_VALOR__ = meta;
  window.__TOTAL_CASAS_JOGO__ = calcularTotalCasinhas(meta);

  garantirCasinhas();

  if ($('gameScreen')?.classList.contains('active')) {
    iniciarJogo();
  } else {
    atualizarUI();
  }

  fecharAdmin();
}

function resetarTudo() {
  if (!adminLiberado) return;
  if (!confirm('Tem certeza que deseja resetar todas as casinhas?')) return;

  garantirCasinhas();
  window.casinhas.forEach(c => c.paga = false);

  if ($('gameScreen')?.classList.contains('active')) iniciarJogo();
  atualizarUI();
  fecharAdmin();
}

// ===== Login / personagem =====
function bindLoginFlow() {
  $('loginBtn')?.addEventListener('click', () => showScreen('characterScreen'));
  $('registerBtn')?.addEventListener('click', () => showScreen('characterScreen'));

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

  $('logoutBtn')?.addEventListener('click', () => showScreen('loginScreen'));
}

function bindAdmin() {
  $('adminBtn')?.addEventListener('click', abrirAdmin);
  $('closeAdmin')?.addEventListener('click', fecharAdmin);
  $('verifyAdminBtn')?.addEventListener('click', verificarAdmin);
  $('updateMetaBtn')?.addEventListener('click', aplicarNovaMeta);
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

  setTimeout(() => {
    if ($('gameScreen')?.classList.contains('active')) iniciarJogo();
    atualizarUI();
  }, 200);

  // deixa global pra outros arquivos chamarem
  window.atualizarUI = atualizarUI;
});
