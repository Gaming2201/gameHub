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
});

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
    const username = document.getElementById('gamer-tag').value;
    const email = document.getElementById('email-address').value;
    const soundPref = document.getElementById('game-sound').value;
    const themePref = document.getElementById('theme-mode').value;

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

// ==========================================
// 1. HTML एलिमेंट्स को सेलेक्ट करना
// ==========================================
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn'); // या 'hamburger' / 'toggleBtn'
const closeBtn = document.getElementById('closeBtn');
const soundToggle = document.getElementById('soundToggle');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');

// ==========================================
// 2. मेन्यू बार (SIDEBAR) को खोलना और बंद करना
// ==========================================

// जब यूजर मेन्यू/हैमबर्गर बटन पर क्लिक करे
if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        if (sidebar) sidebar.classList.add('active'); // साइडबार खोलेगा
    });
}

// जब यूजर क्लोज (X) बटन पर क्लिक करे
if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        if (sidebar) sidebar.classList.remove('active'); // साइडबार बंद करेगा
    });
}

// ==========================================
// 3. स्क्रीन पर थीम (Dark / Neon) लागू करने का फ़ंक्शन
// ==========================================
function applyTheme(theme) {
    if (theme === 'neon') {
        document.body.classList.add('neon-theme');
        document.body.classList.remove('dark-theme');
    } else {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('neon-theme');
    }
}

// ==========================================
// 4. मैसेज (Toast) दिखाना
// ==========================================
function showToast(message) {
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================
// 5. पेज लोड होते ही सेटिंग्स लोड करना
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    let savedTheme = 'dark';
    let savedSound = 'on';

    if (window.db && window.doc && window.getDoc) {
        try {
            const docRef = window.doc(window.db, "users", "user_profile");
            const docSnap = await window.getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.sound) savedSound = data.sound;
                if (data.theme) savedTheme = data.theme;
            }
        } catch (error) {
            console.error("Firebase data load error:", error);
            savedTheme = localStorage.getItem('userTheme') || 'dark';
            savedSound = localStorage.getItem('userSound') || 'on';
        }
    } else {
        savedTheme = localStorage.getItem('userTheme') || 'dark';
        savedSound = localStorage.getItem('userSound') || 'on';
    }

    if (soundToggle) soundToggle.value = savedSound;
    if (themeToggle) themeToggle.value = savedTheme;

    applyTheme(savedTheme);
});

// ==========================================
// 6. 'Save Changes' बटन दबाने पर सेटिंग्स सेव करना
// ==========================================
if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const selectedSound = soundToggle ? soundToggle.value : 'on';
        const selectedTheme = themeToggle ? themeToggle.value : 'dark';

        applyTheme(selectedTheme);

        localStorage.setItem('userTheme', selectedTheme);
        localStorage.setItem('userSound', selectedSound);

        if (window.db && window.doc && window.setDoc) {
            try {
                const docRef = window.doc(window.db, "users", "user_profile");
                await window.setDoc(docRef, {
                    sound: selectedSound,
                    theme: selectedTheme
                }, { merge: true });
            } catch (error) {
                console.error("Firebase save error:", error);
            }
        }

        showToast("Settings Saved Successfully!");
        
        // सेव होने के बाद साइडबार बंद कर दें
        if (sidebar) sidebar.classList.remove('active');
    });
}

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