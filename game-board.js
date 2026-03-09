// ===== SISTEMA DE TRILHA 3D COM 400 HEXÁGONOS DINÂMICOS + TOUCH =====

let posicaoAtual = 0;
let totalCasasJogo = 400;
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

    // Contar casas completas
    var casasCompletas = 0;
    casinhas.forEach(function(c) {
        if (c.paga) casasCompletas++;
    });

    // LIMPAR TODOS OS HEXÁGONOS ANTIGOS
    var todosHexagons = pathContainer.querySelectorAll('.hexagon-container');
    todosHexagons.forEach(function(hex) {
        hex.remove();
    });

    var levaAtual = Math.floor(casasCompletas / 50);
    var inicioLeva = levaAtual * 50;
    var fimLeva = Math.min(inicioLeva + 50, totalCasasJogo);

    console.log('Gerando leva ' + levaAtual + ' (casas ' + inicioLeva + ' a ' + (fimLeva - 1) + ')');

    // Grid OTIMIZADO: 10 colunas x 5 linhas = 50 casas
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
                hexCont.addEventListener('touch*`

