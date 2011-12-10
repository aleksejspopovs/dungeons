// constant definitions for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

/* Constants */
// geometry
var LEVELMOD = 6;
var TILESIZE = 32;
var G_WIDTH = 21;
var G_HEIGHT = 15;
var LEVELSIZE = 50;
var ITEMS_PER_PAGE = 15;

// directions
var D_UP = 1;
var D_DOWN = 3;
var D_RIGHT = 2;
var D_LEFT = 4;

// minimap tiles
var MT_FLOOR = 1;
var MT_WALL = 2;
var MT_UNDEF = 3;
var MT_PLAYER = 4;
var MT_MONSTER = 5;
var MT_EXIT = 6;
var MT_GOLD = 7;
var MT_ITEM = 8;

// tiles
var T_FLOOR = 1;
var T_WALL = 2;
var T_EXIT = 3;
var T_WALLC = 4;
var T_GOLD = 5;
var T_ITEM = 6;

// actions
var A_MOVE = 1;
var A_DIG = 2;
var A_STAY = 3;
var A_BUILD = 4;
var A_INVENTORY = 5;

// slots
var S_HEAD = 1;
var S_LEGS = 2;
var S_ARMS = 3;
var S_BODY = 4;
var S_HANDS = 5;
var slotNames = new Array("", "head", "legs", "arms", "body", "hands");

// animations
var AN_ATTACK = 1;

var toLoad = 10;
var xOff = new Array(0, 0, 1, 0, -1);
var yOff = new Array(0, -1, 0, 1, 0);

var music = new Array("8bit-slow.ogg", "Winged-tune.ogg");
var ctx, monsters, player, mapTiles, tTerrains, tPlayer, bgm;
var dungeon, temp, bgm;
var intervalId = 0;
var choice = 1, pageStart = 0; // for menus

player = new Player("Anonymous", undefined, 25, 25, 3);
monsters = new Array();
mapTiles = new Array();
tPlayer = new Array();
tTerrains = new Array();


var monsterTypes = new Array();
// monsterTypes[i] = new MonsterType(tileName, monsterName, description, author, hp on 1st lvl, att on 1st lvl, def on 1st lvl);
monsterTypes[0] = new MonsterType("troll", "Troll", "An ordinary fat and green troll.", "Endou", 10, 1, 1);
monsterTypes[1] = new MonsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", "Endou", 8, 1, 1);
monsterTypes[2] = new MonsterType("wdoom", "Winged Doom", "Welcome to Omsk!", "Dark Sentinel", 15, 1, 1);
monsterTypes[3] = new MonsterType("cancer", "Cancer", "He's the one killing /b/", "Dark Sentinel", 7, 1, 1);
monsterTypes[4] = new MonsterType("gazel", "Gazelle", "You should pass the fare!", "NeverArt", 17, 1, 1);
monsterTypes[5] = new MonsterType("pedo", "Pedobear", "I love little girls they make me feel so good :3", "Anonymous artist from Dobrochan #1", 10, 1, 1);

var items = new Array();
items[0] = new ItemAction("Troll food", "Refills your health a little bit.", function (p) { p.addHp(10); }, "ate", "gained some health");
items[1] = new ItemAction("Elixir of Cirno", "Makes you feel stronger.", function (p) { p.attBonus += 5; }, "drank", "became The Strongest");
items[2] = new ItemArmor("Cat ears", "Cat ears", "Make you feel warmer^Wcuter. Saves you from enemies, too.", S_HEAD, 5);
items[3] = new ItemArmor("McDonalds Bag", "McDonalds Bag", "Yeah, I know you are wearing one already. But you know, one is never enough.", S_HEAD, 2);
items[4] = new ItemArmor("Aperture Science Long Fall Boots", "AS Long Fall Boots", "Saves you from long distance falls. And from big trolls, too.", S_LEGS, 3);
items[5] = new ItemWeapon("Showel", "Showel", "Can be used to kill enemies. And to make stupid jokes funny, too.", 2);


function resLoad() {
	toLoad--;
	if (toLoad == 0) {
		document.getElementById("gamelog").innerHTML = "All the stuff succesfully loaded.";
		setTimeout(function () {newGame(1); }, 125);
	}
}

function init() {
	if (browserCheck()) {
		if (!window.localStorage.rows)
			window.localStorage.rows = 5;
		document.getElementById('gamelog').style.height = window.localStorage.rows+"em";

		ctx = document.getElementById('game').getContext('2d');
		ctx.font = "16px sans-serif";
		ctx.fillText("Please wait while all the necessary crap is loading...", 100, 210);

		mapTiles[MT_FLOOR] = "rgb(255,255,255)";
		mapTiles[MT_WALL] = "rgb(0,0,0)";
		mapTiles[MT_UNDEF] = "rgb(200,200,200)";
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
		if (!window.localStorage.bgm)
			window.localStorage.bgm = "off";
		document.getElementById("bgmButton").value = "music: "+window.localStorage.bgm;
		if (window.localStorage.bgm == "on") // erm... damn localStorage only works with strings, no booleans :(
			bgm.play();
		else
			bgm.pause();

	} else alert("it seems that your browser is so busy sucking cocks it can't display this awesome game for you");
}
