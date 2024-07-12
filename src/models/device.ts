import { Document, ObjectId, Timestamp } from 'mongodb'

export interface Device extends Document {
  device: string
  device_name: string
  device_serial: string
  device_location: string
  device_tags: string[]
  product_id: string
  product_slug: string
}

export interface ReceivedData extends Document {
  deviceId: ObjectId
  timestamp: Timestamp
  POSITION: string
  GNSS_FIX: boolean
  CAPACITY: number
  ACCURACY: number
  TEMPERATURE: number
  VOLTAGE: number
  RSSI: number
  SNR: number
  DATARATE: string
}
