import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Classroom
{
    constructor()
    {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if(this.debug.active)
        {
            this.debugFolder = this.debug.ui.addFolder('classroom')
        }

        // Resource
        this.resource = this.resources.items.classroomModel

        this.setModel()
    }

    setModel()
    {
        this.model = this.resource.scene

        const meshTest = new THREE.Mesh(
            new THREE.PlaneGeometry(5,2,1,1),
            new THREE.MeshBasicMaterial({
                map: this.experience.billBoard.texture,
            })
        )

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                if (child.name === 'Billboard') {
                    child.material = new THREE.MeshBasicMaterial({
                        map: this.experience.billBoard.texture,
                    })

                    this.billboardMesh = child
                }

                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.model)
    }

    update()
    {
        this.billboardMesh.material.map = this.experience.billBoard.texture
        this.billboardMesh.material.needsUpdate = true
        // this.experience.billBoard.texture.needsUpdate = true
    }
}
