import { Router } from 'express'
import db from '../db.js'
const router = Router()
//Post images for food
router.post('/images', async (req, res) => {
  try {
    const { food_id, url } = req.body
    const images = await db.query(
      `INSERT INTO images(food_id,url) VALUES(${food_id},'${url}') RETURNING *`
    )
    console.log('images response', images.rows[0])
    res.json(images.rows[0])
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
      console.log(`rows images of food id ${food_id}`, rows)
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
    const { food_id, url } = req.body
    let query = `UPDATE images SET `
    let setArray = []
    if (food_id) {
      setArray.push(`food_id = ${food_id}`)
    }
    if (url) {
      setArray.push(`url = '${url}'`)
    }
    query += setArray.join(',')
    query += ` WHERE image_id = ${req.params.imageId} RETURNING *`
    console.log('query', query)
    const updateImage = await db.query(query)
    res.json(updateImage.rows[0])
    console.log('update Image', updateImage.rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete image
router.delete('/images/:imageId', async (req, res) => {
  try {
    const deleteImage = await db.query(
      `DELETE FROM images WHERE image_id = ${req.params.imageId} RETURNING *`
    )
    if (!deleteImage.rows.length) {
      throw new Error(`Image id id not found`)
    }
    res.json(deleteImage.rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
