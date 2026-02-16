// Run once to add date range, notes, and budget columns. Keeps trip_date column.
// Usage from server folder: node db/schemes/migrateDateRangeAndBudget.js
const db = require('../database');

function alter(name, sql, next) {
  db.run(sql, (err) => {
    if (err && !err.message.includes('duplicate column')) console.error(name, err.message);
    if (next) next();
  });
}

alter('destinations.daily_budget_bam', 'ALTER TABLE destinations ADD COLUMN daily_budget_bam REAL', () => {
  alter('trips.start_date', 'ALTER TABLE trips ADD COLUMN start_date TEXT', () => {
    alter('trips.end_date', 'ALTER TABLE trips ADD COLUMN end_date TEXT', () => {
      alter('trips.notes', 'ALTER TABLE trips ADD COLUMN notes TEXT', () => {
        alter('trips.total_budget_bam', 'ALTER TABLE trips ADD COLUMN total_budget_bam REAL', () => {
          db.close();
        });
      });
    });
  });
});
