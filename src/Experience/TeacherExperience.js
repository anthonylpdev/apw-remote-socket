import io from 'socket.io-client'

export default class TeacherExperience {
    constructor(canvas) {
        //TODO: définir l'URL de prod de votre serveur websocket ou l'URL sur le réseau local pendant le dev
        this.socketClient = io('192.168.1.67:3000')

        this.billboardLink = document.querySelector('[data-name=billboard]')
        const tvLink = document.querySelector('[data-name=tv]')

        this.prevX = null
        this.prevY = null

        // Create context 2D
        this.ctx = canvas.getContext('2d')
        this.ratio = 381 / 121

        this.resize()

        this.ctx.fillStyle = '#ff0000'
        this.ctx.fillRect(0, 0, this.width, this.height)
        this.ctx.fillStyle = '#fff'

        this.addEvents()
    }

    draw(x, y) {
        if (this.height < window.innerHeight && (document.webkitFullscreenElement || document.fullscreenElement)) {
            y -= window.innerHeight / 2 - this.height / 2
        }

        this.ctx.beginPath()
        // this.ctx.arc(x, y, 5, 0, Math.PI * 2)
        // this.ctx.fill()
        this.ctx.moveTo(this.prevX || x, this.prevY || y)
        this.ctx.lineTo(x, y)

        const prevX = this.prevX
        const prevY = this.prevY

        this.prevX = x
        this.prevY = y
        this.ctx.stroke()
        this.ctx.closePath()

        this.socketClient.emit('DRAW', {
            prevX: prevX / this.width,
            prevY: prevY / this.height,
            x: x / this.width,
            y: y / this.height,
        })
    }

    addEvents() {
        this.ctx.canvas.addEventListener('touchstart', e => {
            this.drawEnabled = true
            const bcr = this.ctx.canvas.getBoundingClientRect()
            const x = e.targetTouches[0].clientX - bcr.x
            const y = e.targetTouches[0].clientY - bcr.y
            this.draw(x, y)

            return false
        })

        this.ctx.canvas.addEventListener('touchend', e => {
            this.drawEnabled = false
            this.prevX = null
            this.prevY = null
        })

        this.ctx.canvas.addEventListener('touchmove', e => {
            if (!this.drawEnabled)
                return
            this.drawEnabled = true
            const bcr = this.ctx.canvas.getBoundingClientRect()
            let x = e.targetTouches[0].clientX - bcr.x
            let y = e.targetTouches[0].clientY - bcr.y

            this.draw(x, y)

            return false
        })

        this.ctx.canvas.addEventListener('mousedown', e => {
            this.drawEnabled = true
            const [x, y] = [e.offsetX, e.offsetY]
            this.draw(x, y)
            console.log(e)
        })

        this.ctx.canvas.addEventListener('mouseup', e => {
            this.drawEnabled = false
            this.prevX = null
            this.prevY = null
        })

        this.ctx.canvas.addEventListener('mousemove', e => {
            if (!this.drawEnabled)
                return
            const [x, y] = [e.offsetX, e.offsetY]
            this.draw(x, y)
        })

        this.billboardLink.addEventListener('click', (e) => {
            e.preventDefault()
            document.querySelector('.app').style.display = 'none'
            this.ctx.canvas.style.display = 'block'
            this.ctx.canvas.requestFullscreen()
        })

        window.addEventListener('resize', () => {
            this.resize(true)
        })
    }

    resize(restoreDraw = false) {
        this.width = window.innerWidth
        this.height = window.innerWidth / this.ratio

        if (restoreDraw) {
            this.tempCanvas = document.createElement('canvas')
            const tempCtx = this.tempCanvas.getContext('2d')
            this.tempCanvas.width = this.width
            this.tempCanvas.height = this.height
            tempCtx.fillStyle = '#ff0000'
            tempCtx.fillRect(0, 0, this.width, this.height)
            tempCtx.fillStyle = '#fff'
            tempCtx.drawImage(this.ctx.canvas, 0, 0)
        }

        this.ctx.canvas.width = this.width
        this.ctx.canvas.height = this.height

        if (restoreDraw) {
            this.ctx.drawImage(this.tempCanvas, 0, 0);
        }
    }
}
