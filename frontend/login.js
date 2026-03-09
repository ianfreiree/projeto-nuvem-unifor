const firebaseConfig = {
  apiKey: "AIzaSyBNtMV-qFSnJhLCiWKUk5FIkhglRM0UdqY",
  authDomain: "catalogo-inteligente-unifor.firebaseapp.com",
  projectId: "catalogo-inteligente-unifor",
  storageBucket: "catalogo-inteligente-unifor.firebasestorage.app",
  messagingSenderId: "824321695204",
  appId: "1:824321695204:web:934547ff86699a682c7bf1",
  measurementId: "G-SRGGKLCHRP"
};


firebase.initializeApp(firebaseConfig);

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btnEntrar = document.querySelector('button');

    
    btnEntrar.innerText = "Entrando...";
    btnEntrar.disabled = true;

    try {
        
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        
        const token = await userCredential.user.getIdToken();
        
        
        localStorage.setItem('token', token);
        
        console.log("Login realizado com sucesso! ✅");
        window.location.href = 'index.html'; 

    } catch (error) {
        console.error("Erro detalhado:", error.code, error.message);
        
        
        const msgErro = document.getElementById('mensagem-erro');
        msgErro.innerText = "Usuário ou senha inválidos!";
        
        
        btnEntrar.innerText = "Entrar";
        btnEntrar.disabled = false;
    }
}