const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Helper to check and ensure files exist
const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const initialize = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const collections = ['users', 'income', 'expenses', 'budgets', 'goals', 'alerts'];
  collections.forEach(col => {
    const filePath = getFilePath(col);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }
  });
  console.log(`[FILE DB] JSON-based persistent storage initialized at: ${DATA_DIR}`);
};

const readCollection = (collection) => {
  try {
    const filePath = getFilePath(collection);
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    return [];
  }
};

const writeCollection = (collection, data) => {
  try {
    const filePath = getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error(`Error writing collection ${collection}:`, err);
    return false;
  }
};

const fileDb = {
  initialize,

  find: (collection, query = {}) => {
    const data = readCollection(collection);
    return data.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const data = readCollection(collection);
    return data.find(item => {
      for (let key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  },

  insert: (collection, doc) => {
    const data = readCollection(collection);
    const newDoc = {
      _id: doc._id || `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      ...doc
    };
    data.push(newDoc);
    writeCollection(collection, data);
    return newDoc;
  },

  findByIdAndUpdate: (collection, id, updateData) => {
    const data = readCollection(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;

    data[index] = { ...data[index], ...updateData, updatedAt: new Date().toISOString() };
    writeCollection(collection, data);
    return data[index];
  },

  findByIdAndDelete: (collection, id) => {
    const data = readCollection(collection);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return false;

    data.splice(index, 1);
    writeCollection(collection, data);
    return true;
  },

  // Batch insert/overwrite (useful for seed/reset operations)
  overwrite: (collection, documents) => {
    writeCollection(collection, documents);
    return documents;
  }
};

module.exports = fileDb;
