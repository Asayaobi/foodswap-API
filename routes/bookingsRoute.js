import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWT_SECRET
const router = Router()

//Post a reservation for the dish
router.post('/bookings', async (req, res) => {
  try {
    // Check if user isn't logged in = req.cookies is an empty object
    const isEmptyObject =
      req.cookies &&
      Object.keys(req.cookies).length === 0 &&
      (Object.getPrototypeOf(req.cookies) === null ||
        Object.getPrototypeOf(req.cookies) === Object.prototype)
    if (isEmptyObject) {
      return res.json({
        error: 'Please register in order to swap with others.'
      })
    }

    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }

    //Check if this user has listed any food to swap
    const checkQuery = `SELECT * FROM food where chef_id = ${decodedToken.user_id} AND available = TRUE`
    let result = await db.query(checkQuery)
    if (result.rowCount === 0) {
      return res.json({
        error: `You have to list one dish in order to swap with others.`
      })
    } else {
      //post the swap request
      const food_id = req.body.food_id
      //Validate Field
      if (!food_id) {
        throw new Error('food_id is missing')
      }

      // Get current date in 'YYYY-MM-DD' format
      const currentDate = new Date().toISOString().split('T')[0]
      const { rows } = await db.query(
        `INSERT INTO bookings(food_id,user_id,booking_date,swap)
      VALUES(${food_id}, ${decodedToken.user_id}, '${currentDate}', 'pending') RETURNING *`
      )
      res.json(rows[0])
    }
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
    const { rows } = await db.query(query)
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
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }

    // 1 get food id from this user
    const getFoodId = await db.query(
      `SELECT food_id from food WHERE chef_id = ${decodedToken.user_id}`
    )

    //2 get user who request the food
    const requestUsers = []
    const foodids = getFoodId.rows
    let query = `SELECT user_id from bookings WHERE ${foodids.map((e) => `food_id = ${e.food_id}`).join(' OR ')}`
    const getRequestUserId = await db.query(query)
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
      WHERE (${requestUsers[0].map((e) => `bookings.user_id = ${e.user_id}`).join(' OR ')}) AND ${foodids.map((e) => `bookings.food_id = ${e.food_id}`).join(' OR ')} AND food.available = true`

    const getFoodOptions = await db.query(querySwap)
    res.json(getFoodOptions.rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete Booking * for API testing only *
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

export default router
