// import express
import express from 'express'
// run the express function
const app = express()

// Import the users router module
import usersRouter from './routes/users.js'
import foodRouter from './routes/food.js'

// Tell the app to use the user router
app.use(usersRouter)
app.use(foodRouter)

// create routes
app.get('/', (req, res) => {
  res.send('Hello from foodswap!')
})

// keep the server open
app.listen(4000, () => {
  console.log('Server is ready to accept requests')
})
