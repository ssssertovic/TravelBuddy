const db = require('../db/database');

class ItineraryItem {
  static getByTripId(tripId, callback) {
    db.all('SELECT * FROM itinerary_items WHERE trip_id = ? ORDER BY day_number, id', [tripId], callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM itinerary_items WHERE id = ?', [id], callback);
  }

  static create(item, callback) {
    const { trip_id, day_number, activity, note } = item;
    db.run(
      'INSERT INTO itinerary_items (trip_id, day_number, activity, note) VALUES (?, ?, ?, ?)',
      [trip_id, day_number, activity, note || null],
      function (err) {
        callback(err, { id: this.lastID, trip_id, day_number, activity, note: note || null });
      }
    );
  }

  static update(id, updatedItem, callback) {
    const { day_number, activity, note } = updatedItem;
    db.run(
      'UPDATE itinerary_items SET day_number=?, activity=?, note=? WHERE id=?',
      [day_number, activity, note || null, id],
      function (err) {
        if (err) {
          return callback(err);
        }
        if (this.changes === 0) {
          return callback(null, null);
        }
        callback(null, { id, day_number, activity, note: note || null });
      }
    );
  }

  static delete(id, callback) {
    db.get('SELECT * FROM itinerary_items WHERE id = ?', [id], (err, row) => {
      if (err) {
        return callback(err);
      }
      if (!row) {
        return callback(null, null);
      }
      db.run('DELETE FROM itinerary_items WHERE id = ?', [id], function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, row);
      });
    });
  }
}

module.exports = ItineraryItem;
