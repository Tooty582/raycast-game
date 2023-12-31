function cb(e){
    if(e) console.log(e);
}

export class Input{
    static defaultMapping = {
        KeyA: "left",
        KeyD: "right",
        KeyW: "forward",
        KeyS: "back",
        ArrowLeft: "turnLeft",
        ArrowRight: "turnRight",
        MouseNegX: "turnLeft",
        MousePosX: "turnRight",
        LeftStickNegX: "left",
        LeftStickPosX: "right",
        LeftStickPosY: "back",
        LeftStickNegY: "forward",
        RightStickNegX: "turnLeft",
        RightStickPosX: "turnRight"
    };

    static DEAD_ZONE = 0.1;
    static MOUSE_ROTATION_ANG = 0.06;

    constructor(mapping){
        this.mapping = mapping || Object.assign({}, Input.defaultMapping);
        this.turnNum = 0;
        this.keys = {};
        this.mouseAxes = {
            MouseNegX: 0,
            MousePosX: 0,
            MouseNegY: 0,
            MousePosY: 0
        };
        this.mouseButtons = {};

        addEventListener("keydown", (e) => {
            this.keys[e.code] = true;
        });

        addEventListener("keyup", (e) => {
            this.keys[e.code] = false;
        });

        addEventListener("mousemove", (e) => {
            if(document.pointerLockElement){
                let mouseX = e.movementX * Input.MOUSE_ROTATION_ANG;
                let mouseY = e.movementY * Input.MOUSE_ROTATION_ANG;
                let posX = (mouseX >= 0) && "Pos" || "Neg";
                let posY = (mouseY >= 0) && "Pos" || "Neg";

                mouseX = Math.abs(mouseX);
                mouseY = Math.abs(mouseY);

                this.mouseAxes["Mouse" + posX + "X"] += mouseX;
                this.mouseAxes["Mouse" + posY + "Y"] += mouseY;
            }
        }, true);

        addEventListener("mousedown", (e) =>{
            if(!document.pointerLockElement){
                document.body.requestPointerLock({unadjustedMovement: true});
                if(document.fullscreenEnabled && !document.fullscreenElement){
                    document.body.requestFullscreen();
                }
            }else{
                if(e.button == 0){
                    this.mouseButtons.LClick = true;
                }else if(e.button == 1){
                    this.mouseButtons.MClick = true;
                }else if(e.button == 2){
                    this.mouseButtons.RClick = true;
                }
            }
        })

        addEventListener("mouseup", (e) =>{
            if(e.button == 0){
                this.mouseButtons.LClick = false;
            }else if(e.button == 1){
                this.mouseButtons.MClick = false;
            }else if(e.button == 2){
                this.mouseButtons.RClick = false;
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

        addEventListener("fullscreenchange", (e) => {
            if(document.fullscreenElement){
                screen.orientation.lock("landscape").then(cb, cb);
            }else{
                screen.orientation.unlock();
            }
        })

        addEventListener("touchstart", (e) => {
            if(document.fullscreenEnabled && !document.fullscreenElement){
                document.body.requestFullscreen();
            }
        })
    }

    update(){
        this.left = 0;
        this.right = 0;
        this.forward = 0;
        this.back = 0;
        this.turnLeft = 0;
        this.turnRight = 0;

        for(let [k,v] of Object.entries(this.mouseAxes)){
            if(this.mapping[k]){
                this[this.mapping[k]] = Math.max(v, this[this.mapping[k]]);
                this.mouseAxes[k] = 0;
            }
        }

        if(this.gamepad != null){
            let controllerInput = {};
            let gamepad = navigator.getGamepads()[this.gamepad];

            for(let i = 0; i < gamepad.axes.length; i++){
                let val = gamepad.axes[i];
                if(Math.abs(val) < Input.DEAD_ZONE) val = 0;
                let axis = ((i % 2 == 0)) && "X" || "Y";
                let thumbstick = ((i - i % 2) / 2 == 0) && "Left" || "Right";
                let positive = (val >= 0) && "Pos" || "Neg";
                let oppositePos = (val < 0) && "Pos" || "Neg";

                controllerInput[thumbstick + "Stick" + positive + axis] = Math.abs(val);
                controllerInput[thumbstick + "Stick" + oppositePos + axis] = 0;
            }

            for(let i = 0; i < gamepad.buttons.length; i++){
                if(gamepad.buttons[i].value > Input.DEAD_ZONE){
                    controllerInput["Button" + i] = gamepad.buttons[i].value;
                }else{
                    controllerInput["Button" + i] = 0;
                }
            }

            for(let [k, v] of Object.entries(controllerInput)){
                if(this.mapping[k]){
                    this[this.mapping[k]] = Math.max(this[this.mapping[k]], v);
                }
            }
        }

        for(let [k,v] of Object.entries(this.keys)){
            if(this.mapping[k]){
                this[this.mapping[k]] = v && 1 || this[this.mapping[k]];
            }
        }
    }
}