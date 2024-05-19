import { Router } from 'express'
const router = Router()

// Define a GET route for fetching the list of users
router.get('/login', (req, res) => {
  res.send('Login user')
})

// Export the router
export default router
