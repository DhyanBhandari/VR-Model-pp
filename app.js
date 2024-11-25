import * as THREE from './libs/three/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.152/examples/jsm/webxr/VRButton.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { OrbitControls } from './libs/three/jsm/OrbitControls.js';

class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.clock = new THREE.Clock();

        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0, 1.6, 3);

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x505050);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(0, 1.6, 0);
        this.controls.update();

        this.initScene();
        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this));

        this.renderer.setAnimationLoop(this.render.bind(this));
    }

    initScene() {
        // Clear the scene
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }

        this.scene.add(new THREE.HemisphereLight(0x606060, 0x404040));

        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1, 1, 1).normalize();
        this.scene.add(light);

        const modelURL = "https://dweb.link/ipfs/QmSRkv8465jEP1wRC2bJHehRb4pewGjqn75BCmJNTR2tk5";

        const loader = new GLTFLoader();
        loader.load(
            modelURL,
            (gltf) => {
                const model = gltf.scene;
                model.position.set(0, 0, 0); // Adjust position
                model.scale.set(1, 1, 1);   // Adjust scale
                this.scene.add(model);
            },
            (xhr) => {
                console.log(`Model loading: ${(xhr.loaded / xhr.total) * 100}% loaded`);
            },
            (error) => {
                console.error('An error occurred while loading the GLB model:', error);
            }
        );

        // Add a simple plane as the ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshStandardMaterial({ color: 0x808080 }) // Plain color material
        );
        ground.rotation.x = -Math.PI / 2; // Make it horizontal
        this.scene.add(ground);
    }

    setupXR() {
        this.renderer.xr.enabled = true;
        document.body.appendChild(VRButton.createButton(this.renderer));

        // Handle controllers
        this.controllers = this.buildControllers();
    }

    buildControllers() {
        const controllers = [];
        for (let i = 0; i <= 1; i++) {
            const controller = this.renderer.xr.getController(i);
            controller.addEventListener('selectstart', () => {
                console.log(`Controller ${i} selectstart`);
            });
            controller.addEventListener('selectend', () => {
                console.log(`Controller ${i} selectend`);
            });
            this.scene.add(controller);
            controllers.push(controller);
        }
        return controllers;
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}

export { App };
