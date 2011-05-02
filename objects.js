// object declaring code for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

function DungeonTile(tile, passable, monster, item) {
	this.tile = tile;
	this.pass = passable;
	this.monster = monster;
	this.item = item;
	this.known = false;
}
function Monster(id, type, lvl, mX, mY, dir) {
	this.id = id;
	this.type = type;
	this.lvl = lvl;
	this.x = mX;
	this.y = mY;
	this.dir = dir;
	this.maxHp = monsterTypes[type].hp;
	this.attack = monsterTypes[type].att;
	this.defence = monsterTypes[type].def;
  for (var i = 2; i <= lvl; i++) {
    this.maxHp += (((player.lvl+1)*player.lvl)/2) * 3;
    this.attack = Math.round(player.attack * (1 + randHalf()));
    this.defence = Math.round(player.defence * (1 + randHalf()));    
  }
  this.hp = this.maxHp;
	this.name = monsterTypes[type].name;
  this.getAtt = function () {
    return this.attack;
  }
  this.getDef = function () {
    return this.defence;
  }
  this.see = function (whom) { // checks whether a monster can see someone or not
    return ((Math.abs(this.x - whom.x) <= 9) && (Math.abs(this.y - whom.y) <= 9));
  }
	this.takeTurn = function () { // AI
		if (Math.abs(this.x - player.x) + Math.abs(this.y - player.y) == 1) {
			attack(this, player); // if player is near, attack him
		} else {
			var step;
			if (!this.see(player) || !(step = this.findPath(player.x, player.y))) { // if the monster doesn't see player, or can't get to him
				var dir = rand(1,4);
        tries = 0;
				while ((
					!checkCoords(this.x + xOff[dir], this.y + yOff[dir]) || !dungeon[this.x + xOff[dir]][this.y + yOff[dir]].pass || dungeon[this.x + xOff[dir]][this.y + yOff[dir]].monster
				) && tries < 5) { // 5 is here just for it to be easier to check whether monster found a way or not
					dir = dir % 4 + 1;
          tries++;
				}
        if (tries == 5)
          step = null;
        else
          step = new Coords(this.x + xOff[dir], this.y + yOff[dir], dir);
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
    if ((this.lvl - player.lvl) > 0) {
      player.xp += randH(2, 4) * (this.lvl - player.lvl);
    } else {
      player.xp += Math.ceil(0.5 * (player.lvl - this.lvl + 1));
    }
		while (player.xp >= player.toNextLvl)
			player.levelUp();
	}
	this.findPath = function (tX, tY) { // finds a Coords object that is the first step on path to (tX,tY) (or false if there's no such path)
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
		queue[1] = new Coords(tX, tY, 0);
		while (r != w) {
			curX = queue[r].x;
			curY = queue[r].y;
			for (i = 1; i <= 4; i++) {
				mvX = curX + xOff[i];
				mvY = curY + yOff[i];
				if (checkCoords(mvX, mvY) && 
						(cost[mvX][mvY] > cost[curX][curY]+1) && (dungeon[mvX][mvY].pass) && 
						(!dungeon[mvX][mvY].monster || (mvX == this.x && mvY == this.y))) { // this.x;this.y is a monster obviously, so we should check for that
					cost[mvX][mvY] = cost[curX][curY]+1;
					queue[w] = new Coords(mvX, mvY, 0);
					w++;
					if ((mvX == this.x) && (mvY == this.y)) {
						return new Coords(curX, curY, (i == 1) ? 3 : (i == 2 ? 4 : (i == 3 ? 1 : 2)));
					}
				}
			}
			r++;
		}
		return false;
	}
}
function MonsterType(tile, name, desc, artist, hp, att, def) {
	this.tile = tile;
	this.name = name;
	this.desc = desc;
	this.artist = artist;
	this.hp = hp;
  this.att = att;
  this.def = def;
}
function itemRecord(itemId, inventoryId) {
	this.itemId = itemId;
	this.inventoryId = inventoryId;
}

function Player(name, image, x, y, dir) {
	this.name = name;
	this.image = image;
	this.x = x;
	this.y = y;
	this.dir = dir;
	this.xp = 0;
	this.lvl = 1;
  this.toNextLvl = 20;
	this.maxHp = 50;
	this.hp = this.maxHp;
	this.attack = 5;
	this.defence = 5;
  this.attBonus = 0;
  this.defBonus = 0;
  this.getAtt = function () {
    return this.attack + this.attBonus;
  }
  this.getDef = function () {
    return this.defence + this.defBonus;
  }
	this.dead = function () { // tells player he's dead and finishes the game
		this.hp = 0;
		log("You're dead, GAME OVER.");
		gameOver(false);
	}
  this.addHp = function (n) { // adds n HP to the player
    this.hp += n;
    if (this.hp > this.maxHp)
      this.hp = this.maxHp;
  }
  this.levelUp = function () { // levels up the player
    player.lvl++;
    log(player.name+" has leveled up! His level is now "+player.lvl+".");
    player.toNextLvl += Math.round((player.lvl+3)*(player.lvl+2) / 2);
    player.maxHp += (((player.lvl+1)*player.lvl)/2) * 3;
    player.attack = Math.round(player.attack * (1 + randHalf()));
    player.defence = Math.round(player.defence * (1 + randHalf()));
  }
  this.inventory = new Array(undefined);
 	this.lastInventoryId = 0;
  this.giveItem = function (item) {
    this.inventory = this.inventory.concat([new itemRecord(item, ++this.lastInventoryId)]);
    this.inventory.sort(itemRecordCompare);
    this.inventory.pop();
    this.inventory = [undefined].concat(this.inventory); // sorry for this dirty hack,
                                                         // I just love 1-based arrays sooo much <3
  }
  this.deleteItem = function (item) {
		delete this.inventory[item];
		this.inventory.sort(itemRecordCompare);
		this.inventory.pop(); this.inventory.pop();
		this.inventory = [undefined].concat(this.inventory);
	}
	this.хуйня = new Array(); // sorry, couldn't find another way to call all the stuff that player's wearing
}
function Coords(x, y, dir) {
	this.x = x;
	this.y = y;
	this.dir = dir;
}
function ItemAction(name, desc, use) {
  this.name = name;
  this.desc = desc;
  this.use = use; // is a function that should be passed a Player object
}
function ItemArmor(name, desc, slot, bonus) {
  this.name = name;
  this.desc = desc;
  this.slot = slot;
  this.bonus = bonus;
  this.wear = function (player) {
    player.defBonus += this.bonus;
  }
  this.unWear = function (player) {
    player.defBonus -= this.bonus;
  }
}
function ItemWeapon(name, desc, bonus) {
  this.name = name;
  this.desc = desc;
  this.bonus = bonus;
  this.wear = function (player) {
    player.attBonus += this.bonus;
  }
  this.unWear = function (player) {
    player.attBonus -= this.bonus;
  }
}
