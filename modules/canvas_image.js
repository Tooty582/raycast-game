export class CanvasImage{
    constructor(url){
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.imageData = this.context.getImageData(0, 0, 1, 1);
        this.width = 1;
        this.height = 1;
        this.image = new Image();
        let canvasImage = this;
        this.image.addEventListener("load", function(){
            canvasImage.canvas.width = canvasImage.image.naturalWidth;
            canvasImage.canvas.height = canvasImage.image.naturalHeight;
            canvasImage.width = canvasImage.canvas.width;
            canvasImage.height = canvasImage.canvas.height;
            canvasImage.context.drawImage(canvasImage.image, 0, 0, canvasImage.image.naturalWidth, canvasImage.image.naturalHeight);
            canvasImage.imageData = canvasImage.context.getImageData(0, 0, canvasImage.width, canvasImage.height);
        });
        this.image.src = url;
    }

    getPixel(x, y){
        let imageOffset = (y * this.width + x) * 4;
        let r = this.imageData.data[imageOffset];
        let g = this.imageData.data[imageOffset + 1];
        let b = this.imageData.data[imageOffset + 2];
        let a = this.imageData.data[imageOffset + 3];
        return (r << 24) + (g << 16) + (b << 8) + a;
    }
}