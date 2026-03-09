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
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            usuarioLogado = user;
            carregarDadosUsuario();
            mostrarTela('gameScreen');
        } else {
            mostrarTela('loginScreen');
        }
    });

    var loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', fazerLogin);

    var registerBtn = document.getElementById('registerBtn');
    if (registerBtn) registerBtn.addEventListener('click', fazerRegistro);

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', fazerLogout);
    
    var characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(function(card) {
        card.addEventListener('click', selecionarCaractere);
    });
    
    var adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            document.getElementById('adminModal').classList.add('show');
        });
    }
    
    var closeAdmin = document.getElementById('closeAdmin');
    if (closeAdmin) {
        closeAdmin.addEventListener('click', function() {
            document.getElementById('adminModal').classList.remove('show');
        });
    }
    
    var verifyAdminBtn = document.getElementById('verifyAdminBtn');
    if (verifyAdminBtn) verifyAdminBtn.addEventListener('click', verificarAdminPassword);

    var updateTotalBtn = document.getElementById('updateTotalBtn');
    if (updateTotalBtn) updateTotalBtn.addEventListener('click', atualizarTotalCasas);

    var resetAllBtn = document.getElementById('resetAllBtn');
    if (resetAllBtn) resetAllBtn.addEventListener('click', resetarTodosDados);
});

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
            mostrarTela('character

