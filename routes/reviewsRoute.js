import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWT_SECRET
const router = Router()

//Post a review for a dish
router.post('/reviews', async (req, res) => {
  try {
    //Validate Token
    const decoded = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decoded token', decoded)
    if (!decoded.user_id || !decoded.email) {
      throw new Error('Invalid authentication token')
    }
    //Validate field
    const { review_text, rating, food_id } = req.body
    const review_date = new Date().toISOString()
    if (!review_text || !rating) {
      throw new Error('Either comment or rating is missing.')
    } else {
      const review = await db.query(
        `INSERT INTO reviews(reviewer_id, food_id, review_text, rating, review_date)
      VALUES(${decoded.user_id},${food_id},'${review_text}', ${rating},'${review_date}')
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
    //adjust time format
    const formatter = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })

    //arrange data into review
    let reviews = rows.map((r) => {
      r.author = {
        firstname: r.firstname,
        lastname: r.lastname,
        profile_image: r.profile_image
      }
      r.review_date = formatter.format(new Date(r.review_date))
      delete r.firstname
      delete r.lastname
      delete r.profile_image
      return r
    })
    res.json(reviews)
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
