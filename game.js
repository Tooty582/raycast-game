import { Camera } from "./modules/camera.js";
import { Input } from "./modules/input.js";
import { Screen } from "./modules/screen.js";
import { Spritesheet } from "./modules/spritesheet.js";
import { TouchControls } from "./modules/touch_controls.js";
import { Vector2 } from "./modules/vector2.js";

let displayCanvas = document.getElementById("game");
let displayContext = displayCanvas.getContext("2d");
let canvas = document.createElement("canvas");
canvas.width = 320;
canvas.height = 240;
let context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;

let spritesheet = new Spritesheet(64, 2);
let map = {};
map.walls = [
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2],
    [2, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
];
map.floors = [
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
];
map.ceils = [
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
];

let crateSprite = spritesheet.addImage("./assets/crate.png", "crate");
let redCrateSprite = spritesheet.addImage("./assets/crate_red.png", "crate red");
let portalSprite = spritesheet.addImage("./assets/portal.png", "portal");

map.wall1 = crateSprite;
map.wall2 = redCrateSprite;
map.floor1 = crateSprite;
map.floor2 = redCrateSprite;
map.ceil1 = crateSprite;
map.ceil2 = redCrateSprite;
map.floorShade = 0.9619397662556433780640915946984;
map.ceilShade = 0.6913417161825448858642299920152;
map.wallLightVec = new Vector2(1, 0.5).normalize();
map.wallLightShade = 0.9619397662556433780640915946984;
map.wallDarkShade = 0.5;
map.fogColor = 0xC0C0C0FF;
map.fogNear = 12;
map.fogFar = 16;
map.portals = {
    "2 2": {
        sprite: portalSprite,
        normal: new Vector2(-1, 0),
        maskColor: 0x00FF0001,
        posX: 2,
        posY: 2
    }, "2 13": {
        sprite: portalSprite,
        normal: new Vector2(-1, 0),
        maskColor: 0x00FF0001,
        posX: 2,
        posY: 13
    }
};
map.portals["2 2"].linkedPortal = map.portals["2 13"];
map.portals["2 13"].linkedPortal = map.portals["2 2"];

let touchControls = new TouchControls();
let input = new Input(null, touchControls);
let camera = new Camera(new Vector2(8, 8), new Vector2(1, 0), input);
const INTERVAL = 1000/60;
let intervalTime = performance.now();
let framesThisPeriod = 0;
let fps = 0;
let lastTime = intervalTime;

let runFunc = function(){
    let now = performance.now();
    while(intervalTime < now){
        input.update();
        camera.update(map);
        intervalTime += INTERVAL;
    }
    
    Screen.render(context, camera, map, Math.PI / 3, 0.5);
    context.fillStyle = "yellow";
    context.font = "bold 12px sans-serif";

    if(now > lastTime + 250){
        let delta = now - lastTime;
        fps = framesThisPeriod / (delta / 1000);
        fps -= fps % 1;
        framesThisPeriod = 0;
        lastTime = now;
    }
    context.fillText(fps, 2, 12);
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
    if(input.touchEnabled) touchControls.render(displayContext);
    requestAnimationFrame(runFunc);
}

requestAnimationFrame(runFunc);
