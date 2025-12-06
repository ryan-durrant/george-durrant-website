let currentAudio = null;
let currentButton = null;
let currentAudioSrc = null;

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
  const card = button.closest(".group");
  // Try to find h3 first (for audio talks), then fall back to span (for Don't Forget the Star)
  const titleElement = card.querySelector("h3") || card.querySelector("span.text-sm.font-medium");
  const trackTitle = titleElement ? titleElement.textContent : "Audio Track";

  // Close any existing player
  closeAudioPlayer();

  // Update current button reference
  currentButton = button;
  currentAudioSrc = audioSrc; // Store audio source for download

  // Update player content
  document.getElementById("currentTrack").textContent = trackTitle;
  
  // Update download button
  const downloadLink = document.getElementById("audioDownloadLink");
  if (downloadLink) {
    downloadLink.href = audioSrc;
    // Extract filename from path for download attribute
    const filename = audioSrc.split('/').pop();
    downloadLink.download = filename;
  }

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

  // Make video cards clickable (support both click and touch for mobile)
  document.querySelectorAll(".video-card").forEach((card) => {
    let touchStartTime = 0;
    
    // Handle touch events for mobile
    card.addEventListener("touchstart", function (e) {
      touchStartTime = Date.now();
    }, { passive: true });
    
    card.addEventListener("touchend", function (e) {
      const touchDuration = Date.now() - touchStartTime;
      // Only trigger if it was a quick tap (not a swipe)
      if (touchDuration < 300) {
        e.preventDefault();
        // Don't trigger if touching directly on the button
        if (e.target.closest("button")) {
          return;
        }
        const playButton = card.querySelector(".play-video-btn");
        if (playButton) {
          playVideo(playButton);
        }
      }
    });
    
    // Handle click events for desktop
    card.addEventListener("click", function (e) {
      // Don't trigger if clicking directly on the button
      if (e.target.closest("button")) {
        return;
      }
      const playButton = card.querySelector(".play-video-btn");
      if (playButton) {
        playVideo(playButton);
      }
    });
  });

  // Close video modal when clicking/touching on backdrop
  const videoPlayer = document.getElementById("videoPlayer");
  if (videoPlayer) {
    // Handle click events
    videoPlayer.addEventListener("click", function (e) {
      // Only close if clicking directly on the backdrop, not the modal content
      if (e.target === videoPlayer) {
        closeVideoPlayer();
      }
    });
    
    // Handle touch events for mobile
    videoPlayer.addEventListener("touchend", function (e) {
      // Only close if touching directly on the backdrop, not the modal content
      if (e.target === videoPlayer) {
        e.preventDefault();
        closeVideoPlayer();
      }
    });
  }

  // Update copyright year automatically
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();
});

// Video Player Functions
function closeVideoPlayer() {
  const player = document.getElementById("videoPlayer");
  const video = document.getElementById("videoElement");

  player.classList.add("hidden");
  player.classList.remove("flex");

  if (video) {
    // Stop the video by clearing the src
    video.src = "";
  }
}

function playVideo(button) {
  const videoId = button.getAttribute("data-video-id");
  const videoTitle = button.getAttribute("data-video-title") || "Video";
  const videoStart = button.getAttribute("data-video-start") || "0";

  // Close any existing players
  closeAudioPlayer();
  closeVideoPlayer();

  // Update player content
  document.getElementById("currentVideoTitle").textContent = videoTitle;

  // Build YouTube embed URL with mobile-friendly parameters
  let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1`;
  if (videoStart && videoStart !== "0") {
    embedUrl += `&start=${videoStart}`;
  }

  // Show player
  const player = document.getElementById("videoPlayer");
  player.classList.remove("hidden");
  player.classList.add("flex");

  // Set video source
  const video = document.getElementById("videoElement");
  // Small delay to ensure modal is visible before loading video (helps with mobile Safari)
  setTimeout(function() {
    video.src = embedUrl;
  }, 100);
}

