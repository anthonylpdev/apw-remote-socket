import * as THREE from 'three'

export default class Billboard {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d')
        this.ctx.canvas.width = 381 * 2
        this.ctx.canvas.height = 121 * 2
        this.ctx.fillStyle = '#fff'
        this.ctx.strokeStyle = '#fff'
        this.texture = new THREE.CanvasTexture(this.ctx.canvas)
        this.texture.flipY = false
    }

    draw({ prevX, prevY, x, y }) {
        this.ctx.beginPath()
        // this.ctx.arc(x, y, 5, 0, Math.PI * 2)
        // this.ctx.fill()
        this.ctx.moveTo(prevX || x, prevY || y)
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
        this.ctx.closePath()
    }

    update() {
        this.texture.needsUpdate = true
    }
}
