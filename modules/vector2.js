export class Vector2{
    constructor(x, y){
        this.x = x || 0;
        this.y = y || 0;
    }

    static add(vec1, vec2){
        return new Vector2(vec1.x + vec2.x, vec1.y + vec2.y);
    }

    add(vec){
        return Vector2.add(this, vec);
    }

    static subtract(vec1, vec2){
        return new Vector2(vec1.x - vec2.x, vec1.y - vec2.y);
    }

    subtract(vec){
        return Vector2.subtract(this, vec);
    }

    static multiply(vec, num){
        return new Vector2(vec.x * num, vec.y * num);
    }

    multiply(num){
        return Vector2.multiply(this, num);
    }

    static divide(vec, num){
        return new Vector2(vec.x / num, vec.y / num);
    }

    divide(num){
        return Vector2.divide(this, num);
    }

    static dot(vec1, vec2){
        return vec1.x * vec2.x + vec1.y * vec2.y;
    }

    dot(vec){
        return Vector2.dot(this, vec);
    }

    static cross(vec1, vec2){
        return vec1.x * vec2.y - vec2.x * vec1.y;
    }

    cross(vec){
        return Vector2.cross(this, vec);
    }

    static length(vec){
        return Math.sqrt(Vector2.dot(vec, vec))
    }

    length(){
        return Vector2.length(this);
    }

    static normalize(vec){
        return Vector2.divide(vec, vec.length());
    }

    normalize(){
        return Vector2.normalize(this);
    }

    toString(){
        return this.x + " " + this.y;
    }

    static rotate(vec, ang){
        return new Vector2(Math.cos(ang) * vec.x - Math.sin(ang) * vec.y, Math.sin(ang) * vec.x + Math.cos(ang) * vec.y);
    }

    rotate(ang){
        return Vector2.rotate(this, ang);
    }

    static localToLocal(norm1, norm2, vec){
        let localX = norm1.dot(vec);
        let localY = new Vector2(-norm1.y, norm1.x).dot(vec);
        return norm2.multiply(localX).add(new Vector2(-norm2.y, norm2.x).multiply(localY));
    }

    static equals(vec1, vec2){
        return vec1.x == vec2.x && vec1.y == vec2.y;
    }

    equals(vec){
        return Vector2.equals(this, vec);
    }

    static clone(vec){
        return new Vector2(vec.x, vec.y, vec.z);
    }

    clone(){
        return Vector2.clone(this);
    }
}