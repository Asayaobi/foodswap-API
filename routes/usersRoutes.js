import { Router } from 'express'
import db from '../db.js'
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
    const { rows } = await db.query(
      `SELECT * FROM users WHERE user_id = ${req.params.userId}`
    )
    if (!rows.length) {
      throw new Error('user is not found')
    }
    res.json(rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Update user info with PATCH
router.patch('/users/:userId', async (req, res) => {
  try {
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
    query += ` WHERE user_id = ${req.params.userId} RETURNING *`
    console.log('query', query)
    const updateUser = await db.query(query)
    res.json(updateUser.rows[0])
    console.log('updateUser', updateUser.rows[0])
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
