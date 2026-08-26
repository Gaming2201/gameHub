document.addEventListener('DOMContentLoaded', () => {
    console.log("Game Hub Portal: Online!");

    // 1. Play Buttons Click Event
    const playButtons = document.querySelectorAll('.play-btn');
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('disabled')) {
                const gameTitle = button.parentElement.querySelector('h3').innerText;
                console.log(`Launching: ${gameTitle}`);
            }
        });
    });

    // 2. Card Glow Tracking
    const cards = document.querySelectorAll('.game-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });
    });

    // 3. Complete Search & Clear System
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const clearSearch = document.getElementById('clearSearch');

    if (searchInput && searchResults) {
        
        // Dropdown List Loader
        function buildDropdownList(filterText = '') {
            searchResults.innerHTML = '';
            let hasResults = false;

            cards.forEach((card) => {
                const titleElement = card.querySelector('h3');
                if (titleElement) {
                    const gameTitle = titleElement.textContent.trim();

                    if (gameTitle.toLowerCase().includes(filterText.toLowerCase())) {
                        hasResults = true;
                        const item = document.createElement('div');
                        item.className = 'dropdown-item';
                        item.innerHTML = `<span>🎮</span> <span>${gameTitle}</span>`;

                        item.addEventListener('click', () => {
                            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            card.style.transition = '0.5s';
                            card.style.transform = 'scale(1.05)';
                            setTimeout(() => card.style.transform = 'scale(1)', 1000);

                            searchResults.classList.remove('active');
                            searchInput.value = gameTitle;
                            if (clearSearch) clearSearch.style.display = 'block';
                        });

                        searchResults.appendChild(item);
                    }
                }
            });

            if (hasResults) {
                searchResults.classList.add('active');
            } else {
                searchResults.innerHTML = '<div class="dropdown-item" style="cursor:default; color:#888;">कोई गेम नहीं मिला</div>';
                searchResults.classList.add('active');
            }
        }

        // Search Input Events
        searchInput.addEventListener('focus', () => {
            buildDropdownList(searchInput.value);
        });

        searchInput.addEventListener('input', (e) => {
            const value = e.target.value;
            buildDropdownList(value);

            // Toggle Clear (✖) Button Visibility
            if (clearSearch) {
                clearSearch.style.display = value.trim() !== '' ? 'block' : 'none';
            }
        });

        // Clear (✖) Button Click Event
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                clearSearch.style.display = 'none';
                searchResults.classList.remove('active');
                searchInput.focus();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });
    }
});