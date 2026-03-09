// ===== SISTEMA DE TRILHA 3D COM 400 HEXÁGONOS DINÂMICOS + TOUCH =====

let posicaoAtual = 0;
let totalCasasJogo = 400;
let casasVisiveis = {};
let ultimaCasaMostrada = -1;

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
    pathContainer.id = 'pathContainer';

    // Personagem 3D BRANCO com CABELO PRETO
    const playerContainer = document.createElement('div');
    playerContainer.id = 'playerMoving';
    playerContainer.className = 'player-container';
    playerContainer.innerHTML = `
        <div class="player-character">
            👨
        </div>
        <div class="player-shadow"></div>
    `;
    pathContainer.appendChild(playerContainer);

    // Linha de progresso
    const progressLine = document.createElement('div');
    progressLine.id = 'progressLine';
    progressLine.className = 'progress-line';
    pathContainer.appendChild(progressLine);

    track.appendChild(pathContainer);
    gameBoard.appendChild(track);

    // Gerar primeira leva de 50 casinhas
    gerarProximasHexagons();

    // Atualizar posição inicial
    atualizarPosicaoPersonagem();
}

function gerarProximasHexagons() {
    const pathContainer = document.getElementById('pathContainer');
    if (!pathContainer) return;

    // Limpar casas visíveis antigas
    Object.keys(casasVisiveis).forEach(function(key) {
        var elemento = document.querySelector('[data-index="' + key + '"]');
        if (elemento) {
            elemento.remove();
        }
    });
    casasVisiveis = {};

    // Determinar qual leva gerar (0-49, 50-99, 100-149, etc)
    var casasCompletas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasCompletas++;
    });

    var levaAtual = Math.floor(casasCompletas / 50);
    var inicioLeva = levaAtual * 50;
    var fimLeva = Math.min(inicioLeva + 50, totalCasasJogo);

    // Grid OTIMIZADO: 10 colunas x 5 linhas = 50 casas
    const tamanhoHex = 60;
    const espacoX = 70;
    const espacoY = 90;
    
    const colunasPerTela = 10;
    const linhasPerTela = 5;
    
    let hexNaTela = 0;
    
    for (let row = 0; row < linhasPerTela; row++) {
        for (let col = 0; col < colunasPerTela; col++) {
            var indiceGlobal = inicioLeva + hexNaTela;
            
            if (indiceGlobal >= fimLeva) break;
            if (indiceGlobal >= totalCasasJogo) break;
            
            // Posição na tela
            const posX = col * espacoX + (row % 2 ? espacoX / 2 : 0) + 20;
            const posY = row * espacoY + 20;
            
            const casa = casinhas[indiceGlobal];
            if (!casa) break;
            
            const hexContainer = document.createElement('div');
            hexContainer.className = 'hexagon-container';
            hexContainer.style.left = posX + 'px';
            hexContainer.style.top = posY + 'px';
            hexContainer.setAttribute('data-index', indiceGlobal);
            
            const hexBox = document.createElement('div');
            hexBox.className = 'hexagon-box' + (casa.paga ? ' completada' : '');
            hexBox.innerHTML = `
                <div class="hexagon-front">
                    <div class="hexagon-icone">🏠</div>
                    <div class="hexagon-numero">#${indiceGlobal + 1}</div>
                </div>
                <div class="hexagon-shadow"></div>
            `;
            
            hexContainer.appendChild(hexBox);
            
            // ===== CRIAR CLOSURE PARA CAPTURAR VALORES =====
            (function(index, hexCont, hexB, c) {
                // ===== EVENTOS MOUSE =====
                hexCont.addEventListener('click', function(e) {
                    e.stopPropagation();
                    if (!c.paga) {
                        clicarCasaTrilha(index);
                    }
                });

                hexCont.addEventListener('mouseenter', function() {
                    if (!c.paga) {
                        hexB.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                    }
                });

                hexCont.addEventListener('mouseleave', function() {
                    hexB.style.transform = '';
                });

                // ===== EVENTOS TOUCH =====
                hexCont.addEventListener('touchstart', function(e) {
                    e.stopPropagation();
                    hexB.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                }, { passive: true });

                hexCont.addEventListener('touchend', function(e) {
                    e.stopPropagation();
                    if (!c.paga) {
                        clicarCasaTrilha(index);
                    }
                    hexB.style.transform = '';
                }, { passive: true });
            })(indiceGlobal, hexContainer, hexBox, casa);

            pathContainer.appendChild(hexContainer);
            casasVisiveis[indiceGlobal] = true;
            hexNaTela++;
        }
    }
}

function clicarCasaTrilha(index) {
    var casa = casinhas[index];
    if (!casa) return;
    
    casa.paga = !casa.paga;

    var hexContainer = document.querySelector('[data-index="' + index + '"]');
    if (!hexContainer) return;
    
    var hexBox = hexContainer.querySelector('.hexagon-box');
    if (!hexBox) return;
    
    if (casa.paga) {
        hexBox.classList.add('completada');
        hexBox.classList.add('nova-casa');
        hexContainer.classList.add('clicada');
        
        verificarFogosDeArtificio();
        verificarMetaAtingida();
        tocarSomClick();
        
        // AGUARDAR A ANIMAÇÃO E DEPOIS MOSTRAR MENSAGEM
        setTimeout(function() {
            if (hexContainer) {
                hexContainer.style.opacity = '0';
                hexContainer.style.transform = 'scale(0)';
                hexContainer.style.pointerEvents = 'none';
            }
        }, 300);
        
        // MOSTRAR MENSAGEM DEPOIS QUE SUMIR
        setTimeout(function() {
            mostrarMensagem3D(casa);
            
            // VERIFICAR SE PRECISA GERAR NOVA LEVA
            var casasCompletas = 0;
            casinhas.forEach(function(c) {
                if (c.paga) casasCompletas++;
            });
            
            // Se chegou em múltiplo de 50, gerar próximas casas
            if (casasCompletas % 50 === 0 && casasCompletas > 0 && casasCompletas < totalCasasJogo) {
                setTimeout(function() {
                    gerarProximasHexagons();
                    atualizarPosicaoPersonagem();
                }, 500);
            }
        }, 400);
        
        setTimeout(function() {
            hexBox.classList.remove('nova-casa');
            hexContainer.classList.remove('clicada');
        }, 600);
    } else {
        hexBox.classList.remove('completada');
        hexContainer.style.opacity = '1';
        hexContainer.style.transform = '';
        hexContainer.style.pointerEvents = 'auto';
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
    var ultimoHex = null;
    if (casasCompletas > 0) {
        ultimoHex = document.querySelector('[data-index="' + (casasCompletas - 1) + '"]');
    }
    
    if (ultimoHex && casasCompletas > 0) {
        var posX = ultimoHex.offsetLeft + 30;
        var posY = ultimoHex.offsetTop + 30;
        
        playerMoving.style.left = posX + 'px';
        playerMoving.style.top = posY + 'px';
    } else {
        playerMoving.style.left = '0px';
        playerMoving.style.top = '40px';
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

window.inicializarTrilha = inicializarTrilha;
window.atualizarPosicaoPersonagem = atualizarPosicaoPersonagem;
window.mostrarValorMetaFlutuante = mostrarValorMetaFlutuante;
