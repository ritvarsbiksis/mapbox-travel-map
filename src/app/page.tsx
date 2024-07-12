import 'mapbox-gl/dist/mapbox-gl.css'
import { Map } from './components/map/map'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div>
        <Map />
      </div>
    </main>
  )
}
