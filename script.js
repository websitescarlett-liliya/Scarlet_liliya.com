document.addEventListener("DOMContentLoaded", () => {
  // --- STATE & INITIALIZATION ---
  let currentUser = JSON.parse(localStorage.getItem("user")) || null;
  let currentTheme = localStorage.getItem("theme") || "light";
  let pendingDownloadUrl = "";
  let pendingVideoTitle = "";

  // Apply Theme
  if (currentTheme === "dark") {
    document.body.classList.add("dark-mode");
  }

  // Element Selectors
  const authModal = document.getElementById("auth-modal");
  const authForm = document.getElementById("auth-form");
  const googleAuthBtn = document.getElementById("google-auth-btn");
  
  const hamburgerBtn = document.getElementById("hamburger-btn");
  const dropdownMenu = document.getElementById("dropdown-menu");
  
  const profileModal = document.getElementById("profile-modal");
  const menuProfileBtn = document.getElementById("menu-profile-btn");
  const closeProfile = document.getElementById("close-profile");
  const profileNameDisplay = document.getElementById("profile-name-display");
  const profileStatusBadge = document.getElementById("profile-status-badge");
  const downloadHistory = document.getElementById("download-history");
  
  const editProfileModal = document.getElementById("edit-profile-modal");
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const closeEditProfile = document.getElementById("close-edit-profile");
  const editProfileForm = document.getElementById("edit-profile-form");
  const editNameInput = document.getElementById("edit-name-input");
  
  const settingsModal = document.getElementById("settings-modal");
  const menuSettingsBtn = document.getElementById("menu-settings-btn");
  const closeSettings = document.getElementById("close-settings");
  const toggleThemeBtn = document.getElementById("toggle-theme-btn");
  const redeemTokenBtn = document.getElementById("redeem-token-btn");
  const tokenInput = document.getElementById("token-input");
  const logoutBtn = document.getElementById("logout-btn");
  
  const fetchBtn = document.getElementById("fetch-btn");
  const videoUrlInput = document.getElementById("video-url");
  const videoResult = document.getElementById("video-result");

  const adModal = document.getElementById("ad-modal");
  const adVideo = document.getElementById("ad-video");
  const skipAdBtn = document.getElementById("skip-ad-btn");

  // Auth Check
  if (!currentUser) {
    authModal.classList.remove("hidden");
  }

  // --- AUTHENTICATION ---
  authForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value;
    const name = email.split("@")[0];
    currentUser = { name, email, isPremium: false, history: [] };
    saveUser();
    authModal.classList.add("hidden");
  });

  googleAuthBtn.addEventListener("click", () => {
    currentUser = { name: "User Google", email: "user@gmail.com", isPremium: false, history: [] };
    saveUser();
    authModal.classList.add("hidden");
  });

  function saveUser() {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }

  // --- NAVIGATION & DROPDOWN ---
  hamburgerBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  // --- MODAL NAVIGATION ---
  menuProfileBtn.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
    updateProfileUI();
    profileModal.classList.remove("hidden");
  });

  closeProfile.addEventListener("click", () => profileModal.classList.add("hidden"));

  editProfileBtn.addEventListener("click", () => {
    editNameInput.value = currentUser.name;
    editProfileModal.classList.remove("hidden");
  });

  closeEditProfile.addEventListener("click", () => editProfileModal.classList.add("hidden"));

  editProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newName = editNameInput.value;
    if (newName) currentUser.name = newName;
    
    saveUser();
    updateProfileUI();
    editProfileModal.classList.add("hidden");
  });

  menuSettingsBtn.addEventListener("click", () => {
    dropdownMenu.classList.add("hidden");
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));

  // --- SETTINGS LOGIC ---
  toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    toggleThemeBtn.textContent = isDark ? "Mode Terang" : "Mode Gelap";
  });

  redeemTokenBtn.addEventListener("click", () => {
    if (tokenInput.value.trim() === "Ryuka5522") {
      currentUser.isPremium = true;
      saveUser();
      alert("Selamat! Akun Anda menjadi Premium.");
      tokenInput.value = "";
    } else {
      alert("Token tidak valid!");
    }
  });

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    location.reload();
  });

  function updateProfileUI() {
    profileNameDisplay.textContent = currentUser.name;
    if (currentUser.isPremium) {
      profileStatusBadge.textContent = "Premium";
      profileStatusBadge.classList.add("premium");
    } else {
      profileStatusBadge.textContent = "Gratis";
      profileStatusBadge.classList.remove("premium");
    }

    downloadHistory.innerHTML = "";
    if (currentUser.history.length === 0) {
      downloadHistory.innerHTML = "<li>Belum ada riwayat unduhan.</li>";
    } else {
      currentUser.history.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.date} - ${item.platform} (${item.type})`;
        downloadHistory.appendChild(li);
      });
    }
  }

  // --- API DOWNLOADER & PROCESS ---
  fetchBtn.addEventListener("click", () => {
    const url = videoUrlInput.value.trim();
    if (!url) return alert("Tempelkan URL terlebih dahulu!");

    videoResult.innerHTML = "<p>Memproses URL...</p>";
    videoResult.classList.remove("hidden");

    // Menentukan platform dan integrasi API
    if (url.includes("tiktok.com")) {
      processTikTok(url);
    } else if (url.includes("instagram.com")) {
      processInstagram(url);
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      processYouTube(url);
    } else {
      videoResult.innerHTML = "<p>URL tidak didukung. Masukkan URL TikTok, Instagram, atau YouTube.</p>";
    }
  });

  function processTikTok(url) {
    // API tikwm.com
    fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (data.code === 0) {
          renderVideoOptions({
            title: data.data.title || "Video TikTok",
            noWatermark: "https://www.tikwm.com" + data.data.play,
            watermark: "https://www.tikwm.com" + data.data.wmplay,
            platform: "TikTok"
          });
        } else {
          videoResult.innerHTML = "<p>Gagal mengambil video TikTok.</p>";
        }
      })
      .catch(() => videoResult.innerHTML = "<p>Terjadi kesalahan API TikTok.</p>");
  }

  function processInstagram(url) {
    // Simulasi integrasi API IGexport
    renderVideoOptions({
      title: "Video Instagram",
      noWatermark: url, // Simulasi URL hasil dari IGexport
      watermark: url,
      platform: "Instagram"
    });
  }

  function processYouTube(url) {
    // Simulasi integrasi API YTDown.com
    renderVideoOptions({
      title: "Video YouTube",
      noWatermark: url, // Simulasi URL hasil YTDown
      watermark: null,
      platform: "YouTube"
    });
  }

  function renderVideoOptions(data) {
    let buttonsHtml = `<button class="btn-primary dl-btn" data-url="${data.noWatermark}" data-type="No Watermark" data-platform="${data.platform}">Unduh No Watermark</button>`;
    
    if (data.watermark) {
      buttonsHtml += `<button class="btn-secondary dl-btn" data-url="${data.watermark}" data-type="With Watermark" data-platform="${data.platform}">Unduh Pake Watermark</button>`;
    }

    videoResult.innerHTML = `
      <h3>${data.title}</h3>
      <div class="download-options">${buttonsHtml}</div>
    `;

    document.querySelectorAll(".dl-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        pendingDownloadUrl = e.target.getAttribute("data-url");
        const type = e.target.getAttribute("data-type");
        const platform = e.target.getAttribute("data-platform");

        startDownloadProcess(platform, type);
      });
    });
  }

  function startDownloadProcess(platform, type) {
    // Catat ke riwayat
    currentUser.history.unshift({
      platform,
      type,
      date: new Date().toLocaleDateString()
    });
    saveUser();

    // Jika bukan premium, tampilkan iklan
    if (!currentUser.isPremium) {
      adModal.classList.remove("hidden");
      adVideo.play();
    } else {
      triggerDirectDownload();
    }
  }

  // Kontrol Iklan Video
  adVideo.addEventListener("ended", () => {
    skipAdBtn.classList.remove("hidden");
  });

  skipAdBtn.addEventListener("click", () => {
    adModal.classList.add("hidden");
    skipAdBtn.classList.add("hidden");
    triggerDirectDownload();
  });

  function triggerDirectDownload() {
    alert("Unduhan dimulai...");
    window.open(pendingDownloadUrl, "_blank");
  }
});
