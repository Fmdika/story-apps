import { openDB } from "idb";

const DB_NAME = "gudang-story-db";
const DB_VERSION = 1;
const OBJECT_STORE_NAME = "stories";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    }
  },
});

const StoryIDB = {
  async putStory(story) {
    if (!story.hasOwnProperty("id")) return;
    const db = await dbPromise;
    return db.put(OBJECT_STORE_NAME, story);
  },

  async getStory(id) {
    const db = await dbPromise;
    return db.get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(OBJECT_STORE_NAME);
  },

  async clearAllStories() {
    const db = await dbPromise;
    return db.clear(OBJECT_STORE_NAME);
  },

  async deleteStory(id) {
    const db = await dbPromise;
    return db.delete(OBJECT_STORE_NAME, id);
  },
};

export default StoryIDB;
