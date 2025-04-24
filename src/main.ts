import { setupMap } from './map.ts'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = '<div id="map" />'

setupMap()
