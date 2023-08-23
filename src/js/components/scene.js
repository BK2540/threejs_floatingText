import {
  Color,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  SphereGeometry,
  MeshMatcapMaterial,
  AxesHelper,
  Object3D,
  Vector3,
  TorusGeometry,
  IcosahedronGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  MathUtils,
} from 'three'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats-js'
import LoaderManager from '@/js/managers/LoaderManager'
import GUI from 'lil-gui'
import Shape from './shape'
import { gsap } from 'gsap';

export default class MainScene {
  #canvas
  #renderer
  #scene
  #camera
  #controls
  #stats
  #width
  #height
  #mesh
  #guiObj = {
    y: 0,
    showTitle: true,
  }

  containerMesh = new Object3D()
  shapes = []
  mouse = {
    x:0,
    y:0,
  }

  constructor() {
    this.#canvas = document.querySelector('.scene')

    this.init()
  }

  init = async () => {
    // Preload assets before initiating the scene
    const assets = [
      {
        name: 'matcap',
        texture: './img/matcap.png',
      },
      {
        name: 'roboto-font',
        font: './font/Roboto_Regular.json'
      },
    ]

    await LoaderManager.load(assets)

    this.setStats()
    this.setGUI()
    this.setScene()
    this.setRender()
    this.setCamera()
    // this.setControls()
    this.setAxesHelper()

    this.setShapes()
    this.setText() 

    this.handleResize()

    // start RAF
    this.events()
  }

  /**
   * Our Webgl renderer, an object that will draw everything in our canvas
   * https://threejs.org/docs/?q=rend#api/en/renderers/WebGLRenderer
   */
  setRender() {
    this.#renderer = new WebGLRenderer({
      canvas: this.#canvas,
      antialias: true,
    })
  }

  /**
   * This is our scene, we'll add any object
   * https://threejs.org/docs/?q=scene#api/en/scenes/Scene
   */
  setScene() {
    this.#scene = new Scene()
    this.#scene.background = new Color(0xffffff)
  }

  /**
   * Our Perspective camera, this is the point of view that we'll have
   * of our scene.
   * A perscpective camera is mimicing the human eyes so something far we'll
   * look smaller than something close
   * https://threejs.org/docs/?q=pers#api/en/cameras/PerspectiveCamera
   */
  setCamera() {
    const aspectRatio = this.#width / this.#height
    const fieldOfView = 60
    const nearPlane = 0.1
    const farPlane = 10000

    this.#camera = new PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
    this.#camera.position.y = 0
    this.#camera.position.x = 0
    this.#camera.position.z = 10
    this.#camera.lookAt(0, 0, 0)

    this.#scene.add(this.#camera)
  }

  /**
   * Threejs controls to have controls on our scene
   * https://threejs.org/docs/?q=orbi#examples/en/controls/OrbitControls
   */
  setControls() {
    this.#controls = new OrbitControls(this.#camera, this.#renderer.domElement)
    this.#controls.enableDamping = true
    // this.#controls.dampingFactor = 0.04
  }

  /**
   * Axes Helper
   * https://threejs.org/docs/?q=Axesh#api/en/helpers/AxesHelper
   */
  setAxesHelper() {
    const axesHelper = new AxesHelper(3)
    this.#scene.add(axesHelper)
  }

  /**
   * Create a SphereGeometry
   * https://threejs.org/docs/?q=box#api/en/geometries/SphereGeometry
   * with a Basic material
   * https://threejs.org/docs/?q=mesh#api/en/materials/MeshBasicMaterial
   */
  setShapes() {
    
    const geometry1 = new SphereGeometry(1, 32, 32)
    const material = new MeshMatcapMaterial({ matcap: LoaderManager.assets['matcap'].texture })

    const shape1 = new Shape({
      geometry: geometry1, 
      material, 
      parentMesh: this.containerMesh, 
      position: new Vector3(6, 2, -2),
      index: 0,
    })

    const geometry2 = new TorusGeometry( 2, 0.5, 16, 100 );

    const shape2 = new Shape({
      geometry: geometry2, 
      material, 
      parentMesh: this.containerMesh, 
      position: new Vector3(-6, -1, -4),
      speed: 0.002,
      offsetSpeed: 5,
      index: 1,
    })

    const geometry3 = new IcosahedronGeometry(0.8, 0)

    const shape3 = new Shape({
      geometry: geometry3, 
      material, 
      parentMesh: this.containerMesh, 
      position: new Vector3(-1, 0, 4),
      speed: 0.001,
      offsetSpeed: 10,
      index: 2,
    })

    this.#scene.add(this.containerMesh)

    this.shapes = [shape1, shape2, shape3]
    
  }

  setText() {
    const geometry = new TextGeometry( 'Welcome to my website!', {
      font: LoaderManager.assets['roboto-font'].font,
      size: 0.8,
      height: 0.1,
      curveSegments: 12,
      bevelEnabled: false,
    })

    const material = new MeshBasicMaterial({color: 0xf8c291})

    const mesh = new Mesh(geometry, material)

    geometry.computeBoundingBox()

    const centerOffset = -(geometry.boundingBox.max.x - geometry.boundingBox.min.x) /2
    mesh.position.x = centerOffset

    //animate with GSAP
    gsap.fromTo(
      mesh.scale,
      {x:1, y:0, z:0},
      {x:1, y:1, z:1, duration:2, ease: 'expo.out'}
    )

    this.containerMesh.add(mesh)
  }

  /**
   * Build stats to display fps
   */
  setStats() {
    this.#stats = new Stats()
    this.#stats.showPanel(0)
    document.body.appendChild(this.#stats.dom)
  }

  setGUI() {
    const titleEl = document.querySelector('.main-title')

    const handleChange = () => {
      this.#mesh.position.y = this.#guiObj.y
      titleEl.style.display = this.#guiObj.showTitle ? 'block' : 'none'
    }

    const gui = new GUI()
    gui.add(this.#guiObj, 'y', -3, 3).onChange(handleChange)
    gui.add(this.#guiObj, 'showTitle').name('show title').onChange(handleChange)
  }
  /**
   * List of events
   */
  events() {
    window.addEventListener('resize', this.handleResize, { passive: true })
    window.addEventListener('mousemove', this.handleMouse, { passive: true })
    this.draw(0)
  }

  // EVENTS

  /**
   * Request animation frame function
   * This function is called 60/time per seconds with no performance issue
   * Everything that happens in the scene is drawed here
   * @param {Number} now
   */
  draw = (time) => {
    // now: time in ms
    this.#stats.begin()

    if (this.#controls) this.#controls.update() // for damping
    this.#renderer.render(this.#scene, this.#camera)

    for (let i = 0; i < this.shapes.length; i++) {
      const shape = this.shapes[i];
      shape.render(time)
    }

    this.containerMesh.rotation.y = MathUtils.degToRad(this.mouse.x * 10)
    this.containerMesh.rotation.x = MathUtils.degToRad(this.mouse.y * 10)

    this.#stats.end()
    this.raf = window.requestAnimationFrame(this.draw)
  }

  handleMouse = (e) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }

  /**
   * On resize, we need to adapt our camera based
   * on the new window width and height and the renderer
   */
  handleResize = () => {
    this.#width = window.innerWidth
    this.#height = window.innerHeight

    // Update camera
    this.#camera.aspect = this.#width / this.#height
    this.#camera.updateProjectionMatrix()

    const DPR = window.devicePixelRatio ? window.devicePixelRatio : 1

    this.#renderer.setPixelRatio(DPR)
    this.#renderer.setSize(this.#width, this.#height)
  }
}
