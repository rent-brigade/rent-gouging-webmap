import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

export function setupMap() {
  const transformRequest = (url: string) => {
    const isMapboxRequest = url.slice(8, 22) === 'api.mapbox.com' || url.slice(10, 26) === 'tiles.mapbox.com'
    return {
      url: isMapboxRequest
        ? url.replace('?', '?pluginName=sheetMapper&')
        : url,
    }
  }

  mapboxgl.accessToken = 'pk.eyJ1IjoidmljdG9yaWFiZWNrbGV5IiwiYSI6ImNsMXlpa3J6ZjBjeDgzY28zb2lmYm1kejIifQ.iovH6zCr8nvi07wE0SQIdA' // Mapbox token

  const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-118.251454, 34.0360767], // starting position [lng, lat]
    zoom: 11, // starting zoom
    transformRequest,
  })

  map.on('load', () => {
    const data = '/trb-web-map.geojson'

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

    map.on('click', 'listing_points', (e: any) => {
      const ppdate = new Date(e.features[0].properties.emergency_peak_price_date)
      const formattedppdate = ppdate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
      const bpdate = new Date(e.features[0].properties.base_price_date)
      const bedrooms = Number.parseInt(e.features[0].properties.bedrooms)
      const bedroomtype = bedrooms === 0 ? 'studio' : `${bedrooms} Bedroom`

      // const fmr = e.features[0].properties.price_ceiling / 1.6
      const emppprice = e.features[0].properties.emergency_peak_price
      const formattedemppPrice = `$${emppprice.toLocaleString()}`
      const tpbprice = e.features[0].properties.base_price
      const formattedtpbPrice = `$${tpbprice.toLocaleString()}`
      // const perabovefmr = ((e.features[0].properties.emergencypeakprice/fmr)*100).toFixed(0);
      const newcalc_fmr = e.features[0].properties.emergency / emppprice / (e.features[0].properties.price_ceiling / 1.6) * 100
      // const pptofmrper = e.features[0].properties.peak_price_relative_to_fmr * 100 // DON'T HAVE 'peak_price_relative_to_FMR'
      const formattedpptofmrper = `${Math.round(newcalc_fmr)}%`
      const ppincper = e.features[0].properties.base_vs_peak_price * 100
      const formattedppincper = `${Math.round(ppincper)}%`
      const formattedbpdate = bpdate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })
      const tenpercentrule = `Original Rent` + ` (${formattedbpdate}): ` + `<b>${formattedtpbPrice}</b>` + `<br>`
        + `Peak Listed Rent` + ` (${formattedppdate}): ` + `<b>${formattedemppPrice}</b>` + `<br>`
        + `<b>${formattedppincper}</b>` + ` Increase`
      const fmrrule = `Not listed previous to 1/7/25` + `<br>`
        + `Listed Rent` + ` (${formattedppdate}): ` + `<b>${formattedemppPrice}</b>` + `<br>`
        + `<b>${formattedpptofmrper}</b>` + ` Percent Above Fair Market Rent`
      let rule = e.features[0].properties.gouging_rule
      if (rule !== 'fmr') {
        rule = tenpercentrule
      } else {
        rule = fmrrule
      }
      const url = e.features[0].properties.listing_url
      const link = `<a href="${url}" target="_blank" style="color: white;">${e.features[0].properties.street_address}</a>`
      const add_link = `<h3>${link}</h3>`
      const description = `${add_link}<h4>${bedroomtype}${e.features[0].properties.home_type}<br>${rule}</h4>`
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
