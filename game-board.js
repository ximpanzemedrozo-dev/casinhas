// ===== SISTEMA DE TRILHA 3D COM 400 HEXÁGONOS + TOUCH =====

let posicaoAtual = 0;
let totalCasasJogo = 400;

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
    const largura = container.offsetWidth || 1200;
    const altura = container.offsetHeight || 600;
    
    // Grid OTIMIZADO: 50 casas por "página"
    // 10 colunas x 5 linhas = 50 casas por tela
    // Total 8 telas para 400 casas
    
    const tamanhoHex = 60;
    const espacoX = 70;
    const espacoY = 90;
    
    const colunasPerTela = 10;
    const linhasPerTela = 5;
    const casasPerTela = colunasPerTela * linhasPerTela; // 50
    
    let hex = 0;
    let telasUsadas = 0;
    
    for (let tela = 0; tela < 8; tela++) {
        let casasNestaTela = 0;
        
        for (let row = 0; row < linhasPerTela; row++) {
            for (let col = 0; col < colunasPerTela; col++) {
                if (hex >= totalCasasJogo) break;
                if (casasNestaTela >= casasPerTela) break;
                
                // Posição X e Y dentro da tela
                const posX = col * espacoX + (row % 2 ? espacoX / 2 : 0) + 20;
                const posY = row * espacoY + 20 + (tela * altura);
                
                const casa = casinhas[hex];
                if (!casa) break;
                
                const hexContainer = document.createElement('div');
                hexContainer.className = 'hexagon-container';
                hexContainer.style.left = posX + 'px';
                hexContainer.style.top = posY + 'px';
                hexContainer.setAttribute('data-index', hex);
                
                const hexBox = document.createElement('div');
                hexBox.className = 'hexagon-box' + (casa.paga ? ' completada' : '');
                hexBox.innerHTML = `
                    <div class="hexagon-front">
                        <div class="hexagon-icone">🏠</div>
                        <div class="hexagon-numero">#${hex + 1}</div>
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
                })(hex, hexContainer, hexBox, casa);

                container.appendChild(hexContainer);
                hex++;
                casasNestaTela++;
            }
        }
        
        if (hex >= totalCasasJogo) break;
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
        
        // Fazer desaparecer com animação
        setTimeout(function() {
            if (hexContainer) {
                hexContainer.style.opacity = '0';
                hexContainer.style.transform = 'scale(0)';
                hexContainer.style.pointerEvents = 'none';
                
                // MOSTRAR MENSAGEM DEPOIS QUE SUMIR
                setTimeout(function() {
                    mostrarMensagem3D(casa);
                }, 150);
            }
        }, 300);
        
        verificarFogosDeArtificio();
        verificarMetaAtingida();
        tocarSomClick();
        
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
