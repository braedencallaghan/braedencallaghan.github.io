let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");

//Constants
let canvasHeight = 400;
let canvasWidth = 640;
let start = false;

let pix_per_m = canvasHeight/3.3
let g = 9.8; //Gravity m/s^2
let k = 1; //Spring Constant N/m
let w_1 = 0; //Initial Angular Velocity of Pendulum 1 
let w_2 = 0; //Initial Angular Velocity of Pendulum 1
let m1 = 1; //Mass of bob 1: 1 - 5
let m2 = 1; //Mass of bob 2: 1 - 5
let angle1 = 30; //Angle of Pendulum 1 
let angle2 = 0; //Angle of Pendulum 2
let length1 = 1.5; //Length of Pendulum 1: .5 - 2.5
let length2 = 1.5; //Length of Pendulum 2: .5 - 2.5

canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style="border:solid 1px;";
// canvas.style.background = "#EAECEE";

let supportWidth = canvasWidth/1.5;
let supportHeight = canvasHeight/10;

//Support class to draw support
class Support {
    draw(context) {
        context.fillRect((canvasWidth-supportWidth)/2, 0, supportWidth, supportHeight);
    }
}

class Pendulum {
    constructor(xpos, length, mass, angle, direction, color) {
        this.xpos = (canvasWidth-supportWidth)/2 + xpos;
        this.ypos = supportHeight;
        this.radius = 13 + mass*1.5;
        this.length = length*pix_per_m;
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

    //Updates the angle of the pendulum (doesn't draw as later I want to update the angle, then draw the spring, then draw the pendulum so the spring is behind)
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

    //These functions find the very edge of the bob that is perpoendicular to the length of the pendulum plus the radius
    getBobXPos() {
        return this.xpos + this.direction*(this.radius*Math.cos(this.angle)) - (this.length+this.radius)*Math.sin(this.angle);
    }
    
    getBobYPos() {
        return this.ypos + this.direction*(this.radius*Math.sin(this.angle)) + (this.length+this.radius)*Math.cos(this.angle);
    }
}

class Spring {
    constructor(xpos, ypos, length, radius1, radius2, angle) {
        this.width = k * 10 + 5;
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
        
        context.translate(this.xpos, this.ypos); //Sets origin of canvas to the top left corner of spring
        context.rotate(this.angle); //Rotates the angle between bobs
        context.fillRect(-2, -1, 14, 2)
        context.fillRect(this.length-12, -1, 14, 2)

        context.fillRect(10, -this.width/2, this.length-20, this.width); // Draws Spring
        
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
let p1 = new Pendulum(supportWidth/4, length1, m1, angle1, 1,"red");

//Creation of Pendulum 2
let p2 = new Pendulum(3*supportWidth/4, length2, m2, angle2, -1,"blue");

//Creation of Support
let sup = new Support();
sup.draw(context);

//Creation of Spring
let xS = p1.getBobXPos(); //-6 as to offset the spring behind bob. It's a rectangle, so when it rotates with respect to the circular bob it shows corners without this
let yS = p1.getBobYPos();
let lengthS = Math.sqrt(Math.pow(p2.getBobXPos()-p1.getBobXPos(), 2) + Math.pow(p2.getBobYPos()-p1.getBobYPos(), 2)); //+12 to account for previous -6 and add 6 in the opposite direction
let angleS = Math.asin((p2.getBobYPos()-p1.getBobYPos())/lengthS); //Finds angle between bendulum
let spring = new Spring(xS, yS, lengthS, p1.getRadius(), p2.getRadius(), angleS);
spring.draw(context);

p1.draw(context);
p2.draw(context);

//Starts and stops the animation
function toggle() {
    run = !run
}

//Animates the canvas. This is essentially the Euler-Cromer method of numerically solving an ODE
let oldTime = 0;
function animate(timeStamp) {
    let dt = (timeStamp-oldTime)/1000;
    console.log(dt)
    oldTime = timeStamp;
    console.log(dt);
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    sup.draw(context); //Redraws top support everytime (doesn't change)

    //Updates the angular velocity based on the current angles of the pendulum. 
    w_1 += ((-g/length1)*Math.sin(p1.getAngle()) - (k/m1)*(Math.sin(p1.getAngle()) - (length2/length1)*Math.sin(p2.getAngle())))*Math.sqrt(dt);
    w_2 += ((-g/length2)*Math.sin(p2.getAngle()) - (k/m2)*(Math.sin(p2.getAngle()) - (length1/length2)*Math.sin(p1.getAngle())))*Math.sqrt(dt);

    //Updates the angle of the pendulum
    p1.updateAngle(w_1*Math.sqrt(dt));
    p2.updateAngle(w_2*Math.sqrt(dt));

    //Updates the coordinates, length, and angle of the spring
    xS = p1.getBobXPos();
    yS = p1.getBobYPos();
    lengthS = Math.sqrt(Math.  pow(p2.getBobXPos()-p1.getBobXPos(), 2) + Math.pow(p2.getBobYPos()-p1.getBobYPos(), 2));
    angleS = Math.asin((p2.getBobYPos()-p1.getBobYPos())/lengthS);

    //Redraws the spring with updated coordinates, size, and angle
    spring.update(xS, yS, lengthS, angleS);

    //Redraws both pendulums
    p1.update();
    p2.update();
    
    window.requestAnimationFrame(animate);
}

animate(oldTime);
