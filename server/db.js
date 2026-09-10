/**
 * Dandora.online Associate Platform - SQLite Database Layer
 * Uses Node.js v22 built-in `node:sqlite` (DatabaseSync)
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config();

const DB_PATH = process.env.DATABASE_PATH 
  ? path.resolve(__dirname, '..', process.env.DATABASE_PATH)
  : path.resolve(__dirname, '../data/dandora.sqlite');

// Ensure parent data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    // Initialize schema
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db) {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
}

// Database helper methods
const db = {
  getRawDb: () => getDb(),

  get: (sql, params = []) => {
    const statement = getDb().prepare(sql);
    return statement.get(...params);
  },

  all: (sql, params = []) => {
    const statement = getDb().prepare(sql);
    return statement.all(...params);
  },

  run: (sql, params = []) => {
    const statement = getDb().prepare(sql);
    return statement.run(...params);
  },

  exec: (sql) => {
    return getDb().exec(sql);
  }
};

module.exports = db;
