var stage;

var hero;
var level = 1;
var points= 0;

var keys = {
    rkd:false,
    lkd:false,
};
var bullets=[];
var enemies=[];

var queue;
var preloadText;
var heroSpriteSheet;

function preload(){
    stage = new createjs.Stage("spaceHero");
    preloadText = new createjs.Text("0%", "30px Verdana", "#FFF");
    stage.addChild(preloadText);
    queue = new createjs.LoadQueue(true);
    queue.installPlugin(createjs.Sound);
    queue.on("progress", progress);
    queue.on("complete", startGame);

    queue.loadManifest([
        "img/A3.png",
        "img/A4.png",
        "img/hero.png",
        {id: "heroSS", src:"spritesheets/Animations/slime.json"},
        "spritesheets/Animations/slime-sheet.png",
        {id:"explosion", src:"audio/explosion.mp3"},
        {id:"levelCompleted", src:"audio/win.mp3"},
        {id:"hit", src:"audio/step.mp3"},
        {id:"shot", src:"audio/laserShoot.wav"}
    ]);
}

function progress(evt){
    preloadText.text = Math.round(evt.progress*100) + "%";
    stage.update();
}

function startGame(){
    preloadText.text = "Score: " + points;
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tock);

    heroSpriteSheet = new createjs.SpriteSheet(queue.getResult("spritesheets/Animations/slime.json"));
    hero = new createjs.Sprite(heroSpriteSheet, "notMoving");
    hero.speed=4;
    hero.width=62;
    hero.height=56;
    stage.addChild(hero);

    hero.x=stage.canvas.width/2-hero.width/2;
    hero.y=stage.canvas.height-1.5*hero.height;

    window.addEventListener("keydown", fingerDown);
    window.addEventListener("keyup", fingerUp);

    addEnemies();
}

function addEnemies(){
    if (level%4===0){
        for(i=0; i<level/4; i++) {
            var temp = new createjs.Bitmap(queue.getResult("img/A4.png"));
            temp.width = 139;
            temp.height = 152;
            temp.hits = 0;

            stage.addChild(temp);
            temp.y = -200;
            temp.x = Math.floor(Math.random() * (stage.canvas.width - temp.width));
            enemies.push(temp);
        }
    }else{
        for(i=0; i<level; i++) {
            var temp = new createjs.Bitmap(queue.getResult("img/A3.png"));
            temp.width = 90;
            temp.height = 131;

            stage.addChild(temp);
            temp.y = -200;
            temp.x = Math.floor(Math.random() * (stage.canvas.width - temp.width));
            enemies.push(temp);
        }
    }
}

function fingerDown(e){
    if(e.keyCode===37){
        keys.lkd=true;
    }
    if(e.keyCode===39){
        keys.rkd=true;
    }
}
function fingerUp(e){
    if(e.keyCode===32){
        fire();
        hero.gotoAndStop("up");
    }
    if(e.keyCode===38){
        fire();
        hero.gotoAndStop("up");
    }
    if(e.keyCode===37){
        keys.lkd=false;
        hero.gotoAndStop("left");
        hero.currentAnimation="undefined";
    }
    if(e.keyCode===39){
        keys.rkd=false;
        hero.gotoAndStop("right");
        hero.currentAnimation="undefined";
    }
}
function moveHero(){
    if(keys.lkd){
        hero.x-=hero.speed;
        if(hero.currentAnimation!="left"){
            hero.gotoAndPlay("left");
        }
    }
    if(keys.rkd){
        hero.x+=hero.speed;
        if(hero.currentAnimation!="right"){
            hero.gotoAndPlay("right");
        }
    }
    if(hero.x > stage.canvas.width){
        hero.x = 0-hero.width;
    }else if(hero.x < 0 - hero.width){
        hero.x = stage.canvas.width;
    }
}

function fire(){
    createjs.Sound.play("shot");
    var temp = new createjs.Shape();
    temp.graphics.beginFill("#23F7BB").drawCircle(0,0, 5);
    temp.x=hero.x+hero.width/2;
    temp.y=hero.y;
    temp.width=temp.height=10;
    stage.addChild(temp);
    bullets.push(temp);
}

function moveBullets(){
    var length=bullets.length-1

    for(i=length; i>=0; i--){
        bullets[i].y-=4;
        if(bullets[i].y < -10){
            stage.removeChild(bullets[i]);
            bullets.splice(i, 1);

        }
    }
}

function moveEnemies(){
    var length=enemies.length-1

    for(i=length; i>=0; i--){
        enemies[i].y+=4;
        if(enemies[i].y > stage.canvas.height){
            enemies[i].y=-200;
            enemies[i].x = Math.floor(Math.random() * (stage.canvas.width - enemies[i].width));
        }
    }
}

function hitTest(rect1,rect2) {
    if ( rect1.x >= rect2.x + rect2.width
        || rect1.x + rect1.width <= rect2.x
        || rect1.y >= rect2.y + rect2.height
        || rect1.y + rect1.height <= rect2.y )
    {
        return false;
    }
    return true;

}

function checkCollisions(){
    var eLength=enemies.length-1;
    var bLength=bullets.length-1;

    for(e=eLength; e>=0; e--){
        for(b=bLength; b>=0; b--){
            if(level%4===0){
                if(hitTest(enemies[e], bullets[b])){
                    stage.removeChild(bullets[b]);
                    bullets.splice(b, 1);
                    enemies[e].hits ++;
                    createjs.Sound.play("hit");
                    if(enemies[e].hits===3){
                        stage.removeChild(enemies[e]);
                        var s = createjs.Sound.play("explosion");
                        s.setVolume(0.1);
                        enemies.splice(e, 1);
                        points += 50;
                    }
                    if(enemies.length===0){
                        level++;
                        points += 100;
                        addEnemies();
                        var y =createjs.Sound.play("levelCompleted");
                        y.setVolume(0.3);
                    }
                    preloadText.text = "Score: " + points;
                    break;
                }
            }else{
                if(hitTest(enemies[e], bullets[b])){
                    stage.removeChild(bullets[b], enemies[e]);
                    bullets.splice(b, 1);
                    enemies.splice(e, 1);
                    points += 10;
                    var s = createjs.Sound.play("explosion");
                    s.setVolume(0.1);
                    if(enemies.length===0){
                        level++;
                        points += 100;
                        addEnemies();
                        var y =createjs.Sound.play("levelCompleted");
                        y.setVolume(0.3);
                    }
                    preloadText.text = "Score: " + points;
                    break;
                }
            }
        }
    }
}

function tock(e){


    moveEnemies();
    moveHero();
    moveBullets();
    checkCollisions();
    stage.update(e);
}
