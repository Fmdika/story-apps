import AddStoryView from "./add-story-view";
import AddStoryPresenter from "./add-story-presenter";

const AddStoryPage = {
  async render() {
    return AddStoryView.render();
  },

  async afterRender() {
    AddStoryPresenter.bindEvent();
  },
};

export default AddStoryPage;
