// import * as THREE from "../node_modules/three/build/three.module.js";
// import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls, axesHelper;
let geometry, material;
let allCubesGroup;

var debug = false;
var cubes = [];
var colors = [
    0xffffff, //white
    0xffd600, //yellow
    0x0044af, //blue
    0x009c46, //green
    0xff5700, //orange
    0xb80a31, //red
];

init();
createScene();
animate();

// --------------------------------------------------------------------------------
function init() {
    axesHelper = new THREE.AxesHelper(5);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe5e5e5);
    if (debug) scene.add(axesHelper);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.x = 5;
    camera.position.y = 5;
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
}

function createScene() {
    createObjects();
    allCubesGroup = new THREE.Group();
    for(var cube of cubes){
        allCubesGroup.add(cube);
    }
    scene.add(allCubesGroup);
}
function createObjects() {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                var cube = newCube();
                let space = 1.02;
                cube.position.x = i*space;
                cube.position.y = j*space;
                cube.position.z = k*space;

                if (i == -1){
                    cube.geometry.faces[1*2].color.setHex(colors[0]);
                    cube.geometry.faces[1*2 +1].color.setHex(colors[0]);
                }
                if (i == 1){
                    cube.geometry.faces[0*2].color.setHex(colors[1]);
                    cube.geometry.faces[0*2 +1].color.setHex(colors[1]);
                }
                if (j == -1){
                    cube.geometry.faces[3*2].color.setHex(colors[2]);
                    cube.geometry.faces[3*2 +1].color.setHex(colors[2]);
                }
                if (j == 1){
                    cube.geometry.faces[2*2].color.setHex(colors[3]);
                    cube.geometry.faces[2*2 +1].color.setHex(colors[3]);
                }
                if (k == -1){
                    cube.geometry.faces[5*2].color.setHex(colors[4]);
                    cube.geometry.faces[5*2 +1].color.setHex(colors[4]);
                }
                if (k == 1){
                    cube.geometry.faces[4*2].color.setHex(colors[5]);
                    cube.geometry.faces[4*2 +1].color.setHex(colors[5]);
                }
                scene.add(cube);
                cubes.push(cube)
            }
        }
    }
}

function newCube() {
    geometry = new THREE.BoxGeometry(1,1,1);
    for (var i = 0; i < geometry.faces.length; i++) {
        geometry.faces[i].color.setHex(0x000000);
    }
    material = new THREE.MeshBasicMaterial({vertexColors: true});
    return new THREE.Mesh(geometry, material);
}

function animate() {
    requestAnimationFrame(animate);
    allCubesGroup.rotation.x += 0.001;
    allCubesGroup.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
