// ===== SONS DO GAME =====

const SONS = {
    click: 523,      // Do
    sucesso: 659,    // Mi
    milestone: 784,  // Sol
    vitoria: 1046    // Do alto
};

function tocarSom(frequencia, duracao) {
    try {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var oscillator = audioContext.createOscillator();
        var gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequencia;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duracao);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duracao);
    } catch (e) {
        console.log('Som não disponível');
    }
}

function tocarSomClick() {
    tocarSom(523, 0.1);
}

function tocarSomSucesso() {
    var notas = [523, 659, 784];
    notas.forEach(function(freq, idx) {
        setTimeout(function() {
            tocarSom(freq, 0.15);
        }, idx * 150);
    });
}

function tocarSomMilestone() {
    var notas = [784, 784, 1046];
    notas.forEach(function(freq, idx) {
        setTimeout(function() {
            tocarSom(freq, 0.2);
        }, idx * 100);
    });
}

function tocarSomVitoria() {
    var notas = [523, 659, 784, 1046, 1046, 1046];
    notas.forEach(function(freq, idx) {
        setTimeout(function() {
            tocarSom(freq, 0.25);
        }, idx * 200);
    });
}

window.tocarSomClick = tocarSomClick;
window.tocarSomSucesso = tocarSomSucesso;
window.tocarSomMilestone = tocarSomMilestone;
window.tocarSomVitoria = tocarSomVitoria;
