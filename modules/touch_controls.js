export class TouchControls{
    static defaultControls = {
        buttons: [
            {
                type: "circle",
                x: 0.86,
                y: 0.35,
                radius: 0.03,
                color: "#8080FF80",
                input: "walk"
            }
        ], joysticks: [
            {
                x: 0.07,
                y: 0.35,
                radius: 0.04,
                stickRadius: 0.03,
                color: "#8080FF80",
                stickColor: "#80808080",
                stickTravel: 0.03,
                deadZone: 0.1,
                minValue: 0,
                maxValue: 1,
                posXInput: "right",
                negXInput: "left",
                posYInput: "back",
                negYInput: "forward",
                posXScale: 1,
                negXScale: 1,
                posYScale: 1,
                negYScale: 1
            }
        ], trackFields: [
            {
                type: "rect",
                x: 0,
                y: 0,
                width: 1,
                height: 1,
                visible: false,
                posXInput: "turnRight",
                negXInput: "turnLeft",
                posXScale: 0.4,
                negXScale: 0.4
            }
        ]
    };

    constructor(controlObj){
        this.buttons = [];
        this.joysticks = [];
        this.trackFields = [];
        this.setControls(controlObj || TouchControls.defaultControls);
    }

    setControls(controlObj){
        for(let i = 0; i < controlObj.buttons.length; i++){
            this.makeButton(controlObj.buttons[i]);
        }

        for(let i = 0; i < controlObj.joysticks.length; i++){
            this.makeJoystick(controlObj.joysticks[i]);
        }

        for(let i = 0; i < controlObj.trackFields.length; i++){
            this.makeTrackField(controlObj.trackFields[i]);
        }
    }

    makeButton(buttonObj){
        let button = {};
        let xPos = buttonObj.x;
        let yPos = buttonObj.y;
        let color = buttonObj.color;
        button.input = buttonObj.input;
        if(buttonObj.type == "rect"){
            let w = buttonObj.width;
            let h = buttonObj.height;
            button.pressed = function(x, y){
                let scale = window.innerWidth;
                return x >= xPos * scale && x < xPos * scale + w * scale && y >= yPos * scale && y < yPos * scale + h * scale;
            }
            button.draw = function(context){
                let scale = window.innerWidth;
                context.fillStyle = color;
                context.fillRect(xPos * scale, yPos * scale, w * scale, h * scale);
            }
        }else if(buttonObj.type = "circle"){
            xPos += buttonObj.radius;
            yPos += buttonObj.radius;
            let r = buttonObj.radius;
            button.pressed = function(x, y){
                let scale = window.innerWidth;
                let xDiff = x - xPos * scale;
                let yDiff = y - yPos * scale;
                return xDiff**2 + yDiff**2 < (r * scale)**2;
            }
            button.draw = function(context){
                let scale = window.innerWidth;
                context.beginPath();
                context.fillStyle = color;
                context.arc(xPos * scale, yPos * scale, r * scale, 0, 2 * Math.PI);
                context.fill();
            }
        }else return;
        this.buttons[this.buttons.length] = button;
    }

    makeJoystick(joystickObj){
        let joystick = {};
        joystick.x = joystickObj.x + joystickObj.radius;
        joystick.y = joystickObj.y + joystickObj.radius;
        let r = joystickObj.radius;
        let stickR = joystickObj.stickRadius;
        let color = joystickObj.color;
        let stickColor = joystickObj.stickColor;
        joystick.stickTravel = joystickObj.stickTravel;
        joystick.deadZone = joystickObj.deadZone;
        joystick.minValue = joystickObj.minValue;
        joystick.maxValue = joystickObj.maxValue;
        joystick.posXInput = joystickObj.posXInput;
        joystick.negXInput = joystickObj.negXInput;
        joystick.posYInput = joystickObj.posYInput;
        joystick.negYInput = joystickObj.negYInput;
        joystick.posXScale = joystickObj.posXScale;
        joystick.negXScale = joystickObj.negXScale;
        joystick.posYScale = joystickObj.posYScale;
        joystick.negYScale = joystickObj.negYScale;
        joystick.pressed = function(x, y){
            let scale = window.innerWidth;
            let xDiff = x - joystick.x * scale;
            let yDiff = y - joystick.y * scale;
            return xDiff**2 + yDiff**2 < (stickR * scale)**2;
        }
        joystick.draw = function(context){
            let scale = window.innerWidth;
            let scaledX = joystick.x * scale;
            let scaledY = joystick.y * scale;
            context.beginPath();
            context.fillStyle = color;
            context.arc(scaledX, scaledY, r * scale, 0, 2 * Math.PI);
            context.fill();
            context.beginPath();
            context.fillStyle = stickColor;
            context.arc(joystick.touchX || scaledX, joystick.touchY || scaledY, stickR * scale, 0, 2 * Math.PI);
            context.fill();
        }
        this.joysticks[this.joysticks.length] = joystick;
    }

    makeTrackField(trackObj){
        let trackField = {};
        let xPos = trackObj.x;
        let yPos = trackObj.y;
        let color = trackObj.color;
        let visible = trackObj.visible;
        trackField.posXInput = trackObj.posXInput;
        trackField.negXInput = trackObj.negXInput;
        trackField.posYInput = trackObj.posYInput;
        trackField.negYInput = trackObj.negYInput;
        trackField.posXScale = trackObj.posXScale;
        trackField.negXScale = trackObj.negXScale;
        trackField.posYScale = trackObj.posYScale;
        trackField.negYScale = trackObj.negYScale;
        if(trackObj.type == "rect"){
            let w = trackObj.width;
            let h = trackObj.height;
            trackField.pressed = function(x, y){
                let scale = window.innerWidth;
                return x >= xPos * scale && x < xPos * scale + w * scale && y >= yPos * scale && y < yPos * scale + h * scale;
            }
            trackField.draw = function(context){
                if(visible && color){
                    let scale = window.innerWidth;
                    context.fillStyle = color;
                    context.fillRect(xPos * scale, yPos * scale, w * scale, h * scale);
                }
            }
        }else if(trackObj.type = "circle"){
            xPos += trackObj.radius;
            yPos += trackObj.radius;
            let r = trackObj.radius;
            trackField.pressed = function(x, y){
                let scale = window.innerWidth;
                let xDiff = x - xPos * scale;
                let yDiff = y - yPos * scale;
                return xDiff**2 + yDiff**2 < (r * scale)**2;
            }
            trackField.draw = function(context){
                if(visible && color){
                    let scale = window.innerWidth;
                    context.beginPath();
                    context.fillStyle = color;
                    context.arc(xPos * scale, yPos * scale, r * scale, 0, 2 * Math.PI);
                    context.fill();
                }
            }
        }else return;
        this.trackFields[this.trackFields.length] = trackField;
    }

    render(context){
        for(let i = this.trackFields.length - 1; i >= 0; i--){
            this.trackFields[i].draw(context);
        }

        for(let i = this.joysticks.length - 1; i >= 0; i--){
            this.joysticks[i].draw(context);
        }

        for(let i = this.buttons.length - 1; i >= 0; i--){
            this.buttons[i].draw(context);
        }
    }
}