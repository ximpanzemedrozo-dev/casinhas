// ===== SCRIPT PRINCIPAL (ADMIN + META DINÂMICA) =====
// Compatível com o index.html atual (sem precisar alterar IDs)

const VALOR_CASINHA = 2.5;

// estado global (persistência simples)
window.__META_VALOR__ = (typeof window.__META_VALOR__ === 'number') ? window.__META_VALOR__ : 350;
window.__TOTAL_CASAS_JOGO__ = (typeof window.__TOTAL_CASAS_JOGO__ === 'number') ? window.__TOTAL_CASAS_JOGO__ : 140;

let adminLiberado = false;

function $(id) { return document.getElementById(id); }

function formatBRL(v) {
  try {
    return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    return 'R$ ' + (Number(v) || 0).toFixed(2);
  }
}

function clampNumber(n, min, max) {
  n = Number(n);
  if (!Number.isFinite(n)) n = min;
  return Math.max(min, Math.min(max, n));
}

function calcularTotalCasinhas(metaEmReais) {
  // cada casinha vale 2,50 => total = meta/2,50
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

  const totalBancado = pagas * VALOR_CASINHA;
  const percentual = total > 0 ? Math.round((pagas / total) * 100) : 0;

  // topo (valorDisplay é re-renderizado também pelo game-board.js, mas atualizamos aqui por segurança)
  const valorNumero = $('valorNumero');
  if (valorNumero) valorNumero.textContent = totalBancado.toFixed(2);

  const valorPorcentagem = $('valorPorcentagem');
  if (valorPorcentagem) valorPorcentagem.textContent = percentual + '%';

  // header
  const headerPercentage = $('headerPercentage');
  if (headerPercentage) headerPercentage.textContent = percentual + '%';

  const headerProgressFill = $('headerProgressFill');
  if (headerProgressFill) headerProgressFill.style.width = percentual + '%';

  // bottom casinhas (se existir)
  const casasAbertasBottom = $('casasAbertasBottom');
  if (casasAbertasBottom) casasAbertasBottom.textContent = pagas;

  // atualiza texto "Casinhas: X/140" (no seu HTML original o /140 fica hardcoded)
  const statCasinhas = document.querySelector('.stats-bottom .stat-item:nth-child(1) .stat-text');
  if (statCasinhas) {
    statCasinhas.innerHTML = `Casinhas: <strong id="casasAbertasBottom">${pagas}</strong>/${total}`;
  }

  // atualiza texto da meta no rodapé
  const statMeta = document.querySelector('.stats-bottom .stat-item:nth-child(2) .stat-text');
  if (statMeta) {
    statMeta.innerHTML = `Meta: <strong>${formatBRL(window.__META_VALOR__)}</strong>`;
  }

  // status
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

function ensureAdminMetaUI() {
  // injeta campo de META sem alterar index.html
  const panel = $('adminPanel');
  if (!panel) return;

  if ($('newMeta')) return; // já existe

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

  // coloca acima do bloco "Novo total" existente
  const existingControls = section.querySelector('.admin-controls');
  if (existingControls) {
    section.insertBefore(metaWrap, existingControls);
  } else {
    section.appendChild(metaWrap);
  }

  // evento do botão
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

  // preenche campos
  const newMeta = $('newMeta');
  if (newMeta) newMeta.value = String(window.__META_VALOR__);

  const newTotal = $('newTotal');
  if (newTotal) newTotal.value = String(window.__TOTAL_CASAS_JOGO__);

  // atualiza display do total no painel
  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(window.__TOTAL_CASAS_JOGO__);
}

function redesenharTrilha() {
  garantirCasinhas();

  if (typeof window.inicializarTrilha === 'function') {
    window.inicializarTrilha();
  }

  // pede também para o game-board recalcular UI se existir
  if (typeof window.mostrarValorMetaFlutuante === 'function') {
    window.mostrarValorMetaFlutuante();
  }

  atualizarUIBasica();
}

function aplicarNovaMeta() {
  if (!adminLiberado) return;

  const error = $('adminError');
  const metaInput = $('newMeta');

  const meta = clampNumber(metaInput?.value, 1, 100000);
  window.__META_VALOR__ = meta;

  const novoTotal = calcularTotalCasinhas(meta);
  window.__TOTAL_CASAS_JOGO__ = novoTotal;

  // Atualiza também o input antigo "newTotal" (para ficar coerente na tela)
  const newTotal = $('newTotal');
  if (newTotal) newTotal.value = String(novoTotal);

  // atualiza display
  const totalCasasDisplay = $('totalCasasDisplay');
  if (totalCasasDisplay) totalCasasDisplay.textContent = String(novoTotal);

  if (error) error.textContent = '';

  redesenharTrilha();
  fecharAdmin();
}

function resetarTudo() {
  if (!adminLiberado) return;
  if (!confirm('Tem certeza que deseja resetar todas as casinhas?')) return;

  garantirCasinhas();
  window.casinhas.forEach(c => c.paga = false);

  redesenharTrilha();
  fecharAdmin();
}

function initEventos() {
  // Admin
  $('adminBtn')?.addEventListener('click', abrirAdmin);
  $('closeAdmin')?.addEventListener('click', fecharAdmin);
  $('verifyAdminBtn')?.addEventListener('click', verificarAdmin);
  $('resetAllBtn')?.addEventListener('click', resetarTudo);

  // fecha clicando fora
  const adminModal = $('adminModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) fecharAdmin();
    });
  }
}

function initApp() {
  // Se o game já estiver aberto, tenta redesenhar com valores atuais
  garantirCasinhas();
  atualizarUIBasica();

  // expõe para outros scripts chamarem
  window.redesenharTrilha = redesenharTrilha;
  window.atualizarUIBasica = atualizarUIBasica;
}

window.addEventListener('DOMContentLoaded', function () {
  initEventos();
  initApp();
});
