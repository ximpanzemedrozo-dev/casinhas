// ===== SISTEMA DE TRILHA DO JOGO =====

let posicaoAtual = 0;
let totalCasasJogo = 140;

function inicializarTrilha() {
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
        console.error('Elemento gameBoard nao encontrado');
        return;
    }

    gameBoard.innerHTML = '';
    const larguraTrilha = gameBoard.offsetWidth - 100;
    const espacoPorCasa = larguraTrilha / totalCasasJogo;

    // Container da trilha
    const track = document.createElement('div');
    track.className = 'game-track';
    
    // Fundo da trilha
    const trackBg = document.createElement('div');
    trackBg.className = 'track-background';
    track.appendChild(trackBg);

    // Personagem
    const playerContainer = document.createElement('div');
    playerContainer.id = 'playerMoving';
    playerContainer.className = 'player-container';
    playerContainer.innerHTML = `
        <div class="player-character">
            ${CARACTERES[caracterSelecionado].emoji}
        </div>
        <div class="player-shadow"></div>
    `;
    track.appendChild(playerContainer);

    // Fade da trilha
    const fade = document.createElement('div');
    fade.id = 'trackFade';
    fade.className = 'track-fade';
    track.appendChild(fade);

    // Casas clicaveis
    casinhas.forEach(function(casa, index) {
        const posX = (index * espacoPorCasa) + 50;
        
        const houseDiv = document.createElement('div');
        houseDiv.className = 'house-clickable';
        houseDiv.style.left = posX + 'px';
        houseDiv.setAttribute('data-index', index);
        
        const houseBox = document.createElement('div');
        houseBox.className = 'house-box' + (casa.paga ? ' completada' : '');
        houseBox.innerHTML = `
            <div class="house-icone">${casa.mensagem.emoji}</div>
            <div class="house-numero">#${index + 1}</div>
        `;
        
        houseDiv.appendChild(houseBox);
        houseDiv.addEventListener('click', function() {
            if (!casa.paga) {
                clicarCasaTrilha(index);
            }
        });
        
        track.appendChild(houseDiv);
    });

    gameBoard.appendChild(track);

    // Atualizar posicao do personagem
    atualizarPosicaoPersonagem();
}

function clicarCasaTrilha(index) {
    var casa = casinhas[index];
    casa.paga = !casa.paga;

    var houseBox = document.querySelector('[data-index="' + index + '"] .house-box');
    
    if (casa.paga) {
        houseBox.classList.add('completada');
        mostrarMensagem3D(casa);
        verificarFogosDeArtificio();
        verificarMetaAtingida();
        tocarSomClick();
    } else {
        houseBox.classList.remove('completada');
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

    var gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) return;

    var larguraTrilha = gameBoard.offsetWidth - 100;
    var espacoPorCasa = larguraTrilha / totalCasasJogo;
    var novaPosicao = (casasCompletas * espacoPorCasa) + 10;

    var playerMoving = document.getElementById('playerMoving');
    if (playerMoving) {
        playerMoving.style.left = novaPosicao + 'px';
    }

    // Atualizar fade
    var trackFade = document.getElementById('trackFade');
    if (trackFade) {
        var percentualCaminho = (casasCompletas / totalCasasJogo) * 100;
        trackFade.style.width = percentualCaminho + '%';
    }

    // Atualizar progresso track
    var progressFill = document.querySelector('.progress-track-fill');
    if (progressFill) {
        var percentualProgress = (casasCompletas / totalCasasJogo) * 100;
        progressFill.style.width = percentualProgress + '%';
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

    var valorMetaEl = document.getElementById('valorMeta');
    if (valorMetaEl) {
        valorMetaEl.innerHTML = 'R$ <span class="valor-numero">' + totalBancado.toFixed(2) + '</span> | ' + percentual + '%';
    }
}

window.inicializarTrilha = inicializarTrilha;
window.atualizarPosicaoPersonagem = atualizarPosicaoPersonagem;
window.mostrarValorMetaFlutuante = mostrarValorMetaFlutuante;
