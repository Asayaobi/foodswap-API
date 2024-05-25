import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWT_SECRET
const router = Router()

//Post a reservation for the dish
router.post('/bookings', async (req, res) => {
  try {
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    const { food_id, message, booking_date } = req.body
    //Validate Field
    if (!food_id) {
      throw new Error(' food_id is missing')
    }
    const { rows } = await db.query(
      `INSERT INTO bookings(food_id,user_id,message,booking_date)
      VALUES(${food_id}, ${decodedToken.user_id}, '${message}','${booking_date}') RETURNING *`
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
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    const user_id = decodedToken.user_id
    let query = `SELECT 
      bookings.booking_id,
      bookings.food_id,
      bookings.user_id,
      bookings.message,
      bookings.booking_date,
      bookings.swap,
        food.food_id,
        food.food_title,
        food.country,
        food.chef_id,
        food.rating,
        food.available,
        images.url
        FROM bookings 
        LEFT JOIN food ON food.food_id = bookings.food_id
      LEFT JOIN (
          SELECT DISTINCT ON (food_id) food_id, url
          FROM images
      ) AS images ON images.food_id = food.food_id
        WHERE user_id = ${user_id}`
    const { rows } = await db.query(query)
    console.log('query', query)
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
