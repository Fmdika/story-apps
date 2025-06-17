import LandingPage from "../pages/landing/index.js";
import LoginPage from "../pages/login/index.js";
import SignupPage from "../pages/signup/index.js";
import HomePage from "../pages/home/index.js";
import AddStoryPage from "../pages/add-story/index.js";
import SavedStory from "../pages/saved-story/index.js";
import NotFoundPresenter from "../pages/not-found/not-found-presenter.js";
import DetailStory from "../pages/detail-story/index.js";

const routes = {
  "/": LandingPage,
  "/login": LoginPage,
  "/signup": SignupPage,
  "/home": HomePage,
  "/add-story": AddStoryPage,
  "/saved": SavedStory,
  "/detail/:id": DetailStory,
  "*": NotFoundPresenter,
};

export default routes;
