import { Vector2 } from "./vector2.js";

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

        let xCollPos = this.pos.add(new Vector2(moveVec.x / Math.abs(moveVec.x) * Camera.COLLISION_HULL + moveVec.x, 0));
        if(map.walls[xCollPos.x - xCollPos.x % 1][xCollPos.y - xCollPos.y % 1] == 0){
            this.pos.x += moveVec.x;
        }else{
            if(moveVec.x > 0){
                this.pos.x = this.pos.x - this.pos.x % 1 + 1 - Camera.COLLISION_HULL;
            }else{
                this.pos.x = this.pos.x - this.pos.x % 1 + Camera.COLLISION_HULL;
            }
        }

        let yCollPos = this.pos.add(new Vector2(0, moveVec.y / Math.abs(moveVec.y) * Camera.COLLISION_HULL + moveVec.y));
        if(map.walls[yCollPos.x - yCollPos.x % 1][yCollPos.y - yCollPos.y % 1] == 0){
            this.pos.y += moveVec.y;
        }else{
            if(moveVec.y > 0){
                this.pos.y = this.pos.y - this.pos.y % 1 + 1 - Camera.COLLISION_HULL;
            }else{
                this.pos.y = this.pos.y - this.pos.y % 1 + Camera.COLLISION_HULL;
            }
        }
    }
}