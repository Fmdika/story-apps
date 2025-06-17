import Api from "../../data/api.js";
import AuthModel from "../../data/auth-model.js";
import HomeView from "./home-view.js";

export default class HomePresenter {
  async render() {
    return HomeView.render();
  }

  async afterRender() {
    const token = AuthModel.getToken();
    if (!token) {
      HomeView.showUnauthorizedMessage();
      return;
    }

    try {
      const { listStory } = await Api.getAllStories(token);
      HomeView.renderStories(listStory);
      HomeView.renderMap(listStory);

      this.sendPushNotification(
        "Semua story telah dimuat!",
        "Beranda sudah diperbarui.",
        "/",
      );
    } catch (error) {
      HomeView.showErrorMessage("Gagal memuat stories. Coba lagi nanti.");
    }
  }

  sendPushNotification(title, body, url) {
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Worker tidak didukung");
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.active) {
        registration.active.postMessage({
          type: "TEST_PUSH",
          title,
          body,
          url,
        });
      }
    });
  }
}
