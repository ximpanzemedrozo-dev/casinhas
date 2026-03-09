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
            })(indiceGlobal, hexContainer, hexBox, casa);

            pathContainer.appendChild(hexContainer);
            hexNaTela++;
        }
    }

    console.log('Total de hexágonos na tela: ' + hexNaTela);
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
        
        verificarFogosDeArtificio();
        verificarMetaAtingida();
        tocarSomClick();
        
        // SUMIR A CASINHA
        setTimeout(function() {
            if (hexContainer) {
                hexContainer.style.opacity = '0';
                hexContainer.style.transform = 'scale(0)';
                hexContainer.style.pointerEvents = 'none';
            }
        }, 300);
        
        // MOSTRAR MENSAGEM DEPOIS QUE SUMIR - CHAMADA DIRETA
        setTimeout(function() {
            console.log('🎯 Chamando mostrarMensagemDireta para casa ' + index);
            mostrarMensagemDireta(casa);
        }, 500);
        
        setTimeout(function() {
            hexBox.classList.remove('nova-casa');
            hexContainer.classList.remove('clicada');
        }, 600);
        
        // VERIFICAR SE PRECISA GERAR NOVA LEVA
        setTimeout(function() {
            var casasCompletas = 0;
            casinhas.forEach(function(c) {
                if (c.paga) casasCompletas++;
            });
            
            console.log('Casas completas: ' + casasCompletas);
            
            // Se chegou em múltiplo de 50, gerar próximas casas
            if (casasCompletas % 50 === 0 && casasCompletas > 0 && casasCompletas < totalCasasJogo) {
                console.log('Gerando próximas 50 casas!');
                gerarProximasHexagons();
                atualizarPosicaoPersonagem();
            }
        }, 700);
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

// ===== FUNÇÃO PARA MOSTRAR MENSAGEM DIRETAMENTE =====
function mostrarMensagemDireta(casa) {
    console.log('═══════════════════════════════════════');
    console.log('🎯 MOSTRAR MENSAGEM DIRETA CHAMADA');
    console.log('Casa: ' + casa.numero);
    console.log('═══════════════════════════════════════');
    
    try {
        // Mensagens de sucesso
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
        
        // Gerar mensagem aleatória
        const tipoDados = Math.floor(Math.random() * 100);
        let mensagem;
        if (tipoDados < 60) {
            mensagem = MENSAGENS_SUCESSO[Math.floor(Math.random() * MENSAGENS_SUCESSO.length)];
        } else {
            mensagem = CURIOSIDADES[Math.floor(Math.random() * CURIOSIDADES.length)];
        }
        
        console.log('✅ Mensagem gerada: ' + mensagem.texto);
        
        // Criar ou atualizar modal
        var modal = document.getElementById('messageModal');
        
        if (!modal) {
            console.log('📦 Criando novo modal...');
            modal = document.createElement('div');
            modal.id = 'messageModal';
            modal.className = 'message-modal';
            document.body.appendChild(modal);
        }
        
        // Inserir conteúdo
        modal.innerHTML = `
            <div class="message-content">
                <div class="message-emoji">${mensagem.emoji}</div>
                <p class="message-text">${mensagem.texto}</p>
            </div>
        `;
        
        // Remover classe show
        modal.classList.remove('show');
        
        // Forçar reflow
        void modal.offsetWidth;
        
        // Adicionar classe show
        modal.classList.add('show');
        console.log('✅ MODAL VISÍVEL NA TELA!');
        
        // Esconder após 3 segundos
        setTimeout(function() {
            console.log('⏱️ Escondendo modal...');
            if (modal) {
                modal.classList.remove('show');
            }
        }, 3000);
        
    } catch (error) {
        console.error('❌ ERRO em mostrarMensagemDireta:');
        console.error(error);
        console.error(error.stack);
    }
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
