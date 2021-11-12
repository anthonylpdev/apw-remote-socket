import * as THREE from 'three'
import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default class Camera
{
    constructor()
    {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('camera')
        }

        this.setInstance()
        // this.setControls()
    }

    setInstance()
    {
        this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.001, 100)
        this.instance.position.set(2.6, 2, 6)
        this.instance.lookAt(new THREE.Vector3(0, 0.5, -2))
        this.scene.add(this.instance)

        // Debug
        if(this.debug.active)
        {
            this.debugFolder
                .add(this.instance.position, 'x')
                .name('camera X')
                .min(0)
                .max(10)
                .step(0.001)
                .onChange(value => {
                    this.instance.lookAt(new THREE.Vector3(0, 0.5, -3))
                })

            this.debugFolder
                .add(this.instance.position, 'y')
                .name('camera Y')
                .min(0)
                .max(10)
                .step(0.001)
                .onChange(value => {
                    this.instance.lookAt(new THREE.Vector3(0, 0.5, -3))
                })

            this.debugFolder
                .add(this.instance.position, 'z')
                .name('camera Z')
                .min(0)
                .max(10)
                .step(0.001)
                .onChange(value => {
                    this.instance.lookAt(new THREE.Vector3(0, 0.5, -3))
                })
        }
    }

    setControls()
    {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
    }

    resize()
    {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update()
    {
        // this.controls.update()
    }
}
