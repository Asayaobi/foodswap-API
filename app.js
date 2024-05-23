import express from 'express'
import cookieParser from 'cookie-parser'

// run the express function
const app = express()
// Middleware
app.use(cookieParser())
app.use(express.json())

// Import the users router module
import usersRouter from './routes/usersRoutes.js'
import foodRouter from './routes/foodRoutes.js'
import bookingsRouter from './routes/bookingsRoute.js'
import reviewsRouter from './routes/reviewsRoute.js'
import imagesRouter from './routes/imagesRoute.js'
import authRouter from './routes/authRoute.js'

// Tell the app to use the imported routers
app.use(usersRouter)
app.use(foodRouter)
app.use(bookingsRouter)
app.use(reviewsRouter)
app.use(imagesRouter)
app.use(authRouter)

// create routes
app.get('/', (req, res) => {
  res.send('Hello from foodswap!')
})

// keep the server open
app.listen(4000, () => {
  console.log(`Server is ready to accept requests on PORT 4000`)
})
