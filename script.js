// ===== CONFIGURAÇÃO =====
const CARACTERES = {
    1: { nome: 'Carro Vermelho', emoji: '🚗' },
    2: { nome: 'Chapéu de Seda', emoji: '💎' },
    3: { nome: 'Relógio de Ouro', emoji: '⌚' },
    4: { nome: 'Cachorro', emoji: '🐶' },
    5: { nome: 'Cartola', emoji: '🎩' },
    6: { nome: 'Coroa', emoji: '👑' }
};

const ADMIN_PASSWORD = "admin123";
let TOTAL_CASAS = 400;
const VALOR_CASINHA = 2.50;

let casinhas = [];
let usuarioLogado = null;
let caracterSelecionado = 1;
let ultimoCasasAbertas = 0;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            usuarioLogado = user;
            carregarDadosUsuario();
            mostrarTela('gameScreen');
        } else {
            mostrarTela('loginScreen');
        }
    });

    document.getElementById('loginBtn').addEventListener('click', fazerLogin);
    document.getElementById('registerBtn').addEventListener('click', fazerRegistro);
    document.getElementById('logoutBtn').addEventListener('click', fazerLogout);
    
    document.querySelectorAll('.character-card').forEach(function(card) {
        card.addEventListener('click', selecionarCaractere);
    });
    
    document.getElementById('adminBtn').addEventListener('click', function() {
        document.getElementById('adminModal').classList.add('show');
    });
    
    document.getElementById('closeAdmin').addEventListener('click', function() {
        document.getElementById('adminModal').classList.remove('show');
    });
    
    document.getElementById('verifyAdminBtn').addEventListener('click', verificarAdminPassword);
    document.getElementById('updateTotalBtn').addEventListener('click', atualizarTotalCasas);
    document.getElementById('resetAllBtn').addEventListener('click', resetarTodosDados);
});

// ===== AUTENTICAÇÃO =====
function fazerLogin() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = '❌ Preencha email e senha!';
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
            errorMsg.textContent = '';
        })
        .catch(function(error) {
            errorMsg.textContent = '❌ ' + error.message;
        });
}

function fazerRegistro() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = '❌ Preencha email e senha!';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = '❌ Senha deve ter pelo menos 6 caracteres!';
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            errorMsg.textContent = '✅ Conta criada! Faça login agora.';
            setTimeout(function() {
                document.getElementById('loginBtn').click();
            }, 2000);
        })
        .catch(function(error) {
            errorMsg.textContent = '❌ ' + error.message;
        });
}

function fazerLogout() {
    firebase.auth().signOut().then(function() {
        usuarioLogado = null;
        casinhas = [];
        mostrarTela('loginScreen');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });
}

// ===== DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
    mostrarCarregamento();
    
    firebase.firestore().collection('usuarios').doc(usuarioLogado.uid).get()
        .then(function(doc) {
            if (doc.exists) {
                var dados = doc.data();
                caracterSelecionado = dados.caractere || 1;
                atualizarPerfilUI();
                mostrarTela('gameScreen');
                criarTabuleiro();
                carregarCasasDoFirebase();
            } else {
                mostrarTela('characterScreen');
            }
        })
        .catch(function(error) {
            console.error('Erro ao carregar dados:', error);
            mostrarTela('characterScreen');
        });
}

function selecionarCaractere(e) {
    var characterId = e.currentTarget.getAttribute('data-char');
    caracterSelecionado = parseInt(characterId);
    
    document.querySelectorAll('.character-card').forEach(function(card) {
        card.classList.remove('selected');
    });
    e.currentTarget.classList.add('selected');
    
    salvarCaractereNoFirebase(caracterSelecionado);
    
    setTimeout(function() {
        mostrarTela('gameScreen');
        criarTabuleiro();
        carregarCasasDoFirebase();
    }, 500);
}

function salvarCaractereNoFirebase(charId) {
    firebase.firestore().collection('usuarios').doc(usuarioLogado.uid).set({
        caractere: charId,
        email: usuarioLogado.email,
        dataCriacao: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
        .catch(function(error) {
            console.error('Erro ao salvar caractere:', error);
        });
}

function atualizarPerfilUI() {
    document.getElementById('characterDisplay').textContent = CARACTERES[caracterSelecionado].emoji;
    document.getElementById('userName').textContent = CARACTERES[caracterSelecionado].nome;
    document.getElementById('userEmail').textContent = usuarioLogado.email;
}

// ===== TABULEIRO =====
function criarTabuleiro() {
    casinhas = [];

    for (var i = 1; i <= TOTAL_CASAS; i++) {
        var casa = {
            numero: i,
            valor: VALOR_CASINHA,
            paga: false,
            grupo: Math.floor((i - 1) / 50) % 8,
            mensagem: obterMensagem(i)
        };

        casinhas.push(casa);
    }

    var boardContainer = document.getElementById('board');
    criarTabuleiro3D(TOTAL_CASAS, boardContainer);
    
    atualizarProgresso();
    esconderCarregamento();
    console.log("✅ Tabuleiro 3D criado!");
}

// ===== VERIFICAR FOGOS =====
function verificarFogosDeArtificio() {
    var casasAbertas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasAbertas++;
    });
    
    if (casasAbertas > 0 && casasAbertas % 10 === 0 && casasAbertas !== ultimoCasasAbertas) {
        ultimoCasasAbertas = casasAbertas;
        lancarFogos();
        mostrarMilestone(casasAbertas);
    }
}

function lancarFogos() {
    vibraTabuleiro();
    
    for (var i = 0; i < 3; i++) {
        setTimeout(function() {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }, i * 200);
    }
}

// ===== VERIFICAR META =====
function verificarMetaAtingida() {
    var casasAbertas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasAbertas++;
    });
    
    var totalBancado = casasAbertas * VALOR_CASINHA;
    
    if (casasAbertas >= TOTAL_CASAS) {
        setTimeout(function() {
            mostrarVitoria(totalBancado);
            tocarSomVitoria();
        }, 1000);
    }
}

// ===== ATUALIZAR PROGRESSO =====
function atualizarProgresso() {
    var casasAbertas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasAbertas++;
    });
    
    var totalBancado = casasAbertas * VALOR_CASINHA;
    var percentual = Math.round((casasAbertas / TOTAL_CASAS) * 100);

    document.getElementById('percentage').textContent = percentual + '%';
    document.getElementById('total').textContent = totalBancado.toFixed(2);
    document.getElementById('casasAbertas').textContent = casasAbertas;
    document.getElementById('progressFill').style.width = percentual + '%';
    
    if (percentual > 0 && percentual % 10 === 0 && casasAbertas % 10 === 0) {
        mostrarToastProgresso(casasAbertas, TOTAL_CASAS, totalBancado);
    }
}

// ===== FIREBASE =*

