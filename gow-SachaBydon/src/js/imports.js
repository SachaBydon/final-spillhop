import { DefaultCollisionCoordinator  } from '@babylonjs/core/Collisions/collisionCoordinator'

import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene } from '@babylonjs/core/scene'
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader'

import { Space } from '@babylonjs/core/Maths/math.axis'
import { Axis } from '@babylonjs/core/Maths/math.axis'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Color3 } from '@babylonjs/core/Maths/math.color'

import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight'

import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial'
import { Texture } from '@babylonjs/core/Materials/Textures/texture'

import { FollowCamera } from '@babylonjs/core/Cameras/followCamera'
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer'

import { AudioSceneComponent } from '@babylonjs/core/Audio/audioSceneComponent'
import { Sound } from '@babylonjs/core/Audio/sound'
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder'
import { Mesh } from '@babylonjs/core/Meshes/mesh'

import { GamepadManager } from '@babylonjs/core/Gamepads/gamepadManager'

export default {
    DefaultCollisionCoordinator: DefaultCollisionCoordinator,
    Engine: Engine,
    Scene: Scene,
    SceneLoader: SceneLoader,
    Space: Space,
    Axis: Axis,
    Vector3: Vector3,
    Color3: Color3,
    HemisphericLight: HemisphericLight,
    DirectionalLight: DirectionalLight,
    StandardMaterial: StandardMaterial,
    Texture: Texture,
    FollowCamera: FollowCamera,
    GlowLayer: GlowLayer,
    AudioSceneComponent: AudioSceneComponent,
    Sound: Sound,
    MeshBuilder: MeshBuilder,
    Mesh, Mesh,
    GamepadManager
}