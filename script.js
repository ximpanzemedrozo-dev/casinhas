// ===== ADMIN: senha VIVIANE + meta em R$ e total casinhas = meta ÷ 2,50 =====

const VALOR_CASINHA = 2.5;

// estado global
window.__META_VALOR__ = window.__META_VALOR__ ?? 350.0; // R$
window.__TOTAL_CASAS_JOGO__ = window.__TOTAL_CASAS_JOGO__ ?? 140; // casinhas

let adminLiberado = false;

function $(id) { return document.getElementById(id); }

function formatBRL(v) {
  try {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    return 'R$ ' + (Number(v) || 0).toFixed(2);
  }
}

function clamp(n, min, max) {
  n = Number(n);
  if (!Number.isFinite(n)) n = min;
  return Math.max(min, Math.min(max, n));
}

function calcularTotalCasinhas(metaEmReais) {
  // regra: cada casinha vale 2,50 => total = meta / 2,50
  return Math.max(1, Math.round(metaEmReais / VALOR_CASINHA));
}

function garantirCasinhas() {
  if (!window.casinhas || !Array.isArray(window.casinhas)) {
    window.casinhas = [];
  }

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
  if (!window.casinhas) return 0;
  let c = 0;
  window.casinhas.forEach(x => { if (x && x.paga) c++; });
  return c;
}

function atualizarUI() {
  const pagas = contarPagas();
  const total = window.__TOTAL_CASAS_JOGO__;
  const meta = window.__META_VALOR__;

  const totalBancado = pagas * VALOR_CASINHA;
  const percentual = total > 0 ? Math.round((pagas / total) * 100) : 0;

  // topo
  const valorNumero = $('valorNumero');
  if (valorNumero) valorNumero.textContent = totalBancado.toFixed(2);

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

  // admin displays
  const metaAtualDisplay = $('metaAtualDisplay');
  if (metaAtualDisplay) metaAtualDisplay.textContent = formatBRL(meta);

  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(total);

  const bonusText = $('bonusText');
  if (bonusText) bonusText.textContent = percentual >= 100 ? 'Meta Atingida!' : 'Desbloqueado!';
}

// ===== ADMIN MODAL =====
function abrirAdmin() {
  const modal = $('adminModal');
  if (modal) modal.classList.add('show');
}
function fecharAdmin() {
  const modal = $('adminModal');
  if (modal) modal.classList.remove('show');
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

  const newMeta = $('newMeta');
  if (newMeta) newMeta.value = String(window.__META_VALOR__.toFixed(2));

  atualizarUI();
}

function aplicarNovaMeta() {
  if (!adminLiberado) return;

  const metaInput = $('newMeta');
  const error = $('adminError');

  const meta = clamp(metaInput?.value, 1, 100000); // R$
  window.__META_VALOR__ = meta;

  // calcula casinhas pela regra: total = meta / 2,50
  window.__TOTAL_CASAS_JOGO__ = calcularTotalCasinhas(meta);

  if (error) error.textContent = '';

  garantirCasinhas();

  // redesenha o tabuleiro
  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }

  atualizarUI();
  fecharAdmin();
}

function resetarTudo() {
  if (!adminLiberado) return;
  if (!confirm('Tem certeza que deseja resetar todas as casinhas?')) return;

  garantirCasinhas();
  window.casinhas.forEach(c => c.paga = false);

  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }
  atualizarUI();
  fecharAdmin();
}

function initEventos() {
  console.log('✅ Inicializando eventos...');

  const adminBtn = $('adminBtn');
  if (adminBtn) adminBtn.addEventListener('click', abrirAdmin);

  const closeAdmin = $('closeAdmin');
  if (closeAdmin) closeAdmin.addEventListener('click', fecharAdmin);

  const verifyAdminBtn = $('verifyAdminBtn');
  if (verifyAdminBtn) verifyAdminBtn.addEventListener('click', verificarAdmin);

  const updateMetaBtn = $('updateMetaBtn');
  if (updateMetaBtn) updateMetaBtn.addEventListener('click', aplicarNovaMeta);

  const resetAllBtn = $('resetAllBtn');
  if (resetAllBtn) resetAllBtn.addEventListener('click', resetarTudo);

  const adminModal = $('adminModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) fecharAdmin();
    });
  }
}

function initDefaults() {
  // defaults iniciais
  if (typeof window.__META_VALOR__ !== 'number') window.__META_VALOR__ = 350.0;
  if (typeof window.__TOTAL_CASAS_JOGO__ !== 'number') window.__TOTAL_CASAS_JOGO__ = 140;

  garantirCasinhas();

  // desenha tabuleiro
  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }
  atualizarUI();
}

window.addEventListener('DOMContentLoaded', function () {
  initEventos();

  // tenta iniciar quando já estiver no game (ou após seu fluxo)
  setTimeout(() => {
    const gameScreen = $('gameScreen');
    if (gameScreen && gameScreen.classList.contains('active')) {
      initDefaults();
    }
  }, 400);

  // expõe para seu fluxo chamar depois do login/char select
  window.initDefaults = initDefaults;
  window.atualizarUI = atualizarUI;
});
