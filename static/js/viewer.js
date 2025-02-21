// Initialize Quill viewer in read-only mode
const quill = new Quill('#viewer', {
    theme: 'bubble',
    readOnly: true,
    modules: {
        toolbar: false
    }
});

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

// Get session ID from window variable
const sessionId = window.SESSION_ID;

// Firebase Database Reference
const notesRef = firebase.database().ref(`notes/${sessionId}`);

// Update connection status
const connectionStatus = document.getElementById('connectionStatus');
const lastUpdate = document.getElementById('lastUpdate');

function updateConnectionStatus(connected) {
    connectionStatus.textContent = connected ? 'Connected' : 'Disconnected';
    connectionStatus.className = `badge ${connected ? 'bg-success' : 'bg-danger'}`;
}

// Format timestamp
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
}

// Listen for connection state changes
const connectedRef = firebase.database().ref('.info/connected');
connectedRef.on('value', (snap) => {
    const connected = snap.val();
    updateConnectionStatus(connected);
});

// Listen for content updates
notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.content) {
            quill.setContents(data.content);
        }
        
        if (data.last_updated) {
            lastUpdate.textContent = `Last updated: ${formatTimestamp(data.last_updated)}`;
        }
        
        updateConnectionStatus(true);
    } else {
        quill.setContents([{ insert: 'No content available yet...\n' }]);
        lastUpdate.textContent = 'Last updated: Never';
        updateConnectionStatus(false);
    }
});

// Handle connection errors
notesRef.on('error', (error) => {
    console.error('Database error:', error);
    updateConnectionStatus(false);
    quill.setContents([{ insert: 'Error loading content. Please try refreshing the page.\n' }]);
});

// Auto-scroll to bottom when content changes
quill.on('text-change', () => {
    const editor = document.querySelector('.ql-editor');
    editor.scrollTop = editor.scrollHeight;
});

// Initial connection status
updateConnectionStatus(false); 