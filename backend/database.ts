import "dotenv/config";
import mysql from "mysql2/promise";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Environment variable ${name} belum diisi. Cek file backend/.env`
    );
  }
  return value;
}

const db = mysql.createPool({
  host: getEnv("DB_HOST"),
  user: getEnv("DB_USER"),
  password: getEnv("DB_PASSWORD"),
  database: getEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: 10,
});

export default db;
