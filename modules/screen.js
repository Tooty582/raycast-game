import { Vector2 } from "./vector2.js";
import { Sprite } from "./sprite.js";
import { CanvasImage } from "./canvas_image.js";

function modulus(n, m){
    return (n % m + m) % m
}

function getSkyboxPixel(map, x, y, width, height, fov, ang){
    if(map.wrappingSkybox){
        return map.skybox.getPixel(modulus(Math.floor(ang / 2 / Math.PI * map.skybox.width), map.skybox.width), Math.floor(y * map.skybox.height / height));
    }else{
        return map.skybox.getPixel(Math.floor(x * map.skybox.width / width), Math.floor(y * map.skybox.height / height));
    }
}

function drawMapPixel(image, x, y, width, height, map, renderHeight, fov, hitQueue, queueNum){
    let hitEntry = hitQueue[queueNum];
    let posX = hitEntry.posX;
    let posY = hitEntry.posY;
    let curPos = hitEntry.curPos;
    let dir = hitEntry.dir;
    let hitNorm = hitEntry.hitNorm;
    let hitRight = hitEntry.hitRight;
    let camPos = hitEntry.camPos;
    let camForward = hitEntry.camForward;
    let ang = Math.atan2(dir.y, dir.x);

    let fogColor = map.fogColor;
    if(!fogColor){
        if(typeof(map.skybox) == "number"){
            fogColor = map.skybox;
        }else if(map.skybox instanceof CanvasImage){
            fogColor = getSkyboxPixel(map, x, y, width, height, fov, ang);
        }else{
            color = 0;
        }
    }

    let dist = curPos.subtract(camPos).length();
    dist = dist * camForward.dot(dir);
    let wallHeight = width / dist;
    let start = height / 2 - wallHeight * (1 - renderHeight);
    let wall = map["wall" + map.walls[posX][posY]];

    if(y >= start && y < start + wallHeight){
        let wallY = (y - start) / wallHeight;
        let wallX = modulus(curPos.dot(hitRight), 1);
        
        let color = 0;

        if(typeof(wall) == "number"){
            color = wall;
        }else if(typeof(wall) == "function"){
            color = wall(wallX, wallY);
        }else if(wall instanceof Sprite){
            let pixelX = wall.spriteSize * wallX;
            let pixelY = wall.spriteSize * wallY;
            pixelX -= pixelX % 1;
            pixelY -= pixelY % 1;
            color = wall.getPixel(pixelX, pixelY);
        }

        let wallShade = 1;
        if(map.wallLightVec){
            wallShade = map.wallLightVec.dot(hitNorm) * -0.5 + 0.5;
        }
        let darkShade = map.wallDarkShade || 0;
        let lightShade = map.wallLightShade || 1;

        let r = (color >> 24) & 0xFF;
        let g = (color >> 16) & 0xFF;
        let b = (color >> 8) & 0xFF;

        let portal = map.portals[posX + " " + posY];
        if(portal && portal.normal.equals(hitNorm)){
            let pixelX = portal.sprite.spriteSize * wallX;
            let pixelY = portal.sprite.spriteSize * wallY;
            pixelX -= pixelX % 1;
            pixelY -= pixelY % 1;
            let portalColor = portal.sprite.getPixel(pixelX, pixelY);
            if(portalColor != portal.maskColor){
                let portalR = (portalColor >> 24) & 0xFF;
                let portalG = (portalColor >> 16) & 0xFF;
                let portalB = (portalColor >> 8) & 0xFF;
                let portalA = (portalColor & 0xFF) / 255;
                
                let modPortalA = -0.56 / (portalA - 1.4) - 0.4;
                portalA = portalA + (modPortalA - portalA) * (Math.cos(Date.now() / 1000 * 2 * Math.PI) + 1) / 2;

                r = portalR * portalA + r * (1 - portalA);
                g = portalG * portalA + g * (1 - portalA);
                b = portalB * portalA + b * (1 - portalA);

                r -= r % 1;
                g -= g % 1;
                b -= b % 1;
            }else if(portal.linkedPortal){
                drawMapPixel(image, x, y, width, height, map, renderHeight, fov, hitQueue, queueNum + 1);
                return;
            }
        }

        r *= (darkShade + (lightShade - darkShade) * wallShade);
        g *= (darkShade + (lightShade - darkShade) * wallShade);
        b *= (darkShade + (lightShade - darkShade) * wallShade);

        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
        if(fogNum > 1) fogNum = 1;
        if(fogNum < 0) fogNum = 0;

        image[(y * width + x) * 4] = r * (1 - fogNum) + ((fogColor >> 24) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((fogColor >> 16) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((fogColor >> 8) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 3] = 255;
    }else if(y > height / 2){
        let dist = (width * renderHeight - 1) / (y - height / 2);
        let floorPos = camPos.add(dir.multiply(dist / camForward.dot(dir)));
        let floorX = floorPos.x % 1;
        let floorY = floorPos.y % 1;
        let floorXRow = map.floors[floorPos.x - floorX];
        let floor = null;

        if(floorXRow){
            let floorNum = floorXRow[floorPos.y - floorY]
            if(floorNum){
                floor = map["floor" + floorNum]
            }
        }

        let color = 0

        if(!floor){
            if(map.skybox){
                if(typeof(map.skybox) == "number"){
                    color = map.skybox;
                }else if(map.skybox instanceof CanvasImage){
                    color = getSkyboxPixel(map, x, y, width, height, fov, ang);
                }
            }
        }else if(typeof(floor) == "number"){
            color = floor;
        }else if(typeof(floor) == "function"){
            color = floor(floorX, floorY);
        }else if(floor instanceof Sprite){
            let pixelX = floor.spriteSize * floorX;
            let pixelY = floor.spriteSize * floorY;
            pixelX -= pixelX % 1;
            pixelY -= pixelY % 1;
            color = floor.getPixel(pixelX, pixelY);
        }

        let r = ((color >> 24) & 0xFF);
        let g = ((color >> 16) & 0xFF);
        let b = ((color >> 8) & 0xFF);

        if(floor){
            r *= (map.floorShade || 1);
            g *= (map.floorShade || 1);
            b *= (map.floorShade || 1);
        }

        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
        if(fogNum > 1) fogNum = 1;
        if(fogNum < 0) fogNum = 0;

        image[(y * width + x) * 4] = r * (1 - fogNum) + ((fogColor >> 24) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((fogColor >> 16) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((fogColor >> 8) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 3] = 255;
    }else{
        let dist = width * (1 - renderHeight) / (height / 2 - y);
        let ceilPos = camPos.add(dir.multiply(dist / camForward.dot(dir)));
        let ceilX = ceilPos.x % 1;
        let ceilY = ceilPos.y % 1;
        let ceilXRow = map.ceils[ceilPos.x - ceilX];
        let ceil = null;
        
        if(ceilXRow){
            let ceilNum = ceilXRow[ceilPos.y - ceilY];
            if(ceilNum){
                ceil = map["ceil" + ceilNum]
            }
        }

        let color = 0

        if(!ceil){
            if(map.skybox){
                if(typeof(map.skybox) == "number"){
                    color = map.skybox;
                }else if(map.skybox instanceof CanvasImage){
                    color = getSkyboxPixel(map, x, y, width, height, fov, ang);
                }
            }
        }else if(typeof(ceil) == "number"){
            color = ceil;
        }else if(typeof(ceil) == "function"){
            color = ceil(ceilX, ceilY);
        }else if(ceil instanceof Sprite){
            let pixelX = ceil.spriteSize * ceilX;
            let pixelY = ceil.spriteSize * ceilY;
            pixelX -= pixelX % 1;
            pixelY -= pixelY % 1;
            color = ceil.getPixel(pixelX, pixelY);
        }

        let r = ((color >> 24) & 0xFF);
        let g = ((color >> 16) & 0xFF);
        let b = ((color >> 8) & 0xFF);

        if(ceil){
            r *= (map.ceilShade || 1);
            g *= (map.ceilShade || 1);
            b *= (map.ceilShade || 1);
        }

        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
        if(fogNum > 1) fogNum = 1;
        if(fogNum < 0) fogNum = 0;

        image[(y * width + x) * 4] = r * (1 - fogNum) + ((fogColor >> 24) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((fogColor >> 16) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((fogColor >> 8) & 0xFF) * fogNum;
        image[(y * width + x) * 4 + 3] = 255;
    }
}

export class Screen{
       static render(context, camera, map, fov, renderHeight){
        let width = context.canvas.width;
        let height = context.canvas.height;

        let data = context.createImageData(width, height);
        let image = data.data;

        for(let x = 0; x < width; x++){
            let posX = camera.pos.x - camera.pos.x % 1;
            let posY = camera.pos.y - camera.pos.y % 1;
            let curPos = camera.pos;
            let dir = camera.forward.rotate(fov * x / width - fov / 2);
            let hitNorm = null;
            let hitRight = null;
            let camPos = camera.pos;
            let camForward = camera.forward;
            let hitQueue = [];

            while(map.walls[posX][posY] == 0 && camPos.subtract(curPos).length() * camForward.dot(dir) < map.fogFar){
                let stepX = 0;
                let stepY = 0;
                let nextX = null;
                let nextY = null;

                if(dir.x > 0){
                    stepX = 1;
                    nextX = dir.multiply((posX + 1 - curPos.x) / dir.x);
                }else{
                    stepX = -1;
                    nextX = dir.multiply((posX - curPos.x) / dir.x);
                }

                if(dir.y > 0){
                    stepY = 1;
                    nextY = dir.multiply((posY + 1 - curPos.y) / dir.y);
                }else{
                    stepY = -1;
                    nextY = dir.multiply((posY - curPos.y) / dir.y);
                }

                if(nextX.length() < nextY.length()){
                    curPos = curPos.add(nextX);
                    posX += stepX;
                    hitNorm = new Vector2(1, 0).multiply(-stepX);
                }else{
                    curPos = curPos.add(nextY);
                    posY += stepY;
                    hitNorm = new Vector2(0, 1).multiply(-stepY);

                }

                hitRight = new Vector2(hitNorm.y, -hitNorm.x);

                let portal = map.portals[posX + " " + posY];
                if(map.walls[posX][posY] != 0 && portal && portal.linkedPortal){
                    hitQueue[hitQueue.length] = {
                        posX: posX,
                        posY: posY,
                        curPos: curPos,
                        dir: dir,
                        hitNorm: hitNorm,
                        hitRight: hitRight,
                        camPos: camPos,
                        camForward: camForward
                    }

                    let linkedPortal = portal.linkedPortal;
                    let portalPos = new Vector2(portal.posX, portal.posY);
                    if(portal.normal.x == 0){
                        portalPos.x += 0.5;
                        if(portal.normal.y > 0){
                            portalPos.y += 1;
                        }
                    }else{
                        portalPos.y += 0.5;
                        if(portal.normal.x > 0){
                            portalPos.x += 1;
                        }
                    }

                    posX = linkedPortal.posX + linkedPortal.normal.x;
                    posY = linkedPortal.posY + linkedPortal.normal.y;

                    let linkedPortalPos = new Vector2(posX, posY);
                    if(linkedPortal.normal.x == 0){
                        linkedPortalPos.x += 0.5;
                        if(linkedPortal.normal.y < 0){
                            linkedPortalPos.y += 1;
                        }
                    }else{
                        linkedPortalPos.y += 0.5;
                        if(linkedPortal.normal.x < 0){
                            linkedPortalPos.x += 1;
                        }
                    }

                    curPos = Vector2.localToLocal(portal.normal, linkedPortal.normal.multiply(-1), curPos.subtract(portalPos));
                    curPos = curPos.add(linkedPortalPos);
                    dir = Vector2.localToLocal(portal.normal, linkedPortal.normal.multiply(-1), dir);
                    camPos = Vector2.localToLocal(portal.normal, linkedPortal.normal.multiply(-1), camPos.subtract(portalPos));
                    camPos = camPos.add(linkedPortalPos);
                    camForward = Vector2.localToLocal(portal.normal, linkedPortal.normal.multiply(-1), camForward);
                }
            }

            hitQueue[hitQueue.length] = {
                posX: posX,
                posY: posY,
                curPos: curPos,
                dir: dir,
                hitNorm: hitNorm,
                hitRight: hitRight,
                camPos: camPos,
                camForward: camForward
            }

            for(let y = 0; y < height; y++){
                drawMapPixel(image, x, y, width, height, map, renderHeight, fov, hitQueue, 0);
            }
        }

        context.putImageData(data, 0, 0);
    }
}