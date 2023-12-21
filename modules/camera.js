import { Vector2 } from "./vector2.js";
export class Camera{
    static MOVE_SPEED = 0.1;
    static ROTATION_ANG = 0.05;
    static COLLISION_HULL = 0.15;

    constructor(pos, dir, input){
        this.pos = pos;
        this.forward = dir;
        this.right = new Vector2(this.forward.y, -this.forward.x);
        this.input = input;

        addEventListener("mousemove", (e) => {
            if(document.pointerLockElement){
                this.forward = this.forward.rotate(e.movementX * 0.003);
                this.right = new Vector2(this.forward.y, -this.forward.x);
            }
        }, true);
    }

    update(map){
        if(this.input.turnLeft && !this.input.turnRight){
            this.forward = this.forward.rotate(-Camera.ROTATION_ANG);
            this.right = new Vector2(this.forward.y, -this.forward.x);
        }

        if(this.input.turnRight && !this.input.turnLeft){
            this.forward = this.forward.rotate(Camera.ROTATION_ANG);
            this.right = new Vector2(this.forward.y, -this.forward.x);
        }

        if(this.input.forward && !this.input.back){
            let nextPos = this.pos.add(this.forward.multiply(Camera.MOVE_SPEED));
            let collPos = nextPos.add(this.forward.multiply(Camera.COLLISION_HULL));
            if(map.walls[collPos.x - collPos.x % 1][this.pos.y - this.pos.y % 1] == 0){
                this.pos.x = nextPos.x;
            }
            if(map.walls[this.pos.x - this.pos.x % 1][collPos.y - collPos.y % 1] == 0){
                this.pos.y = nextPos.y;
            }
        }

        if(this.input.back && !this.input.forward){
            let nextPos = this.pos.subtract(this.forward.multiply(Camera.MOVE_SPEED));
            let collPos = nextPos.subtract(this.forward.multiply(Camera.COLLISION_HULL));
            if(map.walls[collPos.x - collPos.x % 1][this.pos.y - this.pos.y % 1] == 0){
                this.pos.x = nextPos.x;
            }
            if(map.walls[this.pos.x - this.pos.x % 1][collPos.y - collPos.y % 1] == 0){
                this.pos.y = nextPos.y;
            }
        }

        if(this.input.left && !this.input.right){
            let nextPos = this.pos.add(this.right.multiply(Camera.MOVE_SPEED));
            let collPos = nextPos.add(this.right.multiply(Camera.COLLISION_HULL));
            if(map.walls[collPos.x - collPos.x % 1][this.pos.y - this.pos.y % 1] == 0){
                this.pos.x = nextPos.x;
            }
            if(map.walls[this.pos.x - this.pos.x % 1][collPos.y - collPos.y % 1] == 0){
                this.pos.y = nextPos.y;
            }
        }

        if(this.input.right && !this.input.left){
            let nextPos = this.pos.subtract(this.right.multiply(Camera.MOVE_SPEED));
            let collPos = nextPos.subtract(this.right.multiply(Camera.COLLISION_HULL));
            if(map.walls[collPos.x - collPos.x % 1][this.pos.y - this.pos.y % 1] == 0){
                this.pos.x = nextPos.x;
            }
            if(map.walls[this.pos.x - this.pos.x % 1][collPos.y - collPos.y % 1] == 0){
                this.pos.y = nextPos.y;
            }
        }
    }
}