// misc roguelike code
// 2010 no copyright — mariofag
// free software is our future


function log(str) {
	document.getElementById('gamelog').value += str+"\n";
	document.getElementById('gamelog').scrollTop = document.getElementById('gamelog').scrollHeight; 
}
function log_dec() {
	document.getElementById("gamelog").rows--;
	window.localStorage.rows = document.getElementById("gamelog").rows;
}
function log_inc() {
	document.getElementById("gamelog").rows++;
	window.localStorage.rows = document.getElementById("gamelog").rows;
}

function fillScreenPart() {
	ctx.fillStyle = 'black';  
	ctx.fillRect(0, 0, 672, 10*temp);
	temp++;
	if (temp > 48) {
		clearInterval(intervalId);
		gameOver(true);
	}
}

function gameOver(c) {
	if (!c)	{
		document.onkeydown = "";
		intervalId = setInterval(fillScreenPart, 125);
	} else {
		ctx.fillStyle = 'white';  
		ctx.font = "72px Pixelated";
		ctx.fillText("GAME OVER", 147, 80);
	}
}

function rand(a,b) {
	if (a > b) {
		x = a;
		a = b;
		b = a;
	}
	return Math.round(Math.random()*(b-a))+parseInt(a);
}

function pathFinding(tX, tY, fX, fY) {
	var xOff = new Array(0, 0, 1, 0, -1);
	var yOff = new Array(0, -1, 0, 1, 0);
	var queue = new Array();
	var dung = new Array();
	for (var i = 1; i <= 50; i++) {
		dung[i] = new Array();
		for (var j = 1; j <= 50; j++) dung[i][j] = Infinity;
	}
	var curX = fX;
	var curY = tY;
	var r = 1;
	var w = 2;
	dung[fX][fY] = 0;
	queue[1] = fX*100+fY;
	while (!((curX == tX) && (curY == tY)) && !(r == w)) {
		curX = Math.floor(queue[r]/100);
		curY = queue[r] % 100;
		if (curX < 50 && dungeon[curX+1][curY].pass && dung[curX+1][curY] > dung[curX][curY]+1) {
			dung[curX+1][curY] = dung[curX][curY]+1;
			queue[w] = (curX+1)*100 + curY;
			w++;
		}
		if (curX > 1 && dungeon[curX-1][curY].pass && dung[curX-1][curY] > dung[curX][curY]+1) {
			dung[curX-1][curY] = dung[curX][curY]+1;
			queue[w] = (curX-1)*100 + curY;
			w++;
		}
		if (curY < 50 && dungeon[curX][curY+1].pass && dung[curX][curY+1] > dung[curX][curY]+1) {
			dung[curX][curY+1] = dung[curX][curY]+1;
			queue[w] = curX*100 + curY+1;
			w++;
		}
		if (curY > 1 && dungeon[curX][curY-1].pass && dung[curX][curY-1] > dung[curX][curY]+1) {
			dung[curX][curY-1] = dung[curX][curY]+1;
			queue[w] = curX*100 + curY-1;
			w++;
		}
		r++;
	}
	var minDir = 0;
	var minVal = Infinity;
	for (i = 1; i <= 4; i++) {
		if (dung[tX+xOff[i]][tY+yOff[i]] < minVal) {
			minVal = dung[tX+xOff[i]][tY+yOff[i]];
			minDir = i;
		}	
	}
	return minDir;
}