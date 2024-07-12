'use client'

import { Geometry } from 'geojson'
import ReactMapGL, { Layer, Marker, Source, ViewState } from 'react-map-gl'

import { CoordinatesAction, coordinatesAction } from '@/app/actions/coordinates'
import { useEffect, useState } from 'react'

const initialViewState: Partial<ViewState> = {
  longitude: 24.230515,
  latitude: 56.970931,
  zoom: 12,
}

export const Map = () => {
  const [{ coordinates, markerCoordinates }, setCoordinates] = useState<CoordinatesAction>({
    coordinates: [],
    markerCoordinates: [],
  })

  useEffect(() => {
    coordinatesAction().then(data => setCoordinates(data))
  }, [])

  const sourceData: Geometry = {
    type: 'LineString',
    coordinates,
  }

  return (
    <ReactMapGL
      initialViewState={initialViewState}
      style={{ width: '100vw', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.mapbox_key}
    >
      {markerCoordinates.map(([longitude, latitude]) => (
        <Marker
          key={`${longitude}${latitude}`}
          longitude={longitude}
          latitude={latitude}
          color="red"
          anchor="center"
        />
      ))}

      <Source type="geojson" data={sourceData}>
        <Layer
          type="line"
          layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          paint={{ 'line-color': 'blue', 'line-width': 6 }}
        />
      </Source>
    </ReactMapGL>
  )
}
