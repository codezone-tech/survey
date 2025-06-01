import { openDB } from "idb";
import api from "./api";
import { toast } from "react-toastify";

const DB_NAME = "GIS_SURVEY_DATABASE";
const STORE_NAME = "GP_LIST_DATA";
const DAMGE_FIBER_STORE_NAME = "DAMAGE_FIBER_LIST_DATA";
const EXISTING_FIBER_STORE_NAME = "EXISTING_FIBER_LIST_DATA";
const OLT_STORE_NAME = "OLT_LIST_DATA";
const PLANNING_STORE_NAME = "PLANING_LIST_DATA";

// Initialize DB
const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      const storeList = [
        STORE_NAME,
        DAMGE_FIBER_STORE_NAME,
        EXISTING_FIBER_STORE_NAME,
        OLT_STORE_NAME,
        PLANNING_STORE_NAME,
      ];

      storeList.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      });
    },
  });
};

// Get all data from GP_LIST_DATA
export const getAllGPData = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// Add new GP object to existing array
export const addGPData = async (newData) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const allData = await store.getAll();

  // Generate unique ID for the new entry
  const newEntry = {
    ...newData,
    id: Date.now(), // Using timestamp as ID
  };

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data.push(newEntry);
    await store.put(existingData);
  } else {
    await store.add({ id: 1, data: [newEntry] });
  }
  await tx.done;
};

// Update an existing GP object
export const updateGPData = async (updatedData) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.map((item) =>
      item.id === updatedData.id ? updatedData : item
    );
    await store.put(existingData);
  }
  await tx.done;
};

// Delete a GP object
export const deleteGPData = async (gpId) => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.filter((item) => item.id !== gpId);
    await store.put(existingData);
  }
  await tx.done;
};

export const deleteAllGPData = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  await store.clear();
  await tx.done;
};

// Persist IndexedDB data to localStorage
export const persistDBToLocalStorage = async () => {
  const db = await initDB();
  const allData = await db.getAll(STORE_NAME);
  localStorage.setItem(DB_NAME, JSON.stringify(allData));
};

// Create a new store dynamically
export const createNewStore = async (storeName) => {
  const db = await openDB(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    },
  });
  return db;
};

// Save data into a dynamically created store
export const saveDataToNewStore = async (storeName, data) => {
  const db = await createNewStore(storeName);
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  await store.add(data);
  await tx.done;
};

// Sync pending offline data when online
export const syncPendingData = async () => {
  try {
    const db = await initDB();
    const allData = await db.getAll(STORE_NAME);

    if (allData.length === 0) return;

    const pendingItems = allData[0].data;
    const successfulSubmissions = [];

    // Process each pending item
    for (const item of pendingItems) {
      try {
        const { gram_panchayat_id, ...formData } = item;
        await api.post(`/gram-panchayat/${gram_panchayat_id}`, formData);
        successfulSubmissions.push(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }

    // Remove successfully synced items
    if (successfulSubmissions.length > 0) {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const existingData = allData[0];

      existingData.data = existingData.data.filter(
        (item) => !successfulSubmissions.includes(item.id)
      );

      if (existingData.data.length > 0) {
        await store.put(existingData);
      } else {
        await store.clear();
      }
      await tx.done;

      toast.success(`Synced ${successfulSubmissions.length} pending surveys.`);
    }
  } catch (error) {
    console.error("Error syncing offline data:", error);
  }
};

// Get all data from DAMAGE_FIBER_LIST_DATA
export const getAllFiberData = async () => {
  const db = await initDB();
  return db.getAll(DAMGE_FIBER_STORE_NAME);
};

// Add new Fiber Damage object to existing array
export const addFiberData = async (newData) => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  const allData = await store.getAll();

  // Generate unique ID for the new entry
  const newEntry = {
    ...newData,
    id: Date.now(), // Using timestamp as ID
    syncStatus: 'pending' // Mark as pending sync
  };

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data.push(newEntry);
    await store.put(existingData);
  } else {
    await store.add({ id: 1, data: [newEntry] });
  }
  await tx.done;
};

// Update an existing Fiber Damage object
export const updateFiberData = async (updatedData) => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.map((item) =>
      item.id === updatedData.id ? updatedData : item
    );
    await store.put(existingData);
  }
  await tx.done;
};

// Delete a Fiber Damage object
export const deleteFiberData = async (fiberId) => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.filter((item) => item.id !== fiberId);
    await store.put(existingData);
  }
  await tx.done;
};

export const deleteAllFiberData = async () => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  await store.clear();
  await tx.done;
};

// Sync pending offline fiber damage data when online
export const syncPendingFiberData = async () => {
  try {
    const db = await initDB();
    const allData = await db.getAll(DAMGE_FIBER_STORE_NAME);

    if (allData.length === 0) return;

    const pendingItems = allData[0].data.filter(item => item.syncStatus === 'pending');
    const successfulSubmissions = [];

    // Process each pending item
    for (const item of pendingItems) {
      try {
        // Remove the id and syncStatus before sending to server
        const { id, syncStatus, ...formData } = item;
        await api.post("/damage-fiber", formData);
        successfulSubmissions.push(id);
      } catch (error) {
        console.error(`Failed to sync fiber damage item ${item.id}:`, error);
      }
    }

    // Remove successfully synced items
    if (successfulSubmissions.length > 0) {
      const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
      const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
      const existingData = allData[0];

      existingData.data = existingData.data.filter(
        (item) => !successfulSubmissions.includes(item.id)
      );

      if (existingData.data.length > 0) {
        await store.put(existingData);
      } else {
        await store.clear();
      }
      await tx.done;

      toast.success(`Synced ${successfulSubmissions.length} pending fiber damage reports.`);
    }
  } catch (error) {
    console.error("Error syncing offline fiber damage data:", error);
  }
};

// Get all data from PLANING_LIST_DATA
export const getAllPlanningData = async () => {
  const db = await initDB();
  return db.getAll(PLANNING_STORE_NAME);
};

// Add new Planning object to existing array
export const addPlanningData = async (newData) => {
  const db = await initDB();
  const tx = db.transaction(PLANNING_STORE_NAME, "readwrite");
  const store = tx.objectStore(PLANNING_STORE_NAME);
  const allData = await store.getAll();

  // Generate unique ID for the new entry
  const newEntry = {
    ...newData,
    id: Date.now(), // Using timestamp as ID
    syncStatus: 'pending' // Mark as pending sync
  };

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data.push(newEntry);
    await store.put(existingData);
  } else {
    await store.add({ id: 1, data: [newEntry] });
  }
  await tx.done;
};

// Update an existing Planning object
export const updatePlanningData = async (updatedData) => {
  const db = await initDB();
  const tx = db.transaction(PLANNING_STORE_NAME, "readwrite");
  const store = tx.objectStore(PLANNING_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.map((item) =>
      item.id === updatedData.id ? updatedData : item
    );
    await store.put(existingData);
  }
  await tx.done;
};

// Delete a Planning object
export const deletePlanningData = async (planningId) => {
  const db = await initDB();
  const tx = db.transaction(PLANNING_STORE_NAME, "readwrite");
  const store = tx.objectStore(PLANNING_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.filter((item) => item.id !== planningId);
    await store.put(existingData);
  }
  await tx.done;
};

export const deleteAllPlanningData = async () => {
  const db = await initDB();
  const tx = db.transaction(PLANNING_STORE_NAME, "readwrite");
  const store = tx.objectStore(PLANNING_STORE_NAME);
  await store.clear();
  await tx.done;
};

// Sync pending offline planning data when online
export const syncPendingPlanningData = async () => {
  try {
    const db = await initDB();
    const allData = await db.getAll(PLANNING_STORE_NAME);

    if (allData.length === 0) return;

    const pendingItems = allData[0].data.filter(item => item.syncStatus === 'pending');
    const successfulSubmissions = [];

    // Process each pending item
    for (const item of pendingItems) {
      try {
        // Remove the id and syncStatus before sending to server
        const { id, syncStatus, ...formData } = item;
        await api.post("/planning", formData);
        successfulSubmissions.push(id);
      } catch (error) {
        console.error(`Failed to sync planning item ${item.id}:`, error);
      }
    }

    // Remove successfully synced items
    if (successfulSubmissions.length > 0) {
      const tx = db.transaction(PLANNING_STORE_NAME, "readwrite");
      const store = tx.objectStore(PLANNING_STORE_NAME);
      const existingData = allData[0];

      existingData.data = existingData.data.filter(
        (item) => !successfulSubmissions.includes(item.id)
      );

      if (existingData.data.length > 0) {
        await store.put(existingData);
      } else {
        await store.clear();
      }
      await tx.done;

      toast.success(`Synced ${successfulSubmissions.length} pending planning items.`);
    }
  } catch (error) {
    console.error("Error syncing offline planning data:", error);
  }
};

// Get all data from DAMAGE_FIBER_LIST_DATA
export const getAllDamageFiberData = async () => {
  const db = await initDB();
  const data = await db.getAll(DAMGE_FIBER_STORE_NAME);
  return data.length > 0 ? data[0].data : [];
};

// Add new Damage Fiber data
export const addDamageFiberData = async (newData) => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  const allData = await store.getAll();

  const newEntry = {
    ...newData,
    id: Date.now(),
    syncStatus: 'pending',
    createdAt: new Date().toISOString()
  };

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data.push(newEntry);
    await store.put(existingData);
  } else {
    await store.add({ id: 1, data: [newEntry] });
  }
  await tx.done;
  return newEntry;
};

// Sync pending damage fiber data
export const syncPendingDamageFiberData = async () => {
  try {
    const db = await initDB();
    const allData = await db.getAll(DAMGE_FIBER_STORE_NAME);
    
    if (!allData.length) return;

    const pendingItems = allData[0].data.filter(item => item.syncStatus === 'pending');
    const successfulSyncs = [];

    for (const item of pendingItems) {
      try {
        const { id, syncStatus, ...payload } = item;
        await api.post('/damage-fibers', payload);
        successfulSyncs.push(id);
      } catch (error) {
        console.error(`Sync failed for damage fiber ${item.id}:`, error);
      }
    }

    if (successfulSyncs.length > 0) {
      const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
      const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
      const existingData = allData[0];
      
      existingData.data = existingData.data.map(item => 
        successfulSyncs.includes(item.id) 
          ? { ...item, syncStatus: 'synced', syncedAt: new Date().toISOString() }
          : item
      );
      
      await store.put(existingData);
      await tx.done;
      
      toast.success(`Synced ${successfulSyncs.length} damage fiber reports`);
      return successfulSyncs.length;
    }
  } catch (error) {
    console.error('Damage fiber sync error:', error);
    toast.error('Failed to sync damage fiber data');
    throw error;
  }
};

// Additional utility functions for completeness
export const getDamageFiberById = async (id) => {
  const db = await initDB();
  const allData = await db.getAll(DAMGE_FIBER_STORE_NAME);
  if (!allData.length) return null;
  return allData[0].data.find(item => item.id === id);
};

export const updateDamageFiberData = async (id, updates) => {
  const db = await initDB();
  const tx = db.transaction(DAMGE_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(DAMGE_FIBER_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.map(item => 
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    await store.put(existingData);
  }
  await tx.done;
};

// Get all data from EXISTING_FIBER_LIST_DATA
export const getAllExistingFiberData = async () => {
  const db = await initDB();
  const data = await db.getAll(EXISTING_FIBER_STORE_NAME);
  return data.length > 0 ? data[0].data : [];
};

// Add new Existing Fiber data
export const addExistingFiberData = async (newData) => {
  const db = await initDB();
  const tx = db.transaction(EXISTING_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(EXISTING_FIBER_STORE_NAME);
  const allData = await store.getAll();

  const newEntry = {
    ...newData,
    id: Date.now(), // Unique ID
    syncStatus: 'pending', // Mark as unsynced
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data.push(newEntry);
    await store.put(existingData);
  } else {
    await store.add({ id: 1, data: [newEntry] });
  }
  await tx.done;
  return newEntry;
};

// Sync pending existing fiber data
export const syncPendingExistingFiberData = async () => {
  try {
    const db = await initDB();
    const allData = await db.getAll(EXISTING_FIBER_STORE_NAME);
    
    if (!allData.length) return 0;

    const pendingItems = allData[0].data.filter(item => item.syncStatus === 'pending');
    const successfulSyncs = [];

    for (const item of pendingItems) {
      try {
        const { id, syncStatus, createdAt, updatedAt, ...payload } = item;
        await api.post('/existing-fibers', payload);
        successfulSyncs.push(id);
      } catch (error) {
        console.error(`Sync failed for existing fiber ${item.id}:`, error);
      }
    }

    if (successfulSyncs.length > 0) {
      const tx = db.transaction(EXISTING_FIBER_STORE_NAME, "readwrite");
      const store = tx.objectStore(EXISTING_FIBER_STORE_NAME);
      const existingData = allData[0];
      
      existingData.data = existingData.data.map(item => 
        successfulSyncs.includes(item.id) 
          ? { ...item, syncStatus: 'synced', syncedAt: new Date().toISOString() }
          : item
      );
      
      await store.put(existingData);
      await tx.done;
      
      toast.success(`Synced ${successfulSyncs.length} existing fiber records`);
      return successfulSyncs.length;
    }
    return 0;
  } catch (error) {
    console.error('Existing fiber sync error:', error);
    toast.error('Failed to sync existing fiber data');
    throw error;
  }
};

// Additional utility functions
export const getExistingFiberById = async (id) => {
  const db = await initDB();
  const allData = await db.getAll(EXISTING_FIBER_STORE_NAME);
  if (!allData.length) return null;
  return allData[0].data.find(item => item.id === id);
};

export const updateExistingFiberData = async (id, updates) => {
  const db = await initDB();
  const tx = db.transaction(EXISTING_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(EXISTING_FIBER_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.map(item => 
      item.id === id ? { 
        ...item, 
        ...updates, 
        updatedAt: new Date().toISOString(),
        syncStatus: updates.syncStatus || item.syncStatus
      } : item
    );
    await store.put(existingData);
  }
  await tx.done;
};

export const deleteExistingFiberData = async (id) => {
  const db = await initDB();
  const tx = db.transaction(EXISTING_FIBER_STORE_NAME, "readwrite");
  const store = tx.objectStore(EXISTING_FIBER_STORE_NAME);
  const allData = await store.getAll();

  if (allData.length > 0) {
    const existingData = allData[0];
    existingData.data = existingData.data.filter(item => item.id !== id);
    await store.put(existingData);
  }
  await tx.done;
};