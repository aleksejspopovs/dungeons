// misc roguelike code
// 2010 no copyright — mariofag
// free software is our future


function gameOverKeyHandler(e) {
	if (e.keyCode == 1090 || e.keyCode == 110 || e.keyCode == 78) newGame();
}

function log(str) {
	document.getElementById('gamelog').value += "\n"+str;
	document.getElementById('gamelog').scrollTop = document.getElementById('gamelog').scrollHeight; 
}
function logDec() {
	document.getElementById("gamelog").rows--;
	window.localStorage.rows = document.getElementById("gamelog").rows;
}
function logInc() {
	document.getElementById("gamelog").rows++;
	window.localStorage.rows = document.getElementById("gamelog").rows;
}
function logError(str) {
	document.getElementById('errorlog').value += "\n"+str;
	document.getElementById('errorlog').scrollTop = document.getElementById('errorlog').scrollHeight;
	errorCount++;
	document.getElementById('errorToggle').value = "Errors: "+errorCount;
}
function toggleErrorDisplay() {
	if (document.getElementById('errorlog').style.display == "block") {
		document.getElementById('errorlog').style.display = "none";
		window.localStorage.errorDisplay = "none";
	} else {
		document.getElementById('errorlog').style.display = "block";
		window.localStorage.errorDisplay = "block";
		document.getElementById('errorlog').scrollTop = document.getElementById('errorlog').scrollHeight;
	}
}
function logDebug(str) {
	document.getElementById('debuglog').value += "\n"+str;
	document.getElementById('debuglog').scrollTop = document.getElementById('debuglog').scrollHeight;
}
function toggleDebugDisplay() {
	if (document.getElementById('debuglog').style.display == "block") {
		document.getElementById('debuglog').style.display = "none";
		window.localStorage.debugDisplay = "none";
	} else {
		document.getElementById('debuglog').style.display = "block";
		window.localStorage.debugDisplay = "block";
		document.getElementById('debuglog').scrollTop = document.getElementById('debuglog').scrollHeight;
	}
}

function fillScreenPart() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, 672, 5*temp);
	temp++;
	if (temp > 96) {
		clearInterval(intervalId);
		gameOver(true);
	}
}

function gameOver(c) {
	if (!c) {
		if (navigator.appName == "Opera")
			document.onkeypress = null;
		else 
			document.onkeydown = null;
		intervalId = setInterval(fillScreenPart, 25);
	} else {
		ctx.fillStyle = 'white';
		ctx.font = "54pt Pixelated";
		ctx.fillText("GAME OVER", 147, 80);
		ctx.font = "12pt Pixelated";
		ctx.fillText("Press n to start a new game", 200, 100);
		if (navigator.appName == "Opera")
			document.onkeypress = gameOverKeyHandler;
		else 
			document.onkeydown = gameOverKeyHandler;
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

function alertAjaxGet(url) { // ATTN: this function isn't supported by IE6 and lower (but fuck that shit)
	var req = new XMLHttpRequest();
	req.onreadystatechange=function () {
		if (req.readyState == 4 && req.status == 200) {
			alert(req.responseText);
		}
	}
	req.open("GET",url,true);
	req.send();
}

function browserCheck() {
	return (window.localStorage) && (document.getElementById('game').getContext) && (window.XMLHttpRequest);
}