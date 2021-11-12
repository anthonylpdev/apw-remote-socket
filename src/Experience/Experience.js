import * as THREE from 'three'
import io from 'socket.io-client'
import gsap from 'gsap'

import Debug from './Utils/Debug.js'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Resources from './Utils/Resources.js'

import sources from './sources.js'
import Billboard from './Billboard'

let instance = null

export default class Experience
{
    constructor(_canvas3d, _canvas2d)
    {
        // Singleton
        if(instance)
        {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = _canvas3d

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()
        this.billBoard = new Billboard(_canvas2d)

        this.watcher()

        // Resize event
        this.sizes.on('resize', () =>
        {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () =>
        {
            this.update()
        })
    }

    resize()
    {
        this.camera.resize()
        this.renderer.resize()
    }

    watcher() {
        //TODO: définir l'URL de prod de votre serveur websocket ou l'URL sur le réseau local pendant le dev
        this.socketClient = io('192.168.1.67:3000')
        this.socketClient.on('DRAW_CLASSROOM', (event) => {
            const prevX = event.prevX ? event.prevX * this.billBoard.ctx.canvas.width : null
            const prevY = event.prevY ? event.prevY * this.billBoard.ctx.canvas.height : null

            this.billBoard.draw({
                prevX,
                prevY,
                x: event.x * this.billBoard.ctx.canvas.width,
                y: event.y * this.billBoard.ctx.canvas.height,
            })
        })

        this.socketClient.on('FOCUS_BILLBOARD', () => {
            const tl = gsap.timeline()
            tl.to(this.camera.instance.position, {
                x: 0,
                y: 1.838,
                z: 2.698,
                duration: 2,
                ease: "power2",
                onUpdate: () => {
                    this.camera.instance.lookAt(new THREE.Vector3(-0.2, 1.238, -3))
                }
            })
            // this.camera.instance.position.set(0, 1.838, 2.698)

        })

        this.socketClient.on('BASE_CAMERA', () => {
            const tl = gsap.timeline()
            tl.to(this.camera.instance.position, {
                x: 2.6,
                y: 2,
                z: 6,
                duration: 1.4,
                ease: "power3",
                onUpdate: () => {
                    this.camera.instance.lookAt(new THREE.Vector3(0, 0.5, -2))
                }
            })
        })

        this.socketClient.on('CLEAR_BILLBOARD', () => {
            this.billBoard.ctx.clearRect(0, 0, this.billBoard.ctx.canvas.width, this.billBoard.ctx.canvas.height);
        })

        this.socketClient.on('TV_ON', () => {
            this.world.classroom.antho.flipY = false
            this.world.classroom.screenMesh.material = new THREE.MeshBasicMaterial({
                map: this.world.classroom.antho,
            })
        })
    }

    update()
    {
        this.camera.update()
        this.billBoard.update()
        this.world.update()
        this.renderer.update()
    }

    destroy()
    {
        this.sizes.off('resize')
        this.time.off('tick')

        // Traverse the whole scene
        this.scene.traverse((child) =>
        {
            // Test if it's a mesh
            if(child instanceof THREE.Mesh)
            {
                child.geometry.dispose()

                // Loop through the material properties
                for(const key in child.material)
                {
                    const value = child.material[key]

                    // Test if there is a dispose function
                    if(value && typeof value.dispose === 'function')
                    {
                        value.dispose()
                    }
                }
            }
        })

        this.camera.controls.dispose()
        this.renderer.instance.dispose()

        if(this.debug.active)
            this.debug.ui.destroy()
    }
}
