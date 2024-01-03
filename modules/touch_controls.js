export class TouchControls{
    static defaultControls = {
        buttons: [
            {
                type: "rect",
                x: 0.07,
                y: 0.28,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "forward"
            },{
                type: "rect",
                x: 0.07,
                y: 0.35,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "back"
            },{
                type: "rect",
                x: 0,
                y: 0.35,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "left"
            },{
                type: "rect",
                x: 0.14,
                y: 0.35,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "right"
            }
        ], trackFields: [
            {
                type: "rect",
                x: 0,
                y: 0,
                width: 1,
                height: window.innerHeight / window.innerWidth,
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
        this.trackFields = [];
        this.setControls(controlObj || TouchControls.defaultControls);
    }

    setControls(controlObj){
        for(let i = 0; i < controlObj.buttons.length; i++){
            this.makeButton(controlObj.buttons[i]);
        }

        for(let i = 0; i < controlObj.trackFields.length; i++){
            this.makeTrackField(controlObj.trackFields[i]);
        }
    }

    makeButton(buttonObj){
        let button = {};
        if(buttonObj.type == "rect"){
            let xPos = buttonObj.x;
            let yPos = buttonObj.y;
            let w = buttonObj.width;
            let h = buttonObj.height;
            let color = buttonObj.color;
            button.input = buttonObj.input;
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
            let xPos = buttonObj.x + buttonObj.radius;
            let yPos = buttonObj.y + buttonObj.radius;
            let r = buttonObj.radius;
            let color = buttonObj.color;
            button.input = buttonObj.input;
            button.pressed = function(x, y){
                let scale = window.innerWidth;
                let xDiff = x - xPos * scale;
                let yDiff = y - yPos * scale;
                return xDiff**2 + yDiff**2 < (r * scale)**2;
            }
            button.draw = function(context){
                context.fillStyle = color;
                context.beginPath();
                context.arc(posX * scale, posY * scale, r * scale, 0, 2 * Math.PI);
                context.fill();
            }
        }else return;
        this.buttons[this.buttons.length] = button;
    }

    makeTrackField(trackObj){
        let trackField = {};
        if(trackObj.type == "rect"){
            let xPos = trackObj.x;
            let yPos = trackObj.y;
            let w = trackObj.width;
            let h = trackObj.height;
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
            let xPos = trackObj.x + trackObj.radius;
            let yPos = trackObj.y + trackObj.radius;
            let r = trackObj.radius;
            let color = trackObj.color;
            let visible = trackObj.visible;
            trackField.input = trackObj.input;
            trackField.pressed = function(x, y){
                let scale = window.innerWidth;
                let xDiff = x - xPos * scale;
                let yDiff = y - yPos * scale;
                return xDiff**2 + yDiff**2 < (r * scale)**2;
            }
            trackField.draw = function(context){
                if(visible && color){
                    context.fillStyle = color;
                    context.beginPath();
                    context.arc(posX * scale, posY * scale, r * scale, 0, 2 * Math.PI);
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

        for(let i = this.buttons.length - 1; i >= 0; i--){
            this.buttons[i].draw(context);
        }
    }
}