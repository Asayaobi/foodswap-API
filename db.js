// db.js
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config() // Load environment variables

const { Pool } = pg
const DBURL = process.env.DBURL
// Database connection parameters
const db = new Pool({
  ssl: {
    rejectUnauthorized: false
  },
  connectionString: DBURL
})

export default db
