var lastD6 = 0;

var iterations = 1000;
var winA = 0;
var winB = 0;

for (var x=0;x<iterations;x++) {
	var a = new Object();
	a.name = "orks";
	a.Models = 20;
	a.Shots = 2;
	a.Range = 18;
	a.Armor = 6;
	a.BS = 4;
	a.TOU = 4;
	a.Cover = 0;
	a.LD = 7;
	a.Mob = true;
	
	a.STR = 4;
	a.AP = 6;
	
	var distance = 30;
	var movement = 6;
	
	var d = new Object();
	d.name = "space marines";
	d.Models = 10;
	d.Shots = 1;
	d.Range = 36;
	d.Armor = 3;
	d.BS = 4;
	d.TOU = 4;
	d.Cover = 4;
	d.LD = 8;
	d.Mob = false;
	
	d.STR = 4;
	d.AP = 5;
	
	while(a.Models > 0 && d.Models > 0) {
		resolveShootingRound(d,a);
		if (a.Models <=0) {
			break;
		}
		resolveShootingRound(a,d);
	}
	stats(a);
	stats(d);
	if (a.Models > 0) winA++;
	if (d.Models > 0) winB++;
}
console.log("TOTALS:");
console.log(a.name + ": " + winA);
console.log(d.name + ": " + winB);


function stats(o) {
	console.log("name:   "+ o.name);
	console.log("models: "+ o.Models);
}
function resolveShootingRound(attacker, defender) {
	console.log("resolving Shooting Round for "+ attacker.name);
	var hits= 0;
	// roll attacker
	var bsRolls = "";
	for(var x=0;x<(attacker.Models*attacker.Shots);x++) {
		if (rollBS(attacker.BS)) {
			hits++;
		}
		bsRolls += lastD6 + ":";
	}
	var woundHits = 0;
	var wRolls = "";
	for(var x=0;x<hits;x++) {
		if (rollWound(attacker.STR, defender.TOU)) {
			woundHits++;
		}
		wRolls += lastD6 + ":";
		
	}
	console.log("   " + attacker.Models + " "+ attacker.name + " got "+ hits + " hits (" + bsRolls + ") and scored " + woundHits + " potential wounds (" + wRolls + ")");
	
	// roll defender
	var wounds = 0;
	for (var x=0;x<woundHits;x++) {
		if (!rollSave(defender.Armor, attacker.AP)) {
			if (defender.Cover <= 0 ||  !rollCoverSave(defender.Cover)) {
				wounds++;
			}
		}
	}
	console.log("   " + defender.Models + " "+ defender.name + " took "+ wounds + " wounds");
	defender.Models -= wounds;
	//todo morale
}

function d6() {
	with(Math) var x = 1 + floor(random() * 6); 
	lastD6 = x;
	return x;
}

function rollBS(bs) {
	//todo deal with bs>6
	var r = d6();
	//console.log("      BS D6:" + r);
	if (r==1) return false;
	
	return (7-bs) <= r;
}
function rollWound(str, tou) {
	var r = d6();
	//console.log("      Wound D6:" + r);
	if (r==1) return false;
	var v = 4+(tou-str);
	return v<=r;
}
function rollSave(sv,ap) {
	//check armor piercing
	if (sv>=ap) {
		//console.log("      FAIL  Save fail: auto-hit");
		return false; // auto hit
	}
	
	var r = d6();
	//console.log("      "+(r >=sv?"SAVE":"FAIL") + "  Save D6:" + r + " against " + sv + "+ armour save " );
	return (r >= sv);
}
function rollCoverSave (sv) {

	var r = d6();
	//console.log("         " + (r >=sv?"SAVE":"FAIL") + "  Cover Save D6:" + r + " against " + sv + "+ cover save");
	return (r >= sv);
}

