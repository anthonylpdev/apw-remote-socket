import './style.scss'
import './favicon.ico'

import io from 'socket.io-client'
import World from './World'
import {Vector3} from 'three'

class Base {
  constructor() {

    // this.base()

    this.isMobileTablet = !!navigator.maxTouchPoints
    this.socketClient = io('https://192.168.1.24:3000', {secure: true})

    if (this.isMobileTablet) {
      document.querySelector('body').classList.add('is-mobile')
    }

    this.cameraTargetPosition = new Vector3(1, 1, 1)

    if (!this.isMobileTablet) {
      this.world = new World()
    } else {
      this.remote()
      // this.sensor()
    }

    if (window.DeviceOrientationEvent) {
      // Supported you can continue

      if ('ondeviceorientation' in window) {
        window.addEventListener('deviceorientation', (event) => {
          // console.log("z : " + event.alpha + "\n x : " + event.beta + "\n y : " + event.gamma);
          //const data = Math.min(Math.max(event.beta/90, -1), 1);
          this.socketClient.emit('PHONE_MOVE', event.beta)
        }, false)
      }
    } else {
      alert('not supported')
    }

    this.update()

  }

  base() {
    window.addEventListener('dblclick', () => {
      const fullscreenElement = document.fullscreenElement ||
          document.webkitFullscreenElement

      if (!fullscreenElement) {
        if (this.targetCanvas.requestFullscreen) {
          this.targetCanvas.requestFullscreen()
        } else if (this.targetCanvas.webkitRequestFullscreen) {
          this.targetCanvas.webkitRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }
      }
    })
  }

  sensor() {

    /*const perm = navigator.permissions.query({
      name: 'accelerometer',
    }).then((resp) => {
      console.log('succes',resp);
    }).catch((err) => {
      console.log(err);
    })*/

    /*
        let accelerometer = null;
        try {
          accelerometer = new Accelerometer({ frequency: 10 });
          accelerometer.onerror = (event) => {
            // Handle runtime errors.
            if (event.error.name === 'NotAllowedError') {
              alert('Permission to access sensor was denied.');
            } else if (event.error.name === 'NotReadableError') {
              alert('Cannot connect to the sensor.');
            }
          };
          accelerometer.onreading = (e) => {
            alert(e);
          };
          accelerometer.start();
        } catch (error) {
          // Handle construction errors.
          if (error.name === 'SecurityError') {
            alert('Sensor construction was blocked by the Permissions Policy.');
          } else if (error.name === 'ReferenceError') {
            alert('Sensor is not supported by the User Agent.');
          } else {
            throw error;
          }
        }
        */

  }

  remote() {
    //TODO: définir l'URL de prod de votre serveur websocket ou l'URL sur le réseau local pendant le dev

    const upSelector = document.querySelector('#up')
    const downSelector = document.querySelector('#down')
    const leftSelector = document.querySelector('#left')
    const rightSelector = document.querySelector('#right')

    upSelector.addEventListener('click', (event) => {
      // window.navigator.vibrate(200)
      event.preventDefault()
      this.socketClient.emit('TOUCH_UP')
    })

    downSelector.addEventListener('click', (event) => {
      event.preventDefault()
      this.socketClient.emit('TOUCH_DOWN')
    })

    leftSelector.addEventListener('click', (event) => {
      event.preventDefault()
      this.socketClient.emit('TOUCH_LEFT')
    })

    rightSelector.addEventListener('click', (event) => {
      event.preventDefault()
      this.socketClient.emit('TOUCH_RIGHT')
    })

  }

  update() {
    this.world.update()
    /*window.addEventListener('deviceorientation', (event) => {
      // console.log("z : " + event.alpha + "\n x : " + event.beta + "\n y : " + event.gamma);
      //const data = Math.min(Math.max(event.beta/90, -1), 1);
      this.socketClient.emit('GYROMETER')
    });*/
    requestAnimationFrame(this.update.bind(this))
  }

}

window.base = new Base()
