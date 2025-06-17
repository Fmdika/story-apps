import Api from "../../data/api";
import SignupView from "./signup-view.js";

export default class SignupPresenter {
  async render() {
    return SignupView.render();
  }

  async afterRender() {
    SignupView.bindEvents(this._handleSignup.bind(this));
  }

  async _handleSignup(name, email, password) {
    try {
      const result = await Api.registerUser(name, email, password);

      if (!result.error) {
        SignupView.showSuccessMessage("Akun berhasil dibuat. Silakan login.");
        window.location.hash = "#/login";
      } else {
        SignupView.showErrorMessage(result.message);
      }
    } catch (error) {
      SignupView.showErrorMessage("Gagal mendaftar. Coba lagi.");
    } finally {
      SignupView.hideLoading();
    }
  }
}
