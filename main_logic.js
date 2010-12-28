// main roguelike logic
// 2010 no copyright � mariofag
// free software is our future

function imgLoad() {
	loaded++;
	if (loaded >= 15) {
		setTimeout(function() {
			draw(); 
			document.onkeydown = turn;
			log(player.name+" has entered the dungeon.");
		}, 125);
	}
}

function init() {
	if (!window.localStorage.rows) window.localStorage.rows = 10;
  document.getElementById('gamelog').rows = window.localStorage.rows;
	temp = 1;
	document.getElementById('gamelog').value = "";
	canvas = document.getElementById('game');
	if (canvas.getContext){
		ctx = canvas.getContext('2d');
		ctx.font = "16px sans-serif";
		ctx.fillText("Please wait while all the necessary crap is loading...", 100, 210);
		tTerrains = new Array();
		tTerrains[0] = new Image(); // Undefined (black)
		tTerrains[0].src = './images/undefined.png';
		tTerrains[0].onload = imgLoad;
		tTerrains[1] = new Image(); // Floor
		tTerrains[1].src = './images/floor.png';
		tTerrains[1].onload = imgLoad;
		tTerrains[2] = new Image(); // Wall
		tTerrains[2].src = './images/wall.png';
		tTerrains[2].onload = imgLoad;

		
		tPlayer = new Array();    // Player
		tPlayer[1] = new Image(); // Player facing up
		tPlayer[1].src = './images/'+player.image+'/up.png';
		tPlayer[1].onload = imgLoad;
		tPlayer[2] = new Image(); // Player facing right
		tPlayer[2].src = './images/'+player.image+'/right.png';
		tPlayer[2].onload = imgLoad;
		tPlayer[3] = new Image(); // Player facing down
		tPlayer[3].src = './images/'+player.image+'/down.png';
		tPlayer[3].onload = imgLoad;
		tPlayer[4] = new Image(); // Player facing left
		tPlayer[4].src = './images/'+player.image+'/left.png';
		tPlayer[4].onload = imgLoad;	
		
		tMonsters = new Array();
		for (var i = 1; i < monsterTypes.length; i++) {
			tMonsters[i] = new Array();
			tMonsters[i][1] = new Image();
			tMonsters[i][1].src = './images/monsters/'+monsterTypes[i].tile+'_up.png'; 
			tMonsters[i][1].onload = imgLoad;		
			tMonsters[i][2] = new Image();
			tMonsters[i][2].src = './images/monsters/'+monsterTypes[i].tile+'_right.png';
			tMonsters[i][2].onload = imgLoad;		
			tMonsters[i][3] = new Image();
			tMonsters[i][3].src = './images/monsters/'+monsterTypes[i].tile+'_down.png';
			tMonsters[i][3].onload = imgLoad;		
			tMonsters[i][4] = new Image();
			tMonsters[i][4].src = './images/monsters/'+monsterTypes[i].tile+'_left.png';
			tMonsters[i][4].onload = imgLoad;
		}
		mapTiles[1] = ctx.createImageData(3,3); // floor
		for (var i = 0; i <= 35; i++) mapTiles[1].data[i] = 255;
		mapTiles[2] = ctx.createImageData(3,3); // wall
		for (var i = 0; i <= 35; i++) mapTiles[2].data[i] = !((i+1) % 4) ? 255 : 0;
		mapTiles[3] = ctx.createImageData(3,3); // undefined
		for (var i = 0; i <= 35; i++) mapTiles[3].data[i] = (i+1)%4 ? 228 : 255;	
		mapTiles[4] = ctx.createImageData(3,3); // player
		for (var i = 0; i <= 35; i++) mapTiles[4].data[i] = i % 2 ? 255 : 0;
		mapTiles[5] = ctx.createImageData(3,3); // monster
		for (var i = 0; i <= 35; i++) mapTiles[5].data[i] = !(i % 4) || !((i+1) % 4) ? 255 : 0;
	} else {
		alert('you are a baka and youre using an outdated browser');
	}
}

function draw() {
	for (var i = Math.round(player.x)-10; i < 21+(Math.round(player.x)-10); i++) {
		for (var j = Math.round(player.y)-7; j < 15+(Math.round(player.y)-7); j++) {
			ctx.drawImage((dungeon[i] != undefined && dungeon[i][j] != undefined) ? tTerrains[dungeon[i][j].tile] : tTerrains[0], (i-player.x+10)*32, (j-player.y+7)*32);
			if (dungeon[i] != undefined && dungeon[i][j] != undefined && dungeon[i][j].monster) ctx.drawImage(tMonsters[monsters[dungeon[i][j].monster].type][monsters[dungeon[i][j].monster].dir], (i-player.x+10)*32, (j-player.y+7)*32);
		}
	}
	ctx.drawImage(tPlayer[player.dir], 10*32, 7*32);

	ctx.fillStyle = 'gray';
	ctx.fillRect(672, 0, 822, 480);

	ctx.fillStyle = 'white';
	ctx.font = "16px Pixelated";
	ctx.fillText(player.name, 682, 20);
	
	ctx.strokeRect(682, 40, 130, 3);
	ctx.fillStyle = 'green';
	ctx.fillRect(682, 40, (player.hp / player.maxHp)*130, 3);

	ctx.fillStyle = 'white';
	ctx.font = "10px Visitor";
	ctx.fillText(player.hp+"/"+player.maxHp+" HP", 682, 52);
	ctx.fillText("ATT: "+player.attack, 682, 72);
	ctx.fillText("DEF: "+player.defence, 682, 82);
	ctx.fillText("X;Y: "+player.x+";"+player.y, 682, 92);
	
	for (i = 1; i <= 50; i++) {
		for (j = 1; j <= 50; j++) {
			ctx.putImageData(
				//mapTiles[dungeon[i][j].known ? (dungeon[i][j].monster ? 5 : (dungeon[i][j].pass ? 1 : 2)) : 3],
				mapTiles[dungeon[i][j].monster ? 5 : (dungeon[i][j].pass ? 1 : 2)],
				672+((i-1)*3),
				330+((j-1)*3)
			);
		}
	}
	ctx.putImageData(mapTiles[4], 672+((player.x-1)*3), 330+((player.y-1)*3));
	
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
	draw();
	var success = Math.random() - (def.defence/10 * Math.random());
	if (success > 0.1) {   
		var damage = Math.round(success * att.attack);
		def.hp -= damage;
		log(att.name+' has attacked '+def.name+', and made '+damage+' points of damage.');
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
			player.dir = 4;
			nX--;
		break;
		case 0x26:
			player.dir = 1;
			nY--;
		break;
		case 0x27:
		  player.dir = 2;
			nX++;
		break;
		case 0x28:
			player.dir = 3;
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
		  
		  /*player.hp += rand(0,2);
			if (player.hp > player.maxHp) player.hp = player.maxHp;*/
			
			if (player.dir % 2 == 0) { // left or right
				if ((player.x + (player.dir == 4 ? -10 : 10) <= 50) && (player.x + (player.dir == 4 ? -10 : 10) >= 1)) {
					for (var i = (player.y-7 < 1 ? 1 : player.y-7); i <= (player.y+7 > 50 ? 50 : player.y+7); i++) dungeon[player.x + (player.dir == 4 ? -10 : 10)][i].known = true;
				}
			} else {
				if ((player.y + (player.dir == 1 ? -7 : 7) <= 50) && (player.y + (player.dir == 1 ? -7 : 7) >= 1)) {
					for (var i = (player.x-10 < 1 ? 1 : player.x-10); i <= (player.x+10 > 50 ? 50 : player.x+10); i++) dungeon[i][player.y + (player.dir == 1 ? -7 : 7)].known = true;
				}
			}
		}
		
		for (var i = 1; i < monsters.length; i++) {
			if (monsters[i].hp > 0 && player.hp > 0) monsters[i].takeTurn(); // if monster not dead, make him take his turn
		}	// AI players take their turns
		
		draw();
	} else draw();      // player  pressed the wrong key, only wanted to change the direction or bumped in a wall
}