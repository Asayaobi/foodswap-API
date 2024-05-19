import { Router } from 'express'
const router = Router()

router.get('/signup', (req, res) => {
  res.send('Signup user')
})

router.get('/login', (req, res) => {
  res.send('Login user')
})

router.get('/logout', (req, res) => {
  res.send('Logout user')
})

// Export the router
export default router
