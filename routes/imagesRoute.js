import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of images
router.get('/images', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM images')
    console.log('rows images', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
