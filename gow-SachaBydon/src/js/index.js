/** --- Imports --- */
import { default as BABYLON } from './imports'
import '@babylonjs/loaders/index'

import Player from './player'

import level1 from '../levels/level1'
import level2 from '../levels/level2'
import level3 from '../levels/level3'
import level4 from '../levels/level4'
import level5 from '../levels/level5'
import level6 from '../levels/level6'
import level7 from '../levels/level7'
import level8 from '../levels/level8'
import level9 from '../levels/level9'
const levels = [
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
    level9
]

import Storage from './storage'
const storage = new Storage(levels)

import Ui from './ui'
const UI = new Ui(goToLevel, storage)

import Controls from './controls'
const controls = new Controls(UI)

/** --- Global variables --- */
let player
let sceneGrid = []
let monsters = []
let turningObjects = []
let currentScene


/** --- Set up BABYLONJS engine --- */
const canvas = document.querySelector('#renderCanvas')
const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true, stencil: true
})
if (!engine) throw 'engine should not be null.'
window.addEventListener('resize', () => { engine.resize() })
engine.runRenderLoop(() => {
    if (currentScene) currentScene.render()
    if (audioScene) audioScene.render()
})
const audioScene = createAudioScene()


/** --- Functions --- */
/**
 * All actions updated each frame
 */
function mainUpdate() {
    currentScene.registerBeforeRender(() => {
        if (!currentScene.isReady()) return
        player.update()
        coinAnime()
        moveMonsters()
    })
}

/**
 * Coins rotation animation
 */
function coinAnime() {
    const step = engine.getDeltaTime() / 100 * (-1)
    const world = BABYLON.Space.WORLD
    const y = BABYLON.Axis.Y
    for (let c of turningObjects) c.obj.rotate(y, step * c.speed, world)
}

/**
 * Create all meshes and behaviours of a level
 * @param {Number} idScene 
 */
async function createScene(idScene) {
    UI.show_loading_screen()

    //Get level by idScene
    const level = levels[idScene - 1]

    const scene = new BABYLON.Scene(engine)

    // Set up camera
    const camera = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(100, 100, 100), scene)
    camera.radius = 20
    camera.heightOffset = 5
    camera.rotationOffset = 180
    camera.cameraAcceleration = 0.01
    camera.maxCameraSpeed = 5


    // Set up lights
    const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene)
    light.intensity = .4
    const light2 = new BABYLON.DirectionalLight('dir01', new BABYLON.Vector3(0, -1, 0), scene)
    light2.position = new BABYLON.Vector3(0, 0, 0)
    light2.intensity = .7



    // Set up materials
    const redTileMat = new BABYLON.StandardMaterial('redTileMat', scene)
    redTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/red.png', scene)
    redTileMat.emissiveColor = new BABYLON.Color3(1, 0, 0)

    const purpleTileMat = new BABYLON.StandardMaterial('purpleTileMat', scene)
    purpleTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/purple.png', scene)
    purpleTileMat.emissiveColor = new BABYLON.Color3(.9, 0, 1)

    const greenTileMat = new BABYLON.StandardMaterial('greenTileMat', scene)
    greenTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/green.png', scene)
    greenTileMat.emissiveColor = new BABYLON.Color3(0, 1, 0)

    const blueTileMat = new BABYLON.StandardMaterial('blueTileMat', scene)
    blueTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/blue.png', scene)
    blueTileMat.emissiveColor = new BABYLON.Color3(0, 0, 1)

    const yellowTileMat = new BABYLON.StandardMaterial('yellowTileMat', scene)
    yellowTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/yellow.png', scene)
    yellowTileMat.emissiveColor = new BABYLON.Color3(1, 1, 0)

    const whiteTileMat = new BABYLON.StandardMaterial('whiteTileMat', scene)
    whiteTileMat.diffuseTexture = new BABYLON.Texture('./src/img/cube-textures/white.png', scene)
    whiteTileMat.emissiveColor = new BABYLON.Color3(1, 1, 1)

    const coinMat = new BABYLON.StandardMaterial('coinMat', scene)
    coinMat.diffuseColor = new BABYLON.Color3(1, 1, 0)
    coinMat.emissiveColor = new BABYLON.Color3(1, 1, 0)

    const doubleJumpMat = new BABYLON.StandardMaterial('doubleJumpMat', scene)
    doubleJumpMat.diffuseColor = new BABYLON.Color3(0, .4, 1)
    doubleJumpMat.emissiveColor = new BABYLON.Color3(0, .4, 1)


    //Add glow to the scene
    const glow = new BABYLON.GlowLayer('glow', scene)
    glow.intensity = .25



    //Create monsters of the level
    turningObjects = []
    monsters = []
    if (level.monsters) {
        let monsterMesh = await loadObject('./src/obj/', 'covid19.obj', scene)
        monsterMesh = monsterMesh[0]
        const monsterMat = new BABYLON.StandardMaterial('monsterMat', scene)
        monsterMat.diffuseColor = new BABYLON.Color3(1, 0, 0)
        monsterMesh.material = monsterMat
        monsterMesh.isVisible = false
        monsterMesh.checkCollisions = false
        monsterMesh.scaling = new BABYLON.Vector3(.3, .3, .3)
        const collideSphere = BABYLON.MeshBuilder.CreateSphere("mySphere", {diameter: .5, diameterX: .5}, scene)
        collideSphere.isVisible = false

        for (let monster of level.monsters) {
            createMonster(scene, monster, monsterMesh, collideSphere)
        }
    }

    //Create all tile meshes
    const tileMeshPurple = BABYLON.MeshBuilder.CreateTiledBox('tileMeshPurple', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshPurple.material = purpleTileMat
    tileMeshPurple.isVisible = false

    const tileMeshRed = BABYLON.MeshBuilder.CreateTiledBox('tileMeshRed', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshRed.material = redTileMat
    tileMeshRed.isVisible = false

    const tileMeshGreen = BABYLON.MeshBuilder.CreateTiledBox('tileMeshGreen', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshGreen.material = greenTileMat
    tileMeshGreen.isVisible = false

    const tileMeshBlue = BABYLON.MeshBuilder.CreateTiledBox('tileMeshBlue', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshBlue.material = blueTileMat
    tileMeshBlue.isVisible = false

    const tileMeshYellow = BABYLON.MeshBuilder.CreateTiledBox('tileMeshYellow', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshYellow.material = yellowTileMat
    tileMeshYellow.isVisible = false

    const tileMeshWhite = BABYLON.MeshBuilder.CreateTiledBox('tileMeshWhite', { size: 1, tileSize: 1, depth: 3 }, scene)
    tileMeshWhite.material = whiteTileMat
    tileMeshWhite.isVisible = false


    const tileMeshCoin = BABYLON.MeshBuilder.CreateCylinder(
        'tileMeshCoin',
        { size: 1, diameterTop: 1, tessellation: 30, height: .2 },
        scene
    )
    tileMeshCoin.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD)
    tileMeshCoin.material = coinMat
    tileMeshCoin.isVisible = false



    //Create all tiles instances for the current level
    

    let endLevelPos
    for (let i = 0; i < sceneGrid.length; i++) {
        for (let j = 0; j < sceneGrid[i].length; j++) {
            if (sceneGrid[i][j]) sceneGrid[i][j].dispose()
        }
    }
    sceneGrid = []
    for (let i in level.grille) {
        sceneGrid[i] = []
        for (let j in level.grille[i]) {
            if (level.grille[i][j] != 0) {
                switch (level.grille[i][j]) {
                    case 1:
                        sceneGrid[i][j] = tileMeshPurple.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                    case 2:
                        sceneGrid[i][j] = tileMeshRed.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                    case 3:
                        const ball = await loadObject('./src/obj/balls/', 'ball3.obj', scene)
                        sceneGrid[i][j] = ball[0]
                        sceneGrid[i][j].id = 'doubleJump'
                        sceneGrid[i][j].position.y = -i - .5
                        sceneGrid[i][j].position.x = j
                        sceneGrid[i][j].scaling = new BABYLON.Vector3(.6, .6, .6)
                        sceneGrid[i][j].material = doubleJumpMat
                        turningObjects.push({ obj: sceneGrid[i][j], speed: .2 })
                        break
                    case 5:
                        sceneGrid[i][j] = tileMeshCoin.createInstance('coin')
                        turningObjects.push({ obj: sceneGrid[i][j], speed: 1, coin: true })
                        break
                    case 6:
                        //Load end level pad 3D model
                        const obj = await loadObject('./src/obj/', 'pad.obj', scene)
                        const pad = obj[0]

                        const padMat = new BABYLON.StandardMaterial('padMat', scene)
                        padMat.diffuseTexture = new BABYLON.Texture('./src/img/pad.jpg', scene)
                        pad.material = padMat
                        pad.rotation.x = -Math.PI / 2
                        pad.scaling = new BABYLON.Vector3(.025, .025, .025)

                        sceneGrid[i][j] = pad
                        sceneGrid[i][j].id = 'endPoint'
                        sceneGrid[i][j].position.y = -i - .5
                        sceneGrid[i][j].position.x = j
                        endLevelPos = parseInt(sceneGrid[i][j].position.x)
                        break
                    case 8:
                        sceneGrid[i][j] = tileMeshRed.createInstance()
                        sceneGrid[i][j].id = 'no-col'
                        break
                    case 12:
                        sceneGrid[i][j] = tileMeshGreen.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                    case 13:
                        sceneGrid[i][j] = tileMeshGreen.createInstance()
                        sceneGrid[i][j].id = 'no-col'
                        break
                    case 14:
                        sceneGrid[i][j] = tileMeshBlue.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                    case 15:
                        sceneGrid[i][j] = tileMeshYellow.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                    case 16:
                        sceneGrid[i][j] = tileMeshWhite.createInstance()
                        sceneGrid[i][j].checkCollisions = true
                        break
                }
                if (level.grille[i][j] != 0 && level.grille[i][j] != 3 && level.grille[i][j] != 6) {
                    sceneGrid[i][j].position.y = -i
                    sceneGrid[i][j].position.x = j
                }

            }
        }
    }

    //Init player
    const startPos = (level.start) ? level.start : { x: 0, y: 0 }
    player = new Player(sceneGrid, engine, monsters, scene, UI, controls, idScene, startPos, endLevelPos)

    //Init UI
    UI.set_coins_max(countCoins())
    UI.set_coins(0)
    UI.set_deaths(0)
    UI.set_levelName(idScene)

    const pourcentColor = ((idScene - 1) / levels.length) * .85
    scene.clearColor = new BABYLON.Color3(pourcentColor, pourcentColor, pourcentColor)

    camera.lockedTarget = player.mesh
    
    return scene
}

/**
 * Create a monster and add it to the monsters list and the scene
 * @param {Scene} scene 
 * @param {Object} monster
 */
async function createMonster(scene, monster, mesh, collideSphere) {
    const monsterMesh = mesh.createInstance()
    const collide = collideSphere.createInstance()
    collide.id = 'collide'
    collide.isVisible = false
    let sens = (monster.posStart < monster.posEnd) ? 1 : -1
    if (monster.posY) {
        monsterMesh.position.y = parseInt(-monster.posY)
        monsterMesh.position.x = parseInt(monster.posStart)

        collide.position.y = parseInt(-monster.posY)
        collide.position.x = parseInt(monster.posStart)
    } else {
        monsterMesh.position.y = parseInt(-monster.posStart)
        monsterMesh.position.x = parseInt(monster.posX)

        collide.position.y = parseInt(-monster.posStart)
        collide.position.x = parseInt(monster.posX)

        sens = -sens
    }
    
    turningObjects.push({ obj: monsterMesh, speed: .3 })

    const direction = (monster.posY) ? 'horiz' : 'vert'
    monsters.push({
        posStart: parseInt(monster.posStart),
        posEnd: parseInt(monster.posEnd),
        sens: sens,
        speed: parseFloat(monster.speed),
        mesh: monsterMesh,
        dir: direction
    })
    monsters.push({
        posStart: parseInt(monster.posStart),
        posEnd: parseInt(monster.posEnd),
        sens: sens,
        speed: parseFloat(monster.speed),
        mesh: collide,
        dir: direction
    })

}

/**
 * Displacement of all monsters of the list
 */
function moveMonsters() {
    for (let monster of monsters) {
        if (monster.dir == 'horiz') {
            monster.mesh.position.x += (monster.speed) * monster.sens * (60 * engine.getDeltaTime() / 1000)
            let left, right
            if (monster.posStart < monster.posEnd) {
                left = monster.posStart
                right = monster.posEnd
            } else {
                left = monster.posEnd
                right = monster.posStart
            }

            //To right
            if (monster.sens == 1) {
                if (monster.mesh.position.x >= right) {
                    monster.mesh.position.x = right
                    monster.sens = -1
                }
            }
            //To left
            else {
                if (monster.mesh.position.x <= left) {
                    monster.mesh.position.x = left
                    monster.sens = 1
                }
            }
        } else {
            monster.mesh.position.y += (monster.speed) * monster.sens * (60 * engine.getDeltaTime() / 1000)
            let top, bottom
            if (monster.posStart < monster.posEnd) {
                top = -monster.posStart
                bottom = -monster.posEnd
            } else {
                top = -monster.posEnd
                bottom = -monster.posStart
            }
            //To top
            if (monster.sens == 1) {
                if (monster.mesh.position.y >= top) {
                    monster.mesh.position.y = top
                    monster.sens = -1
                }
            }
            //To bottom
            else {
                if (monster.mesh.position.y <= bottom) {
                    monster.mesh.position.y = bottom
                    monster.sens = 1
                }
            }

        }
    }
}

/**
 * Load the level by id
 * @param {Number} id 
 */
async function goToLevel(id) {
    controls.controlsEnable = false
    if (id > 0 && id <= levels.length) {
        if (currentScene) currentScene.dispose()
        currentScene = await createScene(id)
        setTimeout(() => {
            UI.hide_loading_screen()

            if (storage.save[id - 1].best == 0) {
                UI.show_stories_screen()
                switch (id) {
                    case 1:
                        UI.set_stories_text(3, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 2:
                        UI.set_stories_text(4, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 3:
                        UI.set_stories_text(5, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 4:
                        UI.set_stories_text(6, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 5:
                        UI.set_stories_text(7, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 6:
                        UI.set_stories_text(8, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 7:
                        UI.set_stories_text(9, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 8:
                        UI.set_stories_text(10, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                    case 9:
                        UI.set_stories_text(11, true, () => {
                            controls.controlsEnable = true
                        })
                        break
                }
            } else {
                controls.controlsEnable = true
            }
        }, 500)
        mainUpdate()
    }
}

/**
 * Load an object in the scene
 * @param {String} source
 * @param {String} name
 * @param {Scene} scene
 */
function loadObject(source, name, scene) {
    return new Promise((resolve, reject) => {
        BABYLON.SceneLoader.ImportMesh('', source, name, scene, function (newMeshes) {
            resolve(newMeshes)
        })
    })
}

/**
 * Create the background audio scene
 */
function createAudioScene() {
    const scene = new BABYLON.Scene(engine)
    const backSound = new BABYLON.Sound('backSound', './src/sounds/spillhop.mp3', scene, null, { loop: true, autoplay: true })
    backSound.setVolume(.05)
}

/**
 * Count the coins in the turningObjects list
 */
function countCoins() {
    let cpmt = 0
    turningObjects.forEach(o => { if (o.coin) cpmt++ })
    return cpmt
}