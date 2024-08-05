import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWT_SECRET
const router = Router()

//Post images for food
router.post('/images', async (req, res) => {
  try {
    //Validate field
    let decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    const food_id = req.body.food_id
    //check if this item belongs to this user_id
    const userCheck = await db.query(
      `SELECT * FROM food WHERE chef_id = ${decodedToken.user_id} AND food_id = ${food_id}`
    )
    let foodFromUser = userCheck.rows
    if (foodFromUser.rowCount === 0) {
      throw new Error('You are not authorized')
    } else {
      //add array of images
      const imagesArray = req.body.images
      let query = `INSERT INTO images(food_id,url) VALUES`
      const setUrl = (imagesArray, food_id) => {
        let setArray = []
        for (let i = 0; i < imagesArray.length; i++) {
          setArray.push(`(${food_id}, '${imagesArray[i]}')`)
        }
        return setArray.join(',')
      }
      query += setUrl(imagesArray, food_id)
      query += ' RETURNING *'
      //send query
      const images = await db.query(query)
      res.json(images.rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching the list of images
router.get('/images', async (req, res) => {
  try {
    const food_id = req.query.food_id
    const { rows } = await db.query(
      `SELECT * FROM images WHERE food_id = ${food_id}`
    )
    if (!rows.length) {
      throw new Error('image is not found')
    } else {
      res.json(rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Update image info with PATCH
router.patch('/images/:imageId', async (req, res) => {
  try {
    //validate token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    //check if this item belongs to this user_id
    const food_id = req.body.food_id
    const userCheck = await db.query(
      `SELECT * FROM food WHERE chef_id = ${decodedToken.user_id} AND food_id = ${food_id}`
    )
    if (userCheck.rowCount === 0) {
      throw new Error('You are not authorized.')
    } else {
      //updateImage
      const url = req.body.url
      const query = `UPDATE images SET url = '${url}' WHERE image_id = ${req.params.imageId} RETURNING *`
      const updateImage = await db.query(query)
      res.json(updateImage.rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete image * for API testing only *
router.delete('/images/:imageId', async (req, res) => {
  try {
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    //check user
    const getFoodId = await db.query(
      `SELECT food_id FROM images WHERE image_id = ${req.params.imageId}`
    )
    const food_id = getFoodId.rows[0].food_id
    const checkUser = await db.query(
      `SELECT * FROM food WHERE food_id = ${food_id} AND chef_id = ${decodedToken.user_id}`
    )
    if (checkUser.rowCount === 0) {
      throw new Error('You are not authorized.')
    } else {
      const deleteImage = await db.query(
        `DELETE FROM images WHERE image_id = ${req.params.imageId} RETURNING *`
      )
      if (!deleteImage.rows.length) {
        throw new Error(`Image id id not found`)
      }
      res.json(deleteImage.rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

export default router
