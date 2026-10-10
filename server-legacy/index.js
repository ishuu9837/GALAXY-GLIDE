const express = require('express')
const app = express()
require('dotenv').config()
const connectDB = require('./config/db')
const cors = require('cors')


app.use(cors({
    origin: 'https://galaxy-glide-frontend.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
}))
const port = process.env.PORT || 8000

// app.use(express.static('public'))


app.use(express.urlencoded({extended: false}))

connectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`App listening on port ${port}`);
    })
})
.catch((err) => {
    console.log("Mongodb Connection failed", err);
    
})

// route setup
app.use('/auth', require('./routes/auth'))

app.get('/', (req, res) => {
    res.send("Hello")
})



