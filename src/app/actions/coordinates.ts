'use server'

import axios from 'axios'
import { Timestamp, WithId } from 'mongodb'

import { ReceivedData } from '@/models/device'
import { MapboxMatching } from '@/types'
import { collectionReceivedData } from '@/helpers/db-collections'

type Coordinate = [number, number]

export interface CoordinatesAction {
  coordinates: Coordinate[]
  markerCoordinates: Coordinate[]
}

const COLLECTION_SIZE = 90
const MAPBOX_MATCHING_ENDPOINT = 'https://api.mapbox.com/matching/v5/mapbox/driving'

const getMatchingCoordinates = async (resultCoordinates: string[], index = '0') => {
  const radiuses = resultCoordinates.reduce<number[]>(result => [...result, 40], [])

  const mapboxMatching = await axios
    .get<MapboxMatching>(`${MAPBOX_MATCHING_ENDPOINT}/${resultCoordinates.join(';')}`, {
      params: {
        geometries: 'geojson',
        radiuses: radiuses.join(';'),
        // steps: true,
        overview: 'full',
        tidy: true,
        ignore: 'restrictions,oneways',
        access_token:
          'pk.eyJ1Ijoicml0dmFyc2Jpa3NpcyIsImEiOiJjbHkxYW04YnYwdWQxMnZxdm9zeDJpcTVlIn0.CQQW-dsWFrJhnPpObS9amg',
      },
    })
    .then(data => data.data)

  return {
    index,
    coordinates: mapboxMatching.matchings[0].geometry.coordinates,
  }
}

const getAllCoordinates = async (coordinateCollections: string[][]) =>
  Promise.all(
    coordinateCollections.map((coordinates, index) =>
      getMatchingCoordinates(coordinates, index.toString()),
    ),
  )

const prepareDataFromDb = (
  collectionData: WithId<ReceivedData>[],
): { resultCoordinates: Coordinate[]; collectedByCount: string[][] } =>
  collectionData.reduce<{
    resultCoordinates: Coordinate[]
    prevCoordinate: string
    collectedByCount: string[][]
    counter: number
    collectionCounter: number
  }>(
    (
      { resultCoordinates, prevCoordinate, collectedByCount, counter, collectionCounter },
      { POSITION },
    ) => {
      const coordinate = POSITION.replace(/[()]/g, '').split(',').reverse().join(',')

      if (coordinate === prevCoordinate)
        return {
          resultCoordinates,
          prevCoordinate,
          counter,
          collectedByCount,
          collectionCounter,
        }

      const newCounter = counter === COLLECTION_SIZE ? 1 : counter + 1
      const newCollectionCounter =
        counter === COLLECTION_SIZE ? collectionCounter + 1 : collectionCounter
      const newCollectedByCount = collectedByCount

      if (counter === COLLECTION_SIZE || !newCollectedByCount.length)
        newCollectedByCount.push([
          ...(collectedByCount?.[collectionCounter] ? collectedByCount.slice(-1)[0].slice(-1) : []),
          coordinate,
        ])
      else newCollectedByCount[newCollectionCounter].push(coordinate)

      const [longitude, latitude] = coordinate.split(',')

      return {
        resultCoordinates: [...resultCoordinates, [Number(longitude), Number(latitude)]],
        prevCoordinate: coordinate,
        counter: newCounter,
        collectedByCount: newCollectedByCount,
        collectionCounter: newCollectionCounter,
      }
    },
    {
      resultCoordinates: [],
      prevCoordinate: '',
      collectedByCount: [],
      counter: 0,
      collectionCounter: 0,
    },
  )

export async function coordinatesAction(): Promise<CoordinatesAction> {
  const timeNow = Math.floor(Date.now() / 1000)
  const before4h = timeNow - 60 * 60 * 12

  try {
    const collectionData = await collectionReceivedData().then(collection =>
      collection()
        .find({ timestamp: { $gte: new Timestamp({ t: before4h, i: 0 }) } })
        .toArray(),
    )
    const { collectedByCount, resultCoordinates } = prepareDataFromDb(collectionData)
    const allMatchingCoordinates = await getAllCoordinates(collectedByCount)
    const { coordinates } = allMatchingCoordinates.reduce<{
      coordinates: Coordinate[]
      index: string
    }>(
      (result, { coordinates, index }) => ({
        coordinates: [...result.coordinates, ...coordinates],
        index: `${result.index}-${index}`,
      }),
      {
        coordinates: [],
        index: '',
      },
    )

    return { coordinates, markerCoordinates: resultCoordinates }
  } catch (e) {
    console.error(e)

    return {
      coordinates: [],
      markerCoordinates: [],
    }
  }
}
