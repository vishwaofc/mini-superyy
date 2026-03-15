const { MongoClient } = require('mongodb');

const mongoUri = 'mongodb+srv://fedinolamins_db_user:FT6sPVDTp5jRLIvK@jungii.kc3luzk.mongodb.net/?appName=jungii';
const client = new MongoClient(mongoUri);

let db;

async function initDB() {
  if (!db) {
    await client.connect();
    db = client.db('Podda');
  }
  return db;
}

async function updateUserEnv(key, value, userId) {
  const db = await initDB();
  const collection = db.collection('user_settings');

  await collection.updateOne(
    { userId },
    { $set: { [key]: value } },
    { upsert: true }
  );

  return true;
}

async function getUserEnv(key, userId) {
  const db = await initDB();
  const collection = db.collection('user_settings');

  const data = await collection.findOne({ userId });

  if (!data) return null;

  return data[key] || null;
}

async function getAllUserEnv(userId) {
  const db = await initDB();
  const collection = db.collection('user_settings');

  const data = await collection.findOne({ userId });

  if (!data) return {};

  delete data._id;
  delete data.userId;

  return data;
}

async function initUserEnvIfMissing(userId) {

  const defaults = {
    AUTO_REACT: "off",
    PRESENCE_TYPE: "on",
    PRESENCE_FAKE: "both",
    ANTI_CALL: "on",
    ANTI_DELETE: "on",
    CREATE_NB: userId
  };

  const db = await initDB();
  const collection = db.collection('user_settings');

  const current = await collection.findOne({ userId });

  if (!current) {
    await collection.insertOne({
      userId,
      ...defaults
    });

    console.log(`✅ Settings created for ${userId}`);
  } else {

    for (const key in defaults) {
      if (!(key in current)) {
        await collection.updateOne(
          { userId },
          { $set: { [key]: defaults[key] } }
        );

        console.log(`✅ Initialized ${key} = ${defaults[key]} for ${userId}`);
      }
    }
  }
}

module.exports = {
  updateUserEnv,
  getUserEnv,
  getAllUserEnv,
  initUserEnvIfMissing
};
