import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of booking from each user
router.get('/bookings', async (req, res) => {
  try {
    const user_id = req.query.user_id
    const { rows } = await db.query(
      `SELECT * FROM bookings WHERE user_id = ${user_id}`
    )
    console.log(`bookings of user id ${user_id}`, rows)
    if (!rows.length) {
      throw new Error('booking is not found')
    } else {
      res.json(rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single booking
// router.get('/bookings/1', async (req, res) => {
//   try {
//     const { rows } = await db.query(
//       'SELECT * FROM bookings WHERE booking_id = 1'
//     )
//     console.log('rows bookingid1', rows)
//     res.json(rows)
//   } catch (err) {
//     console.error(err.message)
//     res.json(err)
//   }
// })

// Export the router
export default router
