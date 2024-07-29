import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
import { clearConfigCache } from 'prettier'

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
      images,
      available
    } = req.body
    console.log('reqbody', req.body)
    if (!food_title || !country || !category || !ingredients || !description) {
      return res.json({
        error:
          'Either food title, country, category, ingredients, description, availability or images is missing.'
      })
    }
    // Validate images
    if (!Array.isArray(images)) {
      return res.json({
        error: 'images must be an array.'
      })
    }
    if (!images.length) {
      return res.json({
        error: 'images cannot be empty.'
      })
    }
    if (!images.every((p) => typeof p === 'string' && p.length)) {
      return res.json({
        error: 'all images must be strings and cannot be empty.'
      })
    }

    //check if there's any available food in the list
    const checkQuery = `SELECT * FROM food WHERE chef_id = ${decoded.user_id} AND available = TRUE`
    console.log('checkQuery', checkQuery)
    let result = await db.query(checkQuery)
    console.log('check data', result)
    if (result.rowCount) {
      return res.json({
        error: `You can only list one available dish at a time, please update the availability of your other dish to 'not today'.`
      })
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
    console.log('query for CREATE FOOD', query)
    const foodCreated = await db.query(query)
    let food = foodCreated.rows[0]

    // // Create photos
    let photosQuery = 'INSERT INTO images (food_id, url) VALUES '
    images.forEach((p, i) => {
      if (i === images.length - 1) {
        photosQuery += `(${food.food_id}, '${p}') `
      } else {
        photosQuery += `(${food.food_id}, '${p}'), `
      }
    })
    photosQuery += 'RETURNING *'
    console.log('query FOR CREATE IMAGES', photosQuery)
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
    res.json({ error: err.message })
  }
})
// Define a GET route for fetching the list of food from the same user id
router.get('/listings', async (req, res) => {
  try {
    // Validate Token
    const decoded = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decoded token', decoded)
    if (!decoded.user_id || !decoded.email) {
      throw new Error('Invalid authentication token')
    }
    //get the listings
    const { rows } = await db.query(
      `SELECT * 
FROM (
    SELECT DISTINCT ON (food.food_id) 
        food.*, 
        images.url
    FROM food 
    LEFT JOIN images ON food.food_id = images.food_id 
    WHERE chef_id = ${decoded.user_id})`
    )
    console.log('rows food', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

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
    const { search, country, category, city } = req.query
    let query = `SELECT * 
FROM (
    SELECT DISTINCT ON (food.food_id) 
        food.*, 
        images.url, 
        users.city
    FROM food 
    LEFT JOIN images ON food.food_id = images.food_id
    LEFT JOIN users ON food.chef_id = users.user_id
    WHERE available = true
`
    if (req.query.search) {
      query += ` AND food_title LIKE '%${req.query.search}%' OR description LIKE '%${req.query.search}%' OR ingredients LIKE '%${req.query.search}%'`
    }
    if (req.query.city) {
      query += ` AND city = '${req.query.city}'`
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
      return res.json({
        error: 'food item not found'
      })
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
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decoded token', decodedToken)
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
      available
    } = req.body
    console.log('body', req.body)

    //Update food table
    let food
    if (
      food_title ||
      country ||
      category ||
      ingredients ||
      description ||
      available
    ) {
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
      if (available) {
        setArray.push(`available = ${available}`)
      }
      query += setArray.join(', ')
      query += ` WHERE food_id = ${req.params.foodId} AND chef_id = ${decodedToken.user_id} RETURNING *`
      console.log('query for update food', query)
      const updateFood = await db.query(query)
      food = updateFood.rows[0]
      console.log('updatefood', food)
    }

    // Insert images into images table
    let images = req.body.images
    console.log('images from patch', images)
    if (
      images &&
      Array.isArray(images) &&
      images.length > 0 &&
      images.every((img) => img.trim() !== '')
    ) {
      const getOldimages = await db.query(
        `SELECT * FROM images WHERE food_id = ${req.params.foodId}`
      )
      const oldImages = getOldimages.rows
      console.log('oldImages', oldImages)
      console.log('images', images)
      if (oldImages.length === 0) {
        //if there's no existed image
        const imageInserts = (images) => {
          for (let i = 0; i < images.length; i++) {
            images[i] = `(${req.params.foodId}, '${images[i]}')`
          }
          let imagesStrings = images.join(', ')
          return imagesStrings
        }
        const updateImage = imageInserts(images)
        console.log('update string', updateImage)
        const insertImagesQuery = `INSERT INTO images (food_id, url) VALUES ${updateImage}`
        const updateFood = await db.query(insertImagesQuery)
        console.log(`${updateFood.rowCount} images inserted successfully`)
      } else {
        //if there're existed images
        function replaceUrls(oldImages, newUrls) {
          for (let i = 0; i < oldImages.length && i < newUrls.length; i++) {
            oldImages[i].url = newUrls[i]
          }
          return oldImages
        }
        let newImages = replaceUrls(oldImages, images)
        // Update the URLs in the database
        for (const img of newImages) {
          await db.query(`UPDATE images SET url = $1 WHERE image_id = $2`, [
            img.url,
            img.image_id
          ])
        }
        console.log('Updated images', newImages)
      }
    }
    res.json(food)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete Food
router.delete('/food/:foodId', async (req, res) => {
  try {
    //Validate Token
    let decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('You are not authorized')
    }
    const { rows } = await db.query(`
    DELETE FROM food WHERE food_id = ${req.params.foodId} AND chef_id = ${decodedToken.user_id} RETURNING *
  `)
    if (!rows.length) {
      throw new Error(`You are not authorized to delete this item`)
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
