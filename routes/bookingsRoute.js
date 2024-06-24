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
    const food_id = req.body.food_id
    //Validate Field
    if (!food_id) {
      throw new Error(' food_id is missing')
    }
    // Get current date in 'YYYY-MM-DD' format
    const currentDate = new Date().toISOString().split('T')[0]

    const { rows } = await db.query(
      `INSERT INTO bookings(food_id,user_id,booking_date,swap)
      VALUES(${food_id}, ${decodedToken.user_id}, '${currentDate}', 'pending') RETURNING *`
    )
    console.log('post booking response', rows[0])
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Update a swap status
router.patch('/swap', async (req, res) => {
  try {
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    const { booking_id, swap } = req.body
    //Validate Field
    if (!booking_id || !swap) {
      return res.json({
        error: 'Either booking_id or swap status is missing'
      })
    }
    const query = `UPDATE bookings
      SET swap = '${swap}' WHERE booking_id = ${booking_id}`
    console.log('query to patch swap', query)
    const { rows } = await db.query(query)
    console.log('swap status response', rows[0])
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
        WHERE user_id = ${user_id} AND food.available = true`
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

//get booking request
router.get('/request', async (req, res) => {
  try {
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    // 1 get food id from this user
    const getFoodId = await db.query(
      `SELECT food_id from food WHERE chef_id = ${decodedToken.user_id}`
    )
    console.log('food_id', getFoodId.rows)
    //2 get user who request the food
    const requestUsers = []
    const foodids = getFoodId.rows
    let query = `SELECT user_id from bookings WHERE ${foodids.map((e) => `food_id = ${e.food_id}`).join(' OR ')}`
    console.log('query to get user_id', query)
    const getRequestUserId = await db.query(query)
    console.log('response from getRequestUserId', getRequestUserId.rows)
    requestUsers.push(getRequestUserId.rows)
    //3 show dishes from those users

    let querySwap = `
      SELECT 
      bookings.booking_id,
      bookings.swap,
      food.food_id,
      food.food_title,
      food.country,
      food.chef_id,
      food.rating,
      food.available,
      images.url
    FROM bookings 
      LEFT JOIN food ON food.chef_id = bookings.user_id 
      LEFT JOIN (
          SELECT DISTINCT ON (food_id) food_id, url
          FROM images
      ) AS images ON images.food_id = food.food_id  
      WHERE (${requestUsers[0].map((e) => `bookings.user_id = ${e.user_id}`).join(' OR ')} AND ${foodids.map((e) => `bookings.food_id = ${e.food_id}`).join(' OR ')}) AND food.available = true`

    console.log('request query', querySwap)
    const getFoodOptions = await db.query(querySwap)
    console.log('getFoodOptions', getFoodOptions.rows)
    res.json(getFoodOptions.rows)
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
