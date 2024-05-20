import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')
    console.log('rows users', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single user
router.get('/users/:userId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM users WHERE user_id = ${req.params.userId}`
    )
    if (!rows.length) {
      throw new Error('user is not found')
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
