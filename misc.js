// misc dungeons code
// this software is available under MIT License, see LICENSE for more info
// free software is our future


function log(str) {
	document.getElementById('gamelog').innerHTML += "<br />" + str;
	document.getElementById('gamelog').scrollTop = document.getElementById('gamelog').scrollHeight;
}

function logDec() {
	window.localStorage.rows--;
	document.getElementById("gamelog").style.height = window.localStorage.rows + "em";
}

function logInc() {
	window.localStorage.rows++;
	document.getElementById("gamelog").style.height = window.localStorage.rows + "em";
}

function toggleBgm() {
	window.localStorage.bgm = window.localStorage.bgm == "on" ? "off" : "on";
	document.getElementById("bgmButton").value = "music: " + window.localStorage.bgm;
	if (window.localStorage.bgm == "on")
		bgm.play();
	else
		bgm.pause();
}

function fillScreenPart() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, 672, 5 * temp);
	temp++;
	if (temp > 96) {
		clearInterval(intervalId);
		gameOver(true);
	}
}

function rand(a, b) {
	if (a > b) {
		var x = a;
		a = b;
		b = a;
	}
	return Math.round(Math.random()*(b - a))+parseInt(a);
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
	var out = "<table>";
	for (var i = 1; i < monsterTypes.length; i++) {
		out += "<tr><td><img src='"+monsterTypes[i].tile[D_DOWN].src+"' /></td><td><b>"+monsterTypes[i].name+"</b><br /><i>"+monsterTypes[i].desc+"</i><br />Drawn by "+monsterTypes[i].artist+".<br /></td></tr>";
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
	//return Math.round((floor % 100)/10) == 1 ? (floor+"th") : (floor % 10 == 1 ? (floor+"st") : (floor % 10 == 2 ? (floor+"nd") : (floor % 10 == 3 ? (floor+"rd") : (floor+"th"))));
	// saved to keep me ashamed of what I've done
	// this is amost as bad as that RFC email validating regexp
	if (Math.round(floor % 100 / 10) == 1) {
		return floor + "th";
	} else {
		switch (floor % 10) {
			case 1:
				return floor + "st";
			break;
			case 2:
				return floor + "nd";
			break;
			case 3:
				return floor + "rd";
			break;
			default:
				return floor + "th";
			break;
		}
	}
}

function browserCheck() {
	return (window.localStorage) && (document.getElementById('game').getContext) && (window.XMLHttpRequest);
}

function setKeyListener(l) {
	document.onkeydown = l;
}

function itemRecordCompare(a, b) {
	return ((a.itemId === undefined) || (items[a.itemId].name > items[b.itemId].name));
}
