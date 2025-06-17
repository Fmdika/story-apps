import LandingView from "./landing-view.js";

export default class LandingPresenter {
  constructor() {
    this._view = LandingView;
  }

  async render() {
    return this._view.render();
  }

  async afterRender() {
    if (this._view.bindEvents) {
      this._view.bindEvents();
    }
  }
}
