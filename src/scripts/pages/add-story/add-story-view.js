import "../../../styles/add-story-page.css";
import AuthModel from "../../data/auth-model.js";

const AddStoryView = {
  render() {
    const token = AuthModel.getToken();

    if (!token) {
      return `
        <main class="container" id="main-content" tabindex="-1" style="text-align: center; padding: 40px 20px;">
          <h2 style="margin-bottom: 24px; font-size: 1.5rem;">
            Untuk menambahkan story, silakan login terlebih dahulu!
          </h2>
          <a href="#/">
            <button class="btn-back" style="font-size: 1rem; padding: 10px 20px;">
              Kembali ke Halaman Utama
            </button>
          </a>
        </main>
        <div id="loading-overlay" class="loading-hidden" aria-hidden="true">
          <div class="loading-spinner"></div>
        </div>
      `;
    }

    return `
      <main class="container" id="main-content" tabindex="-1">
        <h2>Add New Story</h2>
        <form id="add-story-form">
          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea id="description" required></textarea>
          </div>
          <div class="form-group">
            <label>Ambil Foto</label>
            <button type="button" id="start-camera">Gunakan Kamera</button>
            <video id="camera" autoplay playsinline width="300" style="display: none;"></video>
            <button type="button" id="take-photo" style="display: none;">Ambil Gambar</button>
            <label>Atau Pilih Gambar dari Galeri</label>
            <input type="file" id="photo-file" accept="image/*" />
            <label>Preview Gambar</label>
            <canvas id="snapshot" width="300" height="200" style="display:none;"></canvas>
          </div>
          <div class="form-group">
            <label for="map">Pilih Lokasi</label>
            <div id="map" style="height: 300px;"></div>
          </div>
          <button type="submit" class="submit-btn">Kirim</button>
        </form>
        <div id="message"></div>
      </main>
      <div id="loading-overlay" class="loading-hidden" aria-hidden="true">
        <div class="loading-popup">
          <div class="spinner"></div>
          <p>Memproses story...</p>
        </div>
      </div>
    `;
  },
};

export default AddStoryView;
