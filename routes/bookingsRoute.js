import { Router } from 'express'
const router = Router()

// Define a GET route for fetching the list of booking
router.get('/bookings', (req, res) => {
  const booking = [
    { id: 1, name: 'Food A', price: 100 },
    { id: 2, name: 'Food B', price: 150 }
    // Add more products as needed
  ]
  res.json(booking)
})

// Define a GET route for fetching a single dish
router.get('/bookings/1', (req, res) => {
  res.send('Booking number 1')
})

// Export the router
export default router
