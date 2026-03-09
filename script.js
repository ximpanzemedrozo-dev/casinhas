// ===== CONFIGURAÇÃO =====
const CARACTERES = {
    1: { nome: 'Carro Vermelho', emoji: '🚗' },
    2: { nome: 'Chapeu de Seda', emoji: '💎' },
    3: { nome: 'Relogio de Ouro', emoji: '⌚' },
    4: { nome: 'Cachorro', emoji: '🐶' },
    5: { nome: 'Cartola', emoji: '🎩' },
    6: { nome: 'Coroa', emoji: '👑' }
};

const ADMIN_PASSWORD = "VIVIANE";
let TOTAL_CASAS = 400;
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
            paga: false,
            grupo: Math.floor((i - 1) / 50) % 8,
            mensagem: { emoji: '🏠', texto: 'Casa ' + i }
        };

        casinhas.push(casa);
    }

    inicializarTrilha();
    atualizarProgresso();
    esconderCarregamento();
    console.log("Trilha do jogo criada com 400 casas!");
}

// ===== VERIFICAR FOGOS =====
function verificarFogosDeArtificio() {
    var casasAbertas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasAbertas++;
    });
    
    if (casasAbertas > 0 && casasAbertas % 40 === 0 && casasAbertas !== ultimoCasasAbertas) {
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

    var percentage = document.getElementById('percentage');
    if (percentage) percentage.textContent = percentual + '%';

    var total = document.getElementById('total');
    if (total) total.textContent = totalBancado.toFixed(2);

    var casasAbertasEl = document.getElementById('casasAbertas');
    if (casasAbertasEl) casasAbertasEl.textContent = casasAbertas;

    var progressFill = document.getElementById('progressFill');
    if (progressFill) progressFill.style.width = percentual + '%';
    
    mostrarValorMetaFlutuante();
}

// ===== FIREBASE =====
function salvarCasasNoFirebase() {
    if (!usuarioLogado) return;

    var casasPagas = [];
    casinhas.forEach(function(c) {
        if (c.paga) casasPagas.push(c.numero);
    });

    firebase.firestore().collection('usuarios').doc(usuarioLogado.uid).collection('progresso').doc('casas').set({
        casasPagas: casasPagas,
        dataAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
    })
        .catch(function(error) {
            console.error('Erro ao salvar:', error);
        });
}

function carregarCasasDoFirebase() {
    if (!usuarioLogado) return;

    firebase.firestore().collection('usuarios').doc(usuarioLogado.uid).collection('progresso').doc('casas').get()
        .then(function(doc) {
            if (doc.exists) {
                var dados = doc.data();
                var casasPagas = dados.casasPagas || [];
                
                casinhas.forEach(function(casa) {
                    if (casasPagas.indexOf(casa.numero) > -1) {
                        casa.paga = true;
                    } else {
                        casa.paga = false;
                    }
                });

                inicializarTrilha();
                atualizarProgresso();
            }
        })
        .catch(function(error) {
            console.error('Erro ao carregar:', error);
        });
}

// ===== ADMIN =====
function verificarAdminPassword() {
    var senha = document.getElementById('adminPassword').value;
    var errorMsg = document.getElementById('adminError');
    
    if (senha === ADMIN_PASSWORD) {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('totalCasasDisplay').textContent = TOTAL_CASAS;
        errorMsg.textContent = '';
    } else {
        errorMsg.textContent = 'Senha de admin incorreta!';
    }
}

function atualizarTotalCasas() {
    var novoTotal = parseInt(document.getElementById('newTotal').value);
    var errorMsg = document.getElementById('adminError');
    
    if (!novoTotal || novoTotal < 1) {
        errorMsg.textContent = 'Digite um numero valido!';
        return;
    }
    
    TOTAL_CASAS = novoTotal;
    totalCasasJogo = novoTotal;
    errorMsg.textContent = 'Total atualizado!';
    
    setTimeout(function() {
        criarTabuleiro();
        document.getElementById('adminModal').classList.remove('show');
    }, 1000);
}

function resetarTodosDados() {
    if (confirm('Tem certeza? Isso apagara TODOS os dados!')) {
        casinhas.forEach(function(casa) { 
            casa.paga = false; 
        });
        
        atualizarProgresso();
        inicializarTrilha();
        salvarCasasNoFirebase();
        document.getElementById('adminModal').classList.remove('show');
    }
}

// ===== UI =====
function mostrarTela(telaId) {
    var telas = document.querySelectorAll('.screen');
    telas.forEach(function(screen) {
        screen.classList.remove('active');
    });
    document.getElementById(telaId).classList.add('active');
}

// ===== FUNÇÕES GLOBAIS =====
function fecharCelebracao() {
    document.getElementById('celebrationModal').classList.remove('show');
}

function mostrarCarregamento() {
    console.log('Carregando...');
}

function esconderCarregamento() {
    console.log('Carregamento concluido');
}

function mostrarMensagem3D(casa) {
    console.log('Casa clicada:', casa.numero);
}

function mostrarMilestone(casasAbertas) {
    console.log('Milestone: ' + casasAbertas + ' casas abertas!');
}

function mostrarToastProgresso(casasAbertas, totalCasas, totalBancado) {
    console.log('Progresso: ' + casasAbertas + '/' + totalCasas + ' - R$ ' + totalBancado.toFixed(2));
}

function vibraTabuleiro() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function mostrarVitoria(totalBancado) {
    var modal = document.getElementById('celebrationModal');
    if (modal) {
        document.getElementById('celebrationMessage').textContent = 'Parabens! Voce economizou R$ ' + totalBancado.toFixed(2) + '!';
        modal.classList.add('show');
    }
}

function tocarSomClick() {
    console.log('Som de click');
}

function tocarSomVitoria() {
    console.log('Som de vitoria');
}

window.fecharCelebracao = fecharCelebracao;
