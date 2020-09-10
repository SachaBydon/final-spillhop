import { default as BABYLON } from './imports'

export default class Player {
    constructor(sceneGrid, engine, monsters, scene, UI, controls, idScene, startPos, endLevelPos) {
        //Movement
        this.velocity = .06
        this.vx = 0
        this.vy = 0
        this.boost = 200
        this.max_vx = 20
        this.max_grav = .25
        this.friction = 2.5
        this.max_vy = .4
        this.gravity = .02
        this.lastPos

        //Jump
        this.jumpEnable = false
        this.previousStateJump = false
        this.doubleJump = false
        this.jumpCount = 0
        this.jumpAnimated = false
        this.rotation = 0

        //Sounds
        this.jumpSound = new BABYLON.Sound('jumpSound', './src/sounds/jump.wav', scene)
        this.jumpSound.setVolume(.7)
        this.doubleJumpSound = new BABYLON.Sound('doubleJumpSound', './src/sounds/blip.wav', scene)
        this.doubleJumpSound.setVolume(.5)
        this.coinSound = new BABYLON.Sound('coinSound', './src/sounds/coin.wav', scene)
        this.coinSound.setVolume(.5)
        this.winSound = new BABYLON.Sound('winSound', './src/sounds/win.wav', scene)
        this.winSound.setVolume(.5)
        this.dieSound = new BABYLON.Sound('dieSound', './src/sounds/die1.wav', scene)
        this.dieSound.setVolume(.1)

        //Other
        this.mesh = this.createPlayerMesh(startPos)
        this.playerHead = this.mesh._children[0]
        this.playerBody = this.mesh._children[1]
        this.playerDirection = 0

        this.scene = scene
        this.sceneGrid = sceneGrid
        this.monsters = monsters
        this.endLevelPos
        this.engine = engine
        this.idScene = idScene

        this.controls = controls
        this.UI = UI

        this.coinCompt = 0
        this.death = 0
        this.lastDirection = 1
        this.dying = false
        this.levelEnd = false
        this.endLevelPos = endLevelPos


        this.endPointMat = new BABYLON.StandardMaterial('endPointMat', scene)
        this.endPointMat.diffuseColor = new BABYLON.Color3(0, 1, 0)
        this.endPointMat.emissiveColor = new BABYLON.Color3(0, 1, 0)
        this.doubleJumpMat = new BABYLON.StandardMaterial('doubleJumpMat', scene)
        this.doubleJumpMat.diffuseColor = new BABYLON.Color3(0, .4, 1)
        this.doubleJumpMat.emissiveColor = new BABYLON.Color3(0, .4, 1)

        this.greenTileMatAlpha = new BABYLON.StandardMaterial('greenTileMatAlpha', scene)
        this.greenTileMatAlpha.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/green.png', scene)
        this.greenTileMatAlpha.emissiveColor = new BABYLON.Color3(0, 1, 0)
        this.greenTileMatAlpha.alpha = .5
        this.tileMeshGreenAlpha = BABYLON.MeshBuilder.CreateTiledBox('tileMeshGreenAlpha', { size: 1, tileSize: 1, depth: 3 }, scene)
        this.tileMeshGreenAlpha.material = this.greenTileMatAlpha
        this.tileMeshGreenAlpha.isVisible = false
    }

    update() {
        //Movement
        this.checkPlayerJumpState()
        this.vx = 0
        let moveVector = new BABYLON.Vector3.Zero()

        if (this.controls.isDPressed) { this.vx += this.velocity }
        if (this.controls.isQPressed) { this.vx -= this.velocity }
        if (this.controls.isSPACEPressed && this.jumpEnable && !this.previousStateJump) {
            this.jumpSound.play()
            this.vy += this.boost
            moveVector.y = + this.vy
            this.jumpEnable = false
        }

        if (this.doubleJump && this.jumpCount < 2 && this.controls.isSPACEPressed && !this.previousStateJump) {
            this.jumpSound.play()
            this.vy += this.boost
            moveVector.y = + this.vy
            this.jumpEnable = false
            if (this.jumpCount == 1) {
                this.jumpAnimated = true
            }
            this.jumpCount++
        }

        if (this.jumpEnable) { this.jumpCount = 0 }

        if (this.vx > this.max_vx) { this.vx = this.max_vx }
        if (this.vx < -this.max_vx) { this.vx = -this.max_vx }
        if (this.vy > this.max_vy) { this.vy = this.max_vy }
        if (this.vy < -this.max_grav) { this.vy = -this.max_grav }

        this.vy = this.vy - (this.gravity * (60 * this.engine.getDeltaTime() / 1000))
        this.vx *= this.friction

        moveVector.x = this.vx
        moveVector.y = this.vy

        moveVector.x = moveVector.x * (60 * this.engine.getDeltaTime() / 1000)
        moveVector.y = moveVector.y * (60 * this.engine.getDeltaTime() / 1000)

        if (moveVector.x > 0) {
            this.lastDirection = 1
        } if (moveVector.x < 0) {
            this.lastDirection = -1
        }

        if (this.controls.isSPACEPressed) {
            this.previousStateJump = true
        } else { this.previousStateJump = false }


        this.lastPos = this.mesh.getAbsolutePosition()
        this.mesh.moveWithCollisions(moveVector)

        //prevent the player to be stuck on the ceiling
        if (this.lastPos) {
            if (this.lastPos.y == this.mesh.getAbsolutePosition().y) {
                this.vy = -this.gravity
            }
        }


        //Check items collide 
        let marge = 2 //2 blocks from the player
        let posXMin = Math.round(this.mesh.position.x) - marge < 0 ? 0 : Math.round(this.mesh.position.x) - marge
        let posXMax = Math.round(this.mesh.position.x) + marge < 0 ? 0 : Math.round(this.mesh.position.x) + marge
        let posYMin = Math.round(Math.abs(this.mesh.position.y)) - marge < 0 ? 0 : Math.round(Math.abs(this.mesh.position.y)) - marge
        let posYMax = Math.round(Math.abs(this.mesh.position.y)) + marge < 0 ? 0 : Math.round(Math.abs(this.mesh.position.y)) + marge

        for (let i = posYMin; i < posYMax; i++) {
            for (let j = posXMin; j < posXMax; j++) {
                if (this.sceneGrid[i]) {
                    if (this.sceneGrid[i][j]) {
                        //Collide End point
                        if (this.sceneGrid[i][j].id == "endPoint" && !this.levelEnd) {
                            if (this.mesh.intersectsMesh(this.sceneGrid[i][j], false, true)) {

                                this.playerHead.material = this.endPointMat
                                this.winSound.play()
                                this.levelEnd = true

                                //Show end level Screen
                                this.UI.show_stories_screen()
                                this.UI.set_end_level_text({
                                    deaths: this.death,
                                    coins: this.coinCompt,
                                    idScene: this.idScene
                                })


                                //Disable controls
                                this.controls.controlsEnable = false
                                this.controls.resetPressed()

                                //Camera animation
                                this.scene.cameras[0].heightOffset = 1;
                                this.scene.cameras[0].rotationOffset = 700
                                this.scene.cameras[0].cameraAcceleration = 0.001
                            }
                        }
                        //Collide Coin
                        if (this.sceneGrid[i][j].id == 'coin') {
                            if (this.mesh.intersectsMesh(this.sceneGrid[i][j], false, true)) {
                                this.coinSound.play()
                                this.sceneGrid[i][j].dispose()
                                this.sceneGrid[i][j] = null
                                this.coinCompt++
                                this.UI.set_coins(this.coinCompt)
                            }
                        } else if (this.sceneGrid[i][j].id == 'no-col') {
                            if (this.mesh.intersectsMesh(this.sceneGrid[i][j], false, true)) {
                                this.sceneGrid[i][j].dispose()
                                this.sceneGrid[i][j] = this.tileMeshGreenAlpha.createInstance()
                                this.sceneGrid[i][j].position.y = -i
                                this.sceneGrid[i][j].position.x = j
                            }
                        }
                        //Collide Double Jump
                        if (this.sceneGrid[i][j]) {
                            if (this.sceneGrid[i][j].id == 'doubleJump') {
                                if (this.mesh.intersectsMesh(this.sceneGrid[i][j], false, true)) {
                                    //document.querySelector(".double-jump").style.opacity = 1
                                    this.sceneGrid[i][j].dispose()
                                    this.sceneGrid[i][j] = null
                                    this.doubleJump = true
                                    this.doubleJumpSound.play()
                                    this.playerHead.material = this.doubleJumpMat

                                    if (this.idScene == 3 && !this.UI.alreadyDoublejump()) {
                                        this.controls.controlsEnable = false
                                        this.controls.resetPressed()
                                        this.UI.show_stories_screen()
                                        this.UI.set_stories_text(21, true, () => {
                                            this.controls.controlsEnable = true
                                        })
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }

        //check collide monsters
        for (let monster of this.monsters) {
            if (this.mesh.intersectsMesh(monster.mesh, false, true)) {
                if(monster.mesh.id == 'collide') {
                    this.die()
                }
            }
        }

        //Detect falling
        if (this.mesh.position.y < -this.sceneGrid.length) {
            this.die()
        }

        //Player animation speeeeeed and double jump rotation
        if (!this.jumpAnimated) {
            let angle = 0
            if (this.controls.isDPressed) {
                angle = - (Math.PI / 8)
                this.playerDirection = 1
            }
            else if (this.controls.isQPressed) {
                angle = (Math.PI / 8)
                this.playerDirection = -1
            }
            else {
                this.playerDirection = 0
            }
            this.mesh.rotation.z = angle
        } else {
            this.rotation = this.rotation + (Math.PI / 120) * this.engine.getDeltaTime()
            if (this.rotation >= 2 * Math.PI) {
                this.rotation = 0
                this.jumpAnimated = false
            }
            this.mesh.rotation.z = - this.rotation * this.lastDirection
        }

        if (this.levelEnd) {
            this.goToEnd()
        }
        this.playerAnime()

    }

    //Check if player is above a collide tile and can jump
    checkPlayerJumpState() {
        let indexY = Math.abs(Math.round(this.mesh.position.y - (this.mesh.ellipsoid.y + .5)))
        let indexX1
        let indexX2
        if (this.mesh.position.x - .3 < Math.trunc(this.mesh.position.x)) {
            indexX1 = Math.trunc(this.mesh.position.x)
            indexX2 = Math.trunc(this.mesh.position.x)
        } else if (this.mesh.position.x + .3 > Math.ceil(this.mesh.position.x)) {
            indexX1 = Math.ceil(this.mesh.position.x)
            indexX2 = Math.ceil(this.mesh.position.x)
        } else {
            indexX1 = Math.trunc(this.mesh.position.x)
            indexX2 = Math.ceil(this.mesh.position.x)
        }
        let playerPos = this.mesh.position.y
        if (this.sceneGrid[indexY]) {
            //Player above 2 tile
            if (this.sceneGrid[indexY][indexX1] && this.sceneGrid[indexY][indexX2]) {
                if (this.sceneGrid[indexY][indexX1].checkCollisions || this.sceneGrid[indexY][indexX2].checkCollisions) {
                    let tile1Pos = this.sceneGrid[indexY][indexX1].position.y
                    let tile2Pos = this.sceneGrid[indexY][indexX2].position.y
                    let diff1 = tile1Pos - playerPos
                    let diff2 = tile2Pos - playerPos
                    if (isAlmostEquals(diff1, -(this.mesh.ellipsoid.y + .5), .1) && isAlmostEquals(diff2, -(this.mesh.ellipsoid.y + .5), .1)) {
                        this.jumpEnable = true
                    }
                    else { this.jumpEnable = false }
                }
            } else {
                //Player above 1 (left) tile
                if (this.sceneGrid[indexY][indexX1]) {
                    if (this.sceneGrid[indexY][indexX1].checkCollisions) {
                        let diff = this.sceneGrid[indexY][indexX1].position.y - playerPos
                        if (isAlmostEquals(diff, -(this.mesh.ellipsoid.y + .5), .1)) {
                            this.jumpEnable = true
                        }
                        else { this.jumpEnable = false }
                    }
                    //Player above 1 (right) tile
                } else if (this.sceneGrid[indexY][indexX2]) {
                    if (this.sceneGrid[indexY][indexX2].checkCollisions) {
                        let diff = this.sceneGrid[indexY][indexX2].position.y - playerPos
                        if (isAlmostEquals(diff, -(this.mesh.ellipsoid.y + .5), .1)) {
                            this.jumpEnable = true
                        }
                        else { this.jumpEnable = false }
                    }
                } else { this.jumpEnable = false }
            }
        } else { this.jumpEnable = false }


    }

    die() {
        if (!this.dying) {
            this.dying = true
            this.controls.controlsEnable = false
            this.controls.resetPressed()
            this.dieSound.play()
            this.death++
            this.UI.set_deaths(this.death)
            this.UI.show_death_screen()
            setTimeout(() => {
                this.mesh.position = new BABYLON.Vector3(this.startPos.x, -this.startPos.y)
                this.controls.controlsEnable = true
                this.dying = false
                this.UI.hide_death_screen()
            }, 2000)
        }
    }

    //Move player to end
    goToEnd() {
        let x = this.mesh.position.x
        if (Math.abs(x - this.endLevelPos) > .1) {
            if (x < this.endLevelPos) {
                x = x + (.1 * (60 * this.engine.getDeltaTime() / 1000))
            } else if (x > this.endLevelPos) {
                x = x - (.1 * (60 * this.engine.getDeltaTime() / 1000))
            }
        } else if (x != this.endLevelPos) {
            x = this.endLevelPos
        }
        this.mesh.position.x = x
    }

    //Player body rotation (rolling)
    playerAnime() {
        const step = this.engine.getDeltaTime() / 60 * (-1) * .5
        this.playerBody.rotate(BABYLON.Axis.Z, step * this.playerDirection, BABYLON.Space.WORLD)
    }

    //Create composed mesh player
    createPlayerMesh(startPos) {
        this.startPos = startPos
        const compoundBody = new BABYLON.Mesh('Player', this.scene)
        const playerHead = BABYLON.MeshBuilder.CreateSphere('playerHead', { diameter: .7, segments: 8 }, this.scene)
        const playerBody = BABYLON.MeshBuilder.CreateSphere('playerBody', { diameter: 1.2, segments: 8 }, this.scene)
        playerHead.position.y = .4
        playerBody.position.y = -.2
        playerBody.rotate(BABYLON.Axis.Y, Math.PI / 2, BABYLON.Space.WORLD)

        compoundBody.addChild(playerHead)
        compoundBody.addChild(playerBody)

        const playerHeadMat = new BABYLON.StandardMaterial('playerHeadMat', this.scene)
        playerHeadMat.diffuseColor = new BABYLON.Color3(1, 1, 1)
        playerHeadMat.emissiveColor = new BABYLON.Color3(.5, .5, .5)

        const playerBodyMat = new BABYLON.StandardMaterial('playerBodyMat', this.scene)
        playerBodyMat.diffuseTexture = new BABYLON.Texture('./src/img/robot5.jpg', this.scene)
        playerBodyMat.emissiveColor = new BABYLON.Color3(.3, .3, .3)

        playerHead.material = playerHeadMat
        playerBody.material = playerBodyMat

        //Set up mesh collision ellipsoid
        compoundBody.ellipsoid.x = .49
        compoundBody.ellipsoid.y = .7
        compoundBody.ellipsoid.z = .49
        compoundBody.position.x = startPos.x
        compoundBody.position.y = -startPos.y

        return compoundBody
    }
}

function isAlmostEquals(arg1, arg2, epsilon) { return (Math.abs(arg1 - arg2) <= 0 + epsilon) }