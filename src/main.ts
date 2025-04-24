import { setupMap } from './mapbox.ts'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = '<div id="map" />'

setupMap()
