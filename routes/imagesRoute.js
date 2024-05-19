import { Router } from 'express'
const router = Router()

// Define a GET route for fetching the list of images
router.get('/images', (req, res) => {
  res.send('List of images')
})

// Export the router
export default router
