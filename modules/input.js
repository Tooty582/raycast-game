export class Input{
    static defaultMapping = {
        KeyA: "left",
        KeyD: "right",
        KeyW: "forward",
        KeyS: "back",
        ArrowLeft: "turnLeft",
        ArrowRight: "turnRight"
    };

    constructor(mapping){
        this.mapping = mapping || Object.assign({}, Input.defaultMapping);

        addEventListener("keydown", (e) => {
            if(this.mapping[e.code]){
                this[this.mapping[e.code]] = true;
            }
        });

        addEventListener("keyup", (e) => {
            if(this.mapping[e.code]){
                this[this.mapping[e.code]] = false;
            }
        });

        addEventListener("click", (e) =>{
            if(!document.pointerLockElement){
                document.body.requestPointerLock({unadjustedMovement: true});
            }else{

            }
        })
    }
}