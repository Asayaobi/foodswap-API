import { Router } from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = Router()
const jwtSecret = process.env.JWT_SECRET

router.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, profile_image, city } =
      req.body
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !profile_image ||
      !city
    ) {
      return res.json({
        error: 'Please complete the form before submitting.'
      })
    }
    //send query to database to check if email is already exist
    const checkEmail = await db.query(
      `SELECT * FROM users WHERE email = '${email}'`
    )
    console.log('checkEmail', checkEmail.rowCount)
    if (checkEmail.rowCount) {
      return res.json({ error: 'This email is already existed' })
    } else {
      //hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      //send query to database
      const { rows } = await db.query(
        `INSERT INTO users (firstname, lastname, email, password, profile_image, city) VALUES ('${firstname}','${lastname}','${email}','${hashedPassword}','${profile_image}','${city}') RETURNING *`
      )
      // create payload data from the database
      const payload = {
        email: rows[0].email,
        user_id: rows[0].user_id
      }
      console.log('payload', payload)
      // Generate a token
      const token = jwt.sign(payload, jwtSecret)
      //Put the jwt in the cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None'
      })
      // Send the jwt in the cookie with the response
      res.json({ message: 'logged in' })
    }
  } catch (err) {
    console.error(err.message)
    res.json({ error: 'Internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      throw new Error('Either your email or your password is missing')
    } else {
      //recieve data from query
      const query = `SELECT * FROM users 
        WHERE email = '${email}'`
      console.log(query)
      const result = await db.query(query)
      console.log('log in data', result.rows)
      if (!result.rowCount) {
        throw new Error(`your email does not exist`)
      }
      //verify password
      const hashedPassword = result.rows[0].password
      console.log('hashedPassword', hashedPassword)
      console.log('password', password)
      const isPasswordValid = await bcrypt.compare(password, hashedPassword)
      if (isPasswordValid) {
        //create payload - jwt token
        const payload = {
          email: result.rows[0].email,
          user_id: result.rows[0].user_id
        }
        console.log('payload login', payload)
        // Generate a token
        const token = jwt.sign(payload, jwtSecret)
        //Put the jwt in the cookie
        res.cookie('jwt', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None'
        })
        // Send the jwt in the cookie with the response
        res.send({ message: 'logged in' })
      } else {
        res.json({ error: 'Your password is not correct' })
      }
    }
  } catch (err) {
    console.error(err.message)
    res.status(400).json({ error: err.message })
  }
})

router.get('/logout', (req, res) => {
  try {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'None' // Ensure it matches the cookie settings
    })
    res.json({ message: 'You are logged out' })
  } catch (err) {
    res.json({ error: err.message })
  }
})

// Export the router
export default router
