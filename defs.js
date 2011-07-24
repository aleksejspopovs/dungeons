// constant definitions for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

/* CONST */
// geometry
const LEVELMOD = 6;
const TILESIZE = 32;
const G_WIDTH = 21;
const G_HEIGHT = 15;
const LEVELSIZE = 50;
const ITEMS_PER_PAGE = 15;

// directions
const D_UP = 1;
const D_DOWN = 3;
const D_RIGHT = 2;
const D_LEFT = 4;

// minimap tiles
const MT_FLOOR = 1;
const MT_WALL = 2;
const MT_UNDEF = 3;
const MT_PLAYER = 4;
const MT_MONSTER = 5;
const MT_EXIT = 6;
const MT_GOLD = 7;
const MT_ITEM = 8;

// tiles
const T_FLOOR = 1;
const T_WALL = 2;
const T_EXIT = 3;
const T_WALLC = 4;
const T_GOLD = 5;
const T_ITEM = 6;

// actions
const A_MOVE = 1;
const A_DIG = 2;
const A_STAY = 3;
const A_BUILD = 4;
const A_INVENTORY = 5;

// slots
const S_HEAD = 1;
const S_LEGS = 2;
const S_ARMS = 3;
const S_BODY = 4;
const S_HANDS = 5;
const slotNames = new Array("", "head", "legs", "arms", "body", "hands");

// animations
const AN_ATTACK = 1;


var toLoad = 10;
const xOff = new Array(0, 0, 1, 0, -1);
const yOff = new Array(0, -1, 0, 1, 0);

const music = new Array("8bit-slow.ogg", "Winged-tune.ogg");

monsterTypes = new Array();
// monsterTypes[i] = new MonsterType(tileName, monsterName, description, author, hp on 1st lvl, att on 1st lvl, def on 1st lvl);
/*monsterTypes[0] = new MonsterType("troll", "Troll", "An ordinary fat and green troll.", "Endou", 10, 4, 4);
monsterTypes[1] = new MonsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", "Endou", 8, 3, 4);
monsterTypes[2] = new MonsterType("wdoom", "Winged Doom", "Welcome to Omsk!", "Dark Sentinel", 15, 5, 5);
monsterTypes[3] = new MonsterType("cancer", "Cancer", "He's the one killing /b/", "Dark Sentinel", 7, 3, 2);
monsterTypes[4] = new MonsterType("gazel", "Gazelle", "You should pass the fare!", "NeverArt", 17, 6, 4);
monsterTypes[5] = new MonsterType("pedo", "Pedobear", "I love little girls they make me feel so good :3", "Anonymous artist from Dobrochan #1", 10, 3, 5);*/
monsterTypes[0] = new MonsterType("troll", "Troll", "An ordinary fat and green troll.", "Endou", 10, 1, 1);
monsterTypes[1] = new MonsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", "Endou", 8, 1, 1);
monsterTypes[2] = new MonsterType("wdoom", "Winged Doom", "Welcome to Omsk!", "Dark Sentinel", 15, 1, 1);
monsterTypes[3] = new MonsterType("cancer", "Cancer", "He's the one killing /b/", "Dark Sentinel", 7, 1, 1);
monsterTypes[4] = new MonsterType("gazel", "Gazelle", "You should pass the fare!", "NeverArt", 17, 1, 1);
monsterTypes[5] = new MonsterType("pedo", "Pedobear", "I love little girls they make me feel so good :3", "Anonymous artist from Dobrochan #1", 10, 1, 1);


items = new Array();
items[0] = new ItemAction("Troll food", "Refills your health a little bit.", function (p) { p.addHp(10); }, "ate", "gained some health");
items[1] = new ItemAction("Elixir of Cirno", "Makes you feel stronger.", function (p) { p.attBonus += 5; }, "drank", "became The Strongest");
items[2] = new ItemArmor("Cat ears", "Cat ears", "Make you feel warmer^Wcuter. Saves you from enemies, too.", S_HEAD, 5);
items[3] = new ItemArmor("McDonalds Bag", "McDonalds Bag", "Yeah, I know you are wearing one already. But you know, one is never enough.", S_HEAD, 2);
items[4] = new ItemArmor("Aperture Science Long Fall Boots", "AS Long Fall Boots", "Saves you from long distance falls. And from big trolls, too.", S_LEGS, 3);
items[5] = new ItemWeapon("Showel", "Showel", "Can be used to kill enemies. And to make stupid jokes funny, too.", 2);


function resLoad() {
	loaded++;
	if (loaded >= toLoad) {
		document.getElementById("gamelog").innerHTML = "All the stuff succesfully loaded.";
		setTimeout(function () {newGame(1); }, 125);
	}
}

function init() {
	if (browserCheck()) {
		if (!window.localStorage.rows) window.localStorage.rows = 5;
		document.getElementById('gamelog').style.height = window.localStorage.rows+"em";
		ctx = document.getElementById('game').getContext('2d');
		ctx.font = "16px sans-serif";
		ctx.fillText("Please wait while all the necessary crap is loading...", 100, 210);
		
		mapTiles[MT_FLOOR] = "rgb(255,255,255)";
		mapTiles[MT_WALL] = "rgb(0,0,0)";
		mapTiles[MT_UNDEF] = "rgb(228,228,228)";
		mapTiles[MT_PLAYER] = "rgb(0,255,0)";
		mapTiles[MT_MONSTER] = "rgb(255,0,0)";
		mapTiles[MT_EXIT] = "rgb(0,127,255)";
		mapTiles[MT_GOLD] = "rgb(255,215,0)";
		mapTiles[MT_ITEM] = "rgb(0,112,0)";

		tTerrains[T_FLOOR] = new Image(); // Floor
		tTerrains[T_FLOOR].src = './images/floor.png';
		tTerrains[T_FLOOR].onload = resLoad;
		tTerrains[T_WALL] = new Image(); // Wall
		tTerrains[T_WALL].src = './images/wall.png';
		tTerrains[T_WALL].onload = resLoad;
		tTerrains[T_EXIT] = new Image(); // Exit
		tTerrains[T_EXIT].src = './images/exit.png';
		tTerrains[T_EXIT].onload = resLoad;
		tTerrains[T_WALLC] = new Image(); // Wall corner
		tTerrains[T_WALLC].src = './images/wall_corner.png';
		tTerrains[T_WALLC].onload = resLoad;
		tTerrains[T_GOLD] = new Image(); // Some gold
		tTerrains[T_GOLD].src = './images/gold.png';
		tTerrains[T_GOLD].onload = resLoad;
		tTerrains[T_ITEM] = new Image(); // An item
		tTerrains[T_ITEM].src = './images/bag.png';
		tTerrains[T_ITEM].onload = resLoad;
		
		tPlayer[D_UP] = new Image(); // Player facing up
		tPlayer[D_UP].src = './images/bag/up.png';
		tPlayer[D_UP].onload = resLoad;
		tPlayer[D_RIGHT] = new Image(); // Player facing right
		tPlayer[D_RIGHT].src = './images/bag/right.png';
		tPlayer[D_RIGHT].onload = resLoad;
		tPlayer[D_DOWN] = new Image(); // Player facing down
		tPlayer[D_DOWN].src = './images/bag/down.png';
		tPlayer[D_DOWN].onload = resLoad;
		tPlayer[D_LEFT] = new Image(); // Player facing left
		tPlayer[D_LEFT].src = './images/bag/left.png';
		tPlayer[D_LEFT].onload = resLoad;
		
		for (var i = 0; i < monsterTypes.length; i++) {
			monsterTypes[i].tile = new Array();
			monsterTypes[i].tile[D_UP] = new Image();
			monsterTypes[i].tile[D_UP].src = './images/monsters/'+monsterTypes[i].filename+'_up.png'; 
			monsterTypes[i].tile[D_UP].onload = resLoad;
			monsterTypes[i].tile[D_RIGHT] = new Image();
			monsterTypes[i].tile[D_RIGHT].src = './images/monsters/'+monsterTypes[i].filename+'_right.png';
			monsterTypes[i].tile[D_RIGHT].onload = resLoad;
			monsterTypes[i].tile[D_DOWN] = new Image();
			monsterTypes[i].tile[D_DOWN].src = './images/monsters/'+monsterTypes[i].filename+'_down.png';
			monsterTypes[i].tile[D_DOWN].onload = resLoad;
			monsterTypes[i].tile[D_LEFT] = new Image();
			monsterTypes[i].tile[D_LEFT].src = './images/monsters/'+monsterTypes[i].filename+'_left.png';
			monsterTypes[i].tile[D_LEFT].onload = resLoad;
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
