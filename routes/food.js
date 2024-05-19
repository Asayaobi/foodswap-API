import { Router } from 'express'
const router = Router()

// Define a GET route for fetching the list of food
router.get('/food', (req, res) => {
  res.send('List of food')
})

// Define a GET route for fetching a single dish
router.get('/food/1', (req, res) => {
  res.send('Food number 1')
})

// Export the router
export default router
