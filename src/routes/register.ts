import express from 'express'
import { registerGet, registerPost } from '../controllers/register-control.js'
const router = express.Router()

router.get('/', registerGet)

router.post('/', registerPost)

export default router
