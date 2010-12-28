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