import "../../../styles/home-page.css";
import "leaflet/dist/leaflet.css";
import StoryIDB from "../../utils/indexedDB.js";
import LoadingPopupPresenter from "../../utils/loading-popup-presenter.js";

const HomeView = {
  render() {
    return `
    <main id="main-content" class="container" tabindex="-1">
      <h2>Latest Story</h2>
      <div id="story-list" class="story-list"></div>
      <div id="map" style="height: 400px; margin-top: 2rem;"></div>
    </main>

    <a href="#/add-story" class="add-story-button" aria-label="Tambah Story">
      <span>＋</span>
    </a>
  `;
  },

  showUnauthorizedMessage() {
    const container = document.getElementById("main-content");
    container.innerHTML = `
      <section style="text-align: center; padding: 40px 20px;" tabindex="-1">
        <h2 style="margin-bottom: 24px; font-size: 1.5rem; color: black;">
          Untuk mengakses beranda, silakan login terlebih dahulu!
        </h2>
        <a href="#/">
          <button style="font-size: 1rem; padding: 12px 24px; background: linear-gradient(135deg, #4A90E2 0%, #7B68EE 50%, #20B2AA 100%); border: none; border-radius: 25px; color: white; cursor: pointer;">
            Kembali ke Halaman Utama
          </button>
        </a>
      </section>
    `;
  },

  renderStories(listStory) {
    const container = document.getElementById("story-list");
    container.innerHTML = "";

    this.latestStories = listStory;

    listStory.forEach((story) => {
      const storyItem = document.createElement("div");
      storyItem.className = "story-card";
      storyItem.setAttribute("data-story-id", story.id);

      // Format tanggal
      const createdDate = new Date(story.createdAt);
      const formattedDate = createdDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      const formattedTime = createdDate.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Format lokasi jika ada
      const locationInfo = story.lat && story.lon ? 
        `<div class="location-info">
          <span class="location-icon">📍</span>
          <span>Lokasi: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
        </div>` : '';

      storyItem.innerHTML = `
        <div class="story-image-container">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-image" />
          <div class="story-overlay">
            <button class="detail-button" data-story-id="${story.id}">
              <span class="detail-icon">👁️</span>
              Lihat Detail
            </button>
          </div>
        </div>
        <div class="story-info">
          <div class="story-header">
            <h3 class="story-name">${story.name}</h3>
            <div class="story-author">
              <span class="author-icon">👤</span>
              <span>${story.name}</span>
            </div>
          </div>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <div class="story-date">
              <span class="date-icon">📅</span>
              <span>${formattedDate} pukul ${formattedTime}</span>
            </div>
            ${locationInfo}
          </div>
          <div class="story-actions">
            <button class="save-button" data-story-id="${story.id}">
              <span class="save-icon">💾</span>
              Simpan Story
            </button>
          </div>
        </div>
      `;

      // Save button event
      const saveButton = storyItem.querySelector(".save-button");
      saveButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.saveStory(story, saveButton);
      });

      // Detail button event
      const detailButton = storyItem.querySelector(".detail-button");
      detailButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showStoryDetail(story.id);
      });

      // Card click (jika bukan tombol)
      storyItem.addEventListener("click", (e) => {
        if (!e.target.closest('.save-button') && !e.target.closest('.detail-button')) {
          this.showStoryDetail(story.id);
        }
      });

      container.appendChild(storyItem);
    });
  },

  async saveStory(story, buttonElement) {
    try {
      LoadingPopupPresenter.showLoading("Menyimpan story...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      const existingStory = await StoryIDB.getStory(story.id);

      if (existingStory) {
        LoadingPopupPresenter.updateMessage("Story sudah pernah disimpan sebelumnya.");
        buttonElement.innerHTML = `<span class="save-icon">✅</span> Tersimpan`;
        buttonElement.classList.add('saved');
      } else {
        await StoryIDB.putStory(story);
        LoadingPopupPresenter.updateMessage("Story berhasil disimpan!");
        buttonElement.innerHTML = `<span class="save-icon">✅</span> Tersimpan`;
        buttonElement.classList.add('saved');
      }

      setTimeout(() => LoadingPopupPresenter.hide(), 2000);
    } catch (error) {
      console.error("Gagal memproses penyimpanan story:", error);
      LoadingPopupPresenter.updateMessage("Terjadi kesalahan saat menyimpan story.");
      setTimeout(() => LoadingPopupPresenter.hide(), 2000);
    }
  },

  showStoryDetail(storyId) {
    const storyData = this.latestStories?.find((s) => s.id === storyId);
    if (storyData) {
      localStorage.setItem("selectedStory", JSON.stringify(storyData));
      window.location.hash = `#/detail/${storyId}`;
    } else {
      console.warn("Story tidak ditemukan");
    }
  },

  renderMap(listStory) {
    const mapContainer = document.getElementById("map");

    const L = require("leaflet");
    const markerIcon = require("leaflet/dist/images/marker-icon.png");
    const markerRetina = require("leaflet/dist/images/marker-icon-2x.png");
    const markerShadow = require("leaflet/dist/images/marker-shadow.png");

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerRetina,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    const map = L.map(mapContainer).setView([0, 0], 2);

    const streetsLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "© OpenStreetMap contributors" },
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles © Esri" },
    );

    const terrainLayer = L.tileLayer(
      "https://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.jpg",
      { attribution: "© Stamen Design" },
    );

    L.control
      .layers({
        Streets: streetsLayer,
        Satellite: satelliteLayer,
        Terrain: terrainLayer,
      })
      .addTo(map);

    streetsLayer.addTo(map);

    const coordinates = listStory
      .filter((s) => s.lat && s.lon)
      .map((s) => [s.lat, s.lon]);

    if (coordinates.length > 0) {
      const avgLat =
        coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length;
      const avgLon =
        coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length;
      map.setView([avgLat, avgLon], 10);
    }

    listStory.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(
          `<div style="text-align: center; padding: 8px;">
            <strong style="color: #4A90E2; font-size: 1.1rem;">${story.name}</strong><br>
            <p style="margin: 8px 0; color: #666;">${story.description}</p>
            <small style="color: #888;">${new Date(story.createdAt).toLocaleString('id-ID')}</small>
          </div>`
        );
      }
    });
  },

  showErrorMessage(message = "Gagal memuat data stories.") {
    const container = document.getElementById("story-list");
    container.innerHTML = `
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <p>${message}</p>
      </div>
    `;
  },
};

export default HomeView;
