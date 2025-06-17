import loadingPopupView from "./loading-popup-view.js";

const LoadingPopupPresenter = {
  showLoading(message = "Loading...") {
    loadingPopupView.show(message);
  },
  updateMessage(message) {
    loadingPopupView.updateMessage(message);
  },
  hide() {
    loadingPopupView.hide();
  },
};

export default LoadingPopupPresenter;
