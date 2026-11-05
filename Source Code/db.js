import * as SQLite from 'expo-sqlite';

let database;

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync('delsu_students.db');
  }

  return database;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      passportUri TEXT,
      fullName TEXT NOT NULL,
      matricNumber TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      dateOfBirth TEXT NOT NULL,
      level TEXT NOT NULL,
      gender TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function fetchStudents(searchTerm = '') {
  const db = await getDatabase();
  const normalizedTerm = `%${searchTerm.trim()}%`;

  if (!searchTerm.trim()) {
    return db.getAllAsync(
      'SELECT * FROM students ORDER BY updatedAt DESC, fullName ASC;'
    );
  }

  return db.getAllAsync(
    `SELECT * FROM students
     WHERE fullName LIKE ?
        OR matricNumber LIKE ?
        OR department LIKE ?
        OR level LIKE ?
        OR gender LIKE ?
        OR phone LIKE ?
        OR email LIKE ?
        OR address LIKE ?
     ORDER BY updatedAt DESC, fullName ASC;`,
    [
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm,
      normalizedTerm
    ]
  );
}

export async function addStudent(student) {
  const db = await getDatabase();

  return db.runAsync(
    `INSERT INTO students (
      passportUri,
      fullName,
      matricNumber,
      department,
      dateOfBirth,
      level,
      gender,
      phone,
      email,
      address,
      updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);`,
    [
      student.passportUri || null,
      student.fullName.trim(),
      student.matricNumber.trim().toUpperCase(),
      student.department.trim(),
      student.dateOfBirth.trim(),
      student.level.trim(),
      student.gender.trim(),
      student.phone.trim(),
      student.email.trim(),
      student.address.trim()
    ]
  );
}

export async function updateStudent(id, student) {
  const db = await getDatabase();

  return db.runAsync(
    `UPDATE students
     SET passportUri = ?,
         fullName = ?,
         matricNumber = ?,
         department = ?,
         dateOfBirth = ?,
         level = ?,
         gender = ?,
         phone = ?,
         email = ?,
         address = ?,
         updatedAt = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [
      student.passportUri || null,
      student.fullName.trim(),
      student.matricNumber.trim().toUpperCase(),
      student.department.trim(),
      student.dateOfBirth.trim(),
      student.level.trim(),
      student.gender.trim(),
      student.phone.trim(),
      student.email.trim(),
      student.address.trim(),
      id
    ]
  );
}

export async function deleteStudent(id) {
  const db = await getDatabase();
  return db.runAsync('DELETE FROM students WHERE id = ?;', [id]);
}
