
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import axios from 'axios'

let clat = 0
let clong = 0
function placeObjectOnPlanet(object, lat, lon, radius) {
  var latRad = lat * (Math.PI / 180);
  var lonRad = -lon * (Math.PI / 180);
  object.position.set(
    Math.cos(latRad) * Math.cos(lonRad) * radius,
    Math.sin(latRad) * radius,
    Math.cos(latRad) * Math.sin(lonRad) * radius

  );
  object.rotation.set(0.0, -lonRad, latRad - Math.PI * 0.5);
}

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.001, 1000)

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("canvas")
})
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

const sphereGeometry = new THREE.SphereGeometry(3, 50, 50)

const sphereMaterial = new THREE.MeshStandardMaterial(
  {
    map: new THREE.TextureLoader().load('./globe.jpg'),
  }
)

sphereMaterial.reflectivity = 1
sphereMaterial.roughness = 0.6

const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)

scene.add(sphere)


const moonGeometry = new THREE.SphereGeometry(1, 50, 50)
const moonMaterial = new THREE.MeshStandardMaterial(
  {
    map: new THREE.TextureLoader().load('./moon.jpg')
  }
)

sphereMaterial.reflectivity = 1
sphereMaterial.roughness = 0.9
const moon = new THREE.Mesh(moonGeometry, moonMaterial)
moon.position.set(-8, 0, 8)
scene.add(moon)

camera.position.set(11.38, 1, 16)

const spotLight = new THREE.SpotLight(0xccee0ff, 3, 50, Math.PI * 3 / 4, 0.5, 1.5)
spotLight.position.set(0, 0, -20)
scene.add(spotLight)

const sunGeometry = new THREE.SphereGeometry(30, 50, 50)
const sunMaterial = new THREE.MeshStandardMaterial(
  {
    emissive: 0xFF5F1F,
    emissiveIntensity: 1
  }
)
sunMaterial.reflectivity = 1
sunMaterial.roughness = 0.6
const sun = new THREE.Mesh(sunGeometry, sunMaterial)
sun.position.set(0, 0, -400)
scene.add(sun)


const spotLightHelper = new THREE.SpotLightHelper(spotLight);
//scene.add(spotLightHelper);

const controls = new OrbitControls(camera, renderer.domElement)

const light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);

const objGeometry = new THREE.SphereGeometry(0.03, 20, 20)
const objMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 10 })
const obj = new THREE.Mesh(objGeometry, objMaterial)
scene.add(obj)


const generateStar = () => {
  const starGeometry = new THREE.SphereGeometry(0.02, 20, 20)
  const starMaterial = new THREE.MeshStandardMaterial({ color: 0xaedafe, emissive: 0xffffff, emissiveIntensity: 1000 })
  const star = new THREE.Mesh(starGeometry, starMaterial)
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(80))
  star.position.set(x, y, z)
  scene.add(star)
}
//placeObjectOnPlanet(sphere, -0.1257, 51.505, 3)

for (let x = 0; x < 5000; x++) {
  generateStar()
}

let val = 0.005
let time = 0

const animate = () => {

  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  sphere.rotation.y += 0.000003
  moon.rotation.y += 0.0027
  time += val
  if (time > 1080) time = 0
  moon.position.x = 14 * Math.cos(time % 360)
  moon.position.z = 8 * Math.sin(time % 360)
  controls.update()
}

animate()

document.getElementById("submit").addEventListener('click', (e) => {
  let city = document.getElementById('city').value
  e.preventDefault()
  console.log(camera.position)
  axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ca6aa8ef24178a7d8d5769af1da0b43f`).then(
    (res) => {
      clat = res.data.coord.lat
      clong = res.data.coord.lon
      placeObjectOnPlanet(obj, clat, clong, 3)
      console.log(res.data)
      document.getElementById('cityName').innerHTML = res.data.name
      document.getElementById('country').innerHTML = `Counrty code: ${res.data.sys.country}`
      document.getElementById('weather').innerHTML = `Weather type: ${res.data.weather[0].main}`
      document.getElementById('weather-desc').innerHTML = `The weather in ${res.data.name} is overall of type ${res.data.weather[0].description}`
      document.getElementById('temperature').innerHTML = `The temperature in ${res.data.name} is ${res.data.main.temp} degrees Farenheit`
      document.getElementById('feel').innerHTML = `It feels like ${res.data.main.feels_like} degrees Farenheit`
    }
  )
})




