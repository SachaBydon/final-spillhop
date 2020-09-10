import { default as BABYLON } from './imports'

export default class Controls {
    constructor(UI) {
        this.controlsEnable = false
        this.isQPressed = false
        this.isDPressed = false
        this.isSPACEPressed = false
        this.gamepadManager = new BABYLON.GamepadManager()
        this.UI = UI
        this.init()
    }

    init() {

        this.gamePadInit()
        document.addEventListener('keydown', (e) => {
            if (this.controlsEnable) {
                if (e.keyCode == 81 || e.keyCode == 37) { this.isQPressed = true }
                if (e.keyCode == 68 || e.keyCode == 39) { this.isDPressed = true }
                if (e.keyCode == 32) { this.isSPACEPressed = true }
                if (e.keyCode == 27) { this.UI.toggle_levels_screen() }
            }
            if (e.keyCode == 32) { this.UI.selection() }
        })
        document.addEventListener('keyup', (e) => {
            if (e.keyCode == 81 || e.keyCode == 37) { this.isQPressed = false }
            if (e.keyCode == 68 || e.keyCode == 39) { this.isDPressed = false }
            if (e.keyCode == 32) { this.isSPACEPressed = false }
        })
        if (this.mobileAndTabletcheck()) {
            document.querySelector("#controls-mobile").setAttribute("style", "")
            let jumpBtn = document.querySelector("#controls-mobile #jump")
            jumpBtn.onpointerdown = () => {
                if (this.controlsEnable) this.isSPACEPressed = true
            }
            jumpBtn.onpointerup = () => {
                this.isSPACEPressed = false
            }
            let leftBtn = document.querySelector("#controls-mobile .directions #left")
            leftBtn.onpointerdown = () => {
                if (this.controlsEnable) this.isQPressed = true
            }
            leftBtn.onpointerup = () => {
                this.isQPressed = false
            }
            let rightBtn = document.querySelector("#controls-mobile .directions #right")
            rightBtn.onpointerdown = () => {
                if (this.controlsEnable) this.isDPressed = true
            }
            rightBtn.onpointerup = () => {
                this.isDPressed = false
            }
        }
    }

    gamePadInit() {
        this.gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
            console.log("Connexion: " + gamepad.id)
            this.UI.show_gamepadIndicator()

            //Generic button down/up events
            gamepad.onButtonDownObservable.add((button, state) => {
                if (this.controlsEnable) {
                    let name
                    switch (button) {
                        case 0:
                            name = "A"
                            this.isSPACEPressed = true
                            break
                        case 8:
                            name = "Menu"
                            this.UI.toggle_levels_screen()
                            break
                        case 9:
                            name = "Menu"
                            this.UI.toggle_levels_screen()
                            break
                    }
                }

                if (button == 0) this.UI.selection()

            })
            gamepad.onButtonUpObservable.add((button, state) => {
                let name
                switch (button) {
                    case 0:
                        name = "A"
                        this.isSPACEPressed = false
                        break
                    case 8:
                        name = "Menu"
                        break
                    case 9:
                        name = "Menu"
                        break
                }
            })

            //Stick events
            let reset = true
            gamepad.onleftstickchanged((values) => {

                if (.2 <= values.x && values.x <= 1) {
                    if (this.UI.is_levels_screen_visible()) {
                        if (reset) {
                            this.UI.selectionNext()
                            reset = false
                        }
                    } else {
                        if (this.controlsEnable) {
                            this.isDPressed = true
                            this.isQPressed = false
                        }
                    }
                }
                else if (-1 <= values.x && values.x <= -.2) {
                    if (this.UI.is_levels_screen_visible()) {
                        if (reset) {
                            this.UI.selectionPrevious()
                            reset = false
                        }
                    } else {
                        if (this.controlsEnable) {
                            this.isDPressed = false
                            this.isQPressed = true
                        }
                    }
                } else {
                    this.isDPressed = false
                    this.isQPressed = false
                    reset = true
                }

            })
        })

        this.gamepadManager.onGamepadDisconnectedObservable.add((gamepad, state) => {
            console.log("Deconnexion: " + gamepad.id)
            this.UI.hide_gamepadIndicator()
        })
    }

    resetPressed() {
        this.isQPressed = false
        this.isDPressed = false
        this.isSPACEPressed = false
    }

    //Add Mobile and tablet UI ans controls
    mobileAndTabletcheck() {
        return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1)
    }

}