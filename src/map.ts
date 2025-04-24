import type { LngLatLike } from 'mapbox-gl'
import dayjs from 'dayjs'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const HomeType = Object.freeze({
  HOME_TYPE_UNKNOWN: 'Unknown',
  TOWNHOUSE: 'Townhouse',
  APARTMENT: 'Apartment',
  MANUFACTURED: 'Manufactured',
  MULTI_FAMILY: 'Multi-family',
  SINGLE_FAMILY: 'Single-family',
  LOT: 'Lot',
  CONDO: 'Condo',
})

type GougingRule = 'fmr' | 'tenpercent'

interface WebMapProperties {
  street_address: string
  listing_url: string
  bedrooms: number
  home_type: keyof typeof HomeType
  council_district: string | null
  supervisor_district: number
  city: string | null
  community: string | null
  jurisdiction: string
  gouging_rule: GougingRule
  price_ceiling: number
  base_price: number | null
  base_price_date: string | null
  emergency_peak_price: number
  emergency_peak_price_date: string
  base_vs_peak_price: null
  was_ever_gouged: boolean
  latest_price: number
  latest_price_date: string
  is_currently_gouged: boolean
  fair_market_rent: number | null
  pct_increase_of_peak_over_base: number
}

export function setupMap() {
  const transformRequest = (url: string) => {
    const isMapboxRequest = url.slice(8, 22) === 'api.mapbox.com' || url.slice(10, 26) === 'tiles.mapbox.com'
    return {
      url: isMapboxRequest
        ? url.replace('?', '?pluginName=sheetMapper&')
        : url,
    }
  }

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?? import.meta.env.MAPBOX_ACCESS_TOKEN

  const initZoom = 9.5
  const initCoords = [-118.32010468759735, 34.025238141009766] as LngLatLike

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: initCoords,
    zoom: initZoom,
    transformRequest,
  })

  map.on('load', () => {
    const data = import.meta.env.VITE_WEB_MAP_GEOJSON ?? import.meta.env.WEB_MAP_GEOJSON

    map.addSource('listings', {
      type: 'geojson',
      data,
    })

    map.addLayer({
      id: 'listing_points',
      type: 'circle',
      source: 'listings',
      layout: {},
      paint: {
        'circle-color': '#f94b4b',
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          1,
          1,
          30,
          12,
        ],
        'circle-stroke-color': '#434344',
        'circle-stroke-width': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10,
          1,
          14,
          1,
        ],
      },
    })

    const parseDate = (date?: string) => {
      return dayjs(date).format('M/D/YY')
    }

    const parsePrice = (price: number) => {
      return `$${price?.toLocaleString()}`
    }

    const parsePercentage = (number: number) => {
      return `${Math.round(number * 100)}%`
    }

    map.on('click', 'listing_points', (e) => {
      const properties = e.features?.[0].properties as WebMapProperties

      const ppDate = parseDate(properties.emergency_peak_price_date)
      const bpDate = properties?.base_price_date && parseDate(properties.base_price_date)
      const bedrooms = properties.bedrooms
      const bedroomtype = bedrooms === 0 ? 'Studio' : `${bedrooms} Bedroom`
      const emppPrice = parsePrice(properties.emergency_peak_price)
      const tpbPrice = properties?.base_price && parsePrice(properties.base_price)
      const fmr = properties.pct_increase_of_peak_over_base
      const fmrPercentage = parsePercentage(fmr)
      const percentIncrease = properties?.base_vs_peak_price && parsePercentage(properties.base_vs_peak_price)

      const homeType = HomeType[properties.home_type as keyof typeof HomeType]

      const tenPercentRuleHtml = `Original Rent (${bpDate}): <strong>${tpbPrice}</strong><br>`
        + `Peak Listed Rent (${ppDate}): <strong>${emppPrice}</strong><br>`
        + `<strong>${percentIncrease}</strong> Increase`

      const fmrRuleHtml = `Not listed previous to 1/7/25<br>`
        + `Listed Rent (${ppDate}): <strong>${emppPrice}</strong><br>`
        + `<strong>${fmrPercentage}</strong> Percent Above Fair Market Rent`

      const gougingRule = properties.gouging_rule
      const rule = gougingRule === 'fmr' ? fmrRuleHtml : tenPercentRuleHtml

      const listingUrl = properties.listing_url
      const link = `<a href="${listingUrl}" target="_blank" style="color: white;">${properties.street_address}</a>`
      const description = `<h3>${link}</h3><h4>${bedroomtype} ${homeType}<br>${rule}</h4>`
      new mapboxgl.Popup().setLngLat(e.lngLat).setHTML(description).addTo(map)
    })

    map.on('mouseenter', 'listing_points', () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'All Priority Buildings', () => {
      map.getCanvas().style.cursor = ''
    })
  })

  const nav = new mapboxgl.NavigationControl({
    showCompass: false,
  })

  map.addControl(nav, 'bottom-left')
}
