// roguelike object declaring code
// 2010 no copyright — mariofag
// free software is our future

function dungeonTile(tile, passable, monster) {
  this.tile = tile;
  this.pass = passable;
  this.monster = monster;
}
function monster(id, type, mX, mY, dir) {
	this.id = id;
	this.type = type;
	this.x = mX;
	this.y = mY;
	this.dir = dir;
	this.hp = monsterTypes[type].hp;
	this.attack = monsterTypes[type].attack;
	this.defence = monsterTypes[type].defence;
	this.name = monsterTypes[type].name;
	dungeon[mX][mY].monster = id;
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
				this.moveTo(player.x == this.x ? (player.y > this.y ? 3 : 1) : (player.x > this.x ? 2 : 4), 1, 4);
				draw();
			} else  { // else go randomly
				this.moveTo(Math.round(Math.random()*3)+1, 1, 4);
				draw();
			}
		}
	}
	this.dead = function () {
		dungeon[this.x][this.y].monster = 0;
	}
}
function monsterType(tile, name, desc, hp, attack, defence) {
	this.tile = tile;
	this.name = name;
	this.desc = desc;
	this.hp = hp;
	this.attack = attack;
	this.defence = defence;
}
function player(name, image, x, y, dir, hp, maxhp, attack, defence) {
	this.name = name;
	this.image = image;
	this.x = x;
	this.y = y;
	this.dir = dir;
	this.hp = hp;
	this.maxHp = maxhp;
	this.attack = attack;
	this.defence = defence;
	this.dead = function () {
		player.hp = 0;
		log("You're dead, GAME OVER");
		gameOver(false);
	}
}
function rand(a,b) {
	if (a > b) {
		x = a;
		a = b;
		b = a;
	}
	return Math.round(Math.random()*(b-a))+parseInt(a);
}