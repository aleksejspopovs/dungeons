// main roguelike logic
// 2010 no copyright -- mariofag
// free software is our future
var dungeon, temp, bgm;
var loaded = 0;
var toLoad = 9;
var intervalId = 0;
var errorCount = 0;
var exitChoice = 1;

player = new playerO("Anonymous", "bag", 25, 25, 3);
monsters = new Array();
mapTiles = new Array();
tPlayer = new Array();
tTerrains = new Array();


function resLoad() {
	loaded++;
	if (loaded >= toLoad) {
		document.getElementById("gamelog").value = "All the stuff succesfully loaded.";
		setTimeout(function () {newGame(1); }, 125);
	}
}

function init() {
	if (browserCheck()) {
		if (!window.localStorage.rows) window.localStorage.rows = 10;
		document.getElementById('gamelog').rows = window.localStorage.rows;
		document.getElementById('gamelog').value = "";
		canvas = document.getElementById('game');
		ctx = canvas.getContext('2d');
		ctx.font = "16px sans-serif";
		ctx.fillText("Please wait while all the necessary crap is loading...", 100, 210);
		
		mapTiles[MT_FLOOR] = ctx.createImageData(3,3); // floor
		for (var i = 0; i <= 35; i++) mapTiles[MT_FLOOR].data[i] = 255;
		mapTiles[MT_WALL] = ctx.createImageData(3,3); // wall
		for (var i = 0; i <= 35; i++) mapTiles[MT_WALL].data[i] = !((i+1) % 4) ? 255 : 0;
		mapTiles[MT_UNDEF] = ctx.createImageData(3,3); // undefined
		for (var i = 0; i <= 35; i++) mapTiles[MT_UNDEF].data[i] = (i+1)%4 ? 228 : 255;
		mapTiles[MT_PLAYER] = ctx.createImageData(3,3); // player
		for (var i = 0; i <= 35; i++) mapTiles[MT_PLAYER].data[i] = i % 2 ? 255 : 0;
		mapTiles[MT_MONSTER] = ctx.createImageData(3,3); // monster
		for (var i = 0; i <= 35; i++) mapTiles[MT_MONSTER].data[i] = !(i % 4) || !((i+1) % 4) ? 255 : 0;		
		mapTiles[MT_EXIT] = ctx.createImageData(3,3); // exit
		for (var i = 0; i <= 35; i++) mapTiles[MT_EXIT].data[i] = (i % 4 == 0) ? 0 : (i % 4 == 1) ? 127 : 255;		
		
		tTerrains[0] = new Image(); // Undefined (black)
		tTerrains[0].src = './images/undefined.png';
		tTerrains[0].onload = resLoad;
		tTerrains[1] = new Image(); // Floor
		tTerrains[1].src = './images/floor.png';
		tTerrains[1].onload = resLoad;
		tTerrains[2] = new Image(); // Wall
		tTerrains[2].src = './images/wall.png';
		tTerrains[2].onload = resLoad;
		tTerrains[3] = new Image(); // Exit
		tTerrains[3].src = './images/exit.png';
		tTerrains[3].onload = resLoad;
		tTerrains[4] = new Image(); // Wall corner
		tTerrains[4].src = './images/wall_corner.png';
		tTerrains[4].onload = resLoad;
		
		tPlayer[D_UP] = new Image(); // Player facing up
		tPlayer[D_UP].src = './images/'+player.image+'/up.png';
		tPlayer[D_UP].onload = resLoad;
		tPlayer[D_RIGHT] = new Image(); // Player facing right
		tPlayer[D_RIGHT].src = './images/'+player.image+'/right.png';
		tPlayer[D_RIGHT].onload = resLoad;
		tPlayer[D_DOWN] = new Image(); // Player facing down
		tPlayer[D_DOWN].src = './images/'+player.image+'/down.png';
		tPlayer[D_DOWN].onload = resLoad;
		tPlayer[D_LEFT] = new Image(); // Player facing left
		tPlayer[D_LEFT].src = './images/'+player.image+'/left.png';
		tPlayer[D_LEFT].onload = resLoad;
		
		tMonsters = new Array();
		for (var i = 1; i < monsterTypes.length; i++) {
			tMonsters[i] = new Array();
			tMonsters[i][D_UP] = new Image();
			tMonsters[i][D_UP].src = './images/monsters/'+monsterTypes[i].tile+'_up.png'; 
			tMonsters[i][D_UP].onload = resLoad;
			tMonsters[i][D_RIGHT] = new Image();
			tMonsters[i][D_RIGHT].src = './images/monsters/'+monsterTypes[i].tile+'_right.png';
			tMonsters[i][D_RIGHT].onload = resLoad;
			tMonsters[i][D_DOWN] = new Image();
			tMonsters[i][D_DOWN].src = './images/monsters/'+monsterTypes[i].tile+'_down.png';
			tMonsters[i][D_DOWN].onload = resLoad;
			tMonsters[i][D_LEFT] = new Image();
			tMonsters[i][D_LEFT].src = './images/monsters/'+monsterTypes[i].tile+'_left.png';
			tMonsters[i][D_LEFT].onload = resLoad;
			toLoad += 4;
		}
		
		bgm = new Audio("./music/"+music[rand(0, music.length-1)]);
		bgm.loop = true;
		if (!window.localStorage.bgm) window.localStorage.bgm = "off";
		document.getElementById("bgmButton").value = "music: "+window.localStorage.bgm;
		if (window.localStorage.bgm == "on") // erm... damn localStorage only works with strings, no booleans :(
			bgm.play();
		else
			bgm.pause();
		
	} else alert("sorry, but your browser is not supported");
}

function newGame(level) {
	if (level == 1) player = new playerO("Anonymous", "bag", 25, 25, 4);
	monsters = new Array();
	dungeon = generateDungeon(level);
	temp = 1;
	draw(); 
	if (navigator.appName == "Opera")
		document.onkeypress = turn;
	else 
		document.onkeydown = turn;
	log(player.name+" has entered the dungeon's "+getFloorString(level)+" floor.");
}

function draw() {
	var startX, startY;
	startX = Math.max(1, Math.min(51-G_WIDTH, player.x-10));
	startY = Math.max(1, Math.min(51-G_HEIGHT, player.y-7));
	for (var i = startX; i < startX + G_WIDTH; i++) {
		for (var j = startY; j < startY + G_HEIGHT; j++) {
			ctx.drawImage(tTerrains[dungeon[i][j].tile], (i-startX)*TILESIZE, (j-startY)*TILESIZE);
			if (dungeon[i][j].monster) { 
				ctx.drawImage(tMonsters[monsters[dungeon[i][j].monster].type][monsters[dungeon[i][j].monster].dir], (i-startX)*TILESIZE, (j-startY)*TILESIZE);
			}
		}
	}
	ctx.drawImage(tPlayer[player.dir], (player.x - startX)*TILESIZE, (player.y - startY)*TILESIZE);
	
	ctx.textAlign = "start";

	ctx.fillStyle = 'gray';
	ctx.fillRect(672, 0, 822, 480);

	ctx.fillStyle = 'white';
	ctx.font = "16px '04b03r'";
	ctx.fillText(player.name, 682, 18);
	
	ctx.strokeRect(682, 35, 130, 3);
	ctx.fillStyle = 'green';
	ctx.fillRect(682, 35, (player.hp / player.maxHp)*130, 3);

	ctx.strokeRect(682, 55, 130, 3);
	ctx.fillStyle = '#FFA000';
	ctx.fillRect(682, 55, (player.xp / ((player.lvl+1) * ((player.lvl) / 2) * LEVELMOD))*130, 3);

	ctx.fillStyle = 'white';
	ctx.font = "10px Visitor";
	ctx.fillText("level "+player.lvl, 682, 26);
	ctx.fillText(getFloorString(dungeon.level)+" floor", 747, 26);
	ctx.fillText(player.hp+"/"+player.maxHp+" HP", 682, 47);
	ctx.fillText(player.xp+"/"+((player.lvl+1) * ((player.lvl) / 2) * LEVELMOD)+" XP", 682, 67);
	ctx.fillText("ATT: "+player.attack, 682, 78);
	ctx.fillText("DEF: "+player.defence, 747, 78);
	ctx.fillText("X;Y: "+player.x+";"+player.y, 682, 105);
	
	for (i = 1; i <= 50; i++) {
		for (j = 1; j <= 50; j++) {
			ctx.putImageData(
				mapTiles[dungeon[i][j].known ? (dungeon[i][j].tile == T_EXIT ? MT_EXIT : dungeon[i][j].monster ? MT_MONSTER : (dungeon[i][j].pass ? MT_FLOOR : MT_WALL)) : MT_UNDEF],
				672+((i-1)*3),
				330+((j-1)*3)
			);
		}
	}
	ctx.putImageData(mapTiles[MT_PLAYER], 672+((player.x-1)*3), 330+((player.y-1)*3));
	
}

function attack(att, def) {
	att.dir = att.x == def.x ? (att.y == def.y+1 ? 1 : 3) : att.x == def.x+1 ? 4 : 2;
	switch (att.dir) {
		case 1: 
			def.dir = 3;
		break; 
		case 2: 
			def.dir = 4;
		break;
		case 3:
			def.dir = 1;
		break;
		case 4:
			def.dir = 2;
		break;
	} 
	var success = att.attack > def.defence ? 1 : Math.random() - ((def.defence - att.attack) * Math.random());
	if (success > 0.2) {
		var damage = Math.round(Math.abs(Math.random() * 2 * att.attack));
		def.hp -= damage;
		log(att.name+' has attacked '+def.name+' and done '+damage+' points of damage.');
	} else {
		log(att.name+' has tried to attack '+def.name+', but missed!');
	}
	if (def.hp < 1) {
		log(def.name+' died.');
		def.dead();
	}
}

function turn(event) {
	var nX = player.x;
	var nY = player.y;
	switch (event.keyCode) {
		case 0x25:
			player.dir = D_LEFT;
			event.preventDefault();
			nX--;
		break;
		case 0x26:
			player.dir = D_UP;
			event.preventDefault();
			nY--;
		break;
		case 0x27:
			player.dir = D_RIGHT;
			event.preventDefault();
			nX++;
		break;
		case 0x28:
			player.dir = D_DOWN;
			event.preventDefault();
			nY++;
		break;
		case 0x0D:
		break;
		default:
			nX = -1;
		break;
	}

	if (nX != -1 && !event.shiftKey) {
    if (dungeon[nX][nY].pass) {
      if (dungeon[nX][nY].monster) {
        attack(player, monsters[dungeon[nX][nY].monster]); // player bumped in a monster
      } else {
        player.x = nX;
        player.y = nY;
        
        player.hp += rand(0,1);
        if (player.hp > player.maxHp) player.hp = player.maxHp;
        
        if (player.dir == D_LEFT || player.dir == D_RIGHT) { // TODO: completely rewrite this piece of shit
          if ((player.x + (player.dir == D_LEFT ? -10 : 10) <= 50) && (player.x + (player.dir == D_LEFT ? -10 : 10) >= 1)) {
            for (var i = (player.y-7 < 1 ? 1 : player.y-7); i <= (player.y+7 > 50 ? 50 : player.y+7); i++) dungeon[player.x + (player.dir == 4 ? -10 : 10)][i].known = true;
          }
        } else {
          if ((player.y + (player.dir == D_UP ? -7 : 7) <= 50) && (player.y + (player.dir == D_UP ? -7 : 7) >= 1)) {
            for (var i = (player.x-10 < 1 ? 1 : player.x-10); i <= (player.x+10 > 50 ? 50 : player.x+10); i++) dungeon[i][player.y + (player.dir == 1 ? -7 : 7)].known = true;
          }
        }
      }
    } else {
      if (dungeon[nX][nY].tile == T_EXIT)
        levelExit(true);
    }
    if (dungeon[nX][nY].pass || dungeon[nX][nY].tile == T_EXIT) {
      for (var i = 1; i < monsters.length; i++) { // AI players take their turns
        if (monsters[i].hp > 0 && player.hp > 0) 
          monsters[i].takeTurn(); // if monster is not dead, make him take his turn
      }
    }
  }
  if (nX != -1 && dungeon[nX][nY].tile != T_EXIT) // I know that (nX != 1) appears in both if's, however, i thought this would be better for readability (less tabs) 
    draw();
}

function levelExitKeyHandler(e) {
	switch (e.keyCode) {
		case 0x26:
			if (exitChoice > 1) exitChoice--;
			e.preventDefault();
		break;
		case 0x28:
			if (exitChoice < 3) exitChoice++;
			e.preventDefault();
		break;
		case 0x0D:
			switch (exitChoice) {
				case 1:
					if (navigator.appName == "Opera")
						document.onkeypress = turn;
					else 
						document.onkeydown = turn;
					draw();
				break;
				case 2:
					log(player.name + " has decided to get deeper into this dungeon.");
					newGame(dungeon.level + 1);
				break;
				case 3:
					alert("sorry, shop isn't implemented yet :(");
				break;
			}
		break;
	}
	if (e.keyCode != 0x0D) levelExit(false);
}

function levelExit(full) {
	if (full) {
		if (navigator.appName == "Opera")
			document.onkeypress = levelExitKeyHandler;
		else 
			document.onkeydown = levelExitKeyHandler;
		exitChoice = 1;
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, 672, 480);
		ctx.fillStyle = 'white';
		ctx.textAlign = "center";
		ctx.font = "32pt '04b03r'";
		ctx.fillText("Escape dungeon", 336, 50);
		ctx.font = "12pt '04b03r'";
		ctx.textAlign = "left";
		ctx.fillText("What do you want to do?", 10, 90);
	}
	ctx.font = "12pt '04b03r'";
	ctx.fillStyle = 'black';
	ctx.fillRect(450, 75, 222, 65);	
	ctx.textAlign = "left";
	ctx.fillStyle = 'white';
	ctx.fillText("Stay", 662-ctx.measureText("Shop and leave").width, 90);
	ctx.fillText("Leave", 662-ctx.measureText("Shop and leave").width, 110);
	ctx.fillText("Shop and leave", 662-ctx.measureText("Shop and leave").width, 130);
	ctx.fillText(">", 662-ctx.measureText("Shop and leave").width-10, 70 + 20*exitChoice);
}
