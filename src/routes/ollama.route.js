import { Router } from 'express'
import chat from '../controller/ollama.controller.js'

const router = Router()

router.post('/', chat)

export default router