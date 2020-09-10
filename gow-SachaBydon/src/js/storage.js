export default class Storage {
    constructor(levels) {
        this.levels = levels
        this.localStorage = window.localStorage
        this.key = 'save'
        this.save = this.getSave()
        
    }


    getSave() {
        let save = JSON.parse(this.localStorage.getItem(this.key))
        if (save === null) {
            save = []
            for(let i=0;i<this.levels.length;i++) {
                const level = {
                    name: i+1,
                    best: 0,
                    perfect: false,
                    disabled: true
                }
                if(i==0) level.disabled = false
                save.push(level)
            }
        }
        return save
    }

    addStats(stats) {
        const id = stats.idScene-1
        if(this.save[id].best < stats.score) {
            this.save[id].best = stats.score
            if(stats.perfect) this.save[id].perfect = true
        }
        let i
        for(i=this.save.length-1;i>0;i--) {
            if(this.save[i].best !=0) break
        }
        if(this.save[i+1]) this.save[i+1].disabled = false
        this.saveToLocalStorage()
    }

    saveToLocalStorage() {
        this.localStorage.setItem(this.key, JSON.stringify(this.save))
    }
}