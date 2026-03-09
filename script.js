// ===== CONFIGURAÇÃO =====
const CARACTERES = {
    1: { nome: 'Carro Vermelho', emoji: '🚗' },
    2: { nome: 'Chapeu de Seda', emoji: '💎' },
    3: { nome: 'Relogio de Ouro', emoji: '⌚' },
    4: { nome: 'Cachorro', emoji: '🐶' },
    5: { nome: 'Cartola', emoji: '🎩' },
    6: { nome: 'Coroa', emoji: '👑' }
};

const ADMIN_PASSWORD = "admin123";
let TOTAL_CASAS = 140;
const VALOR_CASINHA = 2.50;

let casinhas = [];
let usuarioLogado = null;
let caracterSelecionado = 1;
let ultimoCasasAbertas = 0;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    inicializarEventos();
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            usuarioLogado = user;
            carregarDadosUsuario();
        } else {
            mostrarTela('loginScreen');
        }
    });
});

function inicializarEventos() {
    try {
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
        
        console.log('Eventos inicializados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar eventos:', error);
    }
}

// ===== AUTENTICAÇÃO =====
function fazerLogin() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = 'Preencha email e senha!';
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function() {
            errorMsg.textContent = '';
        })
        .catch(function(error) {
            errorMsg.textContent = 'Erro: ' + error.message;
        });
}

function fazerRegistro() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    if (!email || !password) {
        errorMsg.textContent = 'Preencha email e senha!';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Senha deve ter pelo menos 6 caracteres!';
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function() {
            errorMsg.textContent = 'Conta criada! Faca login agora.';
            setTimeout(function() {
                document.getElementById('loginBtn').click();
            }, 2000);
        })
        .catch(function(error) {
            errorMsg.textContent = 'Erro: ' + error.message;
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
}

// ===== TABULEIRO =====
function criarTabuleiro() {
    casinhas = [];

    for (var i = 1; i <= TOTAL_CASAS; i++) {
        var casa = {
            numero: i,
            valor: VALOR_CASINHA,
            p

