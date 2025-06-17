import StoryIDB from "../../utils/indexedDB.js";
import SavedStoryView from "./saved-story-view.js";

export default class SavedStoryPresenter {
  async render() {
    return SavedStoryView.render();
  }

  async afterRender() {
    await this.loadAndRenderStories();

    SavedStoryView.setDeleteHandler(async (id) => {
      await StoryIDB.deleteStory(id);
      await this.loadAndRenderStories();
    });
  }

  async loadAndRenderStories() {
    try {
      const stories = await StoryIDB.getAllStories();
      if (stories.length === 0) {
        SavedStoryView.showErrorMessage("Belum ada story yang disimpan.");
      } else {
        SavedStoryView.renderStories(stories);
      }
    } catch (err) {
      console.error("Gagal memuat story tersimpan:", err);
      SavedStoryView.showErrorMessage("Gagal memuat story tersimpan.");
    }
  }
}
