// Game Details Page Functionality

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Share Button Action
    const shareBtn = document.getElementById("share-btn");
    if(shareBtn) {
        shareBtn.addEventListener("click", () => {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Game Link Copied to Clipboard!");
            }
        });
    }

    // ==========================================
// GAME DETAILS LIKE SYSTEM (FIREBASE INTEGRATED)
// ==========================================

// Firebase Initialization Check
let database;
if (typeof firebase !== 'undefined') {
    database = firebase.database();
} else {
    console.error("Firebase SDK missing! Make sure Firebase scripts are loaded in HTML.");
}

function initGameLikeSystem() {
    // Game Title से ID बनाना (E.g., "Cyber Snake 2077" -> "cybersnake2077")
    const titleElement = document.querySelector('.game-info h1');
    if (!titleElement) return;

    const gameId = titleElement.innerText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const likeBtn = document.getElementById('like-btn');
    const likeCountSpan = document.getElementById('like-count');

    if (!likeBtn || !likeCountSpan || !database) return;

    // 1. Firebase से लाइव लाइक काउंट सुनना
    database.ref('likes/' + gameId).on('value', (snapshot) => {
        const totalLikes = snapshot.val() || 0;
        likeCountSpan.innerText = totalLikes;

        // चेक करें कि यूज़र ने पहले से लाइक किया है या नहीं
        let userLikes = JSON.parse(localStorage.getItem('userLikedGames')) || [];
        if (userLikes.includes(gameId)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    });

    // 2. लाइक बटन का क्लिक इवेंट
    likeBtn.onclick = () => {
        let userLikes = JSON.parse(localStorage.getItem('userLikedGames')) || [];
        const isLiked = userLikes.includes(gameId);
        const gameRef = database.ref('likes/' + gameId);

        if (isLiked) {
            // Un-like एक्शन
            gameRef.transaction(count => Math.max((count || 1) - 1, 0));
            userLikes = userLikes.filter(id => id !== gameId);
            likeBtn.classList.remove('liked');
        } else {
            // Like एक्शन
            gameRef.transaction(count => (count || 0) + 1);
            userLikes.push(gameId);
            likeBtn.classList.add('liked');
        }

        localStorage.setItem('userLikedGames', JSON.stringify(userLikes));
    };
}

// DOM लोड होते ही फ़ंक्शन कॉल होगा
document.addEventListener('DOMContentLoaded', initGameLikeSystem);
});

// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBAqGukTau_tZ6fa3vCZg-np8FJlY0LyD0",
    authDomain: "gamehub-6fbc6.firebaseapp.com",
    databaseURL: "https://gamehub-6fbc6-default-rtdb.firebaseio.com",
    projectId: "gamehub-6fbc6",
    storageBucket: "gamehub-6fbc6.firebasestorage.app",
    messagingSenderId: "586883385937",
    appId: "1:586883385937:web:48417c2ff16f907b928670"
};

// Safe Firebase Setup
let database;
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
} else {
    console.error("Firebase SDK script HTML mein nahi mili!");
}

// ==========================================
// 2. LIKE SYSTEM LOGIC
// ==========================================
function initGameLikeSystem() {
    const titleElement = document.querySelector('.game-info h1');
    if (!titleElement) return;

    // Title se clean ID banayenge (Cyber Snake 2077 -> cybersnake2077)
    const gameId = titleElement.innerText.toLowerCase().replace(/[^a-z0-9]/g, '');
    const likeBtn = document.getElementById('like-btn');
    const likeCountSpan = document.getElementById('like-count');

    if (!likeBtn || !likeCountSpan || !database) return;

    // 1. Realtime Listen from Firebase
    database.ref('likes/' + gameId).on('value', (snapshot) => {
        const totalLikes = snapshot.val() || 0;
        likeCountSpan.innerText = totalLikes;

        let userLikes = JSON.parse(localStorage.getItem('userLikedGames')) || [];
        if (userLikes.includes(gameId)) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    });

    // 2. Click Handler
    likeBtn.onclick = () => {
        let userLikes = JSON.parse(localStorage.getItem('userLikedGames')) || [];
        const isLiked = userLikes.includes(gameId);
        const gameRef = database.ref('likes/' + gameId);

        if (isLiked) {
            // Remove Like
            gameRef.transaction(count => Math.max((count || 1) - 1, 0));
            userLikes = userLikes.filter(id => id !== gameId);
            likeBtn.classList.remove('liked');
        } else {
            // Add Like
            gameRef.transaction(count => (count || 0) + 1);
            userLikes.push(gameId);
            likeBtn.classList.add('liked');
        }

        localStorage.setItem('userLikedGames', JSON.stringify(userLikes));
    };
}

// Execute on DOM Ready
document.addEventListener('DOMContentLoaded', initGameLikeSystem);
