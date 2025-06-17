import "../../../styles/login.css";

const LoginView = {
  render() {
    return `
    <main id="main-content" class="login-page container" tabindex="-1" aria-labelledby="login-title" aria-describedby="login-desc">
      <div class="login-wrapper">
        <div class="login-form-container">
          <h2 id="login-title">Login</h2>
          <p id="login-desc">Masukkan email dan password untuk masuk ke aplikasi.</p>
          <form id="login-form" novalidate>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required aria-required="true" aria-describedby="email-error" />
            <span id="email-error" class="error-message" aria-live="polite"></span>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="8" aria-required="true" aria-describedby="password-error" />
            <span id="password-error" class="error-message" aria-live="polite"></span>

            <button type="submit">Login</button>
          </form>
          <p id="login-message" role="alert" aria-live="assertive"></p>
          <p>Belum punya akun? <a href="#/signup">Daftar di sini</a></p>
        </div>
        <div class="login-logo-container">
          <img src="/images/applogo.png" alt="Logo aplikasi" class="login-logo" />
        </div>
      </div>
    </main>

    <div id="loading-overlay" class="loading-hidden" aria-hidden="true" role="alert" aria-live="assertive">
      <div class="loading-popup">
        <div class="spinner" aria-hidden="true"></div>
        <p>Menunggu login...</p>
      </div>
    </div>
    `;
  },

  bindEvents(loginHandler) {
    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");
    const loadingOverlay = document.getElementById("loading-overlay");
    const emailInput = form?.email;
    const passwordInput = form?.password;
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    const validateField = (input, errorEl) => {
      if (!input.validity.valid) {
        if (input.validity.valueMissing) {
          errorEl.textContent = "Field ini wajib diisi.";
        } else if (input.validity.typeMismatch) {
          errorEl.textContent = "Format email tidak valid.";
        } else if (input.validity.tooShort) {
          errorEl.textContent = `Minimal ${input.minLength} karakter.`;
        } else {
          errorEl.textContent = "Input tidak valid.";
        }
      } else {
        errorEl.textContent = "";
      }
    };

    emailInput?.addEventListener("input", () =>
      validateField(emailInput, emailError),
    );
    passwordInput?.addEventListener("input", () =>
      validateField(passwordInput, passwordError),
    );

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();

      validateField(emailInput, emailError);
      validateField(passwordInput, passwordError);

      if (!form.checkValidity()) {
        message.textContent = "Periksa kembali data yang dimasukkan.";
        return;
      }

      message.textContent = "";
      loadingOverlay.classList.remove("loading-hidden");
      loadingOverlay.setAttribute("aria-hidden", "false");

      try {
        await loginHandler(
          emailInput.value,
          passwordInput.value,
          message,
          loadingOverlay,
        );
      } finally {
        loadingOverlay.classList.add("loading-hidden");
        loadingOverlay.setAttribute("aria-hidden", "true");
      }
    });
  },
};

export default LoginView;
