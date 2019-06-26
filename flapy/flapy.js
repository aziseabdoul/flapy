let Score = document.getElementById('Score');
let main = document.getElementById('main');

class Player {
	constructor(position, width, height, color, context) {
		this.position = position;
		this.width = width;
		this.height = height;
		this.color = 'yellow';
		this.context = context;
		this.score = 0;
		this.velocity = 2;
		this.gravity = .2;
		this.up = false;
	}
	
	newPos() {
		if ( this.up ) {
			this.gravity = -.55;
		} else {
			this.gravity = .25;
		}
		this.velocity += this.gravity;
		this.position.y += this.velocity;
		this.draw();
	}
	
	draw() {
		if ( this.position.y > this.context.canvas.height - this.height ) {
			this.position.y = this.context.canvas.height - this.height;
		} else if ( this.position.y < 0 ) {
			this.position.y = 0;					 
		}
		this.context.fillStyle = this.color;
		this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
	}
	
	get right() {
		return this.position.x + this.width;
	}
	
	get bottom() {
		return this.position.y + this.height;
	}
	
}

class Game {
	constructor() {
		this.canvas = document.getElementById('game');
		this.context = this.canvas.getContext('2d');
		this.canvas.width = document.body.offsetWidth; this.canvas.height = document.body.offsetHeight;
		this.defaultColor = '#22f22c';
		this.frames = 0;
		this.lastWall = 50;
		this.playing = true;
		this.mouseClicked = false;
		this.difficulty = 1;
		this.delta = 0;
		this.lastTime = (new Date()).getTime();
		this.currentTime = 0;
		this.walls = [];
		this.player = new Player({ x: 25, y: this.canvas.height / 2}, 25, 25, '#f2f2f2', this.context);
		this.listeners();
		this.gameLoop();
        this.addWall();
        this.floor = [];
	}
	
	listeners() {
		this.canvas.addEventListener('mousedown', (e) => this.mouseDown(e), false);
		this.canvas.addEventListener('pointerdown', (e) => this.touchStart(e), false);
		this.canvas.addEventListener('mouseup', (e) => this.mouseUp(e), false);
		this.canvas.addEventListener('pointerup', (e) => this.touchEnd(e), false);
	}
	
	touchStart(e) {
		this.player.up = true;
		this.player.velocity = 0;
	}
	
	touchEnd(e) {
		this.player.up = false;
		this.player.velocity = 0;
	}
	
	mouseDown(e) {
		e.preventDefault();
		this.player.up = true;
		this.player.velocity = 0;
	}
	
	mouseUp(e) {
		e.preventDefault();
		this.player.up = false;
		this.player.velocity = 0;
	}
	
	pause(pause) {
		pause ? this.playing = false : this.playing = true;
	}
	
	clear() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	
	gameLoop() {
		
		if ( !this.playing ) {
			return;
		}

		window.requestAnimationFrame(() => this.gameLoop());
		this.currentTime = (new Date()).getTime();
		this.delta = ( this.currentTime - this.lastTime );
		
		if ( this.delta > 1000/60 ) {
		
			this.clear();
			
			this.player.newPos();

			if ( this.frames - this.lastWall >= 150 ) {
				this.addWall();
				this.lastWall = this.frames;
				this.frames++;
			} else {
				this.frames++;
			}

			let wallSpeed = 2;
			
			if ( this.frames > this.canvas.width * 1.5 ) {
				wallSpeed = 2 + ( this.frames * .0005 );
			}
			
			for ( let a = 0; a < this.walls.length; a++ ) {
				this.walls[a].position.x -= wallSpeed;
				this.drawRect(this.walls[a]);
				if ( this.collidesWith(this.player, this.walls[a]) || this.player.position.y + this.player.height >= this.canvas.height) {
					// Collision!
					this.playing = false;
					this.canvas.style.cursor = 'pointer';
					main.classList.add('show');
				}
			}
			
			this.removeWall();
			this.updateScore();
			this.lastTime = this.currentTime - (this.delta % ( 1000/60 ));
			
		}
			
	}
	
	updateScore() {
		Score.innerHTML = 'Score: ' + this.player.score;
	}
	
	addWall() {
		let x = this.canvas.width / 1.25,
				gap = this.random(150, 150),
				minHeight = 30,
				maxHeight = this.canvas.height * .80,
				height = this.random(minHeight, maxHeight),
				height1 = this.random(minHeight, maxHeight);
		
		let w1 = new Player({ x: x, y: 0}, 50, height, this.defaultColor, this.context),
				w2 = new Player({ x: x, y: height + gap}, 50, this.canvas.height + height1 + gap, 'white', this.context);
		
		this.walls.push(...[w1, w2]);
		
	}
	
	removeWall() {
		this.walls = this.walls.filter((wall) => {
			if ( wall.position.x > this.player.position.x - this.player.width ) {
				return wall;
			} else {
				this.player.score += .5;
			}
		});
	}
	
	collidesWith(player, obj) {
		let collide = true;
		if (
			(player.bottom < obj.position.y) || (player.position.y > obj.bottom) || (player.right < obj.position.x) || (player.position.x > obj.right) 
		) {
            collide = false;
            console.log(player.position.y)
		}
		return collide;
	}
	
	random(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	drawRect(obj) {
		let color;
		if ( obj.hasOwnProperty('yellow') ) {
				color = obj.color;
		} else {
			color = this.defaultColor;
		}
		this.context.fillStyle = color;
		this.context.fillRect(obj.position.x, obj.position.y, obj.width, obj.height);
	}
	
}

let g = new Game();

main.addEventListener('click', function() {
	g = new Game();
	this.classList.remove('show');
});