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
    console.log('✅ DOMContentLoaded disparado');
    console.log('📋 Buscando elementos do DOM...');
    
    var loginBtn = document.getElementById('loginBtn');
    var registerBtn = document.getElementById('registerBtn');
    
    console.log('🔘 loginBtn encontrado:', loginBtn);
    console.log('🔘 registerBtn encontrado:', registerBtn);
    
    if (!loginBtn) {
        console.error('❌ ERRO: Botão loginBtn não encontrado!');
    }
    if (!registerBtn) {
        console.error('❌ ERRO: Botão registerBtn não encontrado!');
    }
    
    inicializarEventos();
    
    console.log('📡 Configurando Firebase listener...');
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log('✅ Usuário logado: ' + user.email);
            usuarioLogado = user;
            carregarDadosUsuario();
        } else {
            console.log('❌ Nenhum usuário logado');
            mostrarTela('loginScreen');
        }
    });
});

function inicializarEventos() {
    console.log('🎯 Inicializando eventos...');
    
    var loginBtn = document.getElementById('loginBtn');
    var registerBtn = document.getElementById('registerBtn');
    var logoutBtn = document.getElementById('logoutBtn');
    
    if (loginBtn) {
        console.log('➕ Adicionando evento ao loginBtn');
        loginBtn.addEventListener('click', function(e) {
            console.log('🔐 Clique no botão ENTRAR');
            e.preventDefault();
            fazerLogin();
        });
    } else {
        console.error('❌ loginBtn não encontrado para adicionar evento!');
    }
    
    if (registerBtn) {
        console.log('➕ Adicionando evento ao registerBtn');
        registerBtn.addEventListener('click', function(e) {
            console.log('📝 Clique no botão CRIAR CONTA');
            e.preventDefault();
            fazerRegistro();
        });
    } else {
        console.error('❌ registerBtn não encontrado para adicionar evento!');
    }
    
    if (logoutBtn) {
        console.log('➕ Adicionando evento ao logoutBtn');
        logoutBtn.addEventListener('click', fazerLogout);
    }
    
    document.querySelectorAll('.character-card').forEach(function(card) {
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
    if (verifyAdminBtn) {
        verifyAdminBtn.addEventListener('click', verificarAdminPassword);
    }
    
    var updateTotalBtn = document.getElementById('updateTotalBtn');
    if (updateTotalBtn) {
        updateTotalBtn.addEventListener('click', atualizarTotalCasas);
    }
    
    var resetAllBtn = document.getElementById('resetAllBtn');
    if (resetAllBtn) {
        resetAllBtn.addEventListener('click', resetarTodosDados);
    }
    
    console.log('✅ Eventos inicializados');
}

// ===== AUTENTICAÇÃO =====
function fazerLogin() {
    console.log('═══════════════════════════════════════');
    console.log('🔐 FUNÇÃO FAZER LOGIN CHAMADA');
    console.log('═══════════════════════════════════════');
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    console.log('📧 Email: ' + email);
    console.log('🔑 Senha: ' + (password ? '***' : 'vazia'));

    if (!email || !password) {
        console.error('❌ Email ou senha vazios!');
        errorMsg.textContent = 'Preencha email e senha!';
        return;
    }

    console.log('📡 Enviando credenciais ao Firebase...');
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(result) {
            console.log('✅ LOGIN BEM-SUCEDIDO!');
            console.log('👤 Usuário: ' + result.user.email);
            errorMsg.textContent = '';
        })
        .catch(function(error) {
            console.error('❌ ERRO DE LOGIN:');
            console.error('Código: ' + error.code);
            console.error('Mensagem: ' + error.message);
            errorMsg.textContent = 'Erro: ' + error.message;
        });
}

function fazerRegistro() {
    console.log('═══════════════════════════════════════');
    console.log('📝 FUNÇÃO FAZER REGISTRO CHAMADA');
    console.log('═══════════════════════════════════════');
    
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var errorMsg = document.getElementById('loginError');

    console.log('📧 Email: ' + email);
    console.log('🔑 Senha: ' + (password ? '***' : 'vazia'));

    if (!email || !password) {
        errorMsg.textContent = 'Preencha email e senha!';
        return;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Senha deve ter pelo menos 6 caracteres!';
        return;
    }

    console.log('📡 Criando conta no Firebase...');

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(result) {
            console.log('✅ CONTA CRIADA COM SUCESSO!');
            console.log('👤 Usuário: ' + result.user.email);
            errorMsg.textContent = 'Conta criada! Faca login agora.';
            setTimeout(function() {
                document.getElementById('loginBtn').click();
            }, 2000);
        })
        .catch(function(error) {
            console.error('❌ ERRO DE REGISTRO:');
            console.error('Código: ' + error.code);
            console.error('Mensagem: ' + error.message);
            errorMsg.textContent = 'Erro: ' + error.message;
        });
}

function fazerLogout() {
    console.log('🚪 Fazendo logout...');
    firebase.auth().signOut().then(function() {
        usuarioLogado = null;
        casinhas = [];
        mostrarTela('loginScreen');
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        console.log('✅ Logout realizado');
    });
}

// ===== DADOS DO USUÁRIO =====
function carregarDadosUsuario() {
    console.log('⏳ Carregando dados do usuário...');
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
                console.log('📋 Documento não existe, mostrando seleção de caractere');
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
    console.log('🎮 Criando tabuleiro com ' + TOTAL_CASAS + ' casas...');
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

    console.log('✅ Tabuleiro criado com ' + casinhas.length + ' casas');
    console.log('🎯 Chamando inicializarTrilha...');
    
    if (typeof inicializarTrilha !== 'function') {
        console.error('❌ inicializarTrilha NÃO É UMA FUNÇÃO!');
        return;
    }
    
    inicializarTrilha();
    atualizarProgresso();
    esconderCarregamento();
    console.log("✅ Trilha do jogo criada!");
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

// ===== ATUALIZAR PROGRESSO COM META DINÂMICA =====
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
    
    // ===== ATUALIZAR META DINÂMICA =====
    var metaTotal = TOTAL_CASAS * VALOR_CASINHA;
    var metaValor = document.getElementById('metaValor');
    if (metaValor) {
        metaValor.textContent = 'R$ ' + metaTotal.toFixed(2).replace('.', ',');
    }
    
    // ===== ATUALIZAR TOTAL DE CASINHAS NO RODAPÉ =====
    var casasAbertasBottom = document.getElementById('casasAbertasBottom');
    if (casasAbertasBottom) {
        casasAbertasBottom.textContent = casasAbertas;
    }
    
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
    errorMsg.textContent = 'Total atualizado para ' + novoTotal + ' casinhas!';
    
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
    console.log('📺 Mostrando tela: ' + telaId);
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
    console.log('⏳ Carregando...');
}

function esconderCarregamento() {
    console.log('✅ Carregamento concluido');
}

function mostrarMilestone(casasAbertas) {
    console.log('🎉 Milestone: ' + casasAbertas + ' casas abertas!');
}

function mostrarToastProgresso(casasAbertas, totalCasas, totalBancado) {
    console.log('📊 Progresso: ' + casasAbertas + '/' + totalCasas + ' - R$ ' + totalBancado.toFixed(2));
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
    console.log('🔊 Som de click');
}

function tocarSomVitoria() {
    console.log('🔊 Som de vitoria');
}

function mostrarValorMetaFlutuante() {
    var casasCompletas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasCompletas++;
    });

    var totalBancado = casasCompletas * VALOR_CASINHA;
    var percentual = Math.round((casasCompletas / TOTAL_CASAS) * 100);

    var valorDisplay = document.getElementById('valorDisplay');
    if (valorDisplay) {
        valorDisplay.innerHTML = `
            <span class="valor-icon">💰</span>
            <span class="valor-text">R$ <strong id="valorNumero">${totalBancado.toFixed(2)}</strong></span>
            <span class="valor-porcentagem">${percentual}%</span>
        `;
    }

    var headerPercentage = document.getElementById('headerPercentage');
    if (headerPercentage) {
        headerPercentage.textContent = percentual + '%';
    }

    var headerProgressFill = document.getElementById('headerProgressFill');
    if (headerProgressFill) {
        headerProgressFill.style.width = percentual + '%';
    }
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.fecharCelebracao = fecharCelebracao;
window.criarTabuleiro = criarTabuleiro;
window.verificarFogosDeArtificio = verificarFogosDeArtificio;
window.verificarMetaAtingida = verificarMetaAtingida;
window.atualizarProgresso = atualizarProgresso;
window.salvarCasasNoFirebase = salvarCasasNoFirebase;
window.mostrarMilestone = mostrarMilestone;
window.tocarSomClick = tocarSomClick;
window.tocarSomVitoria = tocarSomVitoria;
window.mostrarValorMetaFlutuante = mostrarValorMetaFlutuante;

console.log('✅ script.js carregado com sucesso!');
