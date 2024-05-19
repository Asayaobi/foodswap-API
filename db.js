// db.js
import pg from 'pg'
const { Pool } = pg

// Database connection parameters
const db = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  connectionString: 'databaseurl'
})

export default db
