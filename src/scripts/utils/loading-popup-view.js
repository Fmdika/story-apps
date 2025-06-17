class LoadingPopup {
  constructor() {
    this.popupElement = document.createElement("div");
    this.popupElement.classList.add("loading-popup");
    this.popupElement.innerHTML = `
      <div class="loading-popup-content">
        <div class="loading-spinner"></div>
        <p class="loading-message">Loading...</p>
      </div>
    `;
    document.body.appendChild(this.popupElement);
    this.hide();
  }

  show(message = "Loading...") {
    this.popupElement.querySelector(".loading-message").textContent = message;
    this.popupElement.style.display = "flex";
  }

  updateMessage(newMessage) {
    this.popupElement.querySelector(".loading-message").textContent =
      newMessage;
  }

  hide() {
    this.popupElement.style.display = "none";
  }
}

export default new LoadingPopup();
