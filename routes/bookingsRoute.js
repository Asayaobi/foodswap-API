import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of booking
router.get('/bookings', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM bookings')
    console.log('rows bookings', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single booking
router.get('/bookings/1', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM bookings WHERE booking_id = 1'
    )
    console.log('rows bookingid1', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
