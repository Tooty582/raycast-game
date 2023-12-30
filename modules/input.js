export class Input{
    static defaultMapping = {
        KeyA: "left",
        KeyD: "right",
        KeyW: "forward",
        KeyS: "back",
        ArrowLeft: "turnLeft",
        ArrowRight: "turnRight",
        LeftStickNegX: "left",
        LeftStickPosX: "right",
        LeftStickPosY: "back",
        LeftStickNegY: "forward",
        RightStickNegX: "turnLeft",
        RightStickPosX: "turnRight"
    };

    constructor(mapping){
        this.mapping = mapping || Object.assign({}, Input.defaultMapping);
        this.turnNum = 0;

        addEventListener("keydown", (e) => {
            if(this.mapping[e.code]){
                this[this.mapping[e.code]] = 1;
            }
        });

        addEventListener("keyup", (e) => {
            if(this.mapping[e.code]){
                this[this.mapping[e.code]] = 0;
            }
        });

        addEventListener("mousemove", (e) => {
            if(document.pointerLockElement){
                this.turnNum += e.movementX;
            }
        }, true);

        addEventListener("click", (e) =>{
            if(!document.pointerLockElement){
                document.body.requestPointerLock({unadjustedMovement: true});
            }else{

            }
        })

        addEventListener("gamepadconnected", (e) => {
            if(e.gamepad.mapping == "standard"){
                this.gamepad = e.gamepad.index;
            }
        })

        addEventListener("gamepaddisconnected", (e) => {
            if(this.gamepad == e.gamepad.index){
                this.gamepad = null;
            }
        })
    }

    update(){


        if(this.gamepad != null){
            let controllerInput = {};
            let gamepad = navigator.getGamepads()[this.gamepad];

            for(let i = 0; i < gamepad.axes.length; i++){
                let val = gamepad.axes[i];
                if(Math.abs(val) < 0.1) val = 0;
                let axis = ((i % 2 == 0)) && "X" || "Y";
                let thumbstick = ((i - i % 2) / 2 == 0) && "Left" || "Right";
                let positive = (val >= 0) && "Pos" || "Neg";
                let oppositePos = (val < 0) && "Pos" || "Neg";

                controllerInput[thumbstick + "Stick" + positive + axis] = Math.abs(val);
                controllerInput[thumbstick + "Stick" + oppositePos + axis] = 0;
            }

            for(let i = 0; i < gamepad.buttons.length; i++){
                controllerInput["Button" + i] = gamepad.buttons[i].value;
            }

            for(let [k, v] of Object.entries(controllerInput)){
                if(this.mapping[k]){
                    this[this.mapping[k]] = v;
                }
            }
        }
    }
}