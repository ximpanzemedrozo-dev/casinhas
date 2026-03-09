// ===== ANIMAÇÕES DO JOGO COM MODAL DE MENSAGEM =====

function vibraTabuleiro() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function mostrarMensagem3D(casa) {
    var mensagem = obterMensagemAleatoria();
    console.log('Casa completada: #' + casa.numero + ' - ' + mensagem.texto);
    
    // Mostrar modal com mensagem
    mostrarModalMensagem(mensagem);
}

function mostrarModalMensagem(mensagem) {
    // Criar modal se não existir
    var modal = document.getElementById('messageModal');
    
    if (!modal) {
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
    
    // Mostrar
    modal.classList.add('show');
    
    // Esconder após 3 segundos
    setTimeout(function() {
        modal.classList.remove('show');
    }, 3000);
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

window.mostrarMensagem3D = mostrarMensagem3D;
window.mostrarMilestone = mostrarMilestone;
window.mostrarToastProgresso = mostrarToastProgresso;
window.mostrarCarregamento = mostrarCarregamento;
window.esconderCarregamento = esconderCarregamento;
window.mostrarVitoria = mostrarVitoria;
