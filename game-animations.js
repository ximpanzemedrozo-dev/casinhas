// ===== ANIMAÇÕES DO JOGO COM MODAL DE MENSAGEM =====

function vibraTabuleiro() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function mostrarMensagem3D(casa) {
    console.log('🎯 mostrarMensagem3D chamada para casa: ' + casa.numero);
    
    try {
        var mensagem = obterMensagemAleatoria();
        console.log('📢 Mensagem obtida: ' + mensagem.texto);
        
        // Mostrar modal com mensagem
        mostrarModalMensagem(mensagem);
    } catch (error) {
        console.error('❌ Erro ao obter mensagem:', error);
    }
}

function mostrarModalMensagem(mensagem) {
    console.log('🎨 Abrindo modal com mensagem: ' + mensagem.texto);
    
    try {
        // Verificar se modal existe
        var modal = document.getElementById('messageModal');
        
        if (!modal) {
            console.log('📦 Criando novo modal...');
            modal = document.createElement('div');
            modal.id = 'messageModal';
            modal.className = 'message-modal';
            document.body.appendChild(modal);
        }
        
        // Atualizar conteúdo
        modal.innerHTML = `
            <div class="message-content">
                <div class="message-emoji">${mensagem.emoji}</div>
                <p class="message-text">${mensagem.texto}</p>
            </div>
        `;
        
        console.log('✨ Modal criado com conteúdo');
        
        // Remover classe show se existir
        modal.classList.remove('show');
        
        // Forçar reflow para disparar animação
        void modal.offsetWidth;
        
        // Mostrar
        modal.classList.add('show');
        console.log('✅ Modal mostrado na tela!');
        
        // Esconder após 3 segundos
        setTimeout(function() {
            console.log('⏱️ Escondendo modal...');
            if (modal) {
                modal.classList.remove('show');
            }
        }, 3000);
    } catch (error) {
        console.error('❌ Erro ao mostrar modal:', error);
    }
}

function mostrarMilestone(casasAbertas) {
    console.log('🎉 Milestone: ' + casasAbertas + ' casas abertas!');
}

function mostrarToastProgresso(casasAbertas, totalCasas, totalBancado) {
    console.log('📊 Progresso: ' + casasAbertas + '/' + totalCasas + ' - R$ ' + totalBancado.toFixed(2));
}

function mostrarCarregamento() {
    console.log('⏳ Carregando...');
}

function esconderCarregamento() {
    console.log('✅ Carregamento concluído');
}

function mostrarVitoria(totalBancado) {
    console.log('🏆 VITÓRIA! Total: R$ ' + totalBancado.toFixed(2));
    var modal = document.getElementById('celebrationModal');
    if (modal) {
        document.getElementById('celebrationMessage').textContent = 'Parabens! Voce economizou R$ ' + totalBancado.toFixed(2) + '!';
        modal.classList.add('show');
    }
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.mostrarMensagem3D = mostrarMensagem3D;
window.mostrarModalMensagem = mostrarModalMensagem;
window.mostrarMilestone = mostrarMilestone;
window.mostrarToastProgresso = mostrarToastProgresso;
window.mostrarCarregamento = mostrarCarregamento;
window.esconderCarregamento = esconderCarregamento;
window.mostrarVitoria = mostrarVitoria;
window.vibraTabuleiro = vibraTabuleiro;

console.log('✅ game-animations.js carregado com sucesso!');
