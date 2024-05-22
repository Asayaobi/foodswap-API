import { Router } from 'express'
import db from '../db.js'
const router = Router()

//Post a reservation for the dish
router.post('/bookings', async (req, res) => {
  try {
    const { food_id, user_id, message, booking_date } = req.body
    if (!food_id || !user_id) {
      throw new Error('Either food_id or user_id is missing')
    }
    const { rows } = await db.query(
      `INSERT INTO bookings(food_id,user_id,message,booking_date)
      VALUES(${food_id}, ${user_id}, '${message}','${booking_date}') RETURNING *`
    )
    console.log('post booking response', rows[0])
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

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

//Delete Booking
router.delete('/bookings/:bookingId', async (req, res) => {
  try {
    const { rows } = await db.query(`
    DELETE FROM bookings WHERE booking_id = ${req.params.bookingId} RETURNING *
  `)
    if (!rows.length) {
      throw new Error(`This booking doesn't exist`)
    }
    res.json(rows[0])
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
