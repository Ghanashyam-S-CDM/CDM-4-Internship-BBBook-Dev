import {config} from 'dotenv'
config()
export const isDevelopment=(process.env.NODE_ENV==='development')

import express from 'express'
import cookieParser from 'cookie-parser'
// import https from 'https'
// import fs from 'fs'

import passport from './loaders/authLoader'
import cors from './loaders/corsLoader'
import logger from './middlewares/loggerMiddleware'
import authRouter from './routes/authRoutes'
import groupRouter from './routes/groupRoutes'
import bookRouter from './routes/bookRoutes'
import commentRouter from './routes/commentRoutes'
import httpsRedirect from './middlewares/httpsRedirect'

const app=express()

// Middlewares
!isDevelopment && app.use(httpsRedirect)
app.use(express.json({limit: '50mb'})) // JSON body parser
app.use(cookieParser())
app.use(passport.initialize())
app.use(cors)
isDevelopment && app.use(logger)

// Routes
// TODO: Scoping /api
app.get('/api/test',(req,res)=>res.json({yep: 'world'}))
app.use(authRouter)
app.use(groupRouter)
app.use(bookRouter)
app.use(commentRouter)

// Finally serve public folder
app.use(express.static('public'))
app.get('*',(req,res)=>res.sendFile('public/index.html'))

// https.createServer({
// 	key: fs.readFileSync('certs/server.key'),
// 	cert: fs.readFileSync('certs/server.cert'),
// },app)
app.listen(process.env.PORT,()=>console.log(`Listening on https://localhost:${process.env.PORT}`))

export default app