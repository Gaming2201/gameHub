// Wait for DOM content to load fully
document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Game Hub Arcade Portal: Online and Ready!");

  // Select all game play buttons
  const playButtons = document.querySelectorAll('.play-btn');

  // Add click feedback for active buttons
  playButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Check if button is not disabled
      if (!button.classList.contains('disabled')) {
        const gameTitle = button.parentElement.querySelector('h3').innerText;
        console.log(`Launching Game: ${gameTitle}`);
      }
    });
  });

  // Optional: Subtle Card Glow Tracking on Mouse Move
  const cards = document.querySelectorAll('.game-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});