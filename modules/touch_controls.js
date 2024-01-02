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
            },{
                type: "rect",
                x: 0.84,
                y: 0.35,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "turnLeft"
            },{
                type: "rect",
                x: 0.91,
                y: 0.35,
                width: 0.06,
                height: 0.06,
                color: "#8080FF80",
                input: "turnRight"
            }
        ]
    };

    constructor(buttonArr){
        this.buttons = [];
        this.setControls(buttonArr || TouchControls.defaultControls);
    }

    setControls(controlObj){
        for(let i = 0; i < controlObj.buttons.length; i++){
            this.makeButton(controlObj.buttons[i]);
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

    render(context){
        for(let i = 0; i < this.buttons.length; i++){
            this.buttons[i].draw(context);
        }
    }
}