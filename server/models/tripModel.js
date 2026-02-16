const db = require('../db/database');

class Trip {
  // Get all trips for a user; include destination_name and daily_budget_bam; sort by start_date (fallback trip_date for old rows)
  static getAllTrips(userId, callback) {
    db.all(
      `SELECT trips.*, destinations.name AS destination_name, destinations.daily_budget_bam
       FROM trips INNER JOIN destinations ON trips.destination_id = destinations.id
       WHERE trips.user_id = ?
       ORDER BY date(COALESCE(trips.start_date, trips.trip_date)) ASC, trips.id ASC`,
      [userId],
      callback
    );
  }

  static makeTrip(userId, destinationId, start_date, end_date, notes, total_budget_bam, callback) {
    db.run(
      `INSERT INTO trips (user_id, destination_id, start_date, end_date, notes, total_budget_bam) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, destinationId, start_date, end_date, notes || null, total_budget_bam != null ? total_budget_bam : null],
      callback
    );
  }

  static deleteTrip(tripId, userId, callback) {
    db.run('DELETE FROM trips WHERE id = ? AND user_id = ?', [tripId, userId], function (err) {
      if (err) return callback(err);
      callback(null, this.changes);
    });
  }

  static updateTrip(tripId, userId, destinationId, start_date, end_date, notes, total_budget_bam, callback) {
    db.run(
      `UPDATE trips SET destination_id = ?, start_date = ?, end_date = ?, notes = ?, total_budget_bam = ? WHERE id = ? AND user_id = ?`,
      [destinationId, start_date, end_date, notes || null, total_budget_bam != null ? total_budget_bam : null, tripId, userId],
      function (err) {
        if (err) return callback(err);
        callback(null, this.changes);
      }
    );
  }
}

module.exports = Trip;
