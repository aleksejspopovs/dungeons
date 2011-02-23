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
		ctx.textAlign = "center";
		ctx.font = "54pt '04b03r'";
		ctx.fillText("GAME OVER", 336, 80);
		ctx.font = "12pt '04b03r'";
		ctx.fillText("Insert coin(s) or press n to start a new game", 336, 100);
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

function closeOverlay() {
	document.getElementById("overlay").style.display = "none";
}

function openOverlay(title, content) {
	document.getElementById("overlayContent").innerHTML = content;
	document.getElementById("overlayTitle").innerHTML = title;
	document.getElementById("overlay").style.display = "block";
}

function generateArtsInfo() {
	out = "<table>";
	for (var i = 1; i < monsterTypes.length; i++) {
		out += "<tr><td><img src='./images/monsters/"+monsterTypes[i].tile+"_down.png' /></td><td><b>"+monsterTypes[i].name+"</b><br /><i>"+monsterTypes[i].desc+"</i><br />Drawn by "+monsterTypes[i].artist+".<br /></td></tr>";
	}
	out += "<tr><td colspan='2' style='font-weight: bold;	font-size: 12pt;'>Fonts</td></tr>";
	out += "<tr><td style='font-family: Visitor; font-size: 16pt'>Abc<br />123</td><td>Visitor font<br />Free for personal use.<br /><i>Made by AEnigma (Brian Kent).</td>";
	out += "<tr><td style='font-family: \"04b03r\"; font-size: 12pt'>Abc<br />Абв<br />123</td><td>04b03rus font<br />Free for any (personal, commercial, etc) use.<br /><i>Made by <a href='http://www.04.jp.org/'>04</a>. Cyryllic symbols added by Endou.</td>";
	return out+"</table>";
}

function browserCheck() {
	return (window.localStorage) && (document.getElementById('game').getContext) && (window.XMLHttpRequest);
}