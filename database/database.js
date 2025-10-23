export default async function initializeDatabase(db) {
  // await db.execAsync("DROP TABLE IF EXISTS verses;");
  // await db.execAsync("DROP TABLE IF EXISTS titles;");

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS titles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT
    );

    CREATE TABLE IF NOT EXISTS verses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title_id INTEGER,
      content TEXT NOT NULL,
      page_number INTEGER,
      date_time TEXT,
      tags TEXT,
      FOREIGN KEY (title_id) REFERENCES titles(id)
    );
  `);
}
