import './style.scss'
import './favicon.ico'

import io from 'socket.io-client'
import World from './World'
import {Vector3} from 'three'

class Base {
  constructor() {

    this.isMobileTablet = window.innerWidth < 1200;
    this.cameraTargetPosition = new Vector3(1, 1, 1)

    if (!this.isMobileTablet) {
      this.world = new World()
    } else {
      this.remote()
    }
    this.update()

  }

  remote() {
    //TODO: définir l'URL de prod de votre serveur websocket ou l'URL sur le réseau local pendant le dev
    this.socketClient = io('192.168.1.16:3000')

    const upSelector = document.querySelector('#up');
    const downSelector = document.querySelector('#down');
    const leftSelector = document.querySelector('#left');
    const rightSelector = document.querySelector('#right');

    upSelector.addEventListener('click', (event) => {
      event.preventDefault();
      this.socketClient.emit('TOUCH_UP');
    })

    downSelector.addEventListener('click', (event) => {
      event.preventDefault();
      this.socketClient.emit('TOUCH_DOWN');
    })

    leftSelector.addEventListener('click', (event) => {
      event.preventDefault();
      this.socketClient.emit('TOUCH_LEFT');
    })

    rightSelector.addEventListener('click', (event) => {
      event.preventDefault();
      this.socketClient.emit('TOUCH_RIGHT');
    })
  }

  update() {
    this.world.update()
    requestAnimationFrame(this.update.bind(this))
  }

}

window.base = new Base()
