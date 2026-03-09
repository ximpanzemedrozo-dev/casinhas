// ===== DADOS DAS CASINHAS COM MENSAGENS ALEATÓRIAS =====

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
    const tipoDados = Math.floor(Math.random() * 100);
    
    if (tipoDados < 60) {
        // 60% mensagens de sucesso
        return MENSAGENS_SUCESSO[Math.floor(Math.random() * MENSAGENS_SUCESSO.length)];
    } else {
        // 40% curiosidades
        return CURIOSIDADES[Math.floor(Math.random() * CURIOSIDADES.length)];
    }
}

function obterMensagem(numero) {
    return { emoji: '🏠', texto: 'Casa ' + numero };
}

// ===== EXPORTAR FUNÇÕES GLOBAIS =====
window.obterMensagemAleatoria = obterMensagemAleatoria;
window.obterMensagem = obterMensagem;

console.log('✅ dados-casinhas.js carregado com sucesso!');
