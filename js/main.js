let currentAudio = null;
let currentButton = null;

function closeAudioPlayer() {
  const player = document.getElementById("audioPlayer");
  const audio = document.getElementById("audioElement");

  player.classList.add("hidden");
  player.classList.remove("flex");

  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }

  // Reset button state
  if (currentButton) {
    currentButton.innerHTML = `
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z"/>
      </svg>
      Listen
    `;
    currentButton = null;
  }
}

// Function to play audio
function playAudio(button) {
  const audioSrc = button.getAttribute("data-audio");
  const trackTitle = button.closest(".group").querySelector("h3").textContent;

  // Close any existing player
  closeAudioPlayer();

  // Update current button reference
  currentButton = button;

  // Update player content
  document.getElementById("currentTrack").textContent = trackTitle;

  // Show player first
  const player = document.getElementById("audioPlayer");
  player.classList.remove("hidden");
  player.classList.add("flex");

  // Get audio element and set source
  const audio = document.getElementById("audioElement");

  // Remove old event listeners by removing and re-adding
  const newAudio = audio.cloneNode(true);
  audio.parentNode.replaceChild(newAudio, audio);
  const audioElement = document.getElementById("audioElement");

  // Set source and load
  audioElement.src = audioSrc;
  audioElement.load(); // Force reload

  // Update button to show playing state
  button.innerHTML = `
    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    Playing...
  `;

  // Auto-play when metadata is loaded
  audioElement.addEventListener("loadedmetadata", function () {
    audioElement.play().catch(function (error) {
      console.log("Autoplay prevented:", error);
      // User interaction required - that's okay, they can click play
    });
  });

  // Reset button when audio ends
  audioElement.addEventListener("ended", function () {
    if (currentButton) {
      currentButton.innerHTML = `
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z"/>
        </svg>
        Listen
      `;
      currentButton = null;
    }
  });

  // Error handling
  audioElement.addEventListener("error", function (e) {
    console.error("Audio error:", e, "Source:", audioSrc);
  });
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Add click handlers for play buttons
  document.querySelectorAll(".play-btn").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent card click from firing
      playAudio(this);
    });
  });

  // Make PDF cards clickable - open in new tab
  document.querySelectorAll(".pdf-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking directly on the download link
      if (e.target.closest("a")) {
        return;
      }
      const downloadLink = card.querySelector("a[download]");
      if (downloadLink) {
        // Open PDF in new tab instead of downloading
        const pdfUrl = downloadLink.getAttribute("href");
        window.open(pdfUrl, "_blank");
      }
    });
  });

  // Make audio cards clickable
  document.querySelectorAll(".audio-card").forEach((card) => {
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking directly on the button or download link
      if (e.target.closest("button") || e.target.closest("a")) {
        return;
      }
      const playButton = card.querySelector(".play-btn");
      if (playButton) {
        playAudio(playButton);
      }
    });
  });

  // Update copyright year automatically
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();
});

