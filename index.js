// import express
import express from 'express'
// run the express function
const app = express()

// create routes
app.get('/', (req, res) => {
  res.send('Hello Javascript!')
})

// keep the server open
app.listen(4000, () => {
  console.log('Server is ready to accept requests')
})
