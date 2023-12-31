import { Vector2 } from "./vector2.js";

function mapCollision(map, nextPos){
    let remX = nextPos.x % 1;
    let remY = nextPos.y % 1;
    let mapX = nextPos.x - remX;
    let mapY = nextPos.y - remY;
    let returnPos = nextPos.clone();

    let xDir = 0;
    let yDir = 0;
    if(remX < Camera.COLLISION_HULL){
        xDir = -1;
    }else if(1 - remX < Camera.COLLISION_HULL){
        xDir = 1;
    }

    if(remY < Camera.COLLISION_HULL){
        yDir = -1;
    }else if(1 - remY < Camera.COLLISION_HULL){
        yDir = 1;
    }

    let xHit = false;
    if(xDir != 0 && map.walls[mapX + xDir][mapY] != 0){
        if(xDir < 0){
            returnPos.x = mapX + Camera.COLLISION_HULL;
        }else{
            returnPos.x = mapX + 1 - Camera.COLLISION_HULL;
        }

        xHit = true;
    }

    let yHit = false;
    if(yDir != 0 && map.walls[mapX][mapY + yDir] != 0){
        if(yDir < 0){
            returnPos.y = mapY + Camera.COLLISION_HULL;
        }else{
            returnPos.y = mapY + 1 - Camera.COLLISION_HULL;
        }

        yHit = true;
    }

    if(!xHit && !yHit && xDir != 0 && yDir != 0 && map.walls[mapX + xDir][mapY + yDir] != 0){
        let xDist = remX;
        if(xDir > 0){
            xDist = 1 - remX;
        }

        let yDist = remY;
        if(yDir > 0){
            yDist = 1 - remY;
        }

        if(xDist > yDist){
            if(xDir < 0){
                returnPos.x = mapX + Camera.COLLISION_HULL;
            }else{
                returnPos.x = mapX + 1 - Camera.COLLISION_HULL;
            }
        }else{
            if(yDir < 0){
                returnPos.y = mapY + Camera.COLLISION_HULL;
            }else{
                returnPos.y = mapY + 1 - Camera.COLLISION_HULL;
            }
        }
    }

    return returnPos;
}

export class Camera{
    static MOVE_SPEED = 0.1;
    static ROTATION_ANG = 0.05;
    static MOUSE_ROTATION_ANG = 0.003;
    static COLLISION_HULL = 0.15;

    constructor(pos, dir, input){
        this.pos = pos;
        this.forward = dir;
        this.right = new Vector2(this.forward.y, -this.forward.x);
        this.input = input;
    }

    update(map){
        if(this.input.turnLeft && !this.input.turnRight){
            this.forward = this.forward.rotate(-this.input.turnLeft * Camera.ROTATION_ANG);
            this.right = new Vector2(-this.forward.y, this.forward.x);
        }

        if(this.input.turnRight && !this.input.turnLeft){
            this.forward = this.forward.rotate(this.input.turnRight * Camera.ROTATION_ANG);
            this.right = new Vector2(-this.forward.y, this.forward.x);
        }

        if(this.input.turnNum && this.input.turnNum != 0){
            this.forward = this.forward.rotate(this.input.turnNum * Camera.MOUSE_ROTATION_ANG);
            this.right = new Vector2(-this.forward.y, this.forward.x);
            this.input.turnNum = 0;
        }

        let moveVec = new Vector2(0, 0);
        if(this.input.forward && !this.input.back){
            moveVec = moveVec.add(this.forward.multiply(this.input.forward));
        }

        if(this.input.back && !this.input.forward){
            moveVec = moveVec.add(this.forward.multiply(-this.input.back));
        }

        if(this.input.left && !this.input.right){
            moveVec = moveVec.add(this.right.multiply(-this.input.left));
        }

        if(this.input.right && !this.input.left){
            moveVec = moveVec.add(this.right.multiply(this.input.right));
        }

        if(moveVec.length() > 1){
            moveVec = moveVec.normalize();
        }
        moveVec = moveVec.multiply(Camera.MOVE_SPEED);

        this.pos = mapCollision(map, this.pos.add(moveVec));
    }
}