import res from '../strings/res'

export default class Ui {
    constructor(goToLevel, storage) {
        this.loading_screen = document.querySelector("#loading")
        this.home_screen = document.querySelector('#home')
        this.home_screen.onclick = () => this.hide_home_screen()
        this.death_screen = document.querySelector("#deathImg")
        this.stories_screen = document.querySelector("#stories")
        this.fireworks_screen = document.querySelector("#fireworks")
        this.gamepadIndicator = document.querySelector("#gamepadIndicator")
        this.nextIndicator = document.querySelector("#nextIndicator")

        this.gameUI = document.querySelector("#gameUI")
        this.levels_screen = document.querySelector("#levelList")
        this.levelList = document.querySelector("#levelList ul")
        this.goToLevel = goToLevel
        this.storage = storage

        this.levelName = document.querySelector("#levelName .value")
        this.coins = document.querySelector("#coins .value")
        this.coinsParent = document.querySelector("#coins")
        this.coins_max = document.querySelector("#coins .maxValue")
        this.coins_max_value
        this.deaths = document.querySelector("#deaths .value")
        this.deathsParent = document.querySelector("#deaths")

        this.levelFocusId = 0

        this.update_levelList(this.storage.save)
    }

    hide_gamepadIndicator() {
        this.gamepadIndicator.classList.add('hide')
        this.nextIndicator.children[0].classList.add('hide')
        this.nextIndicator.children[1].classList.remove('hide')
        this.update_levelList(this.storage.save)
    }
    show_gamepadIndicator() {
        this.gamepadIndicator.classList.remove('hide')
        this.nextIndicator.children[0].classList.remove('hide')
        this.nextIndicator.children[1].classList.add('hide')
        this.update_levelList(this.storage.save)
    }
    is_gamepadIndicator_visible() {!this.gamepadIndicator.classList.contains('hide')}

    hide_nextIndicator() { this.nextIndicator.classList.add('hide') }
    show_nextIndicator() { this.nextIndicator.classList.remove('hide') }

    hide_loading_screen() { this.loading_screen.classList.add('hide') }
    show_loading_screen() { this.loading_screen.classList.remove('hide') }

    hide_home_screen() {
        this.home_screen.classList.add('hide')
        const notBegan = this.storage.save[0].best == 0
        if (notBegan) {
            this.set_stories_text(0, false, () => {
                this.set_stories_text(1, false, () => {
                    this.set_stories_text(2, true, () => {
                        this.show_levels_screen()
                        setTimeout(() => {
                            this.stories_screen.classList.remove('begin')
                            this.gameUI.classList.remove('hide')
                        }, 200)
                    })
                })
            })
        } else {
            this.show_levels_screen()
            this.hide_stories_screen()
            this.stories_screen.classList.remove('begin')
            this.gameUI.classList.remove('hide')
        }



    }
    show_home_screen() {
        this.home_screen.classList.remove('hide')
    }
    is_home_screen_visible() { return !this.home_screen.classList.contains('hide') }

    hide_death_screen() { this.death_screen.classList.add('hide') }
    show_death_screen() { this.death_screen.classList.remove('hide') }

    hide_stories_screen(cb) {
        this.stories_screen.classList.add('hide')
        if (cb) cb()
    }
    show_stories_screen() {
        this.stories_screen.classList.remove('hide')
        this.click_stories = () => { }
    }
    is_stories_screen_visible() { return !this.stories_screen.classList.contains('hide') }

    click_stories() { }

    change_click_stories(hideAfter, cb) {
        this.show_nextIndicator()
        this.click_stories = () => {
            this.hide_nextIndicator()
            if (hideAfter) this.hide_stories_screen(cb)
            else cb()
        }
    }
    set_stories_text(textID, hideAfter, cb) {

        this.click_stories = () => { }
        const text = res.stories[textID]
        const domELEM1 = this.stories_screen.children[0].children[0]
        const domELEM2 = this.stories_screen.children[0].children[1]
        domELEM1.innerHTML = text.replace(/\*n/g, '<br>')
        domELEM2.innerHTML = ''
        for (let i = 0; i < text.length; i++) {
            let letter = text.charAt(i)
            if (letter === '*' && text.charAt(i + 1) === 'n') {
                letter = '<br>'
                setTimeout(() => { domELEM2.innerHTML += letter }, 40 * i)
                i = i + 1
            } else {
                setTimeout(() => { domELEM2.innerHTML += letter }, 40 * i)
            }
        }
        setTimeout(() => { this.change_click_stories(hideAfter, cb) }, 40 * text.length)
    }
    set_end_level_text(stats) {
        let score = 0
        let perfect
        if (stats.deaths < 5) score += (5 - stats.deaths) * 10
        if (this.coins_max_value > 0) {
            score += Math.trunc((stats.coins / this.coins_max_value) * 100)
            perfect = (score == 150) ? true : false
        } else {
            perfect = (score == 50) ? true : false
        }

        const domELEM1 = this.stories_screen.children[0].children[0]
        const domELEM2 = this.stories_screen.children[0].children[1]
        let computed = ''
        computed += `<p style="text-align: center;">Score: ${score}</p>`
        if (perfect) {
            computed += res.perfect
            this.show_fireworks_screen()
        }
        computed += `<p style="text-align: center;">Niveau Suivant -></p>`
        domELEM1.innerHTML = computed
        domELEM2.innerHTML = computed


        this.storage.addStats({
            idScene: stats.idScene,
            score: score,
            perfect: perfect
        })
        this.update_levelList(this.storage.save)

        if (stats.idScene == 9) {
            this.change_click_stories(false, () => {
                this.set_stories_text(12, false, () => {
                    this.set_stories_text(13, false, () => {
                        this.set_stories_text(14, false, () => {
                            this.set_stories_text(15, false, () => {
                                this.set_stories_text(16, false, () => {
                                    this.set_stories_text(17, false, () => {
                                        this.stories_screen.classList.add('begin')
                                        this.gameUI.classList.add('hide')
                                        this.hide_fireworks_screen()
                                        this.set_stories_text(18, false, () => {
                                            this.set_stories_text(19, false, () => {
                                                this.set_stories_text(20, true, () => {
                                                    this.gameUI.classList.remove('hide')
                                                    this.stories_screen.classList.remove('begin')
                                                    this.show_levels_screen()
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        } else {
            this.change_click_stories(true, () => {
                this.show_levels_screen()
                this.hide_fireworks_screen()
            })
        }

    }

    set_levelName(name) { this.levelName.innerHTML = name }
    set_coins(num) {
        if (num == 0) this.setCoinsValid(false)
        else if (num == this.coins_max_value) this.setCoinsValid(true)
        this.coins.innerHTML = num
    }
    set_coins_max(num) {
        this.coins_max_value = num
        this.coins_max.innerHTML = num
    }
    set_deaths(num) {
        if (num == 0) this.setDeathsValid(true)
        else this.setDeathsValid(false)
        this.deaths.innerHTML = num
    }
    setCoinsValid(valid) {
        if (valid) this.coinsParent.classList.add('valid')
        else this.coinsParent.classList.remove('valid')
    }
    setDeathsValid(valid) {
        if (valid) this.deathsParent.classList.add('valid')
        else this.deathsParent.classList.remove('valid')
    }

    hide_levels_screen() { this.levels_screen.classList.add('hide') }
    show_levels_screen() { this.levels_screen.classList.remove('hide') }
    toggle_levels_screen() { this.levels_screen.classList.toggle('hide') }
    is_levels_screen_visible() { return !this.levels_screen.classList.contains('hide') }

    hide_fireworks_screen() {
        this.fireworks_screen.innerHTML = ``
    }
    show_fireworks_screen() {
        this.fireworks_screen.innerHTML = `<div class="before"></div><div class="after"></div>`
    }

    update_levelList(levels) {
        let computed = ''
        for (let i = 0; i < levels.length; i++) {
            let inner = `<div>${levels[i].name}</div>`
            if (levels[i].best > 0) {
                inner += `<div>${levels[i].best}</div>`
                inner += (levels[i].perfect) ? `<div class="perfect">p</div>` : `<div>✓</div>`
            }

            let className = ''
            if (levels[i].disabled) className += ` disabled`
            if(this.is_gamepadIndicator_visible()) {
                if (i == this.levelFocusId) className += ' focus'
            }
            computed += `<li class="${className}" >${inner}</li>`
        }
        this.levelList.innerHTML = computed


        const elements = this.levelList.children
        for (let i = 0; i < elements.length; i++) {
            elements[i].onclick = () => {
                if (!elements[i].classList.contains('disabled')) {
                    this.goToLevel(i + 1)
                    this.hide_levels_screen()
                }
            }
        }
    }

    selectionNext() {
        if (this.levelFocusId < this.levelList.children.length - 1) {
            if (!this.storage.save[this.levelFocusId + 1].disabled) {
                this.levelFocusId++
                const children = this.levelList.children
                const length = children.length
                for (let i = 0; i < length; i++) {
                    if (i == this.levelFocusId) children[i].classList.add('focus')
                    else children[i].classList.remove('focus')
                }
            }
        }
    }

    selectionPrevious() {
        if (this.levelFocusId > 0) {
            this.levelFocusId--
            const children = this.levelList.children
            const length = children.length
            for (let i = 0; i < length; i++) {
                if (i == this.levelFocusId) children[i].classList.add('focus')
                else children[i].classList.remove('focus')
            }
        }
    }

    selection() {
        if (this.is_home_screen_visible()) {
            this.hide_home_screen()
        } else if (this.is_stories_screen_visible()) {
            this.click_stories()
        } else if (this.is_levels_screen_visible()) {
            this.goToLevel(this.levelFocusId + 1)
            this.hide_levels_screen()
        }
    }

    alreadyDoublejump() {
        return this.storage.save[2].best != 0
    }
}