//ES5

;(function() {
	var Game = function(canvasId) {
		//стандарточка
		var canvas = document.getElementById(canvasId);
		var screen = canvas.getContext('2d');
		//берем размеры
		var gameSize = {
		x: canvas.width,
		y: canvas.height
		}; 
		
		//массив переменных обьекты
		this.bodies = createInvaders(this).concat([new Player(this, gameSize)]);

		//получаем данные из сайза через функцию
	var self = this;
	//функция обновления игры
	//тик для того, чтобы всё обновлялось, чтоб не было стаичности
	//тик не как не связанно с основной гейм
	loadSound("shoot.wav", function(shootSound) {
		self.shootSound = shootSound;
			var tick = function() {
		self.update(gameSize);
		self.draw(screen, gameSize);
		requestAnimationFrame(tick);
	}
	tick();
	 });
	}
	
	
	Game.prototype = {
		//апдейт - функция которая всё обновляет в игре
		//дро - функиция которая рисует все в игре
		//после этого вызывается реквест анимейшон фрейм - рекрсивная функция
		update: function(gameSize) {
			var bodies = this.bodies;

			var notCollidingWithAnything = function(b1) {
				return bodies.filter(function(b2){
					return colliding(b1, b2);
				}).length == 0;
			}

			this.bodies = this.bodies.filter(notCollidingWithAnything);

		for(var i=0; i < this.bodies.length; i++){
				//удаляем пули за пределами поля
			if (this.bodies[i].position.y < 0 || this.bodies[i].position.y > gameSize.y) {
    		this.bodies.splice(i, 1);
				}﻿
			}
		
		for(var i=0; i < this.bodies.length; i++){
			this.bodies[i].update();
			}
		},
		//отрисовываем обьекты
		draw: function(screen, gameSize){
			clearCanvas(screen, gameSize);
			//создаем цикл который будет проходить по масииву бодис, проверять сколько обьектов
			//и для все обьектов вызывать функцию дро рект
			for(var i=0; i < this.bodies.length; i++){
				drawRect(screen, this.bodies[i]);
			}
		},
		addBody: function(body){
			this.bodies.push(body);
		},

		invadersBelow: function(invader){
			return this.bodies.filter(function(b){
				return b instanceof Invader &&
				b.position.y > invader.position.y &&
				b.position.x - invader.position.x < invader.size.width;
				}).length > 0;
		}
	}
	//враги
	var Invader = function(game, position) {
		this.game = game;
		this.size = {width:16, height:16};
		this.position = position;
		this.patrolX = 0;
		this.speedX = 1;
	}

	Invader.prototype = {
		update: function(){
			if(this.patrolX<0 || this.patrolX>340) {
				this.speedX = -this.speedX;
			}
			this.position.x += this.speedX;
			this.patrolX += this.speedX;

			if(Math.random() < 0.16 && !this.game.invadersBelow(this)) {
			var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y+this.size.height/2},
				{x:Math.random()-0.5,y:2});		
				this.game.addBody(bullet);
				}
		}
	}



	//игрок
	var Player = function(game, gameSize){
		this.game = game;
		this.bullets = 0;
		this.timer = 0;
		this.size = {width:16, height:16};
		//выставляем игрока по центру
		this.position = {x: gameSize.x/2-this.size.width/2, y:gameSize.y/1.15-this.size.height/2};
		this.keyboarder = new Keyboarder();
	}

	Player.prototype = {
		update: function(){ 
			//this обязательно в джаваскрипте, т.к указывается какая где и откуда
			//берется переменная (в нашем случае не глобальная а локальная)
			//this вытаскивает переменную из Плэйер
			if(this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)){
				this.position.x -= 2;
			}
			if(this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)){
				this.position.x += 2;
			}
			if(this.keyboarder.isDown(this.keyboarder.KEYS.SPACE)){
				if(this.bullets<4) {
				//вычисляем позицию пули
				var bullet = new Bullet({x:this.position.x+this.size.width/2-3/2, y:this.position.y-4},
					{x:0,y:-6});		
					this.game.addBody(bullet);
					this.bullets++;
					this.game.shootSound.load();
					this.game.shootSound.play();
			}				
			}
			this.timer++;
			if(this.timer % 12 == 0){
				this.bullets = 0;
			}
			}
		}

		var Bullet = function(position, velocity){
		this.size = {width:3, height:3};
		//выставляем игрока по центру
		this.position = position;
		this.velocity = velocity;
	}

	Bullet.prototype = {
		update: function(){ 
				this.position.x += this.velocity.x;
				this.position.y += this.velocity.y;
			}
		}
		
		//ответочки

	//управление
	var Keyboarder = function(){
		// состояние клавиши
		var keyState = {};
		window.onkeydown = function(e) {
			//событие через эвент
			keyState[e.keyCode] = true;
		}
		window.onkeyup = function(e) {
			keyState[e.keyCode] = false;
		}
		//функиця которая принимает кейкод отправляет кейстэйт
		// мы знаем какая клавиша нажата
		this.isDown = function(keyCode) {
			return keyState[keyCode] === true;
		}
		this.KEYS = {LEFT: 37, RIGHT: 39, SPACE: 32};
	}
//создаем самих врагов
	var createInvaders = function(game){
		var invaders = [];
		for (var i = 0; i < 60; i++){
			var x = 30 + (i%15) * 30;
			var y = 30 + (i%4) * 30;
			invaders.push(new Invader(game, {x:x, y:y}));
		}
		return invaders;
	}

	//столкновения
	var colliding = function(b1, b2) {
  return !(b1 == b2 || 
   b1.position.x + b1.size.width/2 < b2.position.x - b2.size.width  || 
   b1.position.y + b1.size.width/2  < b2.position.y - b2.size.height/2 ||
   b1.position.x - b1.size.width/2 > b2.position.x + b2.size.width/2 ||
   b1.position.y - b1.size.height/2 > b2.position.y + b2.size.height/2);
 }

 	var loadSound = function(url, callback) {
 		var loaded = function(){
 			callback(sound);
 			sound.removeEventListener("canplaythrough", loaded);
 		}
 		var sound = new Audio(url);
 		sound.addEventListener("canplaythrough", loaded);
 		sound.load();
 	}

	var drawRect = function(screen, body){
		screen.fillRect(body.position.x, body.position.y, body.size.width, body.size.height);
	}
	
	var clearCanvas = function(screen, gameSize){
		screen.clearRect(0,0, gameSize.x, gameSize.y);
	}

	window.onload = function() {
		new Game("screen");
	}
	} )();

