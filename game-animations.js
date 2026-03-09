// ===== ANIMAÇÕES DO GAME =====

// Tela de carregamento
function mostrarCarregamento() {
    var loading = document.getElementById('loadingScreen');
    if (!loading) {
        var div = document.createElement('div');
        div.id = 'loadingScreen';
        div.className = 'loading-screen';
        div.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">🏠</div>
                <div class="loading-text">Carregando seu jogo...</div>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    }
}

function esconderCarregamento() {
    var loading = document.getElementById('loadingScreen');
    if (loading) {
        setTimeout(function() {
            loading.classList.add('hidden');
            setTimeout(function() {
                loading.remove();
            }, 500);
        }, 1000);
    }
}

// Milestone (a cada 10 casas)
function mostrarMilestone(casasAbertas) {
    var popup = document.createElement('div');
    popup.className = 'milestone-popup';
    
    var mensagem = '';
    var icone = '🎉';
    
    if (casasAbertas === 10) {
        mensagem = 'PRIMEIRA VITÓRIA!';
        icone = '🌟';
    } else if (casasAbertas === 50) {
        mensagem = 'MEIA VIA!';
        icone = '⭐';
    } else if (casasAbertas === 100) {
        mensagem = 'METADE DA META!';
        icone = '👑';
    } else if (casasAbertas === 200) {
        mensagem = 'VOCÊ É UM CAMPEÃO!';
        icone = '🏆';
    } else {
        mensagem = 'BORA CONTINUAR!';
        icone = '🚀';
    }
    
    popup.innerHTML = `
        <div class="milestone-icone">${icone}</div>
        <div class="milestone-titulo">${casasAbertas} CASINHAS!</div>
        <div class="milestone-subtitulo">${mensagem}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Confete
    for (var i = 0; i < 10; i++) {
        confetti({
            particleCount: 15,
            spread: 100,
            origin: { x: 0.5, y: 0.3 }
        });
    }
    
    tocarSomMilestone();
    
    setTimeout(function() {
        popup.classList.add('saindo');
        setTimeout(function() {
            popup.remove();
        }, 600);
    }, 3000);
}

// Toast de progresso
function mostrarToastProgresso(casasAbertas, total, totalBancado) {
    var toast = document.createElement('div');
    toast.className = 'progress-toast';
    toast.innerHTML = `
        <div class="toast-titulo">🎯 Progresso!</div>
        <div class="toast-progresso">${casasAbertas}/${total} casinhas</div>
        <div class="toast-progresso">R$ ${totalBancado.toFixed(2)}</div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('saindo');
        setTimeout(function() {
            toast.remove();
        }, 500);
    }, 4000);
}

// Vitória Final
function mostrarVitoria(totalBancado) {
    var overlay = document.createElement('div');
    overlay.className = 'victory-overlay';
    
    overlay.innerHTML = `
        <div class="victory-content">
            <div class="victory-icon">🎊</div>
            <div class="victory-titulo">PARABÉNS!</div>
            <div class="victory-subtitulo">Você completou o jogo!</div>
            
            <div class="victory-stats">
                <div class="stat-row">💰 Total Economizado: <strong>R$ ${totalBancado.toFixed(2)}</strong></div>
                <div class="stat-row">🏆 Você é um Campeão!</div>
                <div class="stat-row">⭐ Missão Cumprida com Sucesso!</div>
            </div>
            
            <button class="victory-button" onclick="location.reload()">🎮 Jogar Novamente</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Fogos massivos
    for (var i = 0; i < 5; i++) {
        setTimeout(function() {
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { x: 0.5, y: 0.5 }
            });
        }, i * 200);
    }
    
    tocarSomVitoria();
}

// Pulso na casa
function pulsoNaCasa(index) {
    var casa = document.querySelector('[data-index="' + index + '"]');
    if (casa) {
        casa.classList.add('pulse');
        setTimeout(function() {
            casa.classList.remove('pulse');
        }, 500);
    }
}

// Vibração no tabuleiro
function vibraTabuleiro() {
    var board = document.querySelector('.tabuleiro-isometrico');
    if (board) {
        board.classList.add('shake');
        setTimeout(function() {
            board.classList.remove('shake');
        }, 400);
    }
}

window.mostrarCarregamento = mostrarCarregamento;
window.esconderCarregamento = esconderCarregamento;
window.mostrarMilestone = mostrarMilestone;
window.mostrarToastProgresso = mostrarToastProgresso;
window.mostrarVitoria = mostrarVitoria;
window.pulsoNaCasa = pulsoNaCasa;
window.vibraTabuleiro = vibraTabuleiro;
