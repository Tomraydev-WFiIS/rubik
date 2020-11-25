import * as THREE from 'https://threejs.org/build/three.module.js';
import { OrbitControls } from 'https://threejs.org/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer, controls, axesHelper;
let geometry, material;
let allCubesGroup;

var debug = true;
var cubes = [];
var colors = [
    0xffffff, //white
    0xffd600, //yellow
    0x0044af, //blue
    0x009c46, //green
    0xff5700, //orange
    0xb80a31, //red
];
var spacing = 1.02;

init();
createScene();
animate();
// turnFace("y", "+");
// turnFace("y", "-");
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

function animate() {
    requestAnimationFrame(animate);
    // allCubesGroup.rotation.x += 0.001;
    // allCubesGroup.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}

function createScene() {
    createObjects();
    // allCubesGroup = new THREE.Group();
    // for(var cube of cubes){
    //     allCubesGroup.add(cube);
    // }
    // scene.add(allCubesGroup);
}
function createObjects() {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                var cube = newCube();
                let spacing = 1.02;
                cube.position.x = i*spacing;
                cube.position.y = j*spacing;
                cube.position.z = k*spacing;

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

function getActiveGroup(axis, orientation) {
    switch(orientation) {
        case "+":
            var position = spacing;
            break;
        case "-":
            var position = -spacing;
            break;
    }
    var activeGroup = new THREE.Group();
    for(var cube of cubes){
        if (cube.position[axis] == position) {
            console.log(cube);
            activeGroup.add(cube);
        }
    }
    return activeGroup;
}

function turnFace(axis, orientation, direction=1, speed=0.01) {
    var activeGroup = getActiveGroup(axis, orientation);
    scene.add(activeGroup);
    var initialRotation = activeGroup.rotation[axis];
    var step = Math.PI * speed;
    function animateTurn(agg){
        if ((agg + step) >= Math.PI/2) {
            activeGroup.rotation[axis] = initialRotation + direction * Math.PI/2;
            // activeGroup.children.forEach(function(cube) {
            //     scene.add(cube);
            // })
            return;
        }
        agg += step;
        activeGroup.rotation[axis] += direction * step;
        requestAnimationFrame(() => animateTurn(agg));
    }
    animateTurn(0);
}
document.addEventListener("keydown", onDocumentKeyDown);
function onDocumentKeyDown(event) {
    var keyCode = event.which || event.keyCode;
    if (keyCode == 16) return; // shift
    var direction = event.shiftKey?-1:1;
    switch(keyCode) {
        case 88: // down
            turnFace("y", "-", direction);
            break;
        case 65: // left
            turnFace("z", "+", direction);
            break;
        case 83: // front
            turnFace("x", "+", direction);
            break;
        case 68: // right
            turnFace("z", "-", direction);
            break;
        case 87: // up
            turnFace("y", "+", direction);
            break;
    }
}