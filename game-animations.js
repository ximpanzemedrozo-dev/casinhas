// ===== DADOS E ANIMAÇÕES DO JOGO =====

console.log('🎬 Inicializando game-animations.js');

// ===== MENSAGENS =====
const MENSAGENS_SUCESSO = [
    { emoji: '💰', texto: 'Parabéns! Você economizou R$ 2,50!' },
    { emoji: '🎯', texto: 'Ótimo! Você está no caminho certo!' },
    { emoji: '⭐', texto: 'Excelente! Continue economizando!' },
    { emoji: '🏆', texto: 'Incrível! Você é um mestre da economia!' },
    { emoji: '🚀', texto: 'Fantástico! Sua meta está perto!' },
    { emoji: '💎', texto: 'Magnífico! Você é especial!' },
    { emoji: '✨', texto: 'Sensacional! Você brilha como uma estrela!' },
    { emoji: '🎉', texto: 'Que legal! Parabéns pela sua dedicação!' },
    { emoji: '❤️', texto: 'Que amor! Você se ama economizando!' },
    { emoji: '🌟', texto: 'Brilhante! Você está crescendo!' },
    { emoji: '🎊', texto: 'Celebre! Cada pequeno passo importa!' },
    { emoji: '🏅', texto: 'Medalha! Você merece essa vitória!' },
    { emoji: '🔥', texto: 'Demais! Você está pegando fogo!' },
    { emoji: '💪', texto: 'Forte! Sua força é inspiradora!' },
    { emoji: '🌈', texto: 'Colorido! Seu futuro é brilhante!' },
    { emoji: '🎁', texto: 'Presente! Você se dá um presente!' },
    { emoji: '👏', texto: 'Bravo! Merecia de pé!' },
    { emoji: '🌻', texto: 'Flor! Você desabrocha cada dia!' },
    { emoji: '🦋', texto: 'Borboleta! Você voa cada vez mais alto!' },
    { emoji: '🌙', texto: 'Lua! Você brilha à noite também!' }
];

const CURIOSIDADES = [
    { emoji: '📊', texto: 'Sabia? Economizar R$ 2,50/dia = R$ 75/mês!' },
    { emoji: '💡', texto: 'Dica: Pequenas economias viram grandes fortunas!' },
    { emoji: '🎓', texto: 'Fato: 90% dos milionários começaram economizando!' },
    { emoji: '📈', texto: 'Estatística: Economias crescem com juros compostos!' },
    { emoji: '🌍', texto: 'Global: Bilionários também economizam no começo!' },
    { emoji: '⏰', texto: 'Tempo: 1 ano = R$ 912,50 economizados!' },
    { emoji: '🎯', texto: 'Meta: Em 2 meses você terá R$ 150!' },
    { emoji: '💳', texto: 'Smart: Cartão de débito controla gastos!' },
    { emoji: '📱', texto: 'App: Use apps para rastrear economias!' },
    { emoji: '🏦', texto: 'Banco: Abra poupança para multiplicar!' },
    { emoji: '🚗', texto: 'Sonho: Em 1 ano compra pneus pro carro!' },
    { emoji: '🎮', texto: 'Diversão: Economizar é como um jogo!' },
    { emoji: '🍕', texto: 'Pizza: 1 pizza custa 7 economias suas!' },
    { emoji: '☕', texto: 'Café: Café de casa = 10x mais economia!' },
    { emoji: '📚', texto: 'Conhecimento: Leia sobre finanças pessoais!' },
    { emoji: '🏠', texto: 'Casa: Economias são tijolos da sua casa!' },
    { emoji: '🎬', texto: 'Cinema: Assistir em casa = mais economia!' },
    { emoji: '🚴', texto: 'Saúde: Bicicleta = economia + exercício!' },
    { emoji: '🌱', texto: 'Crescimento: Você está plantando sementes!' },
    { emoji: '🎪', texto: 'Liberdade: Economia = liberdade financeira!' }
];

function obterMensagemAleatoria() {
    console.log('🎲 Gerando mensagem aleatória...');
    const tipoDados = Math.floor(Math.random() * 100);
    
    let mensagem;
    if (tipoDados < 60) {
        mensagem = MENSAGENS_SUCESSO[Math.floor(Math.random() * MENSAGENS_SUCESSO.length)];
    } else {
        mensagem = CURIOSIDADES[Math.floor(Math.random() * CURIOSIDADES.length)];
    }
    
    console.log('✅ Mensagem gerada: ' + mensagem.emoji + ' ' + mensagem.texto);
    return mensagem;
}

// ===== ANIMAÇÕES =====

function vibraTabuleiro() {
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function mostrarMensagem3D(casa) {
    console.log('═══════════════════════════════════════');
    console.log('🎯 MOSTRAR MENSAGEM CHAMADA');
    console.log('Casa: ' + casa.numero);
    console.log('═══════════════════════════════════════');
    
    try {
        var mensagem = obterMensagemAleatoria();
        console.log('📢 Mensagem obtida: ' + JSON.stringify(mensagem));
        
        mostrarModalMensagem(mensagem);
        
    } catch (error) {
        console.error('❌ ERRO em mostrarMensagem3D:');
        console.error(error);
    }
}

function mostrarModalMensagem(mensagem) {
    console.log('═══════════════════════════════════════');
    console.log('🎨 MOSTRAR MODAL CHAMADO');
    console.log('Mensagem: ' + mensagem.texto);
    console.log('═══════════════════════════════════════');
    
    try {
        var modal = document.getElementById('messageModal');
        
        if (!modal) {
            console.log('📦 Modal não existe, criando...');
            modal = document.createElement('div');
            modal.id = 'messageModal';
            modal.className = 'message-modal';
            document.body.appendChild(modal);
            console.log('✅ Modal criado');
        }
        
        // Criar conteúdo
        var content = `
            <div class="message-content">
                <div class="message-emoji">${mensagem.emoji}</div>
                <p class="message-text">${mensagem.texto}</p>
            </div>
        `;
        
        modal.innerHTML = content;
        console.log('✅ Conteúdo inserido no modal');
        
        // Remover classe show
        modal.classList.remove('show');
        
        // Forçar reflow
        void modal.offsetWidth;
        
        // Adicionar classe show
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
        console.error('❌ ERRO em mostrarModalMensagem:');
        console.error(error);
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
window.obterMensagemAleatoria = obterMensagemAleatoria;
window.mostrarMensagem3D = mostrarMensagem3D;
window.mostrarModalMensagem = mostrarModalMensagem;
window.mostrarMilestone = mostrarMilestone;
window.mostrarToastProgresso = mostrarToastProgresso;
window.mostrarCarregamento = mostrarCarregamento;
window.esconderCarregamento = esconderCarregamento;
window.mostrarVitoria = mostrarVitoria;
window.vibraTabuleiro = vibraTabuleiro;

console.log('🎬 game-animations.js carregado com tudo funcionando!');
