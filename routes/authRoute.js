import { Router } from 'express'
import db from '../db.js'
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
      const { rows } = await db.query(
        `INSERT INTO users (firstname, lastname, email, password, profile_image, city) VALUES ('${firstname}','${lastname}','${email}','${password}','${profile_image}','${city}') RETURNING *`
      )
      res.json(rows)
      console.log('response', rows)
    }
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

router.get('/login', (req, res) => {
  res.send('Login user')
})

router.get('/logout', (req, res) => {
  res.send('Logout user')
})

// Export the router
export default router
