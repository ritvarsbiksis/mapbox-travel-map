import { MongoClient } from 'mongodb'

export * from './mapbox'

export type SvgComponent = React.FC<React.SVGProps<SVGSVGElement>>

declare global {
  const _mongoClientPromise: Promise<MongoClient>
}
