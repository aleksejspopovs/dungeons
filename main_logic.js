// main logic for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

function newGame(level) {
	if (level == 1) player = new Player("Anonymous", tPlayer, 25, 25, 4);
	monsters = new Array();
	dungeon = new Dungeon(level);
	makeKnown();
	temp = 1;
	drawSidebar();
	drawMap();
	setKeyListener(turn);
	log("<b>"+player.name+"</b> has entered the dungeon's <b>"+getFloorString(level)+" floor</b>.");
}

function attackMaths(att, def) {
	if (Math.random() >= (def.getDef() - att.getAtt())/10) {
		var damage = Math.round(def.hp*Math.min(1, (-(def.getDef() - att.getAtt() - 10))/20));
		def.hp -= damage;
		log("<b>"+att.name+"</b> has attacked <b>"+def.name+"</b> and done <b>"+damage+"</b> points of damage.");
	} else {
		log("<b>"+att.name+"</b> has tried to attack <b>"+def.name+"</b>, but <b>missed</b>!");
	}
	if (def.hp < 1) {
		log("<b>"+def.name+'</b> died.');
		def.dead();
	}
}

function attack(att, def) {
	att.dir = att.x == def.x ? (att.y == def.y + 1 ? 1 : 3) : att.x == def.x + 1 ? 4 : 2;
	def.dir = ((att.dir + 2) % 4 == 0) ? 4 : (att.dir + 2) % 4;
	drawAnimation(AN_ATTACK, att, def, 1, function () { attackMaths(att, def); if (att == player) monsterTakesTurn(0); else monsterTakesTurn(att.id+1) });
}

function monsterTakesTurn(which) {
	if (which >= monsters.length)
		return;
	if (monsters[which].hp > 0 && player.hp > 0)
		monsters[which].takeTurn(); // if monster is not dead, make him take his turn
	else
		monsterTakesTurn(which+  1);
}

function turn(event) {
	var nX = player.x;
	var nY = player.y;
	var action;
	var dontRedraw = false;
	switch (event.keyCode) {
		case 37:
			if (!event.shiftKey) action = A_MOVE;
			player.dir = D_LEFT;
			event.preventDefault();
			nX--;
		break;
		case 38:
			if (!event.shiftKey) action = A_MOVE;
			player.dir = D_UP;
			event.preventDefault();
			nY--;
		break;
		case 39:
			if (!event.shiftKey) action = A_MOVE;
			player.dir = D_RIGHT;
			event.preventDefault();
			nX++;
		break;
		case 40:
			if (!event.shiftKey) action = A_MOVE;
			player.dir = D_DOWN;
			event.preventDefault();
			nY++;
		break;
		case 68: // d for Dig
			action = A_DIG;
			event.preventDefault();
		break;
		case 83: // s for build
			action = A_BUILD;
			event.preventDefault();
		break;
		case 73: // i for Inventory
			action = A_INVENTORY;
			event.preventDefault();
		break;
		case 13:
			action = A_STAY;
			event.preventDefault();
		break;
		default:
			dontRedraw = true;
		break;
	}

	switch (action) {
		case A_MOVE:
			 if (dungeon[nX][nY].pass) {
				if (dungeon[nX][nY].monster != -1) {
					attack(player, monsters[dungeon[nX][nY].monster]); // player bumped in a monster
				} else {
					if (dungeon[nX][nY].item != -1) {
						player.giveItem(dungeon[nX][nY].item);
						log("<b>" + player.name + "</b> has picked up <b>" + items[dungeon[nX][nY].item].name + "</b> and put it into his backpack.");
						dungeon[nX][nY].item = -1;
					}
					if (dungeon[nX][nY].gold != 0) {
						player.gold += dungeon[nX][nY].gold;
						log("<b>" + player.name + "</b> has picked up <b>" + dungeon[nX][nY].gold + "</b> gold coins and put them into his pocket.");
						dungeon[nX][nY].gold = 0;
					}
					player.x = nX;
					player.y = nY;

					makeKnown();
					monsterTakesTurn(0);
				}
			} else {
				if (dungeon[nX][nY].tile == T_EXIT)
					levelExit(true);
				dontRedraw = true;
			}
		break;
		case A_DIG:
			if (checkCoords(nX+xOff[player.dir], nY+yOff[player.dir]) && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].monster == -1 && !dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile != T_EXIT) {
				dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass = true;
				dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile = T_FLOOR;
				for (var i = ((player.x < 3) ? 1 : (player.x - 2)); i <= ((player.x > 48) ? 50 : (player.x + 2)); i++) {
					for (var j = ((player.y < 3) ? 1 : (player.y - 2)); j <= ((player.y > 48) ? 50 : (player.y + 2)); j++) {
						if (dungeon[i][j].tile == T_WALL && (dungeon[i][j+1] === undefined || (dungeon[i][j+1].tile != T_WALL && dungeon[i][j+1].tile != T_WALLC)))
							dungeon[i][j].tile = T_WALLC;
					}
				}
				monsterTakesTurn(0);
			}
		break;
		case A_BUILD:
			if (checkCoords(nX+xOff[player.dir], nY+yOff[player.dir]) && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].monster == -1 && dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass) {
				dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].pass = false;
				dungeon[nX+xOff[player.dir]][nY+yOff[player.dir]].tile = T_WALL;
				for (var i = ((player.x < 3) ? 1 : (player.x - 2)); i <= ((player.x > 48) ? 50 : (player.x + 2)); i++) {
					for (var j = ((player.y < 3) ? 1 : (player.y - 2)); j <= ((player.y > 48) ? 50 : (player.y + 2)); j++) {
						if (dungeon[i][j].tile == T_WALL && (dungeon[i][j+1] === undefined || (dungeon[i][j+1].tile != T_WALL && dungeon[i][j+1].tile != T_WALLC)))
							dungeon[i][j].tile = T_WALLC;
						if (dungeon[i][j].tile == 4 && dungeon[i][j+1] != undefined && (dungeon[i][j+1].tile == T_WALL || dungeon[i][j+1].tile == T_WALLC))
							dungeon[i][j].tile = T_WALL;
					}
				}
				monsterTakesTurn(0);
			}
		break;
		case A_STAY:
			player.hp += rand(0,2);
			if (player.hp > player.maxHp) player.hp = player.maxHp;
			monsterTakesTurn(0);
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
		case 38:
			if (choice > 0) choice--;
			if (choice < pageStart) pageStart--;
			e.preventDefault();
			drawInventory();
		break;
		case 40:
			if (choice < player.inventory.length-1) choice++;
			if (choice > (pageStart + ITEMS_PER_PAGE - 1)) pageStart++;
			e.preventDefault();
			drawInventory();
		break;
		case 27:  // ESC
			setKeyListener(turn);
			drawMap();
		break;
		case 13: // enter
			var fail = false;
			if (items[player.inventory[choice].itemId].__proto__.constructor.name == "ItemAction") { // item is an action item
				items[player.inventory[choice].itemId].use(player);
				drawSidebar();
				player.deleteItem(choice);
				if (player.inventory.length == choice)
					choice--;
			} else {                                                                                 // item is a wearable item
				if (player.equipment[items[player.inventory[choice].itemId].slot] != undefined) {
					if (player.equipment[items[player.inventory[choice].itemId].slot].inventoryId == player.inventory[choice].inventoryId) {
						player.equipment[items[player.inventory[choice].itemId].slot] = undefined;
						items[player.inventory[choice].itemId].unWear(player);
					} else {
						fail = true;
						log("You <b>can't equip</b> this item because you're already wearing something on your <b>"+slotNames[items[player.inventory[choice].itemId].slot]+".");
					}
				} else {
					player.equipment[items[player.inventory[choice].itemId].slot] = player.inventory[choice]; // ItemRecord for the equipped item
					items[player.inventory[choice].itemId].wear(player);
				}
			}

			if (!fail)
				monsterTakesTurn(0);
			drawInventory();
			drawSidebar();
		break;
		case 68: // d for drop
			if ((items[player.inventory[choice].itemId].__proto__.constructor.name != "ItemAction") && (player.equipment[items[player.inventory[choice].itemId].slot] !== undefined)  && (player.equipment[items[player.inventory[choice].itemId].slot].inventoryId == player.inventory[choice].inventoryId)) {
				log("You <b>can't drop</b> something you're wearing.");
			} else if (!(dungeon[player.x+xOff[player.dir]][player.y+yOff[player.dir]].pass) || dungeon[player.x+xOff[player.dir]][player.y+yOff[player.dir]].gold || (dungeon[player.x+xOff[player.dir]][player.y+yOff[player.dir]].item != -1)) {
				log("You <b>can't drop</b> items on walls and floor tiles that already have items or coins on them.");
			} else {
				dungeon[player.x+xOff[player.dir]][player.y+yOff[player.dir]].item = player.inventory[choice].itemId;
				player.deleteItem(choice);
				drawMap();
				setKeyListener(turn);
			}
		break;
	}
}
function levelExitKeyHandler(e) {
	switch (e.keyCode) {
		case 38:
			if (choice > 1) choice--;
			e.preventDefault();
		break;
		case 40:
			if (choice < 3) choice++;
			e.preventDefault();
		break;
		case 27:  // ESC
			setKeyListener(turn);
			drawMap();
			drawSidebar();
		break;
		case 13:
			switch (choice) {
				case 1:
					setKeyListener(turn);
					drawMap();
					drawSidebar();
				break;
				case 2:
					log("<b>"+player.name+"</b> has decided to get deeper into this dungeon.");
					newGame(dungeon.level + 1);
				break;
				case 3:
					alert("sorry, shop isn't implemented yet :(");
				break;
			}
		break;
	}
	if (e.keyCode != 13 && e.keyCode != 27) levelExit(false);
}

function gameOver(c) {
	if (!c) {
		setKeyListener(undefined);
		intervalId = setInterval(fillScreenPart, 25);
	} else {
		ctx.fillStyle = 'white';
		ctx.textAlign = "center";
		ctx.font = "54pt '04b03r'";
		ctx.fillText("GAME OVER", 336, 80);
		ctx.font = "12pt '04b03r'";
		ctx.fillText("Insert coin(s) or press n to start a new game", 336, 100);
		setKeyListener(gameOverKeyHandler);
	}
}

function gameOverKeyHandler(e) {
	if (e.keyCode == 78)
		newGame(1);
}

