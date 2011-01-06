// roguelike object declaring code
// 2010 no copyright — mariofag
// free software is our future

function dungeonTile(tile, passable, monster) {
  this.tile = tile;
  this.pass = passable;
  this.monster = monster;
  this.known = false;
}
function monster(id, type, lvl, mX, mY, dir) {
	this.id = id;
	this.type = type;
	this.lvl = lvl;
	this.x = mX;
	this.y = mY;
	this.dir = dir;
	this.hp = this.lvl * (this.lvl+1) / 2 * rand(monsterTypes[type].modMin*3, monsterTypes[type].modMin*3);
	this.attack = this.lvl * (this.lvl+1) / 2 * rand(monsterTypes[type].modMin, monsterTypes[type].modMin);
	this.defence = this.lvl * (this.lvl+1) / 2 * rand(monsterTypes[type].modMin, monsterTypes[type].modMin);
	this.name = monsterTypes[type].name;
	this.moveTo = function (dir, i, limit) {
		var xOff = new Array(0, 0, 1, 0, -1);
		var yOff = new Array(0, -1, 0, 1, 0);
		if ((dungeon[this.x + xOff[dir]][this.y + yOff[dir]].pass) && !(dungeon[this.x + xOff[dir]][this.y + yOff[dir]].monster)) {
			dungeon[this.x][this.y].monster = 0;
			this.x += xOff[dir];
			this.y += yOff[dir];
			dungeon[this.x][this.y].monster = this.id;
			this.dir = dir;						
		} else if (i < limit) {
			this.moveTo((dir + 1) % 5, i+1, limit);
		}
	}
	this.takeTurn = function () {
		if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) == 1) {
			attack(this, player); // if player is near, attack him
		} else {
			if ((((this.x - 9) <= player.x) && ((this.x + 9) >= player.x)) && (((this.y - 9) <= player.y) && ((this.y + 9) >= player.y))) { // if can see player, go in his direction
				//this.moveTo(player.x == this.x ? (player.y > this.y ? 3 : 1) : (player.x > this.x ? 2 : 4), 1, 4);
				this.moveTo(pathFinding(this.x, this.y, player.x, player.y), 1, 4)
			} else  { // else go randomly
				this.moveTo(rand(1,4), 1, 4);
			}				
			draw();
		}
	}
	this.dead = function () {
		dungeon[this.x][this.y].monster = 0;
		player.xp += (player.lvl - this.lvl + 2) * rand(monsterTypes[this.type].modMin, monsterTypes[this.type].modMax);	
		if (player.xp >= ((player.lvl+1) * ((player.lvl) / 2) * LEVELMOD)) {
			player.lvl++;
			log(player.name+" has leveled up! His level is now "+player.lvl+".");
			player.maxHp += (((player.lvl+1)*player.lvl)/2) * 3;
			player.attack = Math.round(Math.random()*3+5) * player.lvl;
			player.defence = Math.round(Math.random()*3+5) * player.lvl;
		}
	}
}
function monsterType(tile, name, desc, modMin, modMax) {
	this.tile = tile;
	this.name = name;
	this.desc = desc;
	this.modMin = modMin;
	this.modMax = modMax;
}
function playerO(name, image, x, y, dir) {
	this.name = name;
	this.image = image;
	this.x = x;
	this.y = y;
	this.dir = dir;
	this.xp = 0;
	this.lvl = 1;
	this.maxHp = 50;
	this.hp = this.maxHp;
	this.attack = Math.round(Math.random()*3+5);
	this.defence = Math.round(Math.random()*3+5);
	this.dead = function () {
		player.hp = 0;
		log("You're dead, GAME OVER");
		gameOver(false);
	}
}
