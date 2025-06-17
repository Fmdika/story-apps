import '../../../styles/detail-story-page.css'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default class DetailStoryView {
  constructor() {
    this.container = document.getElementById('main-content');
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Memuat detail cerita...</div>';
  }

  renderStoryDetail(story) {
    if (!story) {
      this.renderFailedMessage('Cerita tidak ditemukan');
      return;
    }

    this.container.innerHTML = `
      <div class="story-detail">
        <div class="story-detail-header">
          <button id="back-btn" class="back-button" aria-label="Kembali ke daftar cerita">
            <i class="fas fa-arrow-left" aria-hidden="true"></i> Kembali
          </button>
          <h2 id="story-detail-title">Detail Cerita</h2>
        </div>

        <article class="story-detail-content" role="article">
          <div class="story-detail-image">
            <img 
              src="${story.photoUrl}" 
              alt="Foto cerita oleh ${story.name || 'Pengguna'}"
              onerror="this.src='data:image/svg+xml;base64,...'; this.alt='Gambar tidak dapat dimuat';"
              loading="lazy"
            />
          </div>

          <div class="story-detail-info">
            <h3 class="story-author">
              <i class="fas fa-user" aria-hidden="true"></i>
              ${story.name || 'Tanpa Nama'}
            </h3>

            <div class="story-description">
              <h4><i class="fas fa-quote-left" aria-hidden="true"></i> Deskripsi</h4>
              <p>${story.description || 'Tidak ada deskripsi'}</p>
            </div>

            <div class="story-metadata">
              <div class="story-date">
                <i class="fas fa-calendar-alt" aria-hidden="true"></i>
                <strong>Dibuat:</strong>
                <time datetime="${story.createdAt || ''}">${story.createdAt ? new Date(story.createdAt).toLocaleString('id-ID', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
                }) : 'Tanggal tidak tersedia'}</time>
              </div>
              ${story.lat && story.lon ? `
              <div class="story-location">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <strong>Lokasi:</strong> ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}
              </div>` : ''}
            </div>
            ${story.lat && story.lon ? `
              <div class="story-map-section">
                <h4><i class="fas fa-map" aria-hidden="true"></i> Lokasi di Peta</h4>
                <div class="map-container">
                  <div id="story-detail-map" style="height: 400px; width: 100%;" role="img" aria-label="Peta lokasi cerita oleh ${story.name || 'Pengguna'}"></div>
                </div>
              </div>` : ''}
          </div>
        </article>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => {
      history.back();
    });

    if (story.lat && story.lon) {
      setTimeout(() => {
        try {
          const map = L.map('story-detail-map').setView([story.lat, story.lon], 15);
          const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
          });
          const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '&copy; Esri', maxZoom: 19
          });
          const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenTopoMap contributors', maxZoom: 17
          });
          osmLayer.addTo(map);
          L.control.layers({ OpenStreetMap: osmLayer, Satelit: satelliteLayer, Topografi: topoLayer }).addTo(map);
          const marker = L.marker([story.lat, story.lon]).addTo(map);
          marker.bindPopup(`
            <div class="map-popup-detail">
              <h4>${story.name || 'Story Location'}</h4>
              <p><strong>Deskripsi:</strong> ${story.description ? story.description.substring(0, 150) + (story.description.length > 150 ? '...' : '') : 'Tidak ada deskripsi'}</p>
              <p><strong>Koordinat:</strong><br>Latitude: ${story.lat.toFixed(6)}<br>Longitude: ${story.lon.toFixed(6)}</p>
              <p><strong>Dibuat:</strong> ${story.createdAt ? new Date(story.createdAt).toLocaleDateString('id-ID') : 'Tanggal tidak tersedia'}</p>
            </div>
          `).openPopup();
          document.getElementById('story-detail-map').setAttribute('tabindex', '0');
        } catch (error) {
          console.error('Error rendering detail map:', error);
          document.getElementById('story-detail-map').innerHTML = '<div class="map-error">Peta tidak dapat dimuat</div>';
        }
      }, 100);
    }
  }

  renderFailedMessage(message = 'Gagal memuat detail cerita.') {
    this.container.innerHTML = `
      <div class="error-state">
        <button id="back-btn" class="back-button" aria-label="Kembali ke daftar cerita">
          <i class="fas fa-arrow-left" aria-hidden="true"></i> Kembali
        </button>
        <div class="error-content">
          <i class="fas fa-exclamation-triangle fa-3x" aria-hidden="true"></i>
          <h2>Oops!</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="retry-button">
            <i class="fas fa-redo" aria-hidden="true"></i> Coba Lagi
          </button>
        </div>
      </div>
    `;

    document.getElementById('back-btn').addEventListener('click', () => {
      history.back();
    });
  }

  renderNoAuth() {
    this.container.innerHTML = `
      <div class="auth-required">
        <i class="fas fa-lock fa-3x" aria-hidden="true"></i>
        <h2>Login Diperlukan</h2>
        <p>Anda perlu login terlebih dahulu untuk melihat detail cerita.</p>
        <a href="#/login" class="auth-link">
          <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Login Sekarang
        </a>
      </div>
    `;
  }
}
