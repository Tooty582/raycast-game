

function cb(e){
    if(e) console.log(e);
}

export class Input{
    static defaultMapping = {
        KeyA: "left",
        KeyD: "right",
        KeyW: "forward",
        KeyS: "back",
        AltLeft: "walk",
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

    constructor(mapping, touchControls){
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
        this.touchControls = touchControls;
        this.touchList = {};
        this.touchEnabled = false;

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
                if(e.button == 0){
                    document.body.requestPointerLock({unadjustedMovement: true});
                    if(document.fullscreenEnabled && !document.fullscreenElement){
                        document.body.requestFullscreen();
                    }
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
        });

        addEventListener("mouseup", (e) =>{
            if(e.button == 0){
                this.mouseButtons.LClick = false;
            }else if(e.button == 1){
                this.mouseButtons.MClick = false;
            }else if(e.button == 2){
                this.mouseButtons.RClick = false;
            }
        });

        addEventListener("gamepadconnected", (e) => {
            if(e.gamepad.mapping == "standard"){
                this.gamepad = e.gamepad.index;
            }
        });

        addEventListener("gamepaddisconnected", (e) => {
            if(this.gamepad == e.gamepad.index){
                this.gamepad = null;
            }
        });

        addEventListener("fullscreenchange", (e) => {
            if(document.fullscreenElement){
                screen.orientation.lock("landscape").then(cb, cb);
            }else{
                screen.orientation.unlock();
            }
        });

        addEventListener("touchstart", (e) => {
            this.touchEnabled = true;
            if(document.fullscreenEnabled && !document.fullscreenElement){
                document.body.requestFullscreen();
            }else{
                for(let i = 0; i < e.changedTouches.length; i++){
                    let touch = e.changedTouches[i];
                    this.touchList[touch.identifier] = {
                        x: touch.clientX,
                        y: touch.clientY,
                        startX: touch.clientX,
                        startY: touch.clientY
                    };
                }
            }
        });

        addEventListener("touchmove", (e) => {
            for(let i = 0; i < e.changedTouches.length; i++){
                let touch = e.changedTouches[i];
                if(this.touchList[touch.identifier]){
                    this.touchList[touch.identifier].x = touch.clientX;
                    this.touchList[touch.identifier].y = touch.clientY;
                }
            }
        });

        addEventListener("touchend", (e) => {
            for(let i = 0; i < e.changedTouches.length; i++){
                let touch = e.changedTouches[i];
                delete this.touchList[touch.identifier];
            }
        });
    }

    update(){
        this.left = 0;
        this.right = 0;
        this.forward = 0;
        this.back = 0;
        this.walk = 0;
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

        for(let i = 0; i < this.touchControls.buttons.length; i++){
            let button = this.touchControls.buttons[i];
            if(button.touchID){
                if(!this.touchList[button.touchID]){
                    button.touchID = null;
                }else{
                    this[button.input] = 1;
                }
            }else{
                for(let [id, touch] of Object.entries(this.touchList)){
                    if(!touch.control && button.pressed(touch.startX, touch.startY)){
                        button.touchID = id;
                        this[button.input] = 1;
                        touch.control = button;
                    }
                }
            }
        }

        for(let i = 0; i < this.touchControls.trackFields.length; i++){
            let trackField = this.touchControls.trackFields[i];
            if(trackField.touchID){
                let touch = this.touchList[trackField.touchID]
                if(!touch){
                    trackField.touchID = null;
                }else{
                    let xDiff = touch.x - trackField.lastX;
                    let yDiff = touch.y - trackField.lastY;
                    trackField.lastX = touch.x;
                    trackField.lastY = touch.y;

                    if(xDiff >= 0){
                        if(trackField.posXInput){
                            this[trackField.posXInput] = Math.max(this[trackField.posXInput], xDiff * (trackField.posXScale || 1));
                        }
                    }else{
                        if(trackField.negXInput){
                            this[trackField.negXInput] = Math.max(this[trackField.negXInput], -xDiff * (trackField.negXScale || 1));
                        }
                    }

                    if(yDiff >= 0){
                        if(trackField.posYInput){
                            this[trackField.posYInput] = Math.max(this[trackField.posYInput], yDiff * (trackField.posYScale || 1));
                        }
                    }else{
                        if(trackField.negYInput){
                            this[trackField.negYInput] = Math.max(this[trackField.negYInput], -yDiff * (trackField.negYScale || 1));
                        }
                    }
                }
            }else{
                for(let [id, touch] of Object.entries(this.touchList)){
                    if(!touch.control && trackField.pressed(touch.startX, touch.startY)){
                        trackField.touchID = id;
                        trackField.lastX = touch.startX;
                        trackField.lastY = touch.startY;
                        touch.control = trackField;
                    }
                }
            }
        }
    }
}