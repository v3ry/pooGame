const canvas = document.querySelector("#game-container");
const ctx = canvas.getContext('2d');

//Creations de la zone de dessin(canvas) 
//avec la largeur et la hauteur de la page de navigation
canvas.width = innerWidth;
canvas.height = innerHeight;

//La class Entity contient le dessin et les parametres du joueurs
class Entity {
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = "red";
    }
    //dessine le joueur
    draw(){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.radius,0,Math.PI * 2,false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

//La class Player est étendu par la class Entity
class Player extends Entity{
    constructor(x,y,radius,color){
        super(x,y,radius);
        this.color = color;
    }
}

//La class Projectile est étendu par la class Player car il est creer via les meme paramètre
class Projectile extends Player {
    constructor(x,y,radius,color,velocity){
        super(x,y,radius,color);
        this.velocity = velocity;
    }
    //mise a jour de la position du projectil
    update(){
        this.draw();
        this.x = this.x + this.velocity.x; //ça position actuelle + la velocité pour avoir le mouvement
        this.y = this.y + this.velocity.y;
    }
}

//Les class utilisant les parametre commun, ça reste le même principe
class Enemy extends Projectile {
    constructor(x,y,radius,color,velocity){
        super(x,y,radius,color,velocity)
    }
}

//idem au dessu
class Particle extends Enemy{
    constructor(x,y,radius,color,velocity){
        super(x,y,radius,color,velocity);
        this.alpha = 1;
    }
    //creation des particule
    draw(){
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
    //et de l'animation
    update() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
  }
}

//Création de l'objet player de la class Player au centre de l'écran
const player = new Player(canvas.width/2,canvas.height/2,10,"blue");
//Création de projectile de la class Projectiles
const projectile = new Projectile(50,50,30,'blue',{x:3,y:3});
//Créations des liste vide pour avoir les listes des différents objet créer
const projectiles = [];
const enemies = [];
const particles = []

//appel dans les class de draw() pour afficher le player et les projectiles
player.draw();
projectile.draw();


//Ajout de l'event click pour tirer
window.addEventListener("click",(event)=>{
    //calcule de l'angle entre la souris et le joueur
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );
    //calcule de la vitesse
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5,
    };
    //Créations d'un nouveau projectile
    const projectile = new Projectile(
        player.x,
        player.y,
        5,
        "white",
        velocity);
    projectiles.push(projectile); //ajout du projectiles dans la liste
    projectile.draw(); //et l'affichage
    
});

//Fonction d'animation des ennemies et projectiles
let animationId;

function animate() {
    //dire au navigateur que l'on veut faire une animation avec en parametre un callback
    animationId = requestAnimationFrame(animate);
    
    //création de l'effet de trainer
    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    //affichage du joueur
    player.draw();
    
    /* Pour chaque particule, verification de l'alpha(transparence),
     si il est à 0,l'enlever de la liste*/
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          particle.update();
        }
      });

    //vérifie chaque projectile, si il sort de l'écran, l'enlever de la liste
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
  
    //Pour chaque enemy, verifie si il y a collision avec projectile
    enemies.forEach((enemy, enemyIndex) => {
      projectiles.forEach((projectile, projectileIndex) => {
        const distance = Math.hypot(
          projectile.x - enemy.x,
          projectile.y - enemy.y
        );
        if (distance - projectile.radius - enemy.radius <= 0) {
            //Si collision creer 8 particules
            for (let i = 0; i < 8; i++) { 
                particles.push(
                  new Particle(
                    projectile.x,
                    projectile.y,
                    Math.random() * (3 - 1) + 1,
                    enemy.color,
                    {
                      x: (Math.random() - 0.5) * 3,
                      y: (Math.random() - 0.5) * 3,
                    }
                  )
                );
              }

        //Si la taille de l'enemy-10 > 5,faire l'animation de reduction de taille 
          if (enemy.radius -10 > 5){
            gsap.to(enemy, {
                radius: enemy.radius - 10,
              });
            setTimeout(() => {
                //faire disparaitre le projectil après collision
              projectiles.splice(projectileIndex, 1);
            }, 0);
          }else {
              //enleve l'enemies et le projectile
              setTimeout(() => {
                enemies.splice(enemyIndex, 1);
                projectiles.splice(projectileIndex, 1);
          }, 0);
        }}
      });
      
      //verification de la distance entre le joueur et les enemy
      const distPlayerEnemy = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      //Si l'enemy touche le joueur, arret de l'annimation
      if (distPlayerEnemy - enemy.radius - player.radius <= 0) {
          cancelAnimationFrame(animationId);
      }
      //Mise a jour du placement de l'enemy
      enemy.update();
  
    });
  }

//Fonction faisant apparaitre les ennemies autour du joueur
function spawnEnemies(){
    setInterval(()=> {
        //Systeme de couleur et taille aléatoire des enemies
    const radius = Math.random() * (30-4)+4;
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const color = `rgb(${r}, ${g}, ${b})`;

    //Cette randomValue definie de qu'elle coté l'enemies apparait
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

    //calcule du déplacement vers le joueur
    const angle = Math.atan2(player.y - y,player.x - x);
    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };

    //Ajout d'un nouvelle enemies dans la liste avec la class Enemy
    enemies.push(new Enemy(x,y,radius,color,velocity));

    /*
      Le 1000 en dessous va avec le setInterval au début de la fonction
      C'est un paramètre, il définis le temps en ms entre chaque apparition
      Pour rendre le jeu plus dur,réduire le chiffre, augmenté pour le rendre 
      plus facile
      */
},1000);
}

//démarage des fonctions animate() et spawnEnemies()
animate();
spawnEnemies();
