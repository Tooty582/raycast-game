import { Vector2 } from "./vector2.js";

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        return null;
    }

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);

    return {
        position: positionBuffer,
    };
}
  
function initPositionBuffer(gl) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}
  
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPos,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPos);
}

function loadTextureArray(gl, src, width, height, imageFormat, dataFormat, index){
    gl.activeTexture(gl["TEXTURE" + index]);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, imageFormat, width, height, 0, imageFormat, dataFormat, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function loadTexture(gl, src, index){
    gl.activeTexture(gl["TEXTURE" + index]);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
}

function texifyMap(map){
    let result = [];
    for(let y = 0; y < map.walls[0].length; y++){
        for(let x = 0; x < map.walls.length; x++){
            let i = y * map.walls.length + x;
            result[i * 3] = map.walls[x][y];
            result[i * 3 + 1] = map.floors[x][y];
            result[i * 3 + 2] = map.ceils[x][y];
        }
    }
    return new Uint8Array(result);
}

function sendPortalData(gl, portal, index){
    gl.uniform2f(gl.getUniformLocation(shaderProgram, "portals[" + index + "].pos"), portal.pos.x, portal.pos.y);
    gl.uniform2f(gl.getUniformLocation(shaderProgram, "portals[" + index + "].normal"), portal.normal.x, portal.normal.y);
    gl.uniform2f(gl.getUniformLocation(shaderProgram, "portals[" + index + "].outPos"), portal.outPos.x, portal.outPos.y);
    gl.uniform2f(gl.getUniformLocation(shaderProgram, "portals[" + index + "].outNormal"), portal.outNormal.x, portal.outNormal.y);
    gl.uniform4f(gl.getUniformLocation(shaderProgram, "portals[" + index + "].maskColor"), ((portal.maskColor >> 24) & 0xFF) / 0xFF, ((portal.maskColor >> 16) & 0xFF) / 0xFF, ((portal.maskColor >> 8) & 0xFF) / 0xFF, (portal.maskColor & 0xFF) / 0xFF);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "portals[" + index + "].texture"), portal.texture);
}

let buffers, shaderProgram, programInfo;
let imgCount = 2;

export class Screen{
        static async glInit(context, map){
            let vsCode = await fetch("./modules/shader.vert");
            vsCode = await vsCode.text();
            let fsCode = await fetch("./modules/shader.frag");
            fsCode = await fsCode.text();
            shaderProgram = initShaderProgram(context, vsCode, fsCode);

            programInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPos: context.getAttribLocation(shaderProgram, "vertexPos"),
                },
                uniformLocations: {
                    screenSize: context.getUniformLocation(shaderProgram, "screenSize"),
                    pTime: context.getUniformLocation(shaderProgram, "pTime"),
                    fov: context.getUniformLocation(shaderProgram, "fov"),
                    renderHeight: context.getUniformLocation(shaderProgram, "renderHeight"),
                    mapWidth: context.getUniformLocation(shaderProgram, "mapWidth"),
                    mapLength: context.getUniformLocation(shaderProgram, "mapLength"),
                    map: context.getUniformLocation(shaderProgram, "map"),
                    skybox: context.getUniformLocation(shaderProgram, "skybox"),
                    cameraPos: context.getUniformLocation(shaderProgram, "cameraPos"),
                    cameraDir: context.getUniformLocation(shaderProgram, "cameraDir"),
                    fogNear: context.getUniformLocation(shaderProgram, "fogNear"),
                    fogFar: context.getUniformLocation(shaderProgram, "fogFar"),
                    floorShade: context.getUniformLocation(shaderProgram, "floorShade"),
                    ceilShade: context.getUniformLocation(shaderProgram, "ceilShade"),
                    wallLightVec: context.getUniformLocation(shaderProgram, "wallLightVec"),
                    wallShadeDark: context.getUniformLocation(shaderProgram, "wallShadeDark"),
                    wallShadeLight: context.getUniformLocation(shaderProgram, "wallShadeLight")
                }
            };

            context.useProgram(shaderProgram);
            context.uniform1i(programInfo.uniformLocations.mapWidth, map.walls.length);
            context.uniform1i(programInfo.uniformLocations.mapLength, map.walls[0].length);
            context.uniform1f(programInfo.uniformLocations.fogNear, map.fogNear);
            context.uniform1f(programInfo.uniformLocations.fogFar, map.fogFar);
            context.uniform3f(programInfo.uniformLocations.floorShade, ((map.floorShade >> 16) & 0xFF) / 255, ((map.floorShade >> 8) & 0xFF) / 255, (map.floorShade & 0xFF) / 255);
            context.uniform3f(programInfo.uniformLocations.ceilShade, ((map.ceilShade >> 16) & 0xFF) / 255, ((map.ceilShade >> 8) & 0xFF) / 255, (map.ceilShade & 0xFF) / 255);
            context.uniform2f(programInfo.uniformLocations.wallLightVec, map.wallLightVec.x, map.wallLightVec.y);
            context.uniform3f(programInfo.uniformLocations.wallShadeDark, ((map.wallShadeDark >> 16) & 0xFF) / 255, ((map.wallShadeDark >> 8) & 0xFF) / 255, (map.wallShadeDark & 0xFF) / 255);
            context.uniform3f(programInfo.uniformLocations.wallShadeLight, ((map.wallShadeLight >> 16) & 0xFF) / 255, ((map.wallShadeLight >> 8) & 0xFF) / 255, (map.wallShadeLight & 0xFF) / 255);

            for(let i = 0; i < map.portals.length; i++){
                sendPortalData(context, map.portals[i], i);
            }

            buffers = initBuffers(context);
            this.setMap(context, map)
        }

        static setMap(context, map){
            loadTextureArray(context, texifyMap(map), map.walls.length, map.walls[0].length, context.RGB, context.UNSIGNED_BYTE, 0);
            context.uniform1i(programInfo.uniformLocations.map, 0);
        }

        static async setSkybox(context, src){
            let img = new Image();
            img.src = src;
            await img.decode();
            loadTexture(context, img, 1);
            context.uniform1i(programInfo.uniformLocations.skybox, 1);
        }

        static async addImage(context, src){
            let img = new Image();
            img.src = src;
            await img.decode();
            let index = imgCount;
            if(index >= context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS)){
                alert("Could not add image, max image units is " + context.getParameter(context.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
                return;
            }
            loadTexture(context, img, index);
            context.uniform1i(context.getUniformLocation(shaderProgram, "textures[" + (index - 2) + "]"), index);
            imgCount = imgCount + 1;
        }

        static glRender(context, camera, fov, renderHeight){
            context.clearColor(0.0, 0.0, 0.0, 1.0);
            context.clear(context.COLOR_BUFFER_BIT);

            setPositionAttribute(context, buffers, programInfo);

            context.useProgram(shaderProgram);

            context.uniform2f(programInfo.uniformLocations.screenSize, context.canvas.width, context.canvas.height);
            context.uniform1f(programInfo.uniformLocations.pTime, (performance.now()) / 1000);
            context.uniform1f(programInfo.uniformLocations.fov, fov);
            context.uniform1f(programInfo.uniformLocations.renderHeight, renderHeight);
            context.uniform2f(programInfo.uniformLocations.cameraPos, camera.pos.x, camera.pos.y);
            context.uniform2f(programInfo.uniformLocations.cameraDir, camera.forward.x, camera.forward.y);

            const offset = 0;
            const vertexCount = 4;
            context.drawArrays(context.TRIANGLE_STRIP, offset, vertexCount);
        }
}