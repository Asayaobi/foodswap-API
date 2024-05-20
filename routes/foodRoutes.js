import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Post a new dish
router.post('/food', async (req, res) => {
  try {
    const {
      food_title,
      country,
      category,
      ingredients,
      description,
      chef_id,
      rating,
      available
    } = req.body
    console.log('reqbody', req.body)
    if (
      !food_title ||
      !country ||
      !category ||
      !ingredients ||
      !chef_id ||
      !available
    ) {
      throw new Error(
        'Either food title, country, category, ingredients, availability is missing.'
      )
    } else {
      const { rows } = await db.query(
        `INSERT INTO food (
          food_title,
          country,
          category,
          ingredients,
          description,
          chef_id,
          rating,
          available
        ) VALUES (
          '${food_title}',
          '${country}',
          '${category}',
          '${ingredients}',
          '${description}',
          ${chef_id},
          ${rating},
          ${available}
        )RETURNING *`
      )
      res.json({ rows })
      console.log('rows from post', rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err.message)
  }
})
// Define a GET route for fetching the list of food
// router.get('/food', async (req, res) => {
//   try {
//     const { rows } = await db.query('SELECT * FROM food')
//     console.log('rows food', rows)
//     res.json(rows)
//   } catch (err) {
//     console.error(err.message)
//     res.json(err)
//   }
// })

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

// Get route for fetching food with query
router.get('/food', async (req, res) => {
  try {
    const { search, country, category, available } = req.query
    let query = `SELECT * FROM food WHERE available = true`
    if (req.query.search) {
      query += ` AND food_title LIKE '%${req.query.search}%' OR description LIKE '%${req.query.search}%' OR ingredients LIKE '%${req.query.search}%'`
    }
    if (req.query.country) {
      query += ` AND country = '${req.query.country}'`
    }
    if (req.query.category) {
      query += ` AND category = '${req.query.category}'`
    }
    console.log('query', query)
    const { rows } = await db.query(query)
    if (rows.length > 0) {
      res.json(rows)
      console.log(rows[0])
    } else {
      throw new Error('Food item not found')
    }
  } catch (err) {
    console.error(err.message)
  }
})

// Update food info with PATCH
router.patch('food/:foodId', async (req, res) => {
  try {
    //code
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
