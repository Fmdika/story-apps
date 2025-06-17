import CONFIG from "../config";
import StoryIDB from "../utils/indexedDB.js";

const ENDPOINT = `${CONFIG.BASE_URL}`;

const Api = {
  async registerUser(name, email, password) {
    const response = await fetch(`${ENDPOINT}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  async loginUser(email, password) {
    const response = await fetch(`${ENDPOINT}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // untuk fallback offline dgn memanggil indexedDB
  async getAllStories(token, { page = 1, size = 10, location = 0 } = {}) {
    const url = new URL(`${ENDPOINT}/stories`);
    url.searchParams.append("page", page);
    url.searchParams.append("size", size);
    url.searchParams.append("location", location);

    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await response.json();
      return json;
    } catch (error) {
      console.warn("Fetch gagal, mengambil data dari IndexedDB", error);
      const offlineStories = await StoryIDB.getAllStories();

      return { listStory: offlineStories };
    }
  },

  async getStoryDetail(storyId, token) {
    const response = await fetch(`${ENDPOINT}/stories/${storyId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  async postStory({ description, photo, lat, lon }, token) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${ENDPOINT}/stories`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  async postStoryGuest({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${ENDPOINT}/stories/guest`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  async subscribeNotification(subscription, token) {
    const body = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.getKey("p256dh")
          ? btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("p256dh")),
              ),
            )
          : "",
        auth: subscription.getKey("auth")
          ? btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("auth")),
              ),
            )
          : "",
      },
    };

    const response = await fetch(`${ENDPOINT}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return response.json();
  },

  async unsubscribeNotification(subscription, token) {
    const endpoint = subscription.endpoint;
    const response = await fetch(`${ENDPOINT}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    return response.json();
  },
};

export default Api;
