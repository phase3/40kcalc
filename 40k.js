var lastD6 = 0;

var iterations = 100;
var winA = 0;
var winB = 0;

for (var x=0;x<iterations;x++) {
	var a = new Object();
	a.name = "orks";
	a.models = 10;
	a.shots = 2;
	a.range = 18;
	a.armor = 6;
	a.bs = 4;
	a.tou = 4;
	a.cover = 0;
	a.ld = 7;
	a.mob = true;
	a.broken = false;
	a.str = 4;
	a.ap = 6;
	a.stats = new Object();
	
	var distance = 31;
	var movement = 6;
	
	var b = new Object();
	b.name = "space marines";
	b.models = 5;
	b.shots = 1;
	b.range = 36;
	b.armor = 3;
	b.bs = 4;
	b.tou = 4;
	b.cover = 0;
	b.ld = 8;
	b.mob = false;
	b.broken = false;
	b.str = 4;
	b.ap = 5;
	b.stats = new Object();
	
	while(a.models > 0 && b.models > 0) {
		resolveRound(a,b);
		if (b.models <=0) {
			break;
		}
		resolveRound(b,a);
		if (a.models <=0) {
			break;
		}
	}
	stats(a);
	stats(b);
	if (a.models > 0) winA++;
	if (b.models > 0) winB++;
}
console.log("TOTALS:");
console.log(a.name + ": " + winA);
console.log(b.name + ": " + winB);

function resolveRound(att, def) {
	console.log("*** " + att.name + " turn ***");
	if (att.broken) {
		if (resolveMorale(att.models, att)) {
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
		var startTotal = def.models;
		resolveMove(att);
		resolveShootingRound(att,def);
		if (def.models <=0) {
			return;
		}
		
		if ((100*def.models) / startTotal <= 75) {
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
	if (unit.mob) {
		if (unit.models >=12) {
			return false;
		}
	}
	var r = d6() + d6();
	console.log("   Morale " + (r > unit.ld?"failed":"safe") + ": roll=" + r);
	return (r > unit.ld) ;
}
function resolveMove(unit) {
	console.log("resolving Move Round for "+ unit.name);
	if (unit.cover >0) {
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
	console.log("   moving "+ unit.models + " " + unit.name + " "+ x + "\" closer. Distance now: " + distance);
}

function stats(o) {
	console.log("name:   "+ o.name + ", models: "+ o.models);
}
function resolveShootingRound(attacker, defender) {
	console.log("resolving Shooting Round for "+ attacker.name);
	if (distance > attacker.range) {
		console.log ("   No shooting, out of range");
		return;
	}
	var hits= 0;
	// roll attacker
	var bsRolls = "";
	for(var x=0;x<(attacker.models*attacker.shots);x++) {
		if (rollBS(attacker.bs)) {
			hits++;
		}
		bsRolls += lastD6 + ":";
	}
	var woundHits = 0;
	var wRolls = "";
	for(var x=0;x<hits;x++) {
		if (rollWound(attacker.str, defender.tou)) {
			woundHits++;
		}
		wRolls += lastD6 + ":";
		
	}
	console.log("   " + attacker.models + " "+ attacker.name + " got "+ hits + " hits (" + bsRolls + ") and scored " + woundHits + " potential wounds (" + wRolls + ")");
	
	// roll defender
	var wounds = 0;
	for (var x=0;x<woundHits;x++) {
		if (!rollSave(defender.armor, attacker.ap)) {
			if (defender.cover <= 0 ||  !rollCoverSave(defender.cover)) {
				wounds++;
			}
		}
	}
	console.log("   " + defender.models + " "+ defender.name + " took "+ wounds + " wounds");
	defender.models -= wounds;
	if (defender.models < 0) defender.models = 0;

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

