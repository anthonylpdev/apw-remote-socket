import './style.scss'
import Experience from './Experience/Experience.js'
import TeacherExperience from './Experience/TeacherExperience.js'

class Base {
    constructor() {
        this.isMobileOrTablet = window.innerWidth < 900

        if (this.isMobileOrTablet) {
            new TeacherExperience(
                document.querySelector('canvas.billboard-mobile'),
            )
        } else {
            new Experience(
                document.querySelector('canvas.webgl'),
                document.querySelector('canvas.billboard'),
            )
        }
    }
}

window.base = new Base()
