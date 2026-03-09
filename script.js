// ===== CONFIGURAÇÃO =====
const CARACTERES = {
    1: { nome: 'Carro Vermelho', emoji: '🚗' },
    2: { nome: 'Chapéu de Seda', emoji: '💎' },
    3: { nome: 'Relógio de Ouro', emoji: '⌚' },
    4: { nome: 'Cachorro', emoji: '🐶' },
    5: { nome: 'Cartola', emoji: '🎩' },
    6: { nome: 'Coroa', emoji: '👑' }
};

const ADMIN_PASSWORD = "admin123"; // MUDE ISSO!

let TOTAL_CASAS = 400;
const VALOR_CASINHA = 2.50;
const META_TOTAL = () => TOTAL_CASAS * VALOR_CASINHA;
const CHAVE_MESTRA = "Viviane";

// ===== ESTADO ===== 
let casinhas = [];
let usuarioLogado = null;
let caracterSelecionado = 1;
let ultimoCasasAbertas = 0;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se usuário está logado
    auth.onAuthStateChanged((user) => {
        if (user) {
            usuarioLogado = user;
            carregarDadosUsuario();
            mostrarTela('gameScreen');
        } else {
            mostrarTela('loginScreen');
        }
    });

    // Login
    document.getElementById('loginBtn').addEventListener('click', fazerLogin);
    document.getElementById('registerBtn').addEventListener('click', fazerRegistro);
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', fazerLogout);
    
    // Character select
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', selecionarCaractere);
    });
    
    // Admin
    document.getElementById('adminBtn').addEventListener('click', () => {
        document.getElementById('adminModal').classList.add('show');
    });
    document.getElementById('closeAdmin').addEventListener('click', () => {
        document.getElementById('adminModal').classList.remove('show');
    });
    document.getElementById('verifyAdminBtn').addEventListener('click', verificarAdminPassword);
    document.getElementById('updateTotalBtn').addEventListener('click', atualizarTotalCasas);
    document.getElementById('resetAllBtn').addEventListener('click', resetarTodosDados);
});

// ===== AUTENTICAÇÃO =====
async function fazerLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = '❌ Preencha email e senha!';
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        errorMsg.textContent = '';
    } catch (error) {
        errorMsg.textContent = '❌ ' + error.message;
    }
}

async function fazerRegistro() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = '❌ Preencha email e senha!';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = '❌ Senha deve ter pelo menos 6 caracteres!';
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        errorMsg.textContent = '✅ Conta criada! Faça login agora.';
        setTimeout(() => { document.getElementById('loginBtn').click(); }, 2000);
    } catch (error) {
        errorMsg.textContent = '❌ ' + error.message;
    }
}

function fazerLogout() {
    auth.signOut().then(() => {
        usuarioLogado = null;
        casinhas = [];
        mostrarTela('loginScreen');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });
}

// ===== DADOS DO USUÁRIO =====
async function carregarDadosUsuario() {
    try {
        const doc = await db.collection('usuarios').doc(usuarioLogado.uid).get();
        
        if (doc.exists) {
            const dados = doc.data();
            caracterSelecionado = dados.caractere || 1;
            atualizarPerfilUI();
            mostrarTela('gameScreen');
            criarTabuleiro();
            carregarCasasDoFirebase();
        } else {
            mostrarTela('characterScreen');
        }
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarTela('characterScreen');
    }
}

function selecionarCaractere(e) {
    const characterId = e.currentTarget.dataset.char;
    caracterSelecionado = parseInt(characterId);
    
    // Atualizar UI
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');
    
    // Salvar no Firebase
    salvarCaractereNoFirebase(caracterSelecionado);
    
    setTimeout(() => {
        mostrarTela('gameScreen');
        criarTabuleiro();
        carregarCasasDoFirebase();
    }, 500);
}

async function salvarCaractereNoFirebase(charId) {
    try {
        await db.collection('usuarios').doc(usuarioLogado.uid).set({
            caractere: charId,
            email: usuarioLogado.email,
            dataCriacao: new Date()
        }, { merge: true });
    } catch (error) {
        console.error('Erro ao salvar caractere:', error);
    }
}

function atualizarPerfilUI() {
    document.getElementById('characterDisplay').textContent = CARACTERES[caracterSelecionado].emoji;
    document.getElementById('userName').textContent = CARACTERES[caracterSelecionado].nome;
    document.getElementById('userEmail').textContent = usuarioLogado.email;
}

// ===== TABULEIRO =====
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

    atualizarProgresso();
    console.log("✅ Tabuleiro criado com", TOTAL_CASAS, "casinhas!");
}

function clicarCasa(index, elemento) {
    const casa = casinhas[index];
    casa.paga = !casa.paga;
    
    if (casa.paga) {
        elemento.classList.add('paga');
        verificarFogosDeArtificio();
        verificarMetaAtingida();
    } else {
        elemento.classList.remove('paga');
    }
    
    atualizarProgresso();
    salvarCasasNoFirebase();
}

function verificarFogosDeArtificio() {
    const casasAbertas = casinhas.filter(c => c.paga).length;
    
    if (casasAbertas > 0 && casasAbertas % 10 === 0 && casasAbertas !== ultimoCasasAbertas) {
        ultimoCasasAbertas = casasAbertas;
        lancarFogos();
    }
}

function lancarFogos() {
    // Confete
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    // Som (opcional)
    tocarSomSucesso();
}

function tocarSomSucesso() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function verificarMetaAtingida() {
    const casasAbertas = casinhas.filter(c => c.paga).length;
    const totalBancado = casasAbertas * VALOR_CASINHA;
    
    if (casasAbertas >= TOTAL_CASAS) {
        mostrarCelebracao('🎊 META ATINGIDA! 🎊', `Parabéns! Você economizou R$ ${totalBancado.toFixed(2)}!`);
        
        // Grande confete
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                confetti({
                    particleCount: 200,
                    spread: 80,
                    origin: { y: 0.5 }
                });
            }, i * 300);
        }
    }
}

function mostrarCelebracao(titulo, mensagem) {
    const modal = document.getElementById('celebrationModal');
    document.getElementById('celebrationText').textContent = titulo;
    document.getElementById('celebrationMessage').textContent = mensagem;
    modal.classList.add('show');
}

function fecharCelebracao() {
    document.getElementById('celebrationModal').classList.remove('show');
}

function atualizarProgresso() {
    const casasAbertas = casinhas.filter(c => c.paga).length;
    const totalBancado = casasAbertas * VALOR_CASINHA;
    const percentual = Math.round((casasAbertas / TOTAL_CASAS) * 100);

    document.getElementById('percentage').textContent = percentual + '%';
    document.getElementById('total').textContent = totalBancado.toFixed(2);
    document.getElementById('casasAbertas').textContent = casasAbertas;
    document.getElementById('progressFill').style.width = percentual + '%';
}

// ===== FIREBASE =====
async function salvarCasasNoFirebase() {
    if (!usuarioLogado) return;

    try {
        const casasPagas = casinhas
            .filter(c => c.paga)
            .map(c => c.numero);

        await db.collection('usuarios').doc(usuarioLogado.uid).collection('progresso').doc('casas').set({
            casasPagas: casasPagas,
            dataAtualizacao: new Date()
        });
    } catch (error) {
        console.error('Erro ao salvar:', error);
    }
}

async function carregarCasasDoFirebase() {
    if (!usuarioLogado) return;

    try {
        const doc = await db.collection('usuarios').doc(usuarioLogado.uid).collection('progresso').doc('casas').get();
        
        if (doc.exists) {
            const dados = doc.data();
            const casasPagas = dados.casasPagas || [];
            
            casinhas.forEach(casa => {
                casa.paga = casasPagas.includes(casa.numero);
            });

            // Atualizar visual
            document.querySelectorAll('.casa').forEach((el, index) => {
                if (casinhas[index].paga) {
                    el.classList.add('paga');
                } else {
                    el.classList.remove('paga');
                }
            });

            atualizarProgresso();
        }
    } catch (error) {
        console.error('Erro ao carregar:', error);
    }
}

// ===== ADMIN =====
function verificarAdminPassword() {
    const senha = document.getElementById('adminPassword').value;
    const errorMsg = document.getElementById('adminError');
    
    if (senha === ADMIN_PASSWORD) {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('totalCasasDisplay').textContent = TOTAL_CASAS;
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = '❌ Senha de admin incorreta!';
    }
}

function atualizarTotalCasas() {
    const novoTotal = parseInt(document.getElementById('newTotal').value);
    const errorMsg = document.getElementById('adminError');
    
    if (!novoTotal || novoTotal < 1) {
        errorMsg.textContent = '❌ Digite um número válido!';
        return;
    }
    
    TOTAL_CASAS = novoTotal;
    errorMsg.textContent = '✅ Total atualizado! Recarregando...';
    
    setTimeout(() => {
        criarTabuleiro();
        document.getElementById('adminModal').classList.remove('show');
    }, 1000);
}

function resetarTodosDados() {
    if (confirm('⚠️ Tem certeza? Isso apagará TODOS os dados!')) {
        casinhas.forEach(casa => casa.paga = false);
        document.querySelectorAll('.casa').forEach(el => el.classList.remove('paga'));
        atualizarProgresso();
        salvarCasasNoFirebase();
        document.getElementById('adminModal').classList.remove('show');
    }
}

// ===== UI =====
function mostrarTela(telaId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(telaId).classList.add('active');
}

window.fecharCelebracao = fecharCelebracao;
