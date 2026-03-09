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
    auth.onAuthStateChanged(function(user) {
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
    
    var cards = document.querySelectorAll('.character-card');
    cards.forEach(function(card) {
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

    auth.signInWithEmailAndPassword(email, password)
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

    auth.createUserWithEmailAndPassword(email, password)
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
    auth.signOut().then(function() {
        usuarioLogado = null;
        casinhas = [];
        mostrarTela('loginScreen');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
    });
}

// ===== DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
    db.collection('usuarios').doc(usuarioLogado.uid).get()
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
    var characterId = e.currentTarget.dataset.char;
    caracterSelecionado = parseInt(characterId);
    
    var cards = document.querySelectorAll('.character-card');
    cards.forEach(function(card) {
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
    db.collection('usuarios').doc(usuarioLogado.uid).set({
        caractere: charId,
        email: usuarioLogado.email,
        dataCriacao: new Date()
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
    var board = document.getElementById('board');
    board.innerHTML = '';
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

        var elemento = document.createElement('div');
        elemento.className = 'casa grupo-' + casa.grupo;
        elemento.innerHTML = '<div class="casa-icone">' + casa.mensagem.emoji + '</div><div class="casa-numero">#' + i + '</div><div class="casa-valor">R$ ' + casa.valor.toFixed(2) + '</div>';
        elemento.addEventListener('click', (function(index) {
            return function() {
                clicarCasa(index);
            };
        })(i - 1));
        board.appendChild(elemento);
    }

    atualizarProgresso();
    console.log("✅ Tabuleiro criado!");
}

function clicarCasa(index) {
    var elemento = document.querySelectorAll('.casa')[index];
    var casa = casinhas[index];
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
    var casasAbertas = casinhas.filter(function(c) { return c.paga; }).length;
    
    if (casasAbertas > 0 && casasAbertas % 10 === 0 && casasAbertas !== ultimoCasasAbertas) {
        ultimoCasasAbertas = casasAbertas;
        lancarFogos();
    }
}

function lancarFogos() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
    
    tocarSomSucesso();
}

function tocarSomSucesso() {
    try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Som não disponível');
    }
}

function verificarMetaAtingida() {
    var casasAbertas = casinhas.filter(function(c) { return c.paga; }).length;
    var totalBancado = casasAbertas * VALOR_CASINHA;
    
    if (casasAbertas >= TOTAL_CASAS) {
        mostrarCelebracao('🎊 META ATINGIDA! 🎊', 'Parabéns! Você economizou R$ ' + totalBancado.toFixed(2) + '!');
        
        for (var i = 0; i < 3; i++) {
            setTimeout(function() {
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
    var modal = document.getElementById('celebrationModal');
    document.getElementById('celebrationText').textContent = titulo;
    document.getElementById('celebrationMessage').textContent = mensagem;
    modal.classList.add('show');
}

function fecharCelebracao() {
    document.getElementById('celebrationModal').classList.remove('show');
}

function atualizarProgresso() {
    var casasAbertas = casinhas.filter(function(c) { return c.paga; }).length;
    var totalBancado = casasAbertas * VALOR_CASINHA;
    var percentual = Math.round((casasAbertas / TOTAL_CASAS) * 100);

    document.getElementById('percentage').textContent = percentual + '%';
    document.getElementById('total').textContent = totalBancado.toFixed(2);
    document.getElementById('casasAbertas').textContent = casasAbertas;
    document.getElementById('progressFill').style.width = percentual + '%';
}

// ===== FIREBASE =====
function salvarCasasNoFirebase() {
    if (!usuarioLogado) return;

    var casasPagas = casinhas
        .filter(function(c) { return c.paga; })
        .map(function(c) { return c.numero; });

    db.collection('usuarios').doc(usuarioLogado.uid).collection('progresso').doc('cas*

