// misc dungeons code
// this software is available under MIT License, see LICENSE for more info
// free software is our future


function gameOverKeyHandler(e) {
	if (e.keyCode == 1090 || e.keyCode == 110 || e.keyCode == 78) newGame(1);
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

function toggleBgm() {
	window.localStorage.bgm = window.localStorage.bgm == "on" ? "off" : "on";
	document.getElementById("bgmButton").value = "music: "+window.localStorage.bgm;
	if (window.localStorage.bgm == "on")
		bgm.play();
	else
		bgm.pause();
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
		setKeyListener(null);
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

function rand(a,b) {
	if (a > b) {
		x = a;
		a = b;
		b = a;
	}
	return Math.round(Math.random()*(b-a))+parseInt(a);
}

function randH(a,b) {
  return rand(a,b) + (Math.random() >= 0.5 ? 0.5 : 0);
}

function randHalf() {
  var x = Math.random();
  while (x > 0.5)
    x = Math.random();
  return x;
}

function checkCoords(x, y) {
  return x >= 1 && x <= LEVELSIZE && y >= 1 && y <= LEVELSIZE;
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
	out += "<tr><td colspan='2' style='font-weight: bold;	font-size: 12pt;'>Music</td></tr>";
	out += "<tr><td><img src='./images/music.png'></td><td>Another corridor<br /><i>Made by Anonymous musician from Dobrochan #1.</td>";
	out += "<tr><td><img src='./images/music.png'></td><td>Winged tune<br /><i>Made by Anonymous musician from Dobrochan #2.</td>";
	
	return out+"</table>";
}

function getFloorString(floor) {
  return Math.round((floor % 100)/10) == 1 ? (floor+"th") : (floor % 10 == 1 ? (floor+"st") : (floor % 10 == 2 ? (floor+"nd") : (floor % 10 == 3 ? (floor+"rd") : (floor+"th"))));
}

function browserCheck() {
	return (window.localStorage) && (document.getElementById('game').getContext) && (window.XMLHttpRequest);
}

function setKeyListener(l) {
  if (navigator.appName == "Opera")
    document.onkeypress = l;
  else 
    document.onkeydown = l;
}

function itemCompare(a, b) {
  return ((a == undefined) || (items[a].name > items[b].name));
}
