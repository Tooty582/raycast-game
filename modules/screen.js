import { Vector2 } from "./vector2.js";
import {Sprite} from "./sprite.js";

export class Screen{
    static modulus(n, m){
        return (n % m + m) % m
    }

    static render(context, camera, map, fov, renderHeight){
        if(context instanceof CanvasRenderingContext2D){
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

                while(map.walls[posX][posY] == 0 && camera.pos.subtract(curPos).length() * camera.forward.dot(dir) < map.fogFar){
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
                }
                let dist = curPos.subtract(camera.pos).length();
                dist = dist * camera.forward.dot(dir);

                let wallHeight = width / dist;
                let start = height / 2 - wallHeight * (1 - renderHeight);
                let wall = map["wall" + map.walls[posX][posY]];

                for(let y = 0; y < height; y++){
                    if(y >= start && y < start + wallHeight){
                        let wallY = (y - start) / wallHeight;
                        let wallX = Screen.modulus(curPos.dot(hitRight), 1);
                        
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

                        let r = ((color >> 24) & 0xFF);
                        let g = ((color >> 16) & 0xFF);
                        let b = ((color >> 8) & 0xFF);

                        r *= (darkShade + (lightShade - darkShade) * wallShade);
                        g *= (darkShade + (lightShade - darkShade) * wallShade);
                        b *= (darkShade + (lightShade - darkShade) * wallShade);

                        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
                        if(fogNum > 1) fogNum = 1;
                        if(fogNum < 0) fogNum = 0;

                        image[(y * width + x) * 4] = r * (1 - fogNum) + ((map.fogColor >> 24) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((map.fogColor >> 16) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((map.fogColor >> 8) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 3] = 255;
                    }else if(y > height / 2){
                        let dist = (width * renderHeight - 1) / (y - height / 2);
                        let floorPos = camera.pos.add(dir.multiply(dist / camera.forward.dot(dir)));
                        let floorX = floorPos.x % 1;
                        let floorY = floorPos.y % 1;
                        let floor = map["floor" + map.floors[floorPos.x - floorX][floorPos.y - floorY]]

                        let color = 0

                        if(typeof(floor) == "number"){
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

                        r *= (map.floorShade || 1);
                        g *= (map.floorShade || 1);
                        b *= (map.floorShade || 1);

                        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
                        if(fogNum > 1) fogNum = 1;
                        if(fogNum < 0) fogNum = 0;

                        image[(y * width + x) * 4] = r * (1 - fogNum) + ((map.fogColor >> 24) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((map.fogColor >> 16) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((map.fogColor >> 8) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 3] = 255;
                    }else{
                        let dist = width * (1 - renderHeight) / (height / 2 - y);
                        let ceilPos = camera.pos.add(dir.multiply(dist / camera.forward.dot(dir)));
                        let ceilX = ceilPos.x % 1;
                        let ceilY = ceilPos.y % 1;
                        let ceil = map["ceil" + map.ceils[ceilPos.x - ceilX][ceilPos.y - ceilY]]

                        let color = 0

                        if(typeof(ceil) == "number"){
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

                        r *= (map.ceilShade || 1);
                        g *= (map.ceilShade || 1);
                        b *= (map.ceilShade || 1);

                        let fogNum = (dist - map.fogNear) / (map.fogFar - map.fogNear);
                        if(fogNum > 1) fogNum = 1;
                        if(fogNum < 0) fogNum = 0;

                        image[(y * width + x) * 4] = r * (1 - fogNum) + ((map.fogColor >> 24) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 1] = g * (1 - fogNum) + ((map.fogColor >> 16) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 2] = b * (1 - fogNum) + ((map.fogColor >> 8) & 0xFF) * fogNum;
                        image[(y * width + x) * 4 + 3] = 255;
                    }
                }
            }

            context.putImageData(data, 0, 0);
        }
    }
}