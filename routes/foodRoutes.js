import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of food
router.get('/food', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM food')
    console.log('rows food', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single dish
router.get('/food/:foodId', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM food WHERE food_id = ${req.params.foodId}`
    )
    if (rows.length > 0) {
      res.json(rows[0])
    } else {
      throw new Error('Food item not found')
    }
  } catch (err) {
    console.error(err.message)
  }
})

// Export the router
export default router
