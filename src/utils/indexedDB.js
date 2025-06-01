import { openDB } from 'idb';

// Open IndexedDB database
export const initDB = async () => {
  return openDB("appDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("data")) {
        db.createObjectStore("data", { keyPath: "id" });
      }
    },
  });
};

// Save data to IndexedDB
export const saveData = async (key, data) => {
  const db = await initDB();
  const tx = db.transaction("data", "readwrite");
  const store = tx.objectStore("data");
  await store.put({ id: key, data });
};

// Get data from IndexedDB
export const getData = async (key) => {
  const db = await initDB();
  const tx = db.transaction("data", "readonly");
  const store = tx.objectStore("data");
  const result = await store.get(key);
  return result ? result.data : null;
};
