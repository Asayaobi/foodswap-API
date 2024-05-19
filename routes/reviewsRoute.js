import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of users
router.get('/reviews', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM reviews')
    console.log('rows reviews', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single user
router.get('/reviews/1', (req, res) => {
  res.send('Review 1')
})

// Export the router
export default router
