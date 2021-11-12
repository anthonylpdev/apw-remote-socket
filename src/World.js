import {
  Clock,
  Color,
  Mesh,
  PerspectiveCamera,
  Scene,
  MeshNormalMaterial,
  SphereBufferGeometry,
  WebGLRenderer,
  Vector3,
} from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap/all'
import io from 'socket.io-client'

export default class World {
  constructor(props) {
    this.setup()
    this.object()
    this.init()
    this.watcher()
    this.update()
  }

  setup() {
    this.targetCanvas = document.querySelector('#webgl')
    this.clock = new Clock()
    this.scene = new Scene()
    this.scene.background = new Color(0x3498db)

    this.camera = new PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 5, 50,
    )
    this.vector = new Vector3(0, 0, 0)
    this.renderer = new WebGLRenderer({
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
      canvas: this.targetCanvas,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.minDistance = 0.005
    this.controls.maxDistance = 500
    this.controls.enableDamping = true
    // this.controls.autoRotate = true
    this.controls.update()
  }

  object() {
    this.geometry = new SphereBufferGeometry(5, 32, 32)
    this.material = new MeshNormalMaterial({
      wireframe: true,
    })
    this.mesh = new Mesh(this.geometry, this.material)
  }

  init() {
    this.resize()
    this.camera.position.z = 10
    this.camera.rotation.reorder('YXZ')
    this.scene.add(this.mesh)

    window.addEventListener('resize', () => {
      this.resize()
    })

  }

  watcher() {
    //TODO: définir l'URL de prod de votre serveur websocket ou l'URL sur le réseau local pendant le dev
    this.socketClient = io('https://192.168.1.24:3000', {secure: true})
    this.socketClient.on('CAMERA_UP', (event) => {
      this.vector.y += 2
    })
    this.socketClient.on('CAMERA_DOWN', (event) => {
      this.vector.y -= 2
    })
    this.socketClient.on('CAMERA_LEFT', (event) => {
      this.vector.x -= 2
    })
    this.socketClient.on('CAMERA_RIGHT', (event) => {
      this.vector.x += 2
    })
    this.socketClient.on('GYROMETER', (event) => {
      // const data = Math.min(Math.max(event/90, -1), 1);
      const data = Math.round(Math.min(Math.max(event, -90), 90));
      console.log(data + ' degrés');
    })

  }

  update() {
    this.renderer.render(this.scene, this.camera)
    gsap.to(this.mesh.position, {
      x: this.vector.x,
      y: this.vector.y,
    })
    this.controls.update()
  }

  resize() {
    let h = window.innerHeight
    let w = window.innerWidth
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
  }

}
