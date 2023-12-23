export class Sprite{
    constructor(imageName, spritesheet){
        this.imageName = imageName;
        this.spritesheet = spritesheet;
        this.spriteSize = this.spritesheet.spriteSize;
    }

    getPixel(x, y){
        return this.spritesheet.getPixel(this.imageName, x, y);
    }
}