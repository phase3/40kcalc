var lastD6 = 0;

var iterations = 100;
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
	a.broken = false;
	
	a.STR = 4;
	a.AP = 6;
	
	var distance = 31;
	var movement = 6;
	
	var b = new Object();
	b.name = "space marines";
	b.Models = 9;
	b.Shots = 1;
	b.Range = 36;
	b.Armor = 3;
	b.BS = 4;
	b.TOU = 4;
	b.Cover = 4;
	b.LD = 8;
	b.Mob = false;
	b.broken = false;

	b.STR = 4;
	b.AP = 5;
	
	while(a.Models > 0 && b.Models > 0) {
		resolveRound(a,b);
		if (b.Models <=0) {
			break;
		}
		resolveRound(b,a);
		if (a.Models <=0) {
			break;
		}
	}
	stats(a);
	stats(b);
	if (a.Models > 0) winA++;
	if (b.Models > 0) winB++;
}
console.log("TOTALS:");
console.log(a.name + ": " + winA);
console.log(b.name + ": " + winB);

function resolveRound(att, def) {
	if (att.broken) {
		if (resolveMorale(att.Models, att)) {
			// unit broken, falling back
			att.broken = true;
			distance += 6;
			console.log("   UNIT BROKEN! retreating... distance now " + distance);
		} else {
			att.broken = false;
			console.log("   Unit recovered");
		}
		return;
	} else {
		var startTotal = def.Models;
		resolveMove(att);
		resolveShootingRound(att,def);
		if (def.Models <=0) {
			return;
		}
		
		if ((100*def.Models) / startTotal <= 75) {
			if (resolveMorale(startTotal, def)) {
				// unit broken, falling back
				def.broken = true;
				distance += 6;
				console.log("   UNIT BROKEN! retreating... distance now " + distance);

			}
		}
	}
}

function resolveMorale(start, unit) {
	console.log("resolving Morale Check for "+ unit.name);
	if (unit.Mob) {
		if (unit.Models >=12) {
			return false;
		}
	}
	var r = d6() + d6();
	console.log("   Morale " + (r > unit.LD?"failed":"safe") + ": roll=" + r);
	return (r > unit.LD) ;
}
function resolveMove(unit) {
	console.log("resolving Move Round for "+ unit.name);
	if (unit.Cover >0) {
		console.log("   No movement, unit in cover");
		return;
	}
	if (distance <=0) {
		console.log("   No movement, distance=0");
		return;
	}
	var x = distance;
	if (distance < 6) {
		distance = 0;
	} else {
		x=6;
		distance -= 6;
	}
	console.log("   moving "+ unit.Models + " " + unit.name + " "+ x + "\" closer. Distance now: " + distance);
}

function stats(o) {
	console.log("name:   "+ o.name);
	console.log("models: "+ o.Models);
}
function resolveShootingRound(attacker, defender) {
	console.log("resolving Shooting Round for "+ attacker.name);
	if (distance > attacker.Range) {
		console.log ("   No shooting, out of range");
		return;
	}
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
	if (defender.Models < 0) defender.Models = 0;

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

