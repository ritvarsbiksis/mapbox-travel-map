interface Matchings {
  confidence: number
  weight_name: string
  weight: number
  duration: number
  distance: number
  legs: object[][]
  geometry: {
    coordinates: [number, number][]
    type: string
  }
}

export interface MapboxMatching {
  matchings: Matchings[]
}
