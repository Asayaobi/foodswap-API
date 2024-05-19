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

// Define a GET route for fetching a single booking
router.get('/bookings/1', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM booking WHERE booking_id = 1'
    )
    console.log('rows bookingid1', rows)
    res.json(rows)
  } catch (err) {
    console.error(err.message)
    res.json(err)
  }
})

// Export the router
export default router
