import './style.scss'
import Experience from './Experience/Experience.js'
import TeacherExperience from './Experience/TeacherExperience.js'

class Base {
    constructor() {
        document.querySelector('[data-btn=student]').addEventListener('click', (e) => {
            e.preventDefault()

            new Experience(
                document.querySelector('canvas.webgl'),
                document.querySelector('canvas.billboard'),
            )

            this.deleteTeacherPage()
            this.deleteLanding()
        })

        document.querySelector('[data-btn=teacher]').addEventListener('click', (e) => {
            e.preventDefault()

            new TeacherExperience(
                document.querySelector('canvas.billboard-mobile'),
            )

            this.deleteStudentPage()
            this.deleteLanding()
        })
    }

    deleteLanding() {
        document.querySelector('.landing-page').style.display = 'none'
    }

    deleteStudentPage() {
        document.querySelector('canvas.webgl').style.display = 'none'
        document.querySelector('canvas.billboard').style.display = 'none'
    }

    deleteTeacherPage() {
        document.querySelector('.teacher').style.display = 'none'
    }
}

window.base = new Base()
