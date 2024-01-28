#define NUM_TEXTURES 14
#define NUM_PORTALS 16
#define MAX_STEPS 64
#define MAX_PORTAL_RENDERS 16
#define SHIFT_AMOUNT 4.0 //Algorithm acts wonky around values <= 3.0ish, for some reason. Shifting fixes these problems.

precision highp float;
precision highp int;
uniform vec2 screenSize;
uniform float pTime;
uniform float fov;
uniform float renderHeight;
uniform int mapWidth;
uniform int mapLength;
uniform sampler2D map;
uniform sampler2D skybox;
uniform sampler2D textures[NUM_TEXTURES];
uniform vec2 cameraPos;
uniform vec2 cameraDir;
uniform float fogNear;
uniform float fogFar;
uniform vec3 floorShade;
uniform vec3 ceilShade;
uniform vec2 wallLightVec;
uniform vec3 wallShadeDark;
uniform vec3 wallShadeLight;

struct Portal{
    vec2 pos;
    vec2 normal;
    vec2 outPos;
    vec2 outNormal;
    vec4 maskColor;
    int texture;
};

uniform Portal portals[NUM_PORTALS];

vec2 rotate(vec2 vec, float ang){
    return vec2(cos(ang) * vec.x - sin(ang) * vec.y, sin(ang) * vec.x + cos(ang) * vec.y);
}

vec4 getColor(int index, vec2 uv){
    vec4 color = vec4(0.0);
    for(int i = 0; i < NUM_TEXTURES; i++){
        if(i == index){
            color = texture2D(textures[i], uv);
            break;
        }
    }
    return color;
}

vec2 portalTranslate(Portal portal, vec2 posOrDir, bool shift){
    vec2 portalRight = vec2(portal.normal.y, -portal.normal.x);
    vec2 portalOutRight = vec2(portal.outNormal.y, -portal.outNormal.x);
    vec2 resultVec = posOrDir;
    if(shift){
        resultVec -= portal.pos + SHIFT_AMOUNT;
    }
    resultVec = vec2(dot(resultVec, portal.normal), dot(resultVec, portalRight));
    resultVec = -(portal.outNormal * resultVec.x + portalOutRight * resultVec.y);
    if(shift){
        resultVec += portal.outPos + portal.outNormal + SHIFT_AMOUNT;
        float normDot = dot(portal.normal, portal.outNormal);
        if(normDot == 0.0){
            resultVec += abs(portal.outNormal);
        }else if(normDot > 0.0){
            resultVec += 1.0;
        }
    }
    return resultVec;
}

void main(){
    vec2 uv = gl_FragCoord.xy / screenSize;
    vec2 mapSize = vec2(mapWidth, mapLength);
    vec2 shiftCamPos = cameraPos + SHIFT_AMOUNT;
    vec2 curPos = shiftCamPos;
    vec2 curForward = cameraDir;
    vec2 curDir = rotate(curForward, (uv.x - 0.5) * fov);
    vec3 color = vec3(0.0);

    for(int p = 0; p < MAX_PORTAL_RENDERS; p++){
        vec2 mapPos;
        bool wall = false;
        bool portalHit = false;
        int stepX = 0;
        int stepY = 0;
        vec2 hitNorm;
        float dist;
        vec3 skyBoxColor;

            if(uv.y < 0.5){
                dist = screenSize.x / screenSize.y * renderHeight / (0.5 - uv.y) / dot(curForward, curDir);
            }else{
                dist = screenSize.x / screenSize.y * (1.0 - renderHeight) / (uv.y - 0.5) / dot(curForward, curDir);
            }

        if(curDir.x != 0.0){
            if(curDir.x > 0.0){
                stepX = 1;
            }else{
                stepX = -1;
            }
        }
        if(curDir.y != 0.0){
            if(curDir.y > 0.0){
                stepY = 1;
            }else{
                stepY = -1;
            }
        }

        for(int i = 0; i < MAX_STEPS; i++){
            vec2 nextGrid = floor(curPos);
            if(stepX > 0){
                nextGrid.x += 1.0;
            }else if(mod(curPos.x, 1.0) == 0.0){
                nextGrid.x -= 1.0;
            }
            if(stepY > 0){
                nextGrid.y += 1.0;
            }else if(mod(curPos.y, 1.0) == 0.0){
                nextGrid.y -= 1.0;
            }
            
            vec2 nextX = curPos + curDir * (nextGrid.x - curPos.x) / curDir.x;
            vec2 nextY = curPos + curDir * (nextGrid.y - curPos.y) / curDir.y;

            if(length(nextY - curPos) < length(nextX - curPos)){
                curPos = nextY;
                mapPos = floor(curPos);
                if(stepY < 0){
                    mapPos.y -= 1.0;
                }
                hitNorm = vec2(0.0, -stepY);
            }else{
                curPos = nextX;
                mapPos = floor(curPos);
                if(stepX < 0){
                    mapPos.x -= 1.0;
                }
                hitNorm = vec2(-stepX, 0.0);
            }

            if(length(curPos - shiftCamPos) > dist || length(curPos - shiftCamPos) > fogFar){
                break;
            }

            if(texture2D(map, (mapPos - SHIFT_AMOUNT) / mapSize).r > 0.003){
                dist = length(curPos - shiftCamPos) * dot(curForward, curDir);
                wall = true;
                break;
            }
        }

        vec2 hitRight = vec2(hitNorm.y, -hitNorm.x);
        float wallHeight = screenSize.x / dist / screenSize.y;
        float wallStart = 0.5 - wallHeight * renderHeight;
        if(true){
            vec2 skyUV = uv;
            skyUV.x = mod(atan(curDir.y, curDir.x) / 6.283185307179586476925286766559, 1.0);
            skyBoxColor = texture2D(skybox, skyUV).rgb;
        }

        if(wall){
            int wallNum = int(texture2D(map, (mapPos - SHIFT_AMOUNT) / mapSize).r * 255.0) - 1;
            vec2 texUV = vec2(mod(dot(hitRight, curPos), 1.0), (uv.y - wallStart) / wallHeight);
            float shadeNum = (dot(hitNorm, wallLightVec) + 1.0) / 2.0;
            vec3 wallShade = wallShadeDark + (wallShadeLight - wallShadeDark) * shadeNum;
            color = getColor(wallNum, texUV).rgb * wallShade;
            for(int i = 0; i < NUM_PORTALS; i++){
                Portal portal = portals[i];
                if(portal.pos == floor(mapPos - SHIFT_AMOUNT) && portal.normal == hitNorm){
                    vec4 portalColor = getColor(portal.texture, texUV);
                    if(length(portalColor - portal.maskColor) < 0.0039215691){ //Tolerances are inconsistent between browsers. Expect colors one value off on one channel to count towards mask.
                        curPos = portalTranslate(portal, curPos, true);
                        shiftCamPos = portalTranslate(portal, shiftCamPos, true);
                        curForward = portalTranslate(portal, curForward, false);
                        curDir = portalTranslate(portal, curDir, false);
                        portalHit = true;
                    }else{
                        float portalA = portalColor.a;
                        float modPortalA = -0.56 / (portalA - 1.4) - 0.4;
                        portalA = portalA + (modPortalA - portalA) * (cos(pTime * 6.283185307179586476925286766559) + 1.0) / 2.0;
                        color = color + (portalColor.rgb - color) * portalA;
                    }
                }
            }
        }else if(uv.y < 0.5){
            float dist = screenSize.x / screenSize.y * renderHeight / (0.5 - uv.y) / dot(curForward, curDir);
            vec2 floorPos = shiftCamPos + curDir * dist;
            if(texture2D(map, floor(floorPos - SHIFT_AMOUNT) / mapSize).g == 0.0){
                color = skyBoxColor;
            }else{
                int floorNum = int(texture2D(map, (floorPos - SHIFT_AMOUNT) / mapSize).g * 255.0) - 1;
                color = getColor(floorNum, mod(floorPos, 1.0)).rgb * floorShade;
            }
        }else if(uv.y >= 0.5){
            float dist = screenSize.x / screenSize.y * (1.0 - renderHeight) / (uv.y - 0.5) / dot(curForward, curDir);
            vec2 ceilPos = shiftCamPos + curDir * dist;
            if(texture2D(map, floor(ceilPos - SHIFT_AMOUNT) / mapSize).b == 0.0){
                color = skyBoxColor;
            }else{
                int ceilNum = int(texture2D(map, (ceilPos - SHIFT_AMOUNT) / mapSize).b * 255.0) - 1;
                color = getColor(ceilNum, mod(ceilPos, 1.0)).rgb * ceilShade;
            }
        }

        if(color != skyBoxColor){
            float fogNum = (dist - fogNear) / (fogFar - fogNear);
            if(fogNum > 1.0) fogNum = 1.0;
            if(fogNum < 0.0) fogNum = 0.0;
            color = color + (skyBoxColor - color) * fogNum;
        }

        if(!portalHit) break;
    }

    gl_FragColor = vec4(color, 1.0);
}