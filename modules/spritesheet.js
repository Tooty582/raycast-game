import { Sprite } from "./sprite.js";

export class Spritesheet{
    constructor(spriteSize, sheetSize, imageObj){
        this.spriteSize = spriteSize;
        this.sheetSize = sheetSize;
        this.canvas = document.createElement("canvas");
        this.canvas.width = sheetSize * spriteSize;
        this.canvas.height = sheetSize * spriteSize;
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.imageNum = 0;
        this.images = {};
        this.sprites = {};

        if(imageObj){
            for(let [k, v] of Object.entries(imageObj)){
                this.addImage(v, k);
            }
        }
    }

    addImage(imageSource, imageName){
        if(this.imageNum < this.sheetSize * this.sheetSize - 1){
            let imageX = this.imageNum % this.sheetSize;
            let imageY = Math.floor(this.imageNum / this.sheetSize);
            let image = new Image();
            let sheet = this;
            image.addEventListener("load", function(){
                sheet.context.drawImage(image, imageX * sheet.spriteSize, imageY * sheet.spriteSize, sheet.spriteSize, sheet.spriteSize);
                sheet.imageData = sheet.context.getImageData(0, 0, sheet.canvas.width, sheet.canvas.height);
            });
            image.src = imageSource;
            this.images[imageName] = this.imageNum;
            this.imageNum++;
            let sprite = new Sprite(imageName, this);
            this.sprites[imageName] = sprite;
            return sprite;
        }else{
            throw new Error("Tried adding too many images to a spritesheet");
        }
    }

    getPixel(imageName, x, y){
        let imageX = this.images[imageName] % this.sheetSize;
        let imageY = Math.floor(this.images[imageName] / this.sheetSize);
        x %= this.spriteSize;
        y %= this.spriteSize;

        let canvasX = imageX * this.spriteSize + x;
        let canvasY = imageY * this.spriteSize + y;
        let imageOffset = (canvasY * this.canvas.width + canvasX) * 4

        let r = this.imageData.data[imageOffset];
        let g = this.imageData.data[imageOffset + 1];
        let b = this.imageData.data[imageOffset + 2];
        return (r << 24) + (g << 16) + (b << 8) + 0xFF;
    }
}