const mongoose = require('mongoose');
const fileDb = require('./utils/fileDb');

global.useFileDb = false;

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://localhost:27017/finwise';
  try {
    console.log(`[DATABASE] Connecting to MongoDB: ${connStr.replace(/:[^:]*@/, ':****@')} ...`);
    await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2500 // Quick timeout to failover fast if MongoDB is not running
    });
    console.log(`[DATABASE] MongoDB Connection Successful: ${mongoose.connection.host}`);
    global.useFileDb = false;
  } catch (err) {
    console.warn(`[DATABASE] MongoDB connection failed: ${err.message}`);
    console.warn(`[DATABASE] Falling back to local file-based persistent storage.`);
    global.useFileDb = true;
    fileDb.initialize();
  }
};

// Map mongoose model names to fileDb collection names
const getCollectionName = (Model) => {
  const name = Model.modelName;
  switch (name) {
    case 'User': return 'users';
    case 'Income': return 'income';
    case 'Expense': return 'expenses';
    case 'Budget': return 'budgets';
    case 'FinancialGoal': return 'goals';
    case 'Alert': return 'alerts';
    default: return name.toLowerCase();
  }
};

// Unified DB helper methods
const db = {
  find: async (Model, query = {}) => {
    if (global.useFileDb) {
      return fileDb.find(getCollectionName(Model), query);
    } else {
      return await Model.find(query).lean();
    }
  },

  findOne: async (Model, query = {}) => {
    if (global.useFileDb) {
      return fileDb.findOne(getCollectionName(Model), query);
    } else {
      return await Model.findOne(query).lean();
    }
  },

  create: async (Model, docData) => {
    if (global.useFileDb) {
      return fileDb.insert(getCollectionName(Model), docData);
    } else {
      const doc = new Model(docData);
      await doc.save();
      return doc.toObject();
    }
  },

  findByIdAndUpdate: async (Model, id, updateData) => {
    if (global.useFileDb) {
      return fileDb.findByIdAndUpdate(getCollectionName(Model), id, updateData);
    } else {
      return await Model.findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
  },

  findByIdAndDelete: async (Model, id) => {
    if (global.useFileDb) {
      return fileDb.findByIdAndDelete(getCollectionName(Model), id);
    } else {
      const result = await Model.findByIdAndDelete(id);
      return !!result;
    }
  },

  // Seed helper
  overwrite: async (Model, documents) => {
    if (global.useFileDb) {
      return fileDb.overwrite(getCollectionName(Model), documents);
    } else {
      await Model.deleteMany({});
      return await Model.insertMany(documents);
    }
  }
};

module.exports = { connectDB, db };
