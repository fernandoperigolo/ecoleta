import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items }  = request.query

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))

    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    const serializedPoints = points.map(point => ({
      ...point,
      image_url: `http://192.168.1.8:3333/uploads/${point.image}`,
    }))

    return response.json(serializedPoints)
  }

  async show(request: Request, response: Response) {
    const { id } = request.params

    const point = await knex('points').where('id', id).first()

    if (!point) {
      return response.status(400).json({ message: 'Point not found' })
    }
    
    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('items.title')

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.1.8:3333/uploads/${point.image}`,
    }

    return response.json({ point: serializedPoint, items })
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    }  = request.body
  
    const trx = await knex.transaction()
  
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }

    const createdPointsIds = await trx('points').insert(point)

    const createdPointId = createdPointsIds[0]

    const formattedPointsItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item: number) => ({
      item_id: item,
      point_id: createdPointId,
    }))

    await trx('points_items').insert(formattedPointsItems)
  
    await trx.commit()

    return response.json({
      id: createdPointId,
      ...point,
    })
  }
}

export default PointsController