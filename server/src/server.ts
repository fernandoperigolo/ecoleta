import express from 'express'
import router from './router'
import path from 'path'
import cors from 'cors'
import { errors } from 'celebrate'

const app = express()

app.use(cors())
app.use(express.json())
app.use(router)
app.use(errors())

app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')))

app.listen(3333)