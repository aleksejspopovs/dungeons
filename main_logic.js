// main logic for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

var dungeon, temp, bgm;
var loaded = 0;
var toLoad = 9;
var intervalId = 0;
var errorCount = 0;
var choice = 1;

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
	draw(); 
	setKeyListener(turn);
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
	ctx.fillRect(682, 55, (player.xp / player.toNextLvl)*130, 3);

	ctx.fillStyle = 'white';
	ctx.font = "10px Visitor";
	ctx.fillText("level "+player.lvl, 682, 26);
	ctx.fillText(getFloorString(dungeon.level)+" floor", 747, 26);
	ctx.fillText(player.hp+"/"+player.maxHp+" HP", 682, 47);
	ctx.fillText(player.xp+"/"+player.toNextLvl+" XP", 682, 67);
	ctx.fillText("ATT: "+player.getAtt(), 682, 78);
	ctx.fillText("DEF: "+player.getDef(), 747, 78);
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

    break;
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
      setKeyListener(inventoryKeyHandler);
      choice = 0;
      drawInventory();
      dontRedraw = true;
    break;
  }
  if (!dontRedraw)
    draw();
}

function inventoryKeyHandler(e) {
  switch (e.keyCode) {
    case 0x1B:  // ESC
      setKeyListener(turn);
      draw();
    break;
  }
}

function drawInventory() {
  ctx.fillStyle = 'black';
  ctx.fillRect(10, 10, 652, 460);
  ctx.fillStyle = 'white';
  ctx.textAlign = "center";
  ctx.font = "16pt '04b03r'";
  ctx.fillText("Inventory", 336, 40);
  ctx.font = "12pt '04b03r'";
  ctx.textAlign = "left";
  
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
      draw();
    break;
		case 0x0D:
			switch (choice) {
				case 1:
					setKeyListener(turn);
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
	if (e.keyCode != 0x0D && e.keyCode != 0x1B) levelExit(false);
}

function levelExit(full) {
	if (full) {
		setKeyListener(levelExitKeyHandler);
		choice = 1;
		ctx.fillStyle = 'black';
		ctx.fillRect(10, 10, 652, 460);
		ctx.fillStyle = 'white';
		ctx.textAlign = "center";
		ctx.font = "32pt '04b03r'";
		ctx.fillText("Escape dungeon", 336, 50);
		ctx.font = "12pt '04b03r'";
		ctx.textAlign = "left";
		ctx.fillText("What do you want to do?", 20, 90);
	}
	ctx.font = "12pt '04b03r'";
	ctx.fillStyle = 'black';
	ctx.fillRect(450, 75, 200, 65);	
	ctx.textAlign = "left";
	ctx.fillStyle = 'white';
	ctx.fillText("Stay", 652-ctx.measureText("Shop and leave").width, 90);
	ctx.fillText("Leave", 652-ctx.measureText("Shop and leave").width, 110);
	ctx.fillText("Shop and leave", 652-ctx.measureText("Shop and leave").width, 130);
	ctx.fillText(">", 652-ctx.measureText("Shop and leave").width-10, 70 + 20*choice);
}
