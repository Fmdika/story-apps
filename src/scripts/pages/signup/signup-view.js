import "../../../styles/signup.css";

const SignupView = {
  render() {
    return `
      <main id="main-content" class="signup-page container" tabindex="-1" aria-labelledby="signup-title" aria-describedby="signup-desc">
        <div class="signup-wrapper">
          <div class="signup-form-container">
            <h2 id="signup-title">Daftar Akun</h2>
            <p id="signup-desc">Isi formulir di bawah untuk membuat akun baru.</p>
            <form id="signup-form" class="auth-form" novalidate>
              <input type="text" id="name" name="name" placeholder="Nama Lengkap" required aria-required="true" />
              <input type="email" id="email" name="email" placeholder="Email" required aria-required="true" />
              <input type="password" id="password" name="password" placeholder="Password (min. 8 karakter)" required aria-required="true" minlength="8" />
              <button type="submit">Daftar</button>
            </form>
            <p>Sudah punya akun? <a href="#/login">Masuk di sini</a></p>
            <div id="signup-message" role="alert" aria-live="assertive"></div>
          </div>
          <div class="signup-logo-container">
            <img src="/images/applogo.png" alt="Logo Aplikasi" class="signup-logo" />
          </div>
        </div>
      </main>

      <!-- Loading Overlay -->
      <div id="loading-overlay" class="loading-hidden" aria-hidden="true" role="alert" aria-live="assertive">
        <div class="loading-popup">
          <div class="spinner" aria-hidden="true"></div>
          <p>Memproses pendaftaran...</p>
        </div>
      </div>
    `;
  },

  bindEvents(signupHandler) {
    const form = document.getElementById("signup-form");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;

      this.showLoading();
      await signupHandler(name, email, password);
    });
  },

  showSuccessMessage(message) {
    const container = document.getElementById("signup-message");
    container.innerHTML = `<p class="success">${message}</p>`;
  },

  showErrorMessage(message) {
    const container = document.getElementById("signup-message");
    container.innerHTML = `<p class="error">${message}</p>`;
  },

  showLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.remove("loading-hidden");
    loadingOverlay.setAttribute("aria-hidden", "false");
  },

  hideLoading() {
    const loadingOverlay = document.getElementById("loading-overlay");
    loadingOverlay.classList.add("loading-hidden");
    loadingOverlay.setAttribute("aria-hidden", "true");
  },
};

export default SignupView;
