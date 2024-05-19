import { Router } from 'express'
import db from '../db.js'
const router = Router()

// Define a GET route for fetching the list of food
router.get('/food', (req, res) => {
  const food = [
    { id: 1, name: 'Food A', price: 100 },
    { id: 2, name: 'Food B', price: 150 }
    // Add more products as needed
  ]
  res.json(food)
})

// Define a GET route for fetching a single dish
router.get('/food/1', (req, res) => {
  res.send('Food number 1')
})

// Export the router
export default router
