// import express
import express from 'express'
// run the express function
const app = express()

// Import the users router module
import usersRouter from './routes/usersRoutes.js'
import foodRouter from './routes/foodRoutes.js'
import bookingsRouter from './routes/bookingsRoute.js'

// Tell the app to use the user router
app.use(usersRouter)
app.use(foodRouter)
app.use(bookingsRouter)

// create routes
app.get('/', (req, res) => {
  res.send('Hello from foodswap!')
})

// keep the server open
app.listen(4000, () => {
  console.log('Server is ready to accept requests')
})
