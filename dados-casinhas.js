// ===== DADOS DAS CASINHAS COM MENSAGENS =====

function obterMensagem(numero) {
    const mensagens = {
        // Casinhas de 1-20: Educação
        1: { emoji: '🎓', texto: 'Estude programação' },
        2: { emoji: '📚', texto: 'Leia um livro' },
        3: { emoji: '💻', texto: 'Faça um curso online' },
        4: { emoji: '🧠', texto: 'Aprenda algo novo' },
        5: { emoji: '🎯', texto: 'Complete um projeto' },
        6: { emoji: '🏆', texto: 'Ganhe um certificado' },
        7: { emoji: '📖', texto: 'Leia documentação' },
        8: { emoji: '🔬', texto: 'Experimente tecnologia' },
        9: { emoji: '🎨', texto: 'Design criativo' },
        10: { emoji: '✍️', texto: 'Escreva um blog' },
        
        // Casinhas de 21-40: Saúde
        11: { emoji: '🏃', texto: 'Faça exercício' },
        12: { emoji: '🥗', texto: 'Coma saudável' },
        13: { emoji: '💪', texto: 'Musculação' },
        14: { emoji: '🧘', texto: 'Meditação' },
        15: { emoji: '🏊', texto: 'Natação' },
        16: { emoji: '🚴', texto: 'Ciclismo' },
        17: { emoji: '🛏️', texto: 'Durma bem' },
        18: { emoji: '🥤', texto: 'Beba água' },
        19: { emoji: '🍎', texto: 'Coma frutas' },
        20: { emoji: '❤️', texto: 'Cuide da saúde' },
        
        // Casinhas de 41-60: Trabalho
        21: { emoji: '💼', texto: 'Finalize projeto' },
        22: { emoji: '📧', texto: 'Responda emails' },
        23: { emoji: '📞', texto: 'Faça uma reunião' },
        24: { emoji: '🖊️', texto: 'Atualize portfólio' },
        25: { emoji: '💰', texto: 'Aumente renda' },
        26: { emoji: '🎓', texto: 'Aprenda skill novo' },
        27: { emoji: '🤝', texto: 'Networking' },
        28: { emoji: '📊', texto: 'Analise dados' },
        29: { emoji: '🔧', texto: 'Mantenha código' },
        30: { emoji: '🚀', texto: 'Lance feature' },
        
        // Casinhas de 61-80: Diversão
        31: { emoji: '🎮', texto: 'Jogue videogame' },
        32: { emoji: '🎬', texto: 'Assista filme' },
        33: { emoji: '🎵', texto: 'Escute música' },
        34: { emoji: '🎪', texto: 'Vá ao evento' },
        35: { emoji: '🍕', texto: 'Coma pizza' },
        36: { emoji: '🏖️', texto: 'Vá à praia' },
        37: { emoji: '🎭', texto: 'Assista peça' },
        38: { emoji: '🎨', texto: 'Faça arte' },
        39: { emoji: '📸', texto: 'Tire foto' },
        40: { emoji: '🎉', texto: 'Comemore' },
        
        // Casinhas de 81-100: Finanças
        41: { emoji: '💸', texto: 'Economize dinheiro' },
        42: { emoji: '📈', texto: 'Invista' },
        43: { emoji: '🏦', texto: 'Vá ao banco' },
        44: { emoji: '💳', texto: 'Pague contas' },
        45: { emoji: '📋', texto: 'Faça orçamento' },
        46: { emoji: '🎁', texto: 'Compre presente' },
        47: { emoji: '💎', texto: 'Gaste com moderação' },
        48: { emoji: '🤑', texto: 'Ganhe bônus' },
        49: { emoji: '💵', texto: 'Renda passiva' },
        50: { emoji: '📊', texto: 'Controle gastos' },
        
        // Casinhas de 101-120: Relacionamentos
        51: { emoji: '👨‍👩‍👧‍👦', texto: 'Tempo com família' },
        52: { emoji: '❤️', texto: 'Mostre amor' },
        53: { emoji: '🤗', texto: 'Abrace alguém' },
        54: { emoji: '☕', texto: 'Café com amigo' },
        55: { emoji: '📞', texto: 'Ligue para alguém' },
        56: { emoji: '🎁', texto: 'Dê presente' },
        57: { emoji: '🍽️', texto: 'Jante juntos' },
        58: { emoji: '👂', texto: 'Escute bem' },
        59: { emoji: '🤝', texto: 'Ajude alguém' },
        60: { emoji: '😊', texto: 'Sorria sempre' },
        
        // Casinhas de 121-140: Desenvolvimento Pessoal
        61: { emoji: '🌟', texto: 'Acredite em si' },
        62: { emoji: '📝', texto: 'Faça journal' },
        63: { emoji: '🎯', texto: 'Defina metas' },
        64: { emoji: '📚', texto: 'Leia inspiração' },
        65: { emoji: '🏅', texto: 'Celebre vitórias' },
        66: { emoji: '💪', texto: 'Supere desafios' },
        67: { emoji: '🌱', texto: 'Cresça sempre' },
        68: { emoji: '🧭', texto: 'Encontre propósito' },
        69: { emoji: '✨', texto: 'Seja melhor' },
        70: { emoji: '🎊', texto: 'Vida incrível' }
    };

    return mensagens[numero] || { emoji: '🏠', texto: 'Casa ' + numero };
}
