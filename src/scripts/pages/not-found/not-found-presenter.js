import NotFoundView from "./not-found-view.js";

const NotFoundPresenter = {
  async render() {
    return NotFoundView.render();
  },

  async afterRender() {
    NotFoundView.afterRender();
  },
};

export default NotFoundPresenter;
