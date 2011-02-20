// main roguelike logic
// 2010 no copyright — mariofag
// free software is our future
var dungeon;
var temp;
var loaded = 0;
var toLoad = 7;
var intervalId = 0;
var errorCount = 0;

/* CONST */
const LEVELMOD = 6;
const TILESIZE = 32;
const G_WIDTH = 21;
const G_HEIGHT = 15;

const D_UP = 1; // tile directions
const D_DOWN = 3;
const D_RIGHT = 2;
const D_LEFT = 4;

const MT_FLOOR = 1; // These are minimap tile IDs
const MT_WALL = 2;
const MT_UNDEF = 3;
const MT_PLAYER = 4;
const MT_MONSTER = 5;

const xOff = new Array(0, 0, 1, 0, -1);
const yOff = new Array(0, -1, 0, 1, 0);

monsterTypes = new Array();
monsterTypes[1] = new monsterType("troll", "Troll", "A normal, fat and green troll.", 2, 3);
monsterTypes[2] = new monsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", 1, 2);
monsterTypes[3] = new monsterType("wdoom", "Winged Doom", "", 80, 80);
monsterTypes[4] = new monsterType("cancer", "Cancer", "He's the one killing /b/", 10, 10);
//monsterTypes[5] = new monsterType("pedo", "Pedobear", "And I don't care what people say, and I don't care what people think, and I don't care how we look walking down the street, I love little girls they make me feel so good. ", 10, 20);

player = new playerO("Anonymous", "bag", 25, 25, 3);
monsters = new Array();
mapTiles = new Array();
tPlayer = new Array();
tTerrains = new Array();


function resLoad() {
	loaded++;
	if (loaded >= toLoad) {
		document.getElementById("gamelog").value = "All the stuff succesfully loaded.";
		setTimeout(newGame, 125);
	}
}

function init() {
	if (browserCheck()) {
		if (!window.localStorage.rows) window.localStorage.rows = 10;
		if (!window.localStorage.errorDisplay) window.localStorage.errorDisplay = "none";
		if (!window.localStorage.debugDisplay) window.localStorage.debugDisplay = "none";
		document.getElementById('gamelog').rows = window.localStorage.rows;
		document.getElementById('gamelog').value = "";
		document.getElementById('errorlog').style.display = window.localStorage.errorDisplay;
		document.getElementById('debuglog').style.display = window.localStorage.debugDisplay;
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
		
		tTerrains[0] = new Image(); // Undefined (black)
		tTerrains[0].src = './images/undefined.png';
		tTerrains[0].onload = resLoad;
		tTerrains[1] = new Image(); // Floor
		tTerrains[1].src = './images/floor.png';
		tTerrains[1].onload = resLoad;
		tTerrains[2] = new Image(); // Wall
		tTerrains[2].src = './images/wall.png';
		tTerrains[2].onload = resLoad;
		
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
	} else alert("sorry, but your browser is not supported");
}

function newGame() {
	player = new playerO("Anonymous", "bag", 25, 25, 3, 100, 100, 30, 15);
	monsters = new Array();
	dungeon = generateDungeon();
	temp = 1;
	draw(); 
	if (navigator.appName == "Opera")
		document.onkeypress = turn;
	else 
		document.onkeydown = turn;
	log(player.name+" has entered the dungeon.");
}

function draw() {
	for (var i = player.x-10; i < player.x+11; i++) {
		for (var j = player.y-7; j < player.y+8; j++) {
			ctx.drawImage((dungeon[i] != undefined && dungeon[i][j] != undefined) ? tTerrains[dungeon[i][j].tile] : tTerrains[0], (i-player.x+10)*TILESIZE, (j-player.y+7)*TILESIZE);
			if (dungeon[i] != undefined && dungeon[i][j] != undefined && dungeon[i][j].monster) { 
				ctx.drawImage(tMonsters[monsters[dungeon[i][j].monster].type][monsters[dungeon[i][j].monster].dir], (i-player.x+10)*TILESIZE, (j-player.y+7)*TILESIZE);
			}
		}
	}
	ctx.drawImage(tPlayer[player.dir], 10*TILESIZE, 7*TILESIZE);
	
	ctx.textAlign = "start";

	ctx.fillStyle = 'gray';
	ctx.fillRect(672, 0, 822, 480);

	ctx.fillStyle = 'white';
	ctx.font = "16px Pixelated";
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
	ctx.fillText(player.hp+"/"+player.maxHp+" HP", 682, 47);
	ctx.fillText(player.xp+"/"+((player.lvl+1) * ((player.lvl) / 2) * LEVELMOD)+" XP", 682, 67);
	ctx.fillText("ATT: "+player.attack, 682, 78);
	ctx.fillText("DEF: "+player.defence, 747, 78);
	ctx.fillText("X;Y: "+player.x+";"+player.y, 682, 105);
	
	for (i = 1; i <= 50; i++) {
		for (j = 1; j <= 50; j++) {
			ctx.putImageData(
				mapTiles[dungeon[i][j].known ? (dungeon[i][j].monster ? MT_MONSTER : (dungeon[i][j].pass ? MT_FLOOR : MT_WALL)) : MT_UNDEF],
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
	switch (event.keyCode)
	{
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

	if (nX != -1 && !event.shiftKey && dungeon[nX][nY].pass) {
		if (dungeon[nX][nY].monster) {
			attack(player, monsters[dungeon[nX][nY].monster]); // player bumped in a monster
		} else {
			player.x = nX;
			player.y = nY;
			
			player.hp += rand(0,1);
			if (player.hp > player.maxHp) player.hp = player.maxHp;
			
			if (player.dir == D_LEFT || player.dir == D_RIGHT) {
				if ((player.x + (player.dir == D_LEFT ? -10 : 10) <= 50) && (player.x + (player.dir == D_LEFT ? -10 : 10) >= 1)) {
					for (var i = (player.y-7 < 1 ? 1 : player.y-7); i <= (player.y+7 > 50 ? 50 : player.y+7); i++) dungeon[player.x + (player.dir == 4 ? -10 : 10)][i].known = true;
				}
			} else {
				if ((player.y + (player.dir == D_UP ? -7 : 7) <= 50) && (player.y + (player.dir == D_UP ? -7 : 7) >= 1)) {
					for (var i = (player.x-10 < 1 ? 1 : player.x-10); i <= (player.x+10 > 50 ? 50 : player.x+10); i++) dungeon[i][player.y + (player.dir == 1 ? -7 : 7)].known = true;
				}
			}
		}

		for (var i = 1; i < monsters.length; i++) { // AI players take their turns
			if (monsters[i].hp > 0 && player.hp > 0) monsters[i].takeTurn(); // if monster is not dead, make him take his turn
		}
	}
	if ((event.keyCode >= 0x25 && event.keyCode <= 0x28 && dungeon[nX][nY].pass) || (event.keyCode == 0x0D)) draw();
}