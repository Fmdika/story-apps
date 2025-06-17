import "../../../styles/saved-story-page.css";
import LoadingPopupPresenter from "../../utils/loading-popup-presenter.js";

const SavedStoryView = {
  render() {
    return `
      <main id="main-content" class="container" tabindex="-1">
        <h2>Saved Stories</h2>
        <div id="saved-story-list" class="story-list"></div>
      </main>
    `;
  },

  renderStories(stories) {
    const container = document.getElementById("saved-story-list");

    if (!stories.length) {
      container.innerHTML = `<p>Tidak ada story yang disimpan offline.</p>`;
      return;
    }

    container.innerHTML = stories
      .map(
        (story) => `
        <div class="story-item" data-id="${story.id}" tabindex="0" role="button">
          <img src="${story.photoUrl}" alt="${story.name}" class="story-img" />
          <div class="story-content">
            <h4>${story.name}</h4>
            <p>${story.description}</p>
            <small>${new Date(story.createdAt).toLocaleString()}</small>
            <button class="delete-button" aria-label="Hapus Story">Hapus</button>
          </div>
        </div>
      `
      )
      .join("");

    // Handler hapus story
    container.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.stopPropagation(); 
        const storyElement = event.target.closest(".story-item");
        const id = storyElement.dataset.id;

        try {
          LoadingPopupPresenter.showLoading("Menghapus story...");
          await this.onDeleteClick(id);
          LoadingPopupPresenter.updateMessage("Story berhasil dihapus!");
        } catch (error) {
          console.error("Gagal menghapus story:", error);
          LoadingPopupPresenter.updateMessage("Gagal menghapus story.");
        } finally {
          setTimeout(() => LoadingPopupPresenter.hide(), 2000);
        }
      });
    });

    // Handler klik pada card untuk buka detail
    container.querySelectorAll(".story-item").forEach((item) => {
      item.addEventListener("click", () => {
        const id = item.dataset.id;
        const story = stories.find((s) => s.id === id);
        if (story) {
          localStorage.setItem("selectedStory", JSON.stringify(story));
          window.location.hash = `/detail/${id}`;
        }
      });
    });
  },

  showErrorMessage(message = "Gagal memuat data.") {
    const container = document.getElementById("saved-story-list");
    container.innerHTML = `<p>${message}</p>`;
  },

  setDeleteHandler(callback) {
    this.onDeleteClick = callback;
  },
};

export default SavedStoryView;
