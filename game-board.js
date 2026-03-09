// ===== SISTEMA DE TRILHA 3D COM HEXÁGONOS + TOUCH =====

let posicaoAtual = 0;
let totalCasasJogo = 140;

function inicializarTrilha() {
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('Elemento gameBoard nao encontrado');
        return;
    }

    gameBoard.innerHTML = '';

    // Container da trilha
    const track = document.createElement('div');
    track.className = 'game-track';
    
    // Fundo isométrico
    const trackBg = document.createElement('div');
    trackBg.className = 'track-background';
    track.appendChild(trackBg);

    // Container do caminho
    const pathContainer = document.createElement('div');
    pathContainer.className = 'path-container';

    // Personagem 3D Rosa
    const playerContainer = document.createElement('div');
    playerContainer.id = 'playerMoving';
    playerContainer.className = 'player-container';
    playerContainer.innerHTML = `
        <div class="player-character">
            👨‍💼
        </div>
        <div class="player-shadow"></div>
    `;
    pathContainer.appendChild(playerContainer);

    // Gerar hexágonos
    gerarHexagons(pathContainer);

    // Linha de progresso
    const progressLine = document.createElement('div');
    progressLine.id = 'progressLine';
    progressLine.className = 'progress-line';
    pathContainer.appendChild(progressLine);

    track.appendChild(pathContainer);
    gameBoard.appendChild(track);

    // Atualizar posição inicial
    atualizarPosicaoPersonagem();
}

function gerarHexagons(container) {
    const largura = container.offsetWidth || 800;
    const altura = container.offsetHeight || 500;
    
    // Grid isométrico
    const tamanhoHex = 100;
    const espacoX = 110;
    const espacoY = 130;
    
    let hex = 0;
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 50; col++) {
            if (hex >= totalCasasJogo) break;
            
            const posX = col * espacoX + (row % 2 ? espacoX / 2 : 0);
            const posY = row * espacoY + 80;
            
            if (posX + tamanhoHex > largura) continue;
            
            const casa = casinhas[hex];
            const hexContainer = document.createElement('div');
            hexContainer.className = 'hexagon-container';
            hexContainer.style.left = posX + 'px';
            hexContainer.style.top = posY + 'px';
            hexContainer.setAttribute('data-index', hex);
            
            const hexBox = document.createElement('div');
            hexBox.className = 'hexagon-box' + (casa.paga ? ' completada' : '');
            hexBox.innerHTML = `
                <div class="hexagon-front">
                    <div class="hexagon-icone">${casa.mensagem.emoji}</div>
                    <div class="hexagon-numero">#${hex + 1}</div>
                </div>
                <div class="hexagon-shadow"></div>
            `;
            
            hexContainer.appendChild(hexBox);
            
            // ===== EVENTOS MOUSE =====
            hexContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                if (!casa.paga) {
                    clicarCasaTrilha(hex);
                }
            });

            hexContainer.addEventListener('mouseenter', function() {
                if (!casa.paga) {
                    hexBox.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                }
            });

            hexContainer.addEventListener('mouseleave', function() {
                hexBox.style.transform = '';
            });

            // ===== EVENTOS TOUCH =====
            hexContainer.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                hexBox.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                hexBox.style.touchAction = 'manipulation';
            }, { passive: true });

            hexContainer.addEventListener('touchend', function(e) {
                e.stopPropagation();
                if (!casa.paga) {
                    clicarCasaTrilha(hex);
                }
                hexBox.style.transform = '';
            }, { passive: true });

            hexContainer.addEventListener('touchmove', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });

            container.appendChild(hexContainer);
            hex++;
        }
    }
}

function clicarCasaTrilha(index) {
    var casa = casinhas[index];
    casa.paga = !casa.paga;

    var hexContainer = document.querySelector('[data-index="' + index + '"]');
    var hexBox = hexContainer.querySelector('.hexagon-box');
    
    if (casa.paga) {
        hexBox.classList.add('completada');
        hexBox.classList.add('nova-casa');
        hexContainer.classList.add('clicada');
        
        mostrarMensagem3D(casa);
        verificarFogosDeArtificio();
        verificarMetaAtingida();
        tocarSomClick();
        
        setTimeout(function() {
            hexBox.classList.remove('nova-casa');
            hexContainer.classList.remove('clicada');
        }, 600);
    } else {
        hexBox.classList.remove('completada');
    }

    atualizarProgresso();
    atualizarPosicaoPersonagem();
    salvarCasasNoFirebase();
}

function atualizarPosicaoPersonagem() {
    var casasCompletas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasCompletas++;
    });

    var playerMoving = document.getElementById('playerMoving');
    if (!playerMoving) return;

    // Encontrar posição do último hexágono completado
    var ultimoHex = document.querySelector('[data-index="' + (casasCompletas - 1) + '"]');
    
    if (ultimoHex && casasCompletas > 0) {
        var posX = ultimoHex.offsetLeft + 50;
        var posY = ultimoHex.offsetTop + 50;
        
        playerMoving.style.left = posX + 'px';
        playerMoving.style.top = posY + 'px';
    } else {
        playerMoving.style.left = '0px';
        playerMoving.style.top = '80px';
    }

    // Atualizar linha de progresso
    var progressLine = document.getElementById('progressLine');
    if (progressLine) {
        var percentualProgress = (casasCompletas / totalCasasJogo) * 100;
        progressLine.style.width = percentualProgress + '%';
    }

    posicaoAtual = casasCompletas;
}

function mostrarValorMetaFlutuante() {
    var casasCompletas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasCompletas++;
    });

    var totalBancado = casasCompletas * VALOR_CASINHA;
    var percentual = Math.round((casasCompletas / totalCasasJogo) * 100);

    // Atualizar valor flutuante
    var valorDisplay = document.getElementById('valorDisplay');
    if (valorDisplay) {
        valorDisplay.innerHTML = `
            <span class="valor-icon">💰</span>
            <span class="valor-text">R$ <strong id="valorNumero">${totalBancado.toFixed(2)}</strong></span>
            <span class="valor-porcentagem">${percentual}%</span>
        `;
    }

    // Atualizar header
    var headerPercentage = document.getElementById('headerPercentage');
    if (headerPercentage) {
        headerPercentage.textContent = percentual + '%';
    }

    var headerProgressFill = document.getElementById('headerProgressFill');
    if (headerProgressFill) {
        headerProgressFill.style.width = percentual + '%';
    }

    // Atualizar casinhas abertas
    var casasAbertasBottom = document.getElementById('casasAbertasBottom');
    if (casasAbertasBottom) {
        casasAbertasBottom.textContent = casasCompletas;
    }
}

// ===== SUPORTE A GESTOS TOUCH =====
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
}, { passive: true });

window.inicializarTrilha = inicializarTrilha;
window.atualizarPosicaoPersonagem = atualizarPosicaoPersonagem;
window.mostrarValorMetaFlutuante = mostrarValorMetaFlutuante;
