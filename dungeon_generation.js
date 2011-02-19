// roguelike dungeon generating code
// 2010 no copyright — mariofag
// free software is our future

function generateDungeon() {
	function treeGrid(startX, startY, endX, endY) {
		this.startX = startX;
		this.startY = startY;
		this.endX = endX;
		this.endY = endY;
	}
	function walker(x, y) {
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
	function diffFill(cell) {
		var x = 0;
		dun[Math.round((cell.endX + cell.startX)/2)][Math.round((cell.endY + cell.startY)/2)] = new dungeonTile(1, true, 0);
		while (x < ((cell.endX-cell.startX)*(cell.endY-cell.startY))/2) {
			var walkers = new Array();
			for (var i = 0; i < 5; i++) {
				walkers[i] = new walker(rand(cell.startX+1, cell.endX-1), rand(cell.startY+1, cell.endY-1));
			}
			var cont = true;
			while (cont) {
				cont = false;
				for(var i = 0; i < 5; i++) {
					if (!walkers[i].dead) {
						walkers[i].moveTo(Math.round(Math.random()*3+1), 0, 4, cell.startX+1, cell.endX-1, cell.startY+1, cell.endY-1, true);
						if (dun[walkers[i].x-1][walkers[i].y].pass || dun[walkers[i].x+1][walkers[i].y].pass || dun[walkers[i].x][walkers[i].y-1].pass || dun[walkers[i].x][walkers[i].y+1].pass) {
							dun[walkers[i].x][walkers[i].y].pass = true;
							dun[walkers[i].x][walkers[i].y].tile = 1;
							walkers[i].dead = true;
							x++;
						}
					}
				}
				if (x > ((cell.endX-cell.startX)*(cell.endY-cell.startY))/2) break;
			}
		}		
	}
	function connect(from, to) {
		function rand2(a,b) {
			var choice = new Array(a,b);
			return choice[rand(0,1)];
		}
		var w = new walker(Math.round((from.endX + from.startX)/2), Math.round((from.endY + from.startY)/2));
		var toX = Math.round((to.endX + to.startX)/2);
		var toY = Math.round((to.endY + to.startY)/2);
		
		while ((w.x != toX) || (w.y != toY)) {
			w.moveTo((w.x > toX) ? (w.y > toY ? rand2(1,4) : rand2(3,4)) : (w.y > toY ? rand2(1,2) : rand2(2,3))
			, 0, 4, 1, 50, 1, 50, false);
			dun[w.x][w.y].tile = 1;
			dun[w.x][w.y].pass = true;
		}
	}	
	var tree = new Array();
	tree[1] = new treeGrid(1, 1, 50, 50);
	
	for (var i = 2; i <= 31; i += 2) {
		if (rand(0,1)) {
			tree[i] = new treeGrid(tree[Math.floor(i/2)].startX, 
				tree[Math.floor(i/2)].startY,
				Math.floor(tree[Math.floor(i/2)].startX + ((tree[Math.floor(i/2)].endX - tree[Math.floor(i/2)].startX + 1)* (rand(45,55)/100))),
				tree[Math.floor(i/2)].endY);
			tree[i+1] = new treeGrid(tree[i].endX, tree[i].startY, tree[Math.floor(i/2)].endX, tree[Math.floor(i/2)].endY);
		} else {
			tree[i] = new treeGrid(tree[Math.floor(i/2)].startX,
				tree[Math.floor(i/2)].startY,
				tree[Math.floor(i/2)].endX,
				Math.floor(tree[Math.floor(i/2)].startY + ((tree[Math.floor(i/2)].endY - tree[Math.floor(i/2)].startY + 1)* (rand(45,55)/100))));
			tree[i+1] = new treeGrid(tree[i].startX, tree[i].endY, tree[Math.floor(i/2)].endX, tree[Math.floor(i/2)].endY);
		}
	}
	
	var dun = new Array();
	for (var i=0; i <= 51; i++) {
		dun[i] = new Array();
		for (var j=0; j <= 51; j++) {
			dun[i][j] = new dungeonTile(2, false, 0);
		}
	}	
	
	for (var i = 16; i <= 31; i++) diffFill(tree[i]);
	for (var i = 4; i >= 0; i--) {
		for (var j = Math.pow(2, i); j <= Math.pow(2, i+1)-1; j += 2) connect(tree[j], tree[j+1]);
	}
	player.x = Math.floor((tree[24].startX + tree[24].endX) / 2);
	player.y = Math.floor((tree[24].startY + tree[24].endY) / 2);
	for (var i = (player.x-10 < 1 ? 1 : player.x-10); i <= (player.x+10 > 50 ? 50 : player.x+10); i++) {
		for (var j = (player.y-7 < 1 ? 1 : player.y-7); j <= (player.y+7 > 50 ? 50 : player.y+7); j++) {
			dun[i][j].known = true;
		}
	}
	j = 1;
	for (var i = rand(16,18); i <= 31; i += rand(1,3)) {
		if (i != 24) {
			monsters[j] = new monster(j, rand(1, monsterTypes.length-1), 1, Math.floor((tree[i].startX + tree[i].endX)/2), Math.floor((tree[i].startY + tree[i].endY)/2), 3);
			dun[Math.floor((tree[i].startX + tree[i].endX)/2)][Math.floor((tree[i].startY + tree[i].endY)/2)].monster = j;
			j++;
		}
	}
	return dun;
}