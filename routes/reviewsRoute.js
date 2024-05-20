import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of reviews
router.get('/reviews', async (req, res) => {
  try {
    const food_id = req.query.food_id
    const { rows } = await db.query(
      `SELECT * FROM reviews WHERE food_id = ${food_id}`
    )
    console.log('rows reviews', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
