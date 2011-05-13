// constant definitions for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

/* CONST */
const LEVELMOD = 6;
const TILESIZE = 32;
const G_WIDTH = 21;
const G_HEIGHT = 15;
const LEVELSIZE = 50;

const D_UP = 1; // tile directions
const D_DOWN = 3;
const D_RIGHT = 2;
const D_LEFT = 4;

const MT_FLOOR = 1; // minimap tile IDs
const MT_WALL = 2;
const MT_UNDEF = 3;
const MT_PLAYER = 4;
const MT_MONSTER = 5;
const MT_EXIT = 6;

const T_EXIT = 3; // tiles

const A_MOVE = 1; // actions
const A_DIG = 2;
const A_STAY = 3;
const A_BUILD = 4;
const A_INVENTORY = 5;

const S_HEAD = 1; // slots
const S_LEGS = 2;
const S_ARMS = 3;
const S_BODY = 4;
const S_HANDS = 5;
const slotNames = new Array("", "head", "legs", "arms", "body", "hands");

const ITEMS_PER_PAGE = 15;

const xOff = new Array(0, 0, 1, 0, -1);
const yOff = new Array(0, -1, 0, 1, 0);

const music = new Array("8bit-slow.ogg", "Winged-tune.ogg");

monsterTypes = new Array();
// monsterTypes[i] = new MonsterType(tileName, monsterName, description, author, hp on 1st lvl, att on 1st lvl, def on 1st lvl);
monsterTypes[1] = new MonsterType("troll", "Troll", "An ordinary fat and green troll.", "Endou", 10, 4, 4);
monsterTypes[2] = new MonsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", "Endou", 8, 3, 4);
monsterTypes[3] = new MonsterType("wdoom", "Winged Doom", "Welcome to Omsk!", "Dark Sentinel", 15, 5, 5);
monsterTypes[4] = new MonsterType("cancer", "Cancer", "He's the one killing /b/", "Dark Sentinel", 7, 3, 2);
monsterTypes[5] = new MonsterType("gazel", "Gazelle", "You should pass the fare!", "NeverArt", 17, 6, 4);
monsterTypes[6] = new MonsterType("pedo", "Pedobear", "I love little girls they make me feel so good :3", "Anonymous artist from Dobrochan #1", 10, 3, 5);

items = new Array();
items[1] = new ItemAction("Troll food", "Refills your health a little bit.", function (p) { p.addHp(10); });
items[2] = new ItemAction("Elixir of Cirno", "Makes you feel stronger.", function (p) { p.attBonus += 5; });
items[3] = new ItemArmor("Cat ears", "Cat ears", "Make you feel warmer^Wcuter. Saves you from enemies, too.", S_HEAD, 5);
items[4] = new ItemArmor("McDonalds Bag", "McDonalds Bag", "Yeah, I know you are wearing one already. But you know, one is never enough.", S_HEAD, 2);
items[5] = new ItemArmor("Aperture Science Long Fall Boots", "AS Long Fall Boots", "Saves you from long distance falls. And from big trolls, too.", S_LEGS, 3);
items[6] = new ItemWeapon("Showel", "Showel", "Can be used to kill enemies. And to make stupid jokes funny, too.", 2);


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
		
	} else alert("it seems that your browser is busy sucking cocks so it can't display this awesome game for you");
}
