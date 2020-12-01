"use strict";
import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "https://threejs.org/examples/jsm/controls/OrbitControls.js";
// import { Stats } from "https://mrdoob.github.io/stats.js/build/stats.module.js";

let camera;
let scene;
let renderer;
let controls;
let axesHelper;
let geometry;
let material;
let stopwatch;


const debug = false;
let cubes = [];
const colors = [
    0xffffff, //white
    0xffd600, //yellow
    0x0044af, //blue
    0x009c46, //green
    0xff5700, //orange
    0xb80a31 //red
];
let spacing = 1.02; // 1.02
let moveQueue = [];
let userMoveHistory = [];
let shuffleMoveHistory = [];
let moveInProgress = false;
let gameInProgress = false;
let startingGame = false;
const defaultSpeed = 0.05; // 0.05
let speed = defaultSpeed;


init();
createScene();
animate();
// --------------------------------------------------------------------------------
function init() {
    axesHelper = new THREE.AxesHelper(5);
    // if(debug){
    //     stats = createStats();
    //     document.body.appendChild(stats.domElement);
    // }

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
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
    applyMoves();
    if (gameInProgress) checkForWin();
    controls.update();
    renderer.render(scene, camera);
    // if(debug) stats.update();
}

function createScene() {
    createObjects();
}
function createObjects() {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                let cube = newCube();
                cube.position.x = i*spacing;
                cube.position.y = j*spacing;
                cube.position.z = k*spacing;
                cube.initialPosition = cube.position.clone();

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
                cubes.push(cube);
            }
        }
    }
}

function newCube() {
    geometry = new THREE.BoxGeometry(1,1,1);
    for (let i = 0; i < geometry.faces.length; i++) {
        geometry.faces[i].color.setHex(0x000000);
    }
    material = new THREE.MeshBasicMaterial({vertexColors: true});
    return new THREE.Mesh(geometry, material);
}

function getActiveGroup(axis, orientation) {
    let position;
    switch(orientation) {
        case "+":
            position = spacing;
            break;
        case "-":
            position = -spacing;
            break;
    }
    let activeGroup = [];
    for(let cube of cubes){
        if (cube.position[axis] == position) {
            activeGroup.push(cube);
        }
    }
    return activeGroup;
}

function turnFace(move) {
    let axis = move.axis;
    let orientation = move.orientation;
    let direction = move.direction;

    let activeGroup = getActiveGroup(axis, orientation);
    let pivot = new THREE.Object3D();
    pivot.rotation.set(0,0,0);
    pivot.updateMatrixWorld(); //needed?
    scene.add(pivot);
    for(let cube of activeGroup){
        pivot.attach(cube);
    }
    let step = Math.PI * speed;
    function animateTurn(agg){
        if ((agg + step) >= Math.PI/2.0) {
            pivot.rotation[axis] = direction * Math.PI/2.0;
            pivot.updateMatrixWorld(); // needed?
            for(let cube of activeGroup){
                scene.attach(cube);
                cube.position.x = Math.round((cube.position.x + Number.EPSILON) * 100) / 100;
                cube.position.y = Math.round((cube.position.y + Number.EPSILON) * 100) / 100;
                cube.position.z = Math.round((cube.position.z + Number.EPSILON) * 100) / 100;
                cube.updateMatrixWorld(); // needed?
            }
            scene.remove(pivot);
            moveInProgress = false;
            return;
        }
        agg += step;
        pivot.rotation[axis] += direction * step;
        requestAnimationFrame(() => animateTurn(agg));
    }
    animateTurn(0);
}
document.addEventListener("keydown", onDocumentKeyDown);
function onDocumentKeyDown(event) {
    let keyCode = event.which || event.keyCode;
    if (keyCode == 16) return; // shift
    let direction = event.shiftKey?1:-1;
    let move;
    switch(keyCode) {
        case 83: // s - down
            move = {axis: "y", orientation: "-", direction: direction};
            break;
        case 65: // a - left
            move = {axis: "z", orientation: "+", direction: direction};
            break;
        case 70: // f - front
            move = {axis: "x", orientation: "+", direction: direction};
            break;
        case 68: // d - right
            move = {axis: "z", orientation: "-", direction: direction};
            break;
        case 87: // w - up
            move = {axis: "y", orientation: "+", direction: direction};
            break;
        case 90: // z - back
            move = {axis: "x", orientation: "-", direction: direction};
            break;
        default:
            return;
    }
    moveQueue.push(move);
    userMoveHistory.push(move);
}

function applyMoves() {
    if (moveQueue.length > 0 && !moveInProgress) {
        moveInProgress = true;
        turnFace(moveQueue.shift());
    }
    if (moveQueue.length === 0 && !moveInProgress && startingGame) {
        startGame2();
    }
}

function shuffle(turns=20) {
    let previous_move = getRandomMove();
    for(let i = 0; i < turns;){
        let move = getRandomMove();
        if (areOppositeMoves(move, previous_move)) continue;
        moveQueue.push(move);
        shuffleMoveHistory.push(move);
        previous_move = move;
        i++;
    }
}

function getRandomMove() {
    return {axis: choose(["x", "y", "z"]), orientation: choose(["+", "-"]), direction: choose([1, -1])};
}

function areOppositeMoves(m1, m2) {
    if (m1.axis == m2.axis && m1.orientation == m2.orientation && m1.direction != m2.direction){
        return true;
    } else {
        return false;
    }
}

function resetSpeed(){
    speed = defaultSpeed;
}

function choose(choices) {
    let index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

function startGame() {
    document.getElementById("startBtn").style.display  = "none";
    startingGame = true;
    speed = 0.5;
    resetGame();
    shuffle(10);
}

function startGame2() {
    document.getElementById("stopwatch").style.display = "none"; // too distracting
    startStopwatch();
    resetSpeed();
    document.getElementById("solveBtn").style.display  = "block";
    startingGame = false;
    gameInProgress = true;
}

function finishGame() {
    gameInProgress = false;
    stopStopwatch();
    document.getElementById("solveBtn").style.display  = "none";
    document.getElementById("startBtn").style.display  = "block";
    document.getElementById("stopwatch").style.display = "block";
}

function startStopwatch() {
    document.getElementById("stopwatch").innerHTML = "00:00:00";
    let start = new Date().getTime();

    stopwatch = setInterval(function() {
        let elapsed =  new Date(new Date().getTime() - start);
        let hh = pad(elapsed.getUTCHours());
        let mm = pad(elapsed.getMinutes());
        let ss = pad(elapsed.getSeconds());
        let timeString = `${hh}:${mm}:${ss}`;
        document.getElementById("stopwatch").innerHTML = timeString;
    }, 1000);
}

function pad(n){return n<10 ? "0"+n : n}

function stopStopwatch() {
    clearInterval(stopwatch);
}

function resetGame() {
    for(let cube of cubes){
        scene.remove(cube);
    }
    cubes = [];
    moveQueue = [];
    userMoveHistory = [];
    shuffleMoveHistory = [];
    createObjects();
}

function checkForWin() {
    if(cubes.every(checkCube)) {
        finishGame();
    }
}

function checkCube(cube){
    return (
        cube.position.x == cube.initialPosition.x &&
        cube.position.y == cube.initialPosition.y &&
        cube.position.z == cube.initialPosition.z
    );
}

function solve() {
    // primitive solver, reverse every move made
    let moves = shuffleMoveHistory.concat(userMoveHistory).reverse();
    for(let move of moves){
        move.direction = (move.direction==1)?-1:1;
        moveQueue.push(move);
    }
}

function createStats() {
    let stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0";
    stats.domElement.style.top = "0";

    return stats;
}

// exports
window.startGame = startGame;
window.solve = solve;