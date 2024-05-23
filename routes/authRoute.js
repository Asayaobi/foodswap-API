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
    if (!firstname || !lastname || !email || !password) {
      throw new Error(
        'Either first name, last name, email, password is missing.'
      )
    }
    //send query to database to check if email is already exist
    const checkEmail = await db.query(
      `SELECT * FROM users WHERE email = '${email}'`
    )
    console.log('checkEmail', checkEmail.rowCount)
    if (checkEmail.rowCount) {
      res.send(`This email is already exist`)
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
        id: rows[0].user_id
      }
      console.log('payload', payload)
      // Generate a token
      const token = jwt.sign(payload, jwtSecret)
      //Put the jwt in the cookie
      res.cookie('jwt', token)
      // Send the jwt in the cookie with the response
      res.send({ message: 'logged in' })
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      throw new Error('Either your email or your password is missing')
    } else {
      //recieve data from query
      const { rows } = await db.query(
        `SELECT * FROM users 
        WHERE email = '${email}'`
      )
      console.log('log in data', rows[0])
      //verify password
      const hashedPassword = rows[0].password
      const isPasswordValid = await bcrypt.compare(password, hashedPassword)
      if (isPasswordValid) {
        //create payload - jwt token
        const payload = {
          email: rows[0].email,
          id: rows[0].user_id
        }
        console.log('payload login', payload)
        // Generate a token
        const token = jwt.sign(payload, jwtSecret)
        //Put the jwt in the cookie
        res.cookie('jwt', token)
        // Send the jwt in the cookie with the response
        res.send({ message: 'logged in' })
      } else {
        res.send(`your password is not correct`)
      }
    }
  } catch (err) {
    console.error(err.message)
    res.json(err.message)
  }
})

router.get('/logout', (req, res) => {
  res.send('Logout user')
})

// Export the router
export default router
