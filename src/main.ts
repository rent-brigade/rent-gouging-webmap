import { setupMap } from './map.ts'
import './style.css'
import 'ress/dist/ress.min.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = '<div id="map" />'

setupMap()
