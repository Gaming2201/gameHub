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

// Sidebar Open/Close Logic
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const closeBtn = document.getElementById('closeBtn');

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.add('active');
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    sidebar.classList.remove('active');
  });
}

// ==========================================
// AVATAR SELECTION & PROFILE LOGIC
// ==========================================

// Avatar selection event
let selectedAvatar = 'avatar1';
const avatarImgs = document.querySelectorAll('.avatar-img');

avatarImgs.forEach(img => {
  img.addEventListener('click', () => {
    avatarImgs.forEach(a => a.classList.remove('selected'));
    img.classList.add('selected');
    selectedAvatar = img.getAttribute('data-avatar');
  });
});

// Toast Notification Function
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.innerText = message;
  toast.className = isError ? 'toast show error' : 'toast show';

  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}

// Profile & Preferences Save Logic
const saveBtn = document.getElementById('saveBtn');

if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    const username = document.getElementById('usernameInput').value;
    const email = document.getElementById('emailInput').value;
    const soundPref = document.getElementById('soundToggle').value;
    const themePref = document.getElementById('themeToggle').value;

    if (!username || !email) {
      showToast("Please enter the Email & Username", true);
      return;
    }

    try {
      // Save all details to Firestore
      await window.setDoc(window.doc(window.db, "users", "user_profile"), {
        username: username,
        email: email,
        avatar: selectedAvatar,
        sound: soundPref,
        theme: themePref
      });
      
      showToast("Profile & Settings saved successfully!");
    } catch (error) {
      console.error("Error writing document: ", error);
      showToast("Error: " + error.message, true);
    }
  });
}

// Load Profile & Settings Data on Page Load
window.addEventListener('DOMContentLoaded', async () => {
  const usernameInput = document.getElementById('usernameInput');
  const emailInput = document.getElementById('emailInput');
  const soundToggle = document.getElementById('soundToggle');
  const themeToggle = document.getElementById('themeToggle');

  if (window.db && window.doc && window.getDoc) {
    try {
      const docRef = window.doc(window.db, "users", "user_profile");
      const docSnap = await window.getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (usernameInput) usernameInput.value = data.username || '';
        if (emailInput) emailInput.value = data.email || '';
        if (soundToggle) soundToggle.value = data.sound || 'on';
        if (themeToggle) themeToggle.value = data.theme || 'dark';

        // Set Saved Avatar Active
        if (data.avatar) {
          selectedAvatar = data.avatar;
          avatarImgs.forEach(img => {
            if (img.getAttribute('data-avatar') === data.avatar) {
              img.classList.add('selected');
            } else {
              img.classList.remove('selected');
            }
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile: ", error);
    }
  }
});

// Load Profile Data from Firestore on Page Load
window.addEventListener('DOMContentLoaded', async () => {
  const usernameInput = document.getElementById('usernameInput');
  const emailInput = document.getElementById('emailInput');

  // Firestore se doc mangwane ki logic
  if (window.db && window.doc) {
    try {
      const docRef = window.doc(window.db, "users", "user_profile");
      const docSnap = await window.getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (usernameInput) usernameInput.value = data.username || '';
        if (emailInput) emailInput.value = data.email || '';
      }
    } catch (error) {
      console.error("Error loading profile: ", error);
    }
  }
});