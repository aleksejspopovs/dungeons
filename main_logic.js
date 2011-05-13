// main logic for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

var dungeon, temp, bgm;
var loaded = 0;
var toLoad = 9;
var intervalId = 0;
var errorCount = 0;
var choice = 1, pageStart = 0; // for menus

player = new Player("Anonymous", "bag", 25, 25, 3);
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

function newGame(level) {
	if (level == 1) player = new Player("Anonymous", "bag", 25, 25, 4);
	monsters = new Array();
	dungeon = new Dungeon(level);
	temp = 1;
	drawSidebar();
	drawMap(); 
	setKeyListener(turn);
	log(player.name+" has entered the dungeon's "+getFloorString(level)+" floor.");
}

function attack(att, def) {
	att.dir = att.x == def.x ? (att.y == def.y+1 ? 1 : 3) : att.x == def.x+1 ? 4 : 2;
	def.dir = ((att.dir + 2) % 4 == 0) ? 4 : (att.dir + 2) % 4;
	if (Math.random() > (att.getAtt() - def.getDef()) / (2*(att.getAtt() + def.getDef()))) {
		var damage = Math.round(def.maxHp * ((randH(1, 3) * att.getAtt()) / (10 * att.getAtt())));
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

function monstersTakeTurns() {
  for (var i = 1; i < monsters.length; i++) { // AI players take their turns
    if (monsters[i].hp > 0 && player.hp > 0) 
      monsters[i].takeTurn(); // if monster is not dead, make him take his turn
  }
}

function turn(event) {
	var nX = player.x;
	var nY = player.y;
  var action;
  var dontRedraw = false;
	switch (event.keyCode) {
		case 0x25:
      if (!event.shiftKey) action = A_MOVE;
			player.dir = D_LEFT;
			event.preventDefault();
			nX--;
		break;
		case 0x26:
      if (!event.shiftKey) action = A_MOVE;
			player.dir = D_UP;
			event.preventDefault();
			nY--;
		break;
		case 0x27:
      if (!event.shiftKey) action = A_MOVE;
			player.dir = D_RIGHT;
			event.preventDefault();
			nX++;
		break;
		case 0x28:
      if (!event.shiftKey) action = A_MOVE;
			player.dir = D_DOWN;
			event.preventDefault();
			nY++;
		break;
    case 0x44: // d for Dig
    case 0x64:
      action = A_DIG;
      event.preventDefault();
    break;
    case 0x53: // s for build
    case 0x73:
      action = A_BUILD;
      event.preventDefault();
    break;
    case 0x49: // i for Inventory
    case 0x69:
      action = A_INVENTORY;
      event.preventDefault();
    break;
		case 0x0D:
      action = A_STAY;
		break;
		default:
			nX = -1;
		break;
	}

	switch (action) {
    case A_MOVE:
       if (dungeon[nX][nY].pass) {
        if (dungeon[nX][nY].monster) {
          attack(player, monsters[dungeon[nX][nY].monster]); // player bumped in a monster
        } else {
          player.x = nX;
          player.y = nY;
     
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
        monstersTakeTurns();
      } else if (dungeon[nX][nY].tile == T_EXIT) {
        levelExit(true);
        dontRedraw = true;
      }
    break
    case A_DIG:
      if (checkCoords(nX+xOff[player.dir], nY+yOff[player.dir]) && !dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].monster && !dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile != T_EXIT) {
        dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass = true;
        dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile = 1;
        for (var i = ((player.x < 3) ? 1 : (player.x - 2)); i <= ((player.x > 48) ? 50 : (player.x + 2)); i++) {
          for (var j = ((player.y < 3) ? 1 : (player.y - 2)); j <= ((player.y > 48) ? 50 : (player.y + 2)); j++) {
            if (dungeon[i][j].tile == 2 && (dungeon[i][j+1] == undefined || (dungeon[i][j+1].tile != 2 && dungeon[i][j+1].tile != 4))) 
              dungeon[i][j].tile = 4;
          }
        }
        monstersTakeTurns();
      }
    break;
    case A_BUILD:
      if (checkCoords(nX+xOff[player.dir], nY+yOff[player.dir]) && !dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].monster && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass) {
        dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass = false;
        dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile = 2;
        for (var i = ((player.x < 3) ? 1 : (player.x - 2)); i <= ((player.x > 48) ? 50 : (player.x + 2)); i++) {
          for (var j = ((player.y < 3) ? 1 : (player.y - 2)); j <= ((player.y > 48) ? 50 : (player.y + 2)); j++) {
            if (dungeon[i][j].tile == 2 && (dungeon[i][j+1] == undefined || (dungeon[i][j+1].tile != 2 && dungeon[i][j+1].tile != 4))) 
              dungeon[i][j].tile = 4;
            if (dungeon[i][j].tile == 4 && dungeon[i][j+1] != undefined && (dungeon[i][j+1].tile == 2 || dungeon[i][j+1].tile == 4))
              dungeon[i][j].tile = 2;
          }
        }
        monstersTakeTurns();
      }
    break;
    case A_STAY:
      player.hp += rand(0,2);
      if (player.hp > player.maxHp) player.hp = player.maxHp;
      monstersTakeTurns();
    break;
    case A_INVENTORY:
			choice = 0;
			pageStart = 0;
      setKeyListener(inventoryKeyHandler);
      drawInventory();
      dontRedraw = true;
    break;
  }
  if (!dontRedraw) {
    drawMap();
    drawSidebar();
  }
}

function inventoryKeyHandler(e) {
  switch (e.keyCode) {
		case 0x26:
			if (choice > 0) choice--;
			if (choice < pageStart) pageStart--;
			e.preventDefault();
			drawInventory();
		break;
		case 0x28:
			if (choice < player.inventory.length-1) choice++;
			if (choice > (pageStart + ITEMS_PER_PAGE - 1)) pageStart++;
			e.preventDefault();
			drawInventory();
		break;
    case 0x1B:  // ESC
      setKeyListener(turn);
      drawMap();
    break;
		case 0x0D: // enter
      var fail = false;
			if (items[player.inventory[choice].itemId].__proto__.constructor.name == "ItemAction") { // item is an action item
				items[player.inventory[choice].itemId].use(player);
				drawSidebar();
				player.deleteItem(choice);
        if (player.inventory.length == choice)
          choice--;
			} else {                                                                                 // item is a wearable item
				if (player.хуйня[items[player.inventory[choice].itemId].slot] != undefined) {
					if (player.хуйня[items[player.inventory[choice].itemId].slot].inventoryId == player.inventory[choice].inventoryId) {
						player.хуйня[items[player.inventory[choice].itemId].slot] = undefined;
						items[player.inventory[choice].itemId].unWear(player);
					} else { 
            fail = true;
						alert("there's already something equipped in this slot");
					}
				} else {
					player.хуйня[items[player.inventory[choice].itemId].slot] = player.inventory[choice]; // ItemRecord for the equipped item
					items[player.inventory[choice].itemId].wear(player);
				}
			}
      
      if (!fail)
        monstersTakeTurns();
			drawInventory();
			drawSidebar();
		break;
  }
}
function levelExitKeyHandler(e) {
	switch (e.keyCode) {
		case 0x26:
			if (choice > 1) choice--;
			e.preventDefault();
		break;
		case 0x28:
			if (choice < 3) choice++;
			e.preventDefault();
		break;
    case 0x1B:  // ESC
      setKeyListener(turn);
      drawMap();
      drawSidebar();
    break;
		case 0x0D:
			switch (choice) {
				case 1:
					setKeyListener(turn);
					drawMap();
					drawSidebar();
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
	if (e.keyCode != 0x0D && e.keyCode != 0x1B) levelExit(false);
}
