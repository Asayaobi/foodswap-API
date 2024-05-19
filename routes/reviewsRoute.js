import { Router } from 'express'
const router = Router()

// Define a GET route for fetching the list of users
router.get('/reviews', (req, res) => {
  res.send('List of reviews')
})

// Define a GET route for fetching a single user
router.get('/reviews/1', (req, res) => {
  res.send('Review 1')
})

// Export the router
export default router
