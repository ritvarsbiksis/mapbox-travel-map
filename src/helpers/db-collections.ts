import { Collection } from 'mongodb'

import clientPromise from '@/lib/mongodb'
import { Device, ReceivedData } from '@/models/device'

const { DB_NAME, DEVICES_COLLECTION_NAME, RECEIVED_DATA_COLLECTION_NAME } = process.env

export const collectionDevice = async (): Promise<() => Collection<Device>> => {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  return () => db.collection<Device>(DEVICES_COLLECTION_NAME || '')
}

export const collectionReceivedData = async (): Promise<() => Collection<ReceivedData>> => {
  const client = await clientPromise
  const db = client.db(DB_NAME)

  return () => db.collection<ReceivedData>(RECEIVED_DATA_COLLECTION_NAME || '')
}
