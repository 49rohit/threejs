import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import * as dat from 'lil-gui'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'



/**
 * Base
 */
/**
 * Loaders
 */


// Debug
const gui = new GUI();
const global = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Audio listen
const listener = new THREE.AudioListener();
    
// Envronment Map

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child.isMesh && child.material.isMeshStandardMaterial)
        {
            child.material.envMapIntensity = global.envMapIntensity
        }
    })
}

/**
 * Environment map
 */
scene.backgroundBlurriness = 0
scene.backgroundIntensity = 1


gui.add(scene, 'backgroundBlurriness').min(0).max(1).step(0.001)
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001)

// Global intensity
global.envMapIntensity = 1
gui
    .add(global, 'envMapIntensity')
    .min(0)
    .max(10)
    .step(0.001)
    .onChange(updateAllMaterials)

// create a global audio source
const sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'sound/Kala_Chashma.ogg', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
	// sound.AudioLoader(true)
});

// Models loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()
const rgbeLoader = new RGBELoader()
const exrLoader = new EXRLoader()
const textureLoader = new THREE.TextureLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    "/models/fox-model/Avtar_2.glb",
    
    (gltf) =>
    {
// scene.add(gltf.scene.children[0])
// while(gltf.scene.children.length)
// {
//     scene.add(gltf.scene.children[0])
// }
            // console.log(gltf)
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])

        action.play()
        
        gltf.scene.scale.set(8, 8, 8)
        scene.add(gltf.scene)
   
    } 
        
)

/**
 * Real time environment map
 */
// Base environment map
const environmentMap = textureLoader.load('/environmentMaps/blockadesLabsSkybox/Ultraschall_Club_Munich_1997_Panorama_Dance_Area.jpg')
environmentMap.mapping = THREE.EquirectangularReflectionMapping
environmentMap.colorSpace = THREE.SRGBColorSpace

scene.background = environmentMap

// console.log(gltfLoader)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 11,),
    new THREE.MeshStandardMaterial({
        color: '#ff0000',
        metalness: 0.8,
  
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xff0000, 0.5)
scene.add(ambientLight)
ambientLight.position.y =  -8

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 9
directionalLight.shadow.camera.left = - 9
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(0, 2, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 9))
})

// 



/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(100, sizes.width / sizes.height, 0.5, 100)
camera.position.set(-9, 10, 12)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
    
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //update Mixer
    if(mixer != null)
    {
        mixer.update(deltaTime)
    }
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
   
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}



tick()