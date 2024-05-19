// import express
import express from 'express'
// run the express function
const app = express()

// create routes
app.get('/', (req, res) => {
  res.send('Hello Javascript!')
})

//for testing purpose
app.get('/products', (req, res) => {
  const products = [
    { id: 1, name: 'Product A', price: 100 },
    { id: 2, name: 'Product B', price: 150 }
    // Add more products as needed
  ]
  res.send(products)
})

// keep the server open
app.listen(4000, () => {
  console.log('Server is ready to accept requests')
})
