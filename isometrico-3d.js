// ===== POSIÇÕES DAS CASAS EM 3D =====
const TAMANHO_CASA = 60;
const GAP = 10;

function gerarPosicoesTabuleiro(totalCasas) {
    const posicoes = [];
    const casasPorLinha = 10;
    const linhas = Math.ceil(totalCasas / casasPorLinha);
    
    const larguraTabuleiro = (casasPorLinha * TAMANHO_CASA) + ((casasPorLinha - 1) * GAP);
    const alturaTabuleiro = (linhas * TAMANHO_CASA) + ((linhas - 1) * GAP);
    
    const offsetX = (800 - larguraTabuleiro) / 2;
    const offsetY = (450 - alturaTabuleiro) / 2;
    
    for (let i = 0; i < totalCasas; i++) {
        const linha = Math.floor(i / casasPorLinha);
        const coluna = i % casasPorLinha;
        
        const x = offsetX + (coluna * (TAMANHO_CASA + GAP));
        const y = offsetY + (linha * (TAMANHO_CASA + GAP));
        
        posicoes.push({ x, y });
    }
    
    return posicoes;
}

// ===== CRIAR TABULEIRO 3D =====
function criarTabuleiro3D(totalCasas, container) {
    const posicoes = gerarPosicoesTabuleiro(totalCasas);
    const tabuleiroDiv = document.createElement('div');
    tabuleiroDiv.className = 'tabuleiro-isometrico';
    
    for (let i = 0; i < totalCasas; i++) {
        const casa = document.createElement('div');
        casa.className = 'casa-3d grupo-' + (Math.floor(i / 50) % 8);
        casa.setAttribute('data-index', i);
        casa.setAttribute('data-numero', i + 1);
        
        const pos = posicoes[i];
        casa.style.left = pos.x + 'px';
        casa.style.top = pos.y + 'px';
        
        const inner = document.createElement('div');
        inner.className = 'casa-3d-inner';
        
        const frente = document.createElement('div');
        frente.className = 'casa-face casa-frente';
        frente.innerHTML = `
            <div class="casa-icone">${obterMensagem(i + 1).emoji}</div>
            <div class="casa-numero">#${i + 1}</div>
            <div class="casa-valor">R$ ${(2.50).toFixed(2)}</div>
        `;
        
        const atras = document.createElement('div');
        atras.className = 'casa-face casa-atras';
        atras.innerHTML = `
            <div class="casa-icone">${obterMensagem(i + 1).emoji}</div>
            <div class="casa-numero">#${i + 1}</div>
            <div class="casa-valor">R$ ${(2.50).toFixed(2)}</div>
        `;
        
        inner.appendChild(frente);
        inner.appendChild(atras);
        casa.appendChild(inner);
        
        casa.addEventListener('click', function() {
            clicarCasa3D(i);
        });
        
        tabuleiroDiv.appendChild(casa);
    }
    
    container.innerHTML = '';
    container.appendChild(tabuleiroDiv);
}

// ===== CLICAR NA CASA =====
let clicarCasa3DGlobal = null;

function clicarCasa3D(index) {
    const casa = casinhas[index];
    casa.paga = !casa.paga;
    
    const casaEl = document.querySelector('[data-index="' + index + '"]');
    
    if (casa.paga) {
        casaEl.classList.add('flip');
        mostrarMensagem3D(casa);
        verificarFogosDeArtificio();
        verificarMetaAtingida();
    } else {
        casaEl.classList.remove('flip');
    }
    
    atualizarProgresso();
    salvarCasasNoFirebase();
}

// ===== MOSTRAR MENSAGEM 3D =====
function mostrarMensagem3D(casa) {
    const popup = document.createElement('div');
    popup.className = 'mensagem-popup';
    popup.innerHTML = `
        <div class="mensagem-icone">${casa.mensagem.emoji}</div>
        <div class="mensagem-titulo">Casa #<span class="mensagem-numero">${casa.numero}</span></div>
        <div class="mensagem-texto">${casa.mensagem.mensagem}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Confete pequeno
    for (let i = 0; i < 20; i++) {
        confetti({
            particleCount: 5,
            spread: 60,
            origin: { x: 0.5, y: 0.3 }
        });
    }
    
    // Som
    tocarSomMensagem();
    
    // Fechar após 3 segundos
    setTimeout(function() {
        popup.classList.add('saindo');
        setTimeout(function() {
            popup.remove();
        }, 500);
    }, 3000);
}

function tocarSomMensagem() {
    try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var notas = [523, 659, 784]; // Do, Mi, Sol
        
        notas.forEach(function(freq, idx) {
            setTimeout(function() {
                var oscillator = audioContext.createOscillator();
                var gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.15);
            }, idx * 150);
        });
    } catch (e) {
        console.log('Som não disponível');
    }
}

// ===== ATUALIZAR VISUAL 3D =====
function atualizarTabuleiro3D() {
    casinhas.forEach(function(casa, index) {
        const casaEl = document.querySelector('[data-index="' + index + '"]');
        if (casaEl) {
            if (casa.paga) {
                casaEl.classList.add('flip');
            } else {
                casaEl.classList.remove('flip');
            }
        }
    });
}

// ===== CARREGAR CASAS DO FIREBASE E ATUALIZAR 3D =====
function carregarCasasDoFirebase3D() {
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

                atualizarTabuleiro3D();
                atualizarProgresso();
            }
        })
        .catch(function(error) {
            console.error('Erro ao carregar:', error);
        });
}

window.clicarCasa3D = clicarCasa3D;
