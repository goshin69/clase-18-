//Variables globales 
var PLAY = 1;
var END = 0;
var gameState = PLAY;

var trex, trex_running, trex_collided;
var ground, invisibleGround, groundImage;

var cloudsGroup, cloudImage;
var obstaclesGroup, obstacle1, obstacle2, obstacle3, obstacle4, obstacle5, obstacle6;

var score;
var gameOverImg,restartImg;
var jumpSound , checkPointSound, dieSound;

//Función para precargar animaciones, imagenes y sonidos. 
function preload(){
  //Animación T-rex
  trex_running = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_collided = loadAnimation("trex_collided.png");
  //Suelo
  groundImage = loadImage("ground2.png");
  //Nubes
  cloudImage = loadImage("cloud.png");
  //Obstaculos
  obstacle1 = loadImage("obstacle1.png");
  obstacle2 = loadImage("obstacle2.png");
  obstacle3 = loadImage("obstacle3.png");
  obstacle4 = loadImage("obstacle4.png");
  obstacle5 = loadImage("obstacle5.png");
  obstacle6 = loadImage("obstacle6.png");
  //Reinicio/Fin del juego
  restartImg = loadImage("restart.png")
  gameOverImg = loadImage("gameOver.png")
  //Sonidos salto,colisión e hito. 
  jumpSound = loadSound("jump.mp3")
  dieSound = loadSound("die.mp3")
  checkPointSound = loadSound("checkpoint.mp3")
}

//Función de configuración principal 
function setup() {
  //Tamaño del lienzo
  createCanvas(windowWidth, windowHeight);

  //Objeto T-rex
  trex = createSprite(50,height-70,20,50);
  trex.addAnimation("running", trex_running);
  trex.addAnimation("collided", trex_collided);
  trex.scale = 0.5;
  
  //Objeto suelo
  ground = createSprite(width/2,height-20,width,20);
  ground.addImage("ground",groundImage);
  ground.x = ground.width /2;

  //Objeto de Suelo invisible
  invisibleGround = createSprite(width/2,height-10,width,10);
  invisibleGround.visible = false;

  //Objeto para Game Over
  gameOver = createSprite(width/2,height/2-50);
  gameOver.addImage(gameOverImg);

  //Objeto para Restart
  restart = createSprite(width/2,height/2);
  restart.addImage(restartImg);

  //Escalar objetos
  gameOver.scale = 0.5;
  restart.scale = 0.5;

  //crear grupos de obstáculos y nubes
  obstaclesGroup = createGroup();
  cloudsGroup = createGroup();

  //Establecer colisionador
  trex.setCollider("rectangle",0,0,trex.width,trex.height);
  trex.debug = true;
  
  //Inicialización de puntuación
  score = 0;
  
}

function draw() {
  //Fondo 
  background(180);

  //Mostrar puntuación en texto
  text("Puntuación: "+ score, 500,50);
  
  //Condición para estado de juego PLAY 
  if(gameState === PLAY){
    //Puntuación
    score = score + Math.round(getFrameRate()/30);

    //Velocidad del suelo
    ground.velocityX = -(4 + 3* score/100)

    //Visibilidad de objeto restar y game over
    gameOver.visible = false;
    restart.visible = false;

    //Hito de puntuación
    if(score>0 && score%100 === 0){
      checkPointSound.play() 
   }

   //Hacer que el Trex salte al presionar la barra espaciadora
   if(touches.length >0 || keyDown ("space")&& trex.y >= height-120) {
    trex.velocityY = -12;
    jumpSound.play();
    touches=[];
    }
    //Agregar gravedad
    trex.velocityY = trex.velocityY + 0.8;

    //Reinicio de posición del suelo
    if (ground.x < 0){
      ground.x = ground.width/2;
    }

    //Evitar que el Trex caiga
    trex.collide(invisibleGround);
    
    //Aparecer las nubes
    spawnClouds();
    //Aparecer obstáculos en el suelo
    spawnObstacles();

    //Condición para detección de colisión 
    if(obstaclesGroup.isTouching(trex)){
        //Cambio de estado de juego
        gameState = END;
        //Sonido de hito
        dieSound.play();
    }
  }
    //Estado de juego END 
   else if (gameState === END) {
      //Visibilidad de los objetos 
      gameOver.visible = true;
      restart.visible = true;
      
      //Velocidad del suelo y T-rex
      ground.velocityX = 0;
      trex.velocityY = 0;

      //Quitar velocidad a los objetos  
      obstaclesGroup.setVelocityXEach(0);
      cloudsGroup.setVelocityXEach(0); 

      //Cambiar la animación del Trex
      trex.changeAnimation("collided", trex_collided);

      //Establecer lifetime (ciclo de vida) para que no sean destruidos nunca
      obstaclesGroup.setLifetimeEach(-1);
      cloudsGroup.setLifetimeEach(-1);
      
      //Detección del mose sobre Sprite restart
      if(touches.length >0 || keyDown("space")) {
        //Llamado a función reset
        reset();
        touches=0;
      } 
   }
  drawSprites();
}

//Función para aparecer obstaculos 
function spawnObstacles(){
 if (frameCount % 60 === 0){
  var obstacle = createSprite(600,height-30,10,40);
   obstacle.velocityX = -(6 + score/100);
   
    //Generar obstáculos al azar
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstacle.addImage(obstacle1);
              break;
      case 2: obstacle.addImage(obstacle2);
              break;
      case 3: obstacle.addImage(obstacle3);
              break;
      case 4: obstacle.addImage(obstacle4);
              break;
      case 5: obstacle.addImage(obstacle5);
              break;
      case 6: obstacle.addImage(obstacle6);
              break;
      default: break;
    }
   
    //Asignar escala y ciclo de vida al obstáculo           
    obstacle.scale = 0.5;
    obstacle.lifetime = 300;
   
   //Agregar cada obstáculo al grupo
    obstaclesGroup.add(obstacle);
 }
}

//Función para aprecer las nubes 
function spawnClouds() {
  if (frameCount % 60 === 0) {
    var cloud = createSprite(width+20,height-300,40,10);
    cloud.y = Math.round(random(80,120));
    cloud.addImage(cloudImage);
    cloud.scale = 0.5;
    cloud.velocityX = -3;
    
     //Asignar ciclo de vida a la variable
    cloud.lifetime = 400;
    
    //Ajustar la profundidad
    cloud.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    //Agregar cada nube al grupo
    cloudsGroup.add(cloud);
  }
}

//Función para reiniciar juego 
function reset(){
  //Cambio de estado de juego
  gameState = PLAY;

  //Visibilidad de los Sprites 
  gameOver.visible = false;
  reset.visible = false;

  //Destrucción de los Grupos de Sprites
  obstaclesGroup.destroyEach();
  cloudsGroup.destroyEach();

  //Cambiar animación 
  trex.changeAnimation("running",trex_running);

  //Reiniciar contador a cero
  score = 0;

}
