// dungeon generating code for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

function Dungeon(level) {
	function TreeGrid(startX, startY, endX, endY) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
	}
	function Walker(dun, x, y) {
		this.x = x;
		this.y = y;
		this.dead = false;
		this.moveTo = function (dir, i, limit, xMin, xMax, yMin, yMax, check) {
			var tempX = this.x + xOff[dir];
			var tempY = this.y + yOff[dir];
			if (tempX > xMax || tempY > yMax || tempX < xMin || tempY < yMin || (check && dun[tempX][tempY].pass)) {
				if (i < limit) {
					this.moveTo((dir + 1) % 5, i+1, limit, xMin, xMax, yMin, yMax, check);
				}
			} else {
				this.x = tempX;
				this.y = tempY;
			}
		}
	}
	function diffFill(dun, cell) {
		var x = 0;
		dun[Math.round((cell.endX + cell.startX)/2)][Math.round((cell.endY + cell.startY)/2)] = new DungeonTile(T_FLOOR, true);
		while (x < ((cell.endX-cell.startX)*(cell.endY-cell.startY))/2) {
			var walkers = new Array();
			for (var i = 0; i < 5; i++) {
				walkers[i] = new Walker(dun, rand(cell.startX+1, cell.endX-1), rand(cell.startY+1, cell.endY-1));
			}
			var cont = true;
			while (cont) {
				cont = false;
				for(var i = 0; i < 5; i++) {
					if (!walkers[i].dead) {
						walkers[i].moveTo(rand(1,4), 0, 4, cell.startX+1, cell.endX-1, cell.startY+1, cell.endY-1, true);
						if (dun[walkers[i].x-1][walkers[i].y].pass || dun[walkers[i].x+1][walkers[i].y].pass || dun[walkers[i].x][walkers[i].y-1].pass || dun[walkers[i].x][walkers[i].y+1].pass) {
							dun[walkers[i].x][walkers[i].y].pass = true;
							dun[walkers[i].x][walkers[i].y].tile = T_FLOOR;
							walkers[i].dead = true;
							x++;
						}
					}
				}
				if (x > ((cell.endX-cell.startX)*(cell.endY-cell.startY))/2) break;
			}
		}		
	}
	function connect(dun, from, to) {
		function rand2(a,b) {
			var choice = new Array(a,b);
			return choice[rand(0,1)];
		}
		var w = new Walker(dun, Math.round((from.endX + from.startX)/2), Math.round((from.endY + from.startY)/2));
		var toX = Math.round((to.endX + to.startX)/2);
		var toY = Math.round((to.endY + to.startY)/2);
		
		while ((w.x != toX) || (w.y != toY)) {
			w.moveTo((w.x > toX) ? (w.y > toY ? rand2(1,4) : rand2(3,4)) : (w.y > toY ? rand2(1,2) : rand2(2,3))
			, 0, 4, 1, 50, 1, 50, false);
			dun[w.x][w.y].tile = T_FLOOR;
			dun[w.x][w.y].pass = true;
		}
	}	
	
	var tree = new Array();
	tree[1] = new TreeGrid(1, 1, 50, 50);
	
	for (var i = 2; i <= 31; i += 2) {
		if (rand(0,1)) {
			tree[i] = new TreeGrid(tree[Math.floor(i/2)].startX, 
				tree[Math.floor(i/2)].startY,
				Math.floor(tree[Math.floor(i/2)].startX + ((tree[Math.floor(i/2)].endX - tree[Math.floor(i/2)].startX + 1)* (rand(45,55)/100))),
				tree[Math.floor(i/2)].endY);
			tree[i+1] = new TreeGrid(tree[i].endX, tree[i].startY, tree[Math.floor(i/2)].endX, tree[Math.floor(i/2)].endY);
		} else {
			tree[i] = new TreeGrid(tree[Math.floor(i/2)].startX,
				tree[Math.floor(i/2)].startY,
				tree[Math.floor(i/2)].endX,
				Math.floor(tree[Math.floor(i/2)].startY + ((tree[Math.floor(i/2)].endY - tree[Math.floor(i/2)].startY + 1)* (rand(45,55)/100))));
			tree[i+1] = new TreeGrid(tree[i].startX, tree[i].endY, tree[Math.floor(i/2)].endX, tree[Math.floor(i/2)].endY);
		}
	}
	
	for (var i=0; i <= 51; i++) {
		this[i] = new Array();
		for (var j=0; j <= 51; j++) {
			this[i][j] = new DungeonTile(T_WALL, false);
		}
	}
	
	for (var i = 16; i <= 31; i++) 
		diffFill(this, tree[i]);
	
	monsters = new Array();
	
	// connecting rooms
	for (var i = 4; i >= 0; i--) {
		for (var j = Math.pow(2, i); j <= Math.pow(2, i+1)-1; j += 2) 
			connect(this, tree[j], tree[j+1]);
	}
	
	// placing the player
	var playerCell = rand(16, 31);
	player.x = Math.floor((tree[playerCell].startX + tree[playerCell].endX) / 2);
	player.y = Math.floor((tree[playerCell].startY + tree[playerCell].endY) / 2);
	for (var i = (player.x-10 < 1 ? 1 : player.x-10); i <= (player.x+10 > 50 ? 50 : player.x+10); i++) {
		for (var j = (player.y-7 < 1 ? 1 : player.y-7); j <= (player.y+7 > 50 ? 50 : player.y+7); j++) {
			this[i][j].known = true;
		}
	}

	// placing exit
	do {
		i = rand(16, 31); 
	} while (i == playerCell);
	w = new Walker(this, Math.floor((tree[i].startX + tree[i].endX)/2), Math.floor((tree[i].startY + tree[i].endY)/2));
	while (this[w.x][w.y].pass) {
		w.moveTo(rand(1, 4), 0, 4, 1, 50, 1, 50, false);
	}
	this[w.x][w.y].tile = T_EXIT;

	// placing stuff like monsters, items & gold
	for (i = 16; i <= 31; i++) {
		stuff = rand(-1, 3);
		for (j = 1; j <= stuff; j++) {
			do {
				x = rand(tree[i].startX, tree[i].endX);
				y = rand(tree[i].startY, tree[i].endY);
			} while (!this[x][y].pass || (this[x][y].monster != -1) || (this[x][y].item != -1) || (this[x][y].gold));
			switch (rand(0, 4)) {
				case 0: // monster
				case 1:
					this[x][y].monster = monsters.length;
					monsters[monsters.length] = new Monster(monsters.length, rand(0, monsterTypes.length-1), level, x, y, D_DOWN);
				break;
				case 2: // item
				case 3:
					this[x][y].item = rand(0, items.length-1);
				break;
				case 4: // gold
					this[x][y].gold = rand(level*4, level*10);
				break;
			}			
		}
	}


	// converting some walls to wall corners
	for (i=1; i<=50; i++) {
		for (j=1; j<=50; j++) {
			if (this[i][j].tile == T_WALL && (this[i][j+1] == undefined || this[i][j+1].tile != T_WALL)) {
				this[i][j].tile = T_WALLC;
			}
		}
	}
	this.level = level;
}
