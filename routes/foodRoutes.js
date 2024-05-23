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
    if (!rows.length) {
      throw new Error('food id is not fond')
    }
    let food = rows[0]
    // join user
    let { rows: chefRows } = await db.query(
      `SELECT user_id, profile_image, firstname, lastname FROM users WHERE user_id = ${food.chef_id}`
    )
    food.chef = {
      user_id: chefRows[0].user_id,
      profile_image: chefRows[0].profile_image,
      firstname: chefRows[0].firstname,
      lastname: chefRows[0].lastname
    }
    // join images
    let { rows: imagesRows } = await db.query(
      `SELECT * FROM images WHERE food_id = ${food.food_id}`
    )
    food.images = imagesRows.map((i) => i.url)
    delete food.user_id
    res.json(food)
  } catch (err) {
    console.error(err.message)
  }
})

// Get route for fetching food with query
router.get('/food', async (req, res) => {
  try {
    const { search, country, category, available } = req.query
    let query = `SELECT * FROM (SELECT DISTINCT ON (food.food_id) food.*, images.url FROM food LEFT JOIN images ON food.food_id = images.image_id WHERE available = true`
    if (req.query.search) {
      query += ` AND food_title LIKE '%${req.query.search}%' OR description LIKE '%${req.query.search}%' OR ingredients LIKE '%${req.query.search}%'`
    }
    if (req.query.country) {
      query += ` AND country = '${req.query.country}'`
    }
    if (req.query.category) {
      query += ` AND category = '${req.query.category}'`
    }
    query += ') AS distinct_food'
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

//add get request for filter results -- countries
router.get('/country', async (req, res) => {
  try {
    let query = `SELECT DISTINCT(country) FROM food`
    let { rows } = await db.query(query)
    rows = rows.map((r) => r.country)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

//add get request for filter results -- category
router.get('/category', async (req, res) => {
  try {
    let query = `SELECT DISTINCT(category) FROM food`
    let { rows } = await db.query(query)
    rows = rows.map((r) => r.category)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

//add get request for filter results -- city
router.get('/city', async (req, res) => {
  try {
    let query = `SELECT DISTINCT(city) FROM users`
    let { rows } = await db.query(query)
    rows = rows.map((r) => r.city)
    res.json(rows)
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Update food info with PATCH
router.patch('/food/:foodId', async (req, res) => {
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
    console.log('body', req.body)
    let query = `UPDATE food SET `
    const setArray = []
    if (food_title) {
      setArray.push(`food_title = '${food_title}'`)
    }
    if (country) {
      setArray.push(`country = '${country}'`)
    }
    if (category) {
      setArray.push(`category = '${category}'`)
    }
    if (ingredients) {
      setArray.push(`ingredients = '${ingredients}'`)
    }
    if (description) {
      setArray.push(`description = '${description}'`)
    }
    if (chef_id) {
      setArray.push(`chef_id = ${chef_id}`)
    }
    if (rating) {
      setArray.push(`rating = ${rating}`)
    }
    if (available) {
      setArray.push(`available = ${available}`)
    }
    query += setArray.join(',')
    query += ` WHERE food_id = ${req.params.foodId} RETURNING *`
    console.log('query', query)
    const updateFood = await db.query(query)
    res.json(updateFood.rows[0])
    console.log('updatefood', updateFood.rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete Food
router.delete('/food/:foodId', async (req, res) => {
  try {
    const { rows } = await db.query(`
    DELETE FROM food WHERE food_id = ${req.params.foodId} RETURNING *
  `)
    if (!rows.length) {
      throw new Error(`Food id doesn't exist`)
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
