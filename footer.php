<?php
	echo "<span class='footer'><a href='http://github.com/popoffka/dungeons'>Dungeons</a> by mariofag. Rev. ";
	$rev = system("git rev-parse HEAD");
	echo "<br />\n";
	if ($_SERVER["HTTP_HOST"] == "dun.shell.tor.hu") 
		echo 'Host kindly provided by <a href="http://shell.tor.hu">shell.tor.hu</a>, great web host with shell access, real hardware and low prices. More info at <a href="http://cp.tor.hu">cp.tor.hu</a>.</span>';
?>