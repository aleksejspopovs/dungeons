// constant definitions
// 2010 no copyright — mariofag
// free software is our future

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
const MT_EXIT = 6;

const T_EXIT = 3; // tiles

const xOff = new Array(0, 0, 1, 0, -1);
const yOff = new Array(0, -1, 0, 1, 0);

const music = new Array("8bit-slow.ogg", "Winged-tune.ogg");

monsterTypes = new Array();
monsterTypes[1] = new monsterType("troll", "Troll", "An ordinary fat and green troll.", "Endou", 2, 3);
monsterTypes[2] = new monsterType("trolltan", "Troll-tan", "She always chooses to GTFO.", "Endou", 1, 2);
monsterTypes[3] = new monsterType("wdoom", "Winged Doom", "Welcome to Omsk!", "Dark Sentinel", 10, 10);
monsterTypes[4] = new monsterType("cancer", "Cancer", "He's the one killing /b/", "Dark Sentinel", 9, 9);
monsterTypes[5] = new monsterType("gazel", "Gazelle", "You should pass the fare!", "NeverArt", 5, 6);
monsterTypes[6] = new monsterType("pedo", "Pedobear", "I love little girls they make me feel so good :3", "Anonymous artist from Dobrochan #1", 6, 7);