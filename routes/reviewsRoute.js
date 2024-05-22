import { Router } from 'express'
import db from '../db.js'
const router = Router()

//Post a review for a dish
router.post('/reviews', async (req, res) => {
  try {
    const { reviewer_id, food_id, review_text, rating, review_date } = req.body
    if (!reviewer_id || !food_id || !rating) {
      throw new Error('Either user_id, food_id, rating is missing.')
    } else {
      const review = await db.query(
        `INSERT INTO reviews(reviewer_id, food_id, review_text, rating, review_date)
      VALUES(${reviewer_id},${food_id},'${review_text}', ${rating},'${review_date}')
      RETURNING *`
      )
      console.log('review response', review.rows[0])
      res.json(review.rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching the list of reviews
router.get('/reviews', async (req, res) => {
  try {
    let sqlquery = `
      SELECT reviews.*, users.firstname, users.lastname, users.profile_image FROM reviews
      LEFT JOIN users ON users.user_id = reviews.reviewer_id
      WHERE food_id = ${req.query.food_id}
      ORDER BY review_date DESC
    `
    const { rows } = await db.query(sqlquery)
    if (!rows.length) {
      throw new Error('review is not found')
    } else {
      console.log('rows reviews', rows)
      res.json(rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Delete Reviews
router.delete('/reviews/:reviewId', async (req, res) => {
  try {
    const deleteReviews = await db.query(
      `DELETE FROM reviews WHERE review_id = ${req.params.reviewId} RETURNING *`
    )
    if (!deleteReviews.rows.length) {
      throw new Error(`review id is not found`)
    } else {
      res.json(deleteReviews.rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
