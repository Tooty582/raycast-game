import { Camera } from "./modules/camera.js";
import { Input } from "./modules/input.js";
import { Screen } from "./modules/screen.js";
import { TouchControls } from "./modules/touch_controls.js";
import { Vector2 } from "./modules/vector2.js";

let displayCanvas = document.getElementById("game");
let displayContext = displayCanvas.getContext("2d");
let canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;
let context = canvas.getContext("webgl");
context.imageSmoothingEnabled = false;
let hudCanvas = document.createElement("canvas");
hudCanvas.width = 320;
hudCanvas.height = 240;
let hudContext = hudCanvas.getContext("2d");
hudContext.imageSmoothingEnabled = false;

let map = {};
map.walls = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
map.floors = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
];
map.ceils = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

map.floorShade = 0xD0B160;
map.ceilShade = 0x5E595F;
map.wallLightVec = new Vector2(0, 1).rotate(Math.PI / 18);
map.wallShadeDark = 0xFCD25F;
map.wallShadeLight = 0x464660;
map.fogNear = 16;
map.fogFar = 24;
map.wrappingSkybox = true;
map.portals = [
    {
        pos: new Vector2(2, 3),
        normal: new Vector2(1, 0),
        outPos: new Vector2(29, 3),
        outNormal: new Vector2(-1, 0),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(29, 3),
        normal: new Vector2(-1, 0),
        outPos: new Vector2(2, 3),
        outNormal: new Vector2(1, 0),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(2, 12),
        normal: new Vector2(1, 0),
        outPos: new Vector2(29, 12),
        outNormal: new Vector2(-1, 0),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(29, 12),
        normal: new Vector2(-1, 0),
        outPos: new Vector2(2, 12),
        outNormal: new Vector2(1, 0),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(3, 2),
        normal: new Vector2(0, 1),
        outPos: new Vector2(3, 13),
        outNormal: new Vector2(0, -1),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(3, 13),
        normal: new Vector2(0, -1),
        outPos: new Vector2(3, 2),
        outNormal: new Vector2(0, 1),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(28, 2),
        normal: new Vector2(0, 1),
        outPos: new Vector2(28, 13),
        outNormal: new Vector2(0, -1),
        maskColor: 0x00FF0001,
        texture: 2
    }, {
        pos: new Vector2(28, 13),
        normal: new Vector2(0, -1),
        outPos: new Vector2(28, 2),
        outNormal: new Vector2(0, 1),
        maskColor: 0x00FF0001,
        texture: 2
    }
];

let touchControls = new TouchControls();
let input = new Input(null, touchControls);
let camera = new Camera(new Vector2(8, 8), new Vector2(1, 0), input);
const INTERVAL = 1000/60;
let intervalTime = performance.now();
let framesThisPeriod = 0;
let fps = 0;
let lastTime = intervalTime;

await Screen.glInit(context, map);
await Screen.setSkybox(context, "./assets/skybox.png");
await Screen.addImage(context, "./assets/crate.png");
await Screen.addImage(context, "./assets/grass.png");
await Screen.addImage(context, "./assets/portal.png");

let runFunc = function(){
    let now = performance.now();
    while(intervalTime < now){
        input.update();
        camera.update(map);
        intervalTime += INTERVAL;
    }

    Screen.glRender(context, camera, Math.PI / 3, 0.5);
    hudContext.fillStyle = "yellow";
    hudContext.font = "bold 12px sans-serif";

    if(now > lastTime + 250){
        let delta = now - lastTime;
        fps = framesThisPeriod / (delta / 1000);
        fps -= fps % 1;
        framesThisPeriod = 0;
        lastTime = now;
    }
    hudContext.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
    hudContext.fillText(fps, 2, 12);
    framesThisPeriod++;

    displayCanvas.width = window.innerWidth;
    displayCanvas.height = window.innerHeight;
    let widthScale = displayCanvas.width / canvas.width;
    let heightScale = displayCanvas.height / canvas.height;
    let scale = 0;
    let xOff = 0;
    let yOff = 0;
    if(widthScale > heightScale){
        xOff = (widthScale - heightScale) / widthScale * displayCanvas.width / 2;
        scale = heightScale;
    }else{
        yOff = (heightScale - widthScale) / heightScale * displayCanvas.height / 2;
        scale = widthScale;
    }
    displayContext.imageSmoothingEnabled = false;
    displayContext.drawImage(canvas, xOff, yOff, canvas.width * scale, canvas.height * scale);
    displayContext.drawImage(hudCanvas, xOff, yOff, canvas.width * scale, canvas.height * scale);
    if(input.touchEnabled) touchControls.render(displayContext);
    requestAnimationFrame(runFunc);
}

requestAnimationFrame(runFunc);
