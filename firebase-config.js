// ===== CONFIGURAÇÃO DO FIREBASE =====

// Inicializar Firebase com suas credenciais
const firebaseConfig = {
    apiKey: "AIzaSyB_sua_chave_aqui",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-numero",
    appId: "seu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obter referências
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase inicializado com sucesso!');
console.log('🔥 Projeto: ' + firebaseConfig.projectId);

// Verificar status de conexão
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log('✅ Usuário conectado: ' + user.email);
    } else {
        console.log('❌ Nenhum usuário conectado');
    }
});
