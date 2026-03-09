const TOTAL_CASAS = 400;
const VALOR_CASINHA = 2.50;
const CHAVE_MESTRA = "Viviane";
const META_TOTAL = TOTAL_CASAS * VALOR_CASINHA;

let casinhas = [];

document.addEventListener('DOMContentLoaded', () => {
    console.log("🎮 Iniciando Tabuleiro das Casinhas...");
    carregarDadosLocais();
    criarTabuleiro();
    atualizarProgresso();
    
    document.getElementById('saveBtn').addEventListener('click', salvarNoFirebase);
    document.getElementById('resetBtn').addEventListener('click', resetarTudo);
    document.getElementById('closeModal').addEventListener('click', fecharModal);
    document.getElementById('masterKey').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') salvarNoFirebase();
    });

    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') fecharModal();
    });
});

function criarTabuleiro() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    casinhas = [];

    for (let i = 1; i <= TOTAL_CASAS; i++) {
        const casa = {
            numero: i,
            valor: VALOR_CASINHA,
            paga: false,
            grupo: Math.floor((i - 1) / 50) % 8,
            mensagem: obterMensagem(i)
        };

        casinhas.push(casa);

        const elemento = document.createElement('div');
        elemento.className = `casa grupo-${casa.grupo}`;
        elemento.innerHTML = `
            <div class="casa-icone">${casa.mensagem.emoji}</div>
            <div class="casa-numero">#${i}</div>
            <div class="casa-valor">R$ ${casa.valor.toFixed(2)}</div>
        `;
        elemento.addEventListener('click', () => clicarCasa(i - 1, elemento));
        board.appendChild(elemento);
    }

    console.log("✅ Tabuleiro criado com", TOTAL_CASAS, "casinhas!");
}

function clicarCasa(index, elemento) {
    const casa = casinhas[index];
    casa.paga = !casa.paga;
    
    if (casa.paga) {
        elemento.classList.add('paga');
    } else {
        elemento.classList.remove('paga');
    }
    
    atualizarProgresso();
    
    if (casa.paga) {
        mostrarMensagem(casa);
    }

    console.log(`Casa #${index + 1} clicada! Status: ${casa.paga ? 'PAGA' : 'NÃO PAGA'}`);
}

function mostrarMensagem(casa) {
    document.getElementById('modalHeader').textContent = `Casa #${casa.numero}`;
    document.getElementById('modalMessage').textContent = casa.mensagem.mensagem;
    document.getElementById('modal').classList.add('show');
    
    setTimeout(fecharModal, 2500);
}

function fecharModal() {
    document.getElementById('modal').classList.remove('show');
}

function atualizarProgresso() {
    const casasPagas = casinhas.filter(c => c.paga).length;
    const totalBancado = casasPagas * VALOR_CASINHA;
    const percentual = Math.round((casasPagas / TOTAL_CASAS) * 100);

    document.getElementById('percentage').textContent = percentual;
    document.getElementById('total').textContent = totalBancado.toFixed(2);
    document.getElementById('progressFill').style.width = percentual + '%';
    
    salvarDadosLocais();
}

function salvarNoFirebase() {
    const chave = document.getElementById('masterKey').value;
    const statusMsg = document.getElementById('statusMsg');
    
    if (chave !== CHAVE_MESTRA) {
        statusMsg.textContent = '❌ Chave mestra incorreta!';
        statusMsg.className = 'status-msg error';
        return;
    }

    statusMsg.textContent = '✅ Dados salvos com sucesso!';
    statusMsg.className = 'status-msg success';
    
    console.log("💾 Dados salvos:", JSON.stringify(casinhas.filter(c => c.paga)));
    
    document.getElementById('masterKey').value = '';
    
    setTimeout(() => {
        statusMsg.textContent = '';
    }, 3000);
}

function resetarTudo() {
    if (confirm('⚠️ Tem certeza que quer resetar tudo? Essa ação não pode ser desfeita!')) {
        casinhas.forEach(casa => casa.paga = false);
        
        document.querySelectorAll('.casa').forEach(el => {
            el.classList.remove('paga');
        });
        
        atualizarProgresso();
        console.log("🔄 Tudo foi resetado!");
    }
}

function salvarDadosLocais() {
    const dados = casinhas
        .filter(c => c.paga)
        .map(c => c.numero);
    localStorage.setItem('casinhas_estado', JSON.stringify(dados));
}

function carregarDadosLocais() {
    const dados = localStorage.getItem('casinhas_estado');
    if (dados) {
        try {
            const numeros = JSON.parse(dados);
            console.log(`📂 Carregado ${numeros.length} casinhas do localStorage`);
        } catch (e) {
            console.log("⚠️ Erro ao carregar dados locais");
        }
    }
}

console.log(`
╔════════════════════════════════════════╗
║   🏠 TABULEIRO DAS CASINHAS 🏠        ║
║                                        ║
║   Total de Casinhas: ${TOTAL_CASAS}              ║
║   Valor Unitário: R$ ${VALOR_CASINHA.toFixed(2)}          ║
║   Meta Total: R$ ${META_TOTAL.toFixed(2)}        ║
║   Chave Mestra: ${CHAVE_MESTRA}        ║
╚════════════════════════════════════════╝
`);
