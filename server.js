require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')

var cors = require('cors')

const app = express()

const MONGO_URL = process.env.MONGO_URL
const PORT = process.env.PORT
const FRONTEND = process.env.FRONTEND

var corsOptions = {
    origin: FRONTEND,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
  }

  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(morgan("common"))

  

  app.get('/', (req,res)=>{
    res.send('Hello NODE API')
})

app.get('/block', (req,res)=>{
    res.send('Hello BLOCK my name is mimi')
})

//app.use(errorMiddleware)

mongoose.
connect(MONGO_URL)
.then(()=>{
    console.log('connected to mongodb')
    app.listen(PORT, ()=> {
        console.log(`Node API app is running on port ${PORT}`)
    })    
}).catch((error)=>{
    console.log(error)
})

