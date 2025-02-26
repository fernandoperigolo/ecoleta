import express from 'express'
import PointsController from './controllers/PointsController'
import ItemsController from './controllers/ItemsController'
import multer from 'multer'
import multerConfig from './config/multer'
import { celebrate, Joi } from 'celebrate'

const router = express.Router()
const upload = multer(multerConfig)

const pointsController = new PointsController()
const itemsController =  new ItemsController()

router.get('/items', itemsController.index)

router.get('/points', pointsController.index)
router.get('/points/:id', pointsController.show)

router.post(
  '/points',
  upload.single('image'),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().required().email(),
      whatsapp: Joi.number().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      city: Joi.string().required(),
      uf: Joi.string().required().max(2),
      items: Joi.string().required(),
    })
  }, {
    abortEarly: false,
  }),
  pointsController.create
)

export default router