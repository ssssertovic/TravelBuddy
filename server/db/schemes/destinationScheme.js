const db = require('../database');

db.run(`
  CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY,
    name TEXT,
    country TEXT,
    description TEXT
  )
`);

db.close();
