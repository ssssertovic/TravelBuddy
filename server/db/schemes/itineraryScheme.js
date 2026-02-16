const db = require('../database');

db.run(`
  CREATE TABLE IF NOT EXISTS itinerary_items (
    id INTEGER PRIMARY KEY,
    trip_id INTEGER,
    day_number INTEGER,
    activity TEXT,
    note TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id)
  )
`);

db.close();
