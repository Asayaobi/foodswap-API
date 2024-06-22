import { Router } from 'express'
import db from '../db.js'
import jwt from 'jsonwebtoken'
const jwtSecret = process.env.JWT_SECRET
const router = Router()

// Define a GET route for fetching the list of users
router.get('/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users')
    console.log('rows users', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Define a GET route for fetching a single user
router.get('/users/:userId', async (req, res) => {
  try {
    //Validate Token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    //checks if the requesting user id is the same user id
    if (decodedToken.user_id != req.params.userId) {
      throw new Error('You are not authorized')
    } else {
      const { rows } = await db.query(
        `SELECT * FROM users WHERE user_id = ${decodedToken.user_id}`
      )
      res.json(rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

//Get user for /profile page
router.get('/profile', async (req, res) => {
  try {
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    if (!decodedToken.user_id || !decodedToken.email) {
      res.json({ error: 'please log in to view your profile' })
    } else {
      const { rows } = await db.query(
        `SELECT * FROM users WHERE user_id = ${decodedToken.user_id}`
      )
      console.log('response from users for /profile', rows[0])
      res.json(rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Update user info with PATCH
router.patch('/users/:userId', async (req, res) => {
  try {
    //validate token
    const decodedToken = jwt.verify(req.cookies.jwt, jwtSecret)
    console.log('decodedToken', decodedToken)
    if (!decodedToken.user_id || !decodedToken.email) {
      throw new Error('Invalid authentication token')
    }
    //checks if the requesting user id is the same user id
    if (decodedToken.user_id != req.params.userId) {
      throw new Error('You are not authorized')
    } else {
      const { firstname, lastname, email, password, profile_image, city } =
        req.body
      let query = `UPDATE users SET `
      let setArray = []
      if (firstname) {
        setArray.push(`firstname = '${firstname}'`)
      }
      if (lastname) {
        setArray.push(`lastname = '${lastname}'`)
      }
      if (email) {
        setArray.push(`email = '${email}'`)
      }
      if (password) {
        setArray.push(`password = '${password}'`)
      }
      if (profile_image) {
        setArray.push(`profile_image = '${profile_image}'`)
      }
      if (city) {
        setArray.push(`city = '${city}'`)
      }
      query += setArray.join(', ')
      query += ` WHERE user_id = ${decodedToken.user_id} RETURNING *`
      console.log('query', query)
      const updateUser = await db.query(query)
      res.json(updateUser.rows[0])
      console.log('updateUser', updateUser.rows[0])
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
