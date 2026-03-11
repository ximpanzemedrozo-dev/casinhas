// ===== SISTEMA DE TRILHA 3D COM HEXÁGONOS + TOUCH =====

let posicaoAtual = 0;
let totalCasasJogo = 400;

function inicializarTrilha() {
    // total dinâmico vindo do script.js (meta ÷ 2,50)
    if (typeof window.__TOTAL_CASAS_JOGO__ === 'number' && window.__TOTAL_CASAS_JOGO__ > 0) {
        totalCasasJogo = window.__TOTAL_CASAS_JOGO__;
    }

    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('Elemento gameBoard nao encontrado');
        return;
    }

    gameBoard.innerHTML = '';

    const track = document.createElement('div');
    track.className = 'game-track';

    const trackBg = document.createElement('div');
    trackBg.className = 'track-background';
    track.appendChild(trackBg);

    const pathContainer = document.createElement('div');
    pathContainer.className = 'path-container';

    const playerContainer = document.createElement('div');
    playerContainer.id = 'playerMoving';
    playerContainer.className = 'player-container';
    playerContainer.innerHTML = `
        <div class="player-character">👨</div>
        <div class="player-shadow"></div>
    `;
    pathContainer.appendChild(playerContainer);

    gerarHexagons(pathContainer);

    const progressLine = document.createElement('div');
    progressLine.id = 'progressLine';
    progressLine.className = 'progress-line';
    pathContainer.appendChild(progressLine);

    track.appendChild(pathContainer);
    gameBoard.appendChild(track);

    atualizarPosicaoPersonagem();

    // atualiza UI do topo/rodapé se existir
    if (typeof window.atualizarUIBasica === 'function') {
        window.atualizarUIBasica();
    }
}

function gerarHexagons(container) {
    const altura = container.offsetHeight || 600;

    const espacoX = 70;
    const espacoY = 90;

    const colunasPerTela = 10;
    const linhasPerTela = 5;
    const casasPerTela = colunasPerTela * linhasPerTela;

    let hex = 0;
    const totalTelas = Math.ceil(totalCasasJogo / casasPerTela);

    for (let tela = 0; tela < totalTelas; tela++) {
        let casasNestaTela = 0;

        for (let row = 0; row < linhasPerTela; row++) {
            for (let col = 0; col < colunasPerTela; col++) {
                if (hex >= totalCasasJogo) break;
                if (casasNestaTela >= casasPerTela) break;

                const posX = col * espacoX + (row % 2 ? espacoX / 2 : 0) + 20;
                const posY = row * espacoY + 20 + (tela * altura);

                const casa = (window.casinhas || [])[hex];
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

                (function(index, hexCont, hexB, c) {
                    hexCont.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (!c.paga) clicarCasaTrilha(index);
                    });

                    hexCont.addEventListener('mouseenter', function() {
                        if (!c.paga) hexB.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                    });

                    hexCont.addEventListener('mouseleave', function() {
                        hexB.style.transform = '';
                    });

                    hexCont.addEventListener('touchstart', function(e) {
                        e.stopPropagation();
                        hexB.style.transform = 'rotateY(15deg) rotateX(10deg) scale(1.15)';
                    }, { passive: true });

                    hexCont.addEventListener('touchend', function(e) {
                        e.stopPropagation();
                        if (!c.paga) clicarCasaTrilha(index);
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
    var casa = (window.casinhas || [])[index];
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

        setTimeout(function() {
            if (hexContainer) {
                hexContainer.style.opacity = '0';
                hexContainer.style.transform = 'scale(0)';
                hexContainer.style.pointerEvents = 'none';

                setTimeout(function() {
                    if (typeof window.mostrarMensagem3D === 'function') window.mostrarMensagem3D(casa);
                }, 150);
            }
        }, 300);

        if (typeof window.tocarSomClick === 'function') window.tocarSomClick();
        if (typeof window.verificarFogosDeArtificio === 'function') window.verificarFogosDeArtificio();
        if (typeof window.verificarMetaAtingida === 'function') window.verificarMetaAtingida();

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

    if (typeof window.atualizarUIBasica === 'function') window.atualizarUIBasica();
    atualizarPosicaoPersonagem();

    if (typeof window.atualizarProgresso === 'function') window.atualizarProgresso();
    if (typeof window.salvarCasasNoFirebase === 'function') window.salvarCasasNoFirebase();
}

function atualizarPosicaoPersonagem() {
    var casasCompletas = 0;
    (window.casinhas || []).forEach(function(c) {
        if (c && c.paga) casasCompletas++;
    });

    var playerMoving = document.getElementById('playerMoving');
    if (!playerMoving) return;

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

    var progressLine = document.getElementById('progressLine');
    if (progressLine) {
        var percentualProgress = (casasCompletas / totalCasasJogo) * 100;
        progressLine.style.width = percentualProgress + '%';
    }

    posicaoAtual = casasCompletas;
}

window.inicializarTrilha = inicializarTrilha;
window.atualizarPosicaoPersonagem = atualizarPosicaoPersonagem;
