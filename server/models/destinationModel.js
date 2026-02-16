// server/models/destinationModel.js
const db = require('../db/database');

class Destination {
  static getAll(callback) {
    db.all('SELECT * FROM destinations', callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM destinations WHERE id = ?', [id], callback);
  }

  static create(destination, callback) {
    const { name, country, description, daily_budget_bam } = destination;
    const budget = daily_budget_bam != null && daily_budget_bam !== '' ? Number(daily_budget_bam) : null;
    db.run(
      'INSERT INTO destinations (name, country, description, daily_budget_bam) VALUES (?, ?, ?, ?)',
      [name, country, description, budget],
      function (err) {
        callback(err, { id: this.lastID, name, country, description, daily_budget_bam: budget });
      }
    );
  }

  static update(id, updatedDestination, callback) {
    const { name, country, description, daily_budget_bam } = updatedDestination;
    const budget = daily_budget_bam != null && daily_budget_bam !== '' ? Number(daily_budget_bam) : null;
    db.run(
      'UPDATE destinations SET name=?, country=?, description=?, daily_budget_bam=? WHERE id=?',
      [name, country, description, budget, id],
      function (err) {
        if (err) return callback(err);
        if (this.changes === 0) return callback(null, null);
        callback(null, { id, name, country, description, daily_budget_bam: budget });
      }
    );
  }

  static delete(id, callback) {
    db.get('SELECT * FROM destinations WHERE id = ?', [id], (err, destination) => {
      if (err) {
        return callback(err);
      }
      if (!destination) {
        return callback(null, null);
      }

      db.run('DELETE FROM destinations WHERE id = ?', [id], function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, {
        id,
        name: destination.name,
        country: destination.country,
        description: destination.description,
        daily_budget_bam: destination.daily_budget_bam,
      });
      });
    });
  }
}

module.exports = Destination;
