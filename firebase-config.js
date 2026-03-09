// ===== CONFIGURAÇÃO DO FIREBASE =====

const firebaseConfig = {
    apiKey: "AIzaSyCb2K_i-y1ln_CBqoKlMDinY7EzbLqPIFA",
    authDomain: "gerenciador-inteligente-27636.firebaseapp.com",
    projectId: "gerenciador-inteligente-27636",
    storageBucket: "gerenciador-inteligente-27636.firebasestorage.app",
    messagingSenderId: "377729052526",
    appId: "1:377729052526:web:13ca749977b307d9525b7f",
    measurementId: "G-03Q3XTZ13X"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado com sucesso!');
    console.log('🔥 Projeto: ' + firebaseConfig.projectId);
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// Obter referências
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase Config carregado!');
