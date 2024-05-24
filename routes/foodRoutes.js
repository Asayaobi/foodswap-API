import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET
const router = Router()

// Post a new dish
router.post('/food', async (req, res) => {
  try {
    // Validate Token
    const decoded = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decoded token', decoded)
    if (!decoded.user_id || !decoded.email) {
      throw new Error('Invalid authentication token')
    }
    // Validate fields
    const {
      food_title,
      country,
      category,
      ingredients,
      description,
      rating,
      available,
      images
    } = req.body
    console.log('reqbody', req.body)
    if (!food_title || !country || !category || !ingredients || !available) {
      throw new Error(
        'Either food title, country, category, ingredients, availability, or photo is missing.'
      )
    }
    // Validate images
    if (!Array.isArray(images)) {
      throw new Error('photos must be an array')
    }
    if (!images.length) {
      throw new Error('photos array cannot be empty')
    }
    if (!images.every((p) => typeof p === 'string' && p.length)) {
      throw new Error('all photos must be strings and must not be empty')
    }

    //create food
    let query = `INSERT INTO food (
          food_title,
          country,
          category,
          ingredients,
          description,
          chef_id,
          available
        ) VALUES (
          '${food_title}',
          '${country}',
          '${category}',
          '${ingredients}',
          '${description}',
          ${decoded.user_id},
          ${available}
        )RETURNING *`
    console.log('query for food info', query)
    const foodCreated = await db.query(query)
    let food = foodCreated.rows[0]

    // Create photos
    let photosQuery = 'INSERT INTO images (food_id, url) VALUES '
    images.forEach((p, i) => {
      if (i === images.length - 1) {
        photosQuery += `(${food.food_id}, '${p}') `
      } else {
        photosQuery += `(${food.food_id}, '${p}'), `
      }
    })
    photosQuery += 'RETURNING *'
    console.log('photoquery', photosQuery)
    let photosCreated = await db.query(photosQuery)
    // Compose response
    let photosArray = photosCreated.rows
    console.log('photosArrayd', photosArray)
    food.images = photosArray.map((row) => row.url)
    food.rating = 0
    // Respond
    res.json(food)
    console.log('from post food', food)
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
    // Validate Token
    const decodedToken = jwt.verity(res.cookies.jwt, jwtSecret)
    if (!decodedToken || !decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    //Validate Fields
    const {
      food_title,
      country,
      category,
      ingredients,
      description,
      chef_id,
      rating,
      available,
      images
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
    let food = updateFood.rows[0]

    if (images) {
      // Check if images is an array
      if (!Array.isArray(images)) {
        throw new Error('images must be an array of image URLs')
      }
      // Construct a subquery to insert/update images table
      const imageSubQuery = images
        .map((url) => `('${url}', ${req.params.foodId})`)
        .join(',')
      setArray.push(
        `pic_url = (SELECT array_agg(url) FROM images WHERE food_id = ${req.params.foodId} UNION ALL VALUES ${imageSubQuery})`
      )
    }
    query += setArray.join(',')
    query += ` WHERE food_id = ${req.params.foodId} RETURNING *`
    console.log('query', query)
    updateFood = await db.query(query)
    food.images = updateFood.rows[0]
    console.log('updatefood', food)
    res.json(food)
    //console.log('updatefood', updateFood.rows[0])
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
