// Initialize Quill editor
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ]
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

// Initialize Firebase if not already initialized
if (!firebase.apps?.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get or create session ID from URL parameter
const urlParams = new URLSearchParams(window.location.search);
let sessionId = urlParams.get('session') || localStorage.getItem('currentSession');
if (!sessionId) {
    sessionId = 'session_' + Date.now();
    localStorage.setItem('currentSession', sessionId);
}

// Get database reference
const notesRef = firebase.database().ref(`notes/${sessionId}`);

// Save changes to Firebase with debouncing
let saveTimeout;
let lastSaveTime = Date.now();

// Simplified auth state tracking
let currentUser = null;

// Listen for auth state changes
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.href = '/logout';
    }
});

// Modify the save function to use session token
quill.on('text-change', (delta, oldDelta, source) => {
    if (source === 'user') {
        const saveStatus = document.getElementById('saveStatus');
        saveStatus.textContent = 'Saving...';
        
        if (saveTimeout) clearTimeout(saveTimeout);
        
        saveTimeout = setTimeout(async () => {
            try {
                const content = quill.getContents();
                lastSaveTime = Date.now();
                
                const response = await fetch(`/api/notes/${sessionId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ content })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to save');
                }

                const timeSinceSave = Math.round((Date.now() - lastSaveTime) / 1000);
                saveStatus.textContent = `All changes saved (${timeSinceSave}s ago)`;

                // Save backup
                localStorage.setItem(`notes_${sessionId}`, JSON.stringify({
                    content,
                    timestamp: lastSaveTime
                }));

            } catch (error) {
                console.error('Save error:', error);
                saveStatus.textContent = 'Error saving changes';
                
                // Save backup on error
                localStorage.setItem(`notes_${sessionId}_backup`, JSON.stringify({
                    content: quill.getContents(),
                    timestamp: Date.now()
                }));
            }
        }, 1000);
    }
});

// Update save status periodically
setInterval(() => {
    const saveStatus = document.getElementById('saveStatus');
    if (saveStatus.textContent.includes('All changes saved')) {
        const timeSinceSave = Math.round((Date.now() - lastSaveTime) / 1000);
        saveStatus.textContent = `All changes saved (${timeSinceSave}s ago)`;
    }
}, 5000);

// Share functionality
document.getElementById('shareBtn').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    const shareLink = `${window.location.origin}/view/${sessionId}`;
    document.getElementById('shareLink').value = shareLink;
    modal.show();
});

// Copy link functionality
document.getElementById('copyLink').addEventListener('click', () => {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    const copyBtn = document.getElementById('copyLink');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = 'Copy';
    }, 2000);
});

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await firebase.auth().signOut();
        window.location.href = '/logout';  // Use server logout route
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out');
    }
});

// Load existing content
async function loadContent() {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.textContent = 'Loading...';
    
    try {
        // Try to load from Firebase
        const snapshot = await notesRef.once('value');
        const data = snapshot.val();
        
        if (data?.content) {
            quill.setContents(data.content);
            const timeSinceSave = Math.round((Date.now() - (data.last_updated || Date.now())) / 1000);
            saveStatus.textContent = `All changes saved (${timeSinceSave}s ago)`;
            lastSaveTime = data.last_updated || Date.now();
        } else {
            // Try to load from local storage backup
            const localData = localStorage.getItem(`notes_${sessionId}`);
            if (localData) {
                const parsedData = JSON.parse(localData);
                quill.setContents(parsedData.content);
                lastSaveTime = parsedData.timestamp;
                saveStatus.textContent = 'Loaded from local backup';
            } else {
                saveStatus.textContent = 'New document';
            }
        }
    } catch (error) {
        console.error('Load error:', error);
        if (error.message.includes('No user logged in')) {
            window.location.href = '/?session=' + sessionId;
            return;
        }
        
        // Try to load from local storage backup
        const localData = localStorage.getItem(`notes_${sessionId}_backup`);
        if (localData) {
            const parsedData = JSON.parse(localData);
            quill.setContents(parsedData.content);
            lastSaveTime = parsedData.timestamp;
            saveStatus.textContent = 'Loaded from local backup';
        } else {
            saveStatus.textContent = 'Error loading content';
        }
    }
}

// Load content when page loads
window.addEventListener('load', loadContent); 