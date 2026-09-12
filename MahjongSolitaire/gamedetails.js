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

    // 2. Like Button Counter
    const likeBtn = document.getElementById("like-btn");
    if(likeBtn) {
        let count = 0;
        likeBtn.addEventListener("click", () => {
            count++;
            likeBtn.innerText = `👍 ${count}`;
        });
    }

    // 3. Prevent DevTools F12 on Details Page
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
        }
    });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});