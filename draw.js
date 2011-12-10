// rendering code for dungeons
// this software is available under MIT License, see LICENSE for more info
// free software is our future

function drawInventory() {
	ctx.fillStyle = "black";
	ctx.fillRect(10, 10, 652, 460);
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.font = "16pt '04b03r'";
	ctx.fillText("Inventory", 336, 40);
	ctx.font = "12pt '04b03r'";
	ctx.textAlign = "left";
	ctx.strokeStyle = "white";
	ctx.strokeRect(15, 50, 642, 275); // item list
	ctx.strokeRect(15, 335, 642, 130); // cur item desc
	if (player.inventory.length < 1) {
		ctx.fillText("Sorry, but it seems that you haven't got any items in your inventory :(", 30, 65);
	} else {
		for (var i=pageStart; i < Math.min(player.inventory.length, pageStart + ITEMS_PER_PAGE); i++) {
			ctx.textAlign = "left";
			if ((player.equipment[items[player.inventory[i].itemId].slot] != undefined) && (player.equipment[items[player.inventory[i].itemId].slot].inventoryId == player.inventory[i].inventoryId))
				ctx.fillStyle = "yellow";
			else
				ctx.fillStyle = "white";
			ctx.fillText(items[player.inventory[i].itemId].name, 30, 65 + 18*(i-pageStart));
			if (items[player.inventory[i].itemId].stackable) {
				ctx.textAlign = "right";
				ctx.fillText(player.inventory[i].count, 647, 65 + 18*(i-pageStart));
			}
		}
		ctx.fillStyle = "white";
		ctx.textAlign = "left";
		ctx.fillText(">", 20, 65 + 18 * (choice - pageStart));

		// writing an item's description
		words = items[player.inventory[choice].itemId].desc.split(" ");
		i = 1;
		line = 0;
		cur = words[0];
		while (i <= words.length-1) {
			while ((i <= words.length-1) && (ctx.measureText(cur + " " + words[i]).width <= 622))
				cur += " " + words[i++];
			ctx.fillText(cur, 20, 350 + line*18);
			cur = "";
			line++;
		}
		if (items[player.inventory[choice].itemId].__proto__.constructor.name != "ItemAction") // item is equippable
			ctx.fillText("You can equip this item on your "+slotNames[items[player.inventory[choice].itemId].slot]+".", 20, 350+18*6);
	}
}

function drawSidebar() {
	ctx.textAlign = "left";
	ctx.fillStyle = "gray";
	ctx.fillRect(672, 0, 822, 480);

	ctx.fillStyle = "white";
	ctx.font = "16px '04b03r'";
	ctx.fillText(player.name, 682, 18);

	ctx.strokeRect(682, 35, 130, 3);
	ctx.fillStyle = "green";
	ctx.fillRect(682, 35, (player.hp / player.maxHp)*130, 3);

	ctx.strokeRect(682, 55, 130, 3);
	ctx.fillStyle = "#FFA000";
	ctx.fillRect(682, 55, (player.xp / player.toNextLvl)*130, 3);

	ctx.fillStyle = "white";
	ctx.font = "10px Visitor";
	ctx.fillText("level " + player.lvl, 682, 26);
	ctx.fillText(player.hp + "/" + player.maxHp + " HP", 682, 47);
	ctx.fillText(player.xp + "/" + player.toNextLvl + " XP", 682, 67);
	ctx.fillText("ATT: " + player.getAtt(), 682, 78);
	ctx.fillText("DEF: " + player.getDef(), 747, 78);
	ctx.fillText("gold: " + player.gold, 682, 89);

	ctx.textAlign = "right";
	ctx.fillText(getFloorString(dungeon.level) + " floor", 812, 26);

	// equipment
	ctx.textAlign = "left";
	ctx.fillText("your equipment:", 682, 105);
	for (i = 1; i < slotNames.length; i++) {
		ctx.fillText(slotNames[i]+":", 682, 96 + (2 * i * 9));
		ctx.fillText("  " + (player.equipment[i] === undefined ? "none" : items[player.equipment[i].itemId].shName), 682, 96 + (2 * i + 1) * 9);
	}

	// minimap
	for (i = 1; i <= 50; i++) {
		for (j = 1; j <= 50; j++) {
			ctx.fillStyle = mapTiles[
				dungeon[i][j].known ?
					(dungeon[i][j].tile == T_EXIT ? MT_EXIT
					: dungeon[i][j].monster != -1 ? MT_MONSTER
					: dungeon[i][j].item != -1 ? MT_ITEM
					: dungeon[i][j].gold != 0 ? MT_GOLD
					: (dungeon[i][j].pass ? MT_FLOOR
					: MT_WALL))
				: MT_UNDEF];
			ctx.fillRect(672 + (i - 1) *3, 330 + (j - 1) * 3, 3, 3);
		}
	}
	ctx.fillStyle = mapTiles[MT_PLAYER];
	ctx.fillRect(672 + (player.x-1)*3, 330 + (player.y-1)*3, 3, 3);
}

function drawMap() {
	var startX = Math.max(1, Math.min(51 - G_WIDTH, player.x - 10));
	var startY = Math.max(1, Math.min(51 - G_HEIGHT, player.y - 7));

	for (var i = startX; i < startX + G_WIDTH; i++) {
		for (var j = startY; j < startY + G_HEIGHT; j++) {
			if (!dungeon[i][j].known) {
				ctx.fillStyle = "black";
				ctx.fillRect((i - startX)*TILESIZE, (j - startY) * TILESIZE, TILESIZE, TILESIZE);
				continue;
			}

			ctx.drawImage(tTerrains[dungeon[i][j].tile], (i - startX)*TILESIZE, (j - startY) * TILESIZE);
			if (dungeon[i][j].item != -1)
				ctx.drawImage(tTerrains[T_ITEM], (i - startX)*TILESIZE, (j - startY) * TILESIZE);
			if (dungeon[i][j].gold != 0)
				ctx.drawImage(tTerrains[T_GOLD], (i - startX)*TILESIZE, (j - startY) * TILESIZE);
			if (dungeon[i][j].monster != -1)
				ctx.drawImage(monsters[dungeon[i][j].monster].tile[monsters[dungeon[i][j].monster].dir], (i - startX) * TILESIZE, (j - startY) * TILESIZE);
		}
	}
	ctx.drawImage(player.tile[player.dir], (player.x - startX) * TILESIZE, (player.y - startY) * TILESIZE);
}

function levelExit(full) {
	if (full) {
		setKeyListener(levelExitKeyHandler);
		choice = 1;
		ctx.fillStyle = "black";
		ctx.fillRect(10, 10, 652, 460);
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.font = "32pt '04b03r'";
		ctx.fillText("Escape dungeon", 336, 50);
		ctx.font = "12pt '04b03r'";
		ctx.textAlign = "left";
		ctx.fillText("What do you want to do?", 20, 90);
	}
	ctx.font = "12pt '04b03r'";
	ctx.fillStyle = "black";
	ctx.fillRect(450, 75, 200, 65);
	ctx.textAlign = "left";
	ctx.fillStyle = "white";
	ctx.fillText("Stay", 652 - ctx.measureText("Shop and leave").width, 90);
	ctx.fillText("Leave", 652 - ctx.measureText("Shop and leave").width, 110);
	ctx.fillText("Shop and leave", 652 - ctx.measureText("Shop and leave").width, 130);
	ctx.fillText(">", 652 - ctx.measureText("Shop and leave").width - 10, 70 + 20 * choice);
}

function drawAnimation(which, from, at, frame, onFinish) {
	if (frame == 1)
		setKeyListener(undefined);

	drawMap();
	var stop = false;
	var delay = 0;
	switch (which) {
		case AN_ATTACK:
			startX = Math.max(1, Math.min(51 - G_WIDTH, player.x - 10));
			startY = Math.max(1, Math.min(51 - G_HEIGHT, player.y - 7));

			// removing the actor
			ctx.drawImage(tTerrains[dungeon[from.x][from.y].tile], (from.x - startX) * TILESIZE, (from.y - startY) * TILESIZE);

			if (frame <= 16)
				ctx.drawImage(from.tile[from.dir], (from.x - startX) * TILESIZE + xOff[from.dir] * (frame), (from.y - startY) * TILESIZE + yOff[from.dir] * frame);
			else
				ctx.drawImage(from.tile[from.dir], (from.x - startX) * TILESIZE + xOff[from.dir] * (32 - frame), (from.y - startY) * TILESIZE + yOff[from.dir] * (32 - frame));
			if (from.dir == D_DOWN)
				ctx.drawImage(at.tile[at.dir], (at.x - startX) * TILESIZE, (at.y - startY) * TILESIZE);
			stop = (frame == 32);
			delay = 10;
		break;
	}

	if (stop)
		setTimeout(function () { onFinish(); drawMap(); setKeyListener(turn); }, delay);
	else
		setTimeout(function () { drawAnimation(which, from, at, ++frame, onFinish); }, delay);
}

function makeKnown() {
	var startX = Math.max(1, Math.min(51 - G_WIDTH, player.x - 10));
	var startY = Math.max(1, Math.min(51 - G_HEIGHT, player.y - 7));
	var endX = startX + G_WIDTH - 1;
	var endY = startY + G_HEIGHT - 1;

	var queue = [];
	queue[0] = [player.x, player.y];
	var seen = [];

	while (queue.length > 0) {
		cur = queue.pop(0);
		for (var dir = 1; dir <= 4; dir++) {
			var x = cur[0] + xOff[dir];
			var y = cur[1] + yOff[dir];
			if (!checkCoords(x, y)) {
				continue;
			}
			dungeon[x][y].known = true;
			if ((seen.indexOf(x*100 + y) == -1) && (dungeon[x][y].pass) && (x >= startX) && (x <= endX) && (y >= startY) && (y <= endY)) {
				queue.push([x, y]);
			}
		}
		seen.push(cur[0]*100 + cur[1]);
	}
}
