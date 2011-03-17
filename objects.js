// roguelike object declaring code
// 2010 no copyright -- mariofag
// free software is our future

function dungeonTile(tile, passable, monster, item) {
	this.tile = tile;
	this.pass = passable;
	this.monster = monster;
	this.item = item;
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
  this.see = function (whom) {
    return ((Math.abs(this.x - whom.x) <= 9) && (Math.abs(this.y - whom.y) <= 9));
  }
	this.takeTurn = function () {
		if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) == 1) {
			attack(this, player); // if player is near, attack him
		} else {
			var step;
			if (!this.see(player) || !(step = this.findPath(player.x, player.y))) { // if the monster doesn't see player, or can't get to him
				var dir = rand(1,4);
        tries = 0;
				while ((
					((this.x + xOff[dir]) > LEVELSIZE) || ((this.x + xOff[dir]) < 1) || ((this.y + yOff[dir]) > LEVELSIZE) || ((this.y + yOff[dir]) < 1) || 
					!dungeon[this.x + xOff[dir]][this.y + yOff[dir]].pass || dungeon[this.x + xOff[dir]][this.y + yOff[dir]].monster
				) && tries < 5) { // 5 is here just for it to be easier to check whether monster found a way or not
					dir = dir % 4 + 1;
          tries++;
				}
        if (tries == 5)
          step = null;
        else
          step = new coords(this.x + xOff[dir], this.y + yOff[dir], dir);
			}
      if (step != null) {
        dungeon[this.x][this.y].monster = false;
        this.x = step.x;
        this.y = step.y;
        this.dir = step.dir;
        dungeon[this.x][this.y].monster = this.id;
      } // else monster can't do anything (so he doesn't do anything)
		}
	}
	this.dead = function () {
		dungeon[this.x][this.y].monster = 0;
		player.xp += (player.lvl - this.lvl + 2) * rand(monsterTypes[this.type].modMin, monsterTypes[this.type].modMax);
		while (player.xp >= ((player.lvl+1) * ((player.lvl) / 2) * LEVELMOD)) {
			player.lvl++;
			log(player.name+" has leveled up! His level is now "+player.lvl+".");
			player.maxHp += (((player.lvl+1)*player.lvl)/2) * 3;
			player.attack = Math.round(Math.random()*3+5) * player.lvl;
			player.defence = Math.round(Math.random()*3+5) * player.lvl;
		}
	}
	this.findPath = function (tX, tY) {
		var queue = new Array();
		var cost = new Array();
		for (var i = 1; i <= 50; i++) {
			cost[i] = new Array();
			for (var j = 1; j <= 50; j++) cost[i][j] = Infinity;
		}
		var curX, curY, mvX, mvY;
		var r = 1; // index of the queue element being read
		var w = 2; // index of the first empty queue element
		cost[tX][tY] = 0;
		queue[1] = new coords(tX, tY, 0);
		while (r != w) {
			curX = queue[r].x;
			curY = queue[r].y;
			for (i = 1; i <= 4; i++) {
				mvX = curX + xOff[i];
				mvY = curY + yOff[i];
				if ((mvX <= 50) && (mvX >= 1) && (mvY <= 50) && (mvY >= 1) && 
						(cost[mvX][mvY] > cost[curX][curY]+1) && (dungeon[mvX][mvY].pass) && 
						(!dungeon[mvX][mvY].monster || (mvX == this.x && mvY == this.y))) { // this.x;this.y is a monster obviously, so we should check for that
					cost[mvX][mvY] = cost[curX][curY]+1;
					queue[w] = new coords(mvX, mvY, 0);
					w++;
					if ((mvX == this.x) && (mvY == this.y)) {
						return new coords(curX, curY, (i == 1) ? 3 : (i == 2 ? 4 : (i == 3 ? 1 : 2)));
					}
				}
			}
			r++;
		}
		return false;
	}
}
function monsterType(tile, name, desc, artist, modMin, modMax) {
	this.tile = tile;
	this.name = name;
	this.desc = desc;
	this.artist = artist;
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
		this.hp = 0;
		log("You're dead, GAME OVER.");
		gameOver(false);
	}
}
function item(type, subtype) {
	this.type = type;
	this.subtype = subtype;
}
function coords(x, y, dir) {
	this.x = x;
	this.y = y;
	this.dir = dir;
}
