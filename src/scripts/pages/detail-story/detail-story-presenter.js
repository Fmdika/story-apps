import DetailStoryView from "./detail-story-view.js";

export default class DetailStoryPresenter {
  constructor() {
    this.view = new DetailStoryView();
    this.init();
  }

  init() {
    this.view.showLoading();

    const url = new URL(window.location.href);
    const storyId = url.hash.split("/")[2];

    if (!storyId) {
      this.view.renderFailedMessage("ID cerita tidak valid.");
      return;
    }

    const storyData = JSON.parse(localStorage.getItem("selectedStory"));

    if (!storyData || storyData.id !== storyId) {
      this.view.renderFailedMessage("Data story tidak ditemukan.");
      return;
    }

    this.view.renderStoryDetail(storyData);
  }
}
