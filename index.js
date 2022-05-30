const canvas = document.querySelector("#game-container");
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;



// ctx.beginPath();
// ctx.arc(canvas.width / 2, canvas.height / 2, 30, 0, Math.PI * 2, false);
// ctx.fillStyle = "red";
// ctx.fill();

class Entity {
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "red";
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Player extends Entity{
    constructor(x,y,radius,color){
        super(x,y,radius);
        this.color = color;
    }
}

class Projectile extends Player {
    constructor(x,y,radius,color,velocity){
        super(x,y,radius,color);
        this.velocity = velocity;
    }
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy extends Projectile {
    constructor(x,y,radius,color,velocity){
        super(x,y,radius,color,velocity)
    }
}

const player = new Player(canvas.width/2,canvas.height/2,10,"blue");
const projectile = new Projectile(50,50,30,'blue',{x:3,y:3});
const projectiles = [];
const enemies = []
player.draw();
projectile.draw();


//Ajout de l'event click pour tirer
window.addEventListener("click",(event)=>{
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    const projectile = new Projectile(
        player.x,
        player.y,
        5,
        "white",
        velocity);
    projectiles.push(projectile);
    projectile.draw();
    
});

//Fonction d'animation des ennemies et projectiles
let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
  
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    player.draw();
  
    projectiles.forEach((projectile,index) => {
        if (
            projectile.x - projectile.radius < 0 ||
            projectile.x + projectile.radius > canvas.width ||
            projectile.y - projectile.radius < 0 ||
            projectile.y + projectile.radius > canvas.height
          ) {
            projectiles.splice(index, 1);
          }
        projectile.update();
    });
  
    enemies.forEach((enemy, enemyIndex) => {
      projectiles.forEach((projectile, projectileIndex) => {
        const distance = Math.hypot(
          projectile.x - enemy.x,
          projectile.y - enemy.y
        );
        if (distance - projectile.radius - enemy.radius <= 0) {
          if (enemy.radius -10 > 5){
            gsap.to(enemy, {
                radius: enemy.radius - 10,
              });
            setTimeout(() => {
              projectiles.splice(projectileIndex, 1);
            }, 0);
          }else {
          setTimeout(() => {
            enemies.splice(enemyIndex, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }}
      });
      
      const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
          cancelAnimationFrame(animationId);
      }
  
      enemy.update();
  
    });
  }

//Fonction faisant apparaitre les ennemie autour du joueur
function spawnEnemies(){
    setInterval(()=> {
    const radius = Math.random() * (30-4)+4;
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = `rgb(${r}, ${g}, ${b})`;

    const randomValue = Math.random();
    let x,y;
    if (randomValue < 0.25) {
        x = 0 - radius;
        y = Math.random()*canvas.height;
    }else if (randomValue >= 0.25 && randomValue < 0.5){
        x = canvas.width + radius;
        y = Math.random() * canvas.height;
    }else if (randomValue >= 0.5 && randomValue < 0.75) {
        x = Math.random() * canvas.width;
        y = 0 - radius;
    } else if (randomValue >= 0.75) {
        x = Math.random() * canvas.width;
        y = canvas.height + radius;
    }

    const angle = Math.atan2(player.y - y,player.x - x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };
    enemies.push(new Enemy(x,y,radius,color,velocity));
},1000);
}

animate();
spawnEnemies();
