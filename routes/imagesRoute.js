import { Router } from 'express'
import db from '../db.js'
const router = Router()
//Post images for food
router.post('/images', async (req, res) => {
  try {
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})
// Define a GET route for fetching the list of images
router.get('/images', async (req, res) => {
  try {
    const food_id = req.query.food_id
    const { rows } = await db.query(
      `SELECT * FROM images WHERE food_id = ${food_id}`
    )
    if (!rows.length) {
      throw new Error('image is not found')
    } else {
      console.log(`rows images of food id ${food_id}`, rows)
      res.json(rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
