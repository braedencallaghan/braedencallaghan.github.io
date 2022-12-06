let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

//Constants
let canvasHeight = 300;
let canvasWidth = 500;

let g = 9.8; //Gravity
let k = .1; //Spring Constant
let w_1 = 0; //Initial Angular Velocity of Pendulum 1
let w_2 = 0; //Initial Angular Velocity of Pendulum 1
let m1 = .5; //Mass of bob 1
let m2 =.5; //Mass of bob 2
let angle1 = 45; //Angle of Pendulum 1
let angle2 = 45; //Angle of Pendulum 2
let length1 = 30; //Length of Pendulum 1
let length2 = 30; //Length of Pendulum 2

canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style="border:solid 1px;";
// canvas.style.background = "#EAECEE";

let supportWidth = canvasWidth/1.5;
let supportHeight = canvasHeight/10;

class Support {
    draw(context) {
        context.fillRect((canvasWidth-supportWidth)/2, 0, supportWidth, supportHeight); // Draws Top Support
    }
}

class Pendulum {
    constructor(xpos, length, mass, angle, direction, color) {
        this.xpos = (canvasWidth-supportWidth)/2 + xpos;
        this.ypos = supportHeight;
        this.radius = 10 + mass*10;
        this.length = length;
        this.color = color;
        this.angle = angle * Math.PI/180;
        this.direction = direction
    }

    draw(context) {
        context.save();

        //Starting angle
        context.translate(this.xpos, this.ypos);
        context.rotate(this.angle);
        
        // Rod
        const rodWidth = 2;
        context.fillStyle = "black";
        context.fillRect(-rodWidth/2, 0, rodWidth, this.length);

        // Bob
        context.beginPath();
        context.arc(0, this.length+this.radius, this.radius, 0, 2*Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();

        context.restore();

    }

    updateAngle(theta) {
        this.angle += theta*Math.PI/180;
    }

    update() {
        this.draw(context);
    }

    getAngle() {
        return this.angle;
    }

    //The following three functions are useful in calculating the location and length of the spring
    getRadius() {
        return this.radius;
    }

    getBobXPos() {
        return this.xpos + this.direction*(this.radius*Math.cos(this.angle)) - (this.length+this.radius)*Math.sin(this.angle);
    }
    
    getBobYPos() {
        return this.ypos + this.direction*(this.radius*Math.sin(this.angle)) + (this.length+this.radius)*Math.cos(this.angle);
    }
}

class Spring {
    constructor(xpos, ypos, length, radius1, radius2, angle) {
        this.width = k * 100;
        this.xpos = xpos;
        this.ypos = ypos;
        this.length = length;
        this.angle = angle;
        this.radius1 = radius1;
        this.radius2 = radius2;
    }

    draw(context) {
        context.save();
        
        context.fillStyle = "orange";
        
        context.translate(this.xpos, this.ypos);
        context.rotate(this.angle);
        context.fillRect(0, -this.width/2, this.length, this.width); // Draws Spring
        
        context.restore();
    }

    update(xposNew, yposNew, lengthNew, theta) {
        this.xpos = xposNew;
        this.ypos = yposNew;
        this.length = lengthNew;
        this.angle = theta;
        this.draw(context);
    }
}

//Creation of Pendulum 1
let p1 = new Pendulum(supportWidth/4, 150, m1, angle1, 1,"red");

//Creation of Pendulum 2
let p2 = new Pendulum(3*supportWidth/4, 150, m2, angle2, -1,"blue");

//Creation of Support
let sup = new Support();
sup.draw(context);

//Creation of Spring
let xS = p1.getBobXPos()-6;
let yS = p1.getBobYPos();
let lengthS = Math.sqrt(Math.pow(p2.getBobXPos()-p1.getBobXPos(), 2) + Math.pow(p2.getBobYPos()-p1.getBobYPos(), 2))+12;
let angleS = Math.asin((p2.getBobYPos()-p1.getBobYPos())/lengthS);
let spring = new Spring(xS, yS, lengthS, p1.getRadius(), p2.getRadius(), angleS);

spring.draw(context);
p1.draw(context);
p2.draw(context);

function animationLoop(timeStamp) {
    
}


function animate() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    sup.draw(context);

    w_1 += ((-g/length1)*Math.sin(p1.getAngle()) - (k/m1)*(Math.sin(p1.getAngle()) - (length2/length1)*Math.sin(p2.getAngle())));
    w_2 += ((-g/length2)*Math.sin(p2.getAngle()) - (k/m2)*(Math.sin(p2.getAngle()) - (length1/length2)*Math.sin(p1.getAngle())));

    p1.updateAngle(w_1);
    p2.updateAngle(w_2);

    xS = p1.getBobXPos()-6;
    yS = p1.getBobYPos();
    lengthS = Math.sqrt(Math.pow(p2.getBobXPos()-p1.getBobXPos(), 2) + Math.pow(p2.getBobYPos()-p1.getBobYPos(), 2))+12;
    angleS = Math.asin((p2.getBobYPos()-p1.getBobYPos())/lengthS);
    spring = new Spring(xS, yS, lengthS, p1.getRadius(), p2.getRadius(), angleS);

    spring.update(xS, yS, lengthS, angleS);
    p1.update();
    p2.update();
    
    window.requestAnimationFrame(animate);
}

animate();

