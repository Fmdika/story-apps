import DetailStoryPresenter from "./detail-story-presenter.js";

const DetailStory = {
  async render() {
    return `
      <main id="main-content" tabindex="-1">
        <div id="detail-story-container" class="container"></div>
      </main>
    `;
  },

  async afterRender() {
    new DetailStoryPresenter();
  },
};

export default DetailStory;
