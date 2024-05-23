import { Router } from 'express'
import db from '../db.js'
import bcrypt from 'bcrypt'

const router = Router()

router.post('/signup', async (req, res) => {
  try {
    const { firstname, lastname, email, password, profile_image, city } =
      req.body
    if (!firstname || !lastname || !email || !password) {
      throw new Error(
        'Either first name, last name, email, password is missing.'
      )
    } else {
      //hash password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      //send query to database
      const { rows } = await db.query(
        `INSERT INTO users (firstname, lastname, email, password, profile_image, city) VALUES ('${firstname}','${lastname}','${email}','${hashedPassword}','${profile_image}','${city}') RETURNING *`
      )
      res.json(rows)
      console.log('response', rows)
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
      //compare password
      const hashedPassword = rows[0].password
      const isPasswordValid = await bcrypt.compare(password, hashedPassword)
      if (isPasswordValid) {
        res.json(rows[0])
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
