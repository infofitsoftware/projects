// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAhrl9zNwjxdc9UMIA7oz-MgvB-ubPjRmQ",
    authDomain: "utrainscodeshare.firebaseapp.com",
    projectId: "utrainscodeshare",
    databaseURL: "https://utrainscodeshare-default-rtdb.firebaseio.com",
    storageBucket: "utrainscodeshare.firebasestorage.app",
    messagingSenderId: "823329983361",
    appId: "1:823329983361:web:29ec009a9b90b354dd3680",
    measurementId: "G-DV1Q4KFCRW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const token = await userCredential.user.getIdToken();
        window.location.href = `/editor?token=${token}`;
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

// Simple auth state listener
firebase.auth().onAuthStateChanged((user) => {
    console.log(user ? 'User is signed in' : 'User is signed out');
}); 