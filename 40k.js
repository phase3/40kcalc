indent = 0;
showRolls = false;
var lastD6 = 0;

var iterations = parseInt(process.argv[2]);

var sideA = new Object();
var sideB = new Object();
sideA.wins = 0;
sideA.enemiesKilledShooting = 0;
sideA.enemiesKilledCombat = 0;

sideB.wins= 0;
sideB.enemiesKilledShooting = 0;
sideB.enemiesKilledCombat = 0;
for (var x=0;x<iterations;x++) {
    var distance = 20;
    var movement = 6;

	var a = new Object();
    a.side = sideA;
	a.name = "orks";
	a.models = 30;
	a.shots = 2;
	a.range = 18;
	a.armor = 6;
	a.bs = 4;
	a.tou = 4;
	a.attacks = 2;
	a.ws = 4;
	a.ini = 2;
	a.engaged = false;
	a.cover = 0;
	a.ld = 7;
	a.mob = true;
	a.broken = false;
	a.weaponStr = 4;
	a.str = 4;
	a.ap = 6;


	var b = new Object();
    b.side = sideB;
	b.name = "space marines";
	b.models = 20;
	b.shots = 1;
	b.range = 36;
	b.armor = 3;
	b.bs = 4;
	b.tou = 4;
	b.attacks = 2;
	b.ws = 4;
	b.ini = 4;
	b.engaged = false;
	b.cover = 4;
	b.ld = 8;
	b.mob = false;
	b.broken = false;
    b.weaponStr = 4;
	b.str = 4;
	b.ap = 5;

    var aRoll = d6() + d6();
    var bRoll = d6() + d6();

	while(a.models > 0 && b.models > 0) {
        if (aRoll > bRoll) {
            resolveRound(a,b);
            if (b.models <=0 || a.models <=0) {
                break;
            }
            resolveRound(b,a);
            if (b.models <=0 || a.models <=0) {
                break;
            }
        } else {
            resolveRound(b,a);
            if (b.models <=0 || a.models <=0) {
                break;
            }
            resolveRound(a,b);
            if (b.models <=0 || a.models <=0) {
                break;
            }
        }
	}
	stats(a);
	stats(b);
	if (a.models > 0) sideA.wins++;
	if (b.models > 0) sideB.wins++;
}
console.log("*************************************************************************************:");
console.log("TOTALS:");
console.log(ind(indent) + a.name + ": " + sideA.wins);
totalStats(a);
console.log(ind(indent) + b.name + ": " + sideB.wins);
totalStats(b);

function totalStats(unit) {
    console.log(ind(indent) +"shooting kills:     " + unit.side.enemiesKilledShooting);
    console.log(ind(indent) +"close combat kills: " + unit.side.enemiesKilledCombat);
}
function resolveRound(att, def) {
	console.log("*** " + att.name + " turn ***");
    indent=1;
	if (att.broken) {
        indent++;
		if (resolveMorale(att.models, att)) {
			// unit broken, falling back
			att.broken = true;
            att.engaged = false;
            def.engaged = false;
			distance += 6;
			console.log(ind(indent) +"UNIT BROKEN! retreating... distance now " + distance);
		} else {
			att.broken = false;
			console.log(ind(indent) +"Unit recovered");
		}
        indent--;
		return;
	} else {
		var startTotal = def.models;
        indent++;
		resolveMove(att);
        indent--;
        if (!att.engaged) {
            indent++
            resolveShootingRound(att,def);
            if (def.models <=0) {
                return;
            }
        }

        if ((100*def.models) / startTotal <= 75) {
            if (resolveMorale(startTotal, def)) {
                // unit broken, falling back
                def.broken = true;
                att.cover = 0;
                att.engaged = false;
                def.engaged = false;
                distance += 6;
                console.log(ind(indent) +"UNIT BROKEN! retreating... distance now " + distance);

            }
        }

        if (distance < 6) {
            distance=0;
            resolveCloseCombat(att, def);
        }
   	}
}

function resolveMorale(start, unit) {
	console.log(ind(indent) + "resolving Morale Check for "+ unit.name);
    indent++;
    try {
        if (unit.mob) {
            if (unit.models >=12) {
                return false;
            }
        }
        var r = d6() + d6();
        console.log(ind(indent) +"Morale " + (r > unit.ld?"failed":"safe") + ": roll=" + r);
        return (r > unit.ld) ;
    } finally {
        indent--;
    }
}
function resolveMove(unit) {
	console.log(ind(indent) + "resolving Move Round for "+ unit.name);
    indent++;
    try {
        if (unit.engaged) {
            console.log(ind(indent) +"No movement, unit engaged in close combat");
            return;
        }
        if (unit.cover >0) {
            console.log(ind(indent) +"No movement, unit in cover");
            return;
        }
        if (distance <=0) {
            console.log(ind(indent) +"No movement, distance=0");
            return;
        }
        var x = distance;
        if (distance < 6) {
            distance = 0;
        } else {
            x=6;
            distance -= 6;
        }
        console.log(ind(indent) +"moving "+ unit.models + " " + unit.name + " "+ x + "\" closer. Distance now: " + distance);
    } finally {
        indent--;
    }
}

function stats(o) {
    console.log("___________________________________________");
    console.log("name:   "+ o.name + ", models: "+ o.models);
    console.log("");
}
function resolveShootingRound(attacker, defender) {
	console.log(ind(indent) +  "resolving Shooting Round for "+ attacker.name);
    indent++;
    try {
        if (distance > attacker.range) {
            console.log (ind(indent) +"No shooting, out of range");
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
            if (rollWound(attacker.weaponStr, defender.tou)) {
                woundHits++;
            }
            wRolls += lastD6 + ":";

        }
        if (showRolls) {
            console.log(ind(indent) + attacker.models + " "+ attacker.name + " got "+ hits + " hits (" + bsRolls + ") and scored " + woundHits + " potential wounds (" + wRolls + ")");
        } else {
            console.log(ind(indent) + attacker.models + " "+ attacker.name + " got "+ hits + " hits and scored " + woundHits + " potential wounds ");
        }
        // roll defender
        var wounds = 0;
        for (var x=0;x<woundHits;x++) {
            if (!rollSave(defender.armor, attacker.ap)) {
                if (defender.cover <= 0 ||  !rollCoverSave(defender.cover)) {
                    wounds++;
                }
            }
        }
        console.log(ind(indent) + defender.models + " "+ defender.name + " took "+ wounds + " wounds");

        attacker.side.woundsDealt += wounds;
        if (defender.models < wounds) {
            attacker.side.enemiesKilledShooting += defender.models;
            defender.models = 0;
        } else {
            attacker.side.enemiesKilledShooting += wounds;
            defender.models -= wounds;
        }
    } finally {
        indent--;
    }
}

function d6() {
	with(Math) var x = 1 + floor(random() * 6); 
	lastD6 = x;
	return x;
}

function rollBS(bs) {
	//todo deal with bs>6
	var r = d6();
	//console.log(ind(indent) +"   BS D6:" + r);
	if (r==1) return false;
	
	return (7-bs) <= r;
}
function rollWound(str, tou) {
	var r = d6();
	//console.log(ind(indent) +"   Wound D6:" + r);
	if (r==1) return false;
	var v = 4+(tou-str);
	return v<=r;
}
function rollSave(sv,ap) {
	//check armor piercing
	if (sv>=ap) {
		//console.log(ind(indent) +"   FAIL  Save fail: auto-hit");
		return false; // auto hit
	}
	
	var r = d6();
	//console.log(ind(indent) +"   "+(r >=sv?"SAVE":"FAIL") + "  Save D6:" + r + " against " + sv + "+ armour save " );
	return (r >= sv);
}
function resolveCloseCombat(attacker, defender) {
    // bonuses: +1 1st to assault, +1 two weapons
    // resolve initiative order
    // roll to hit: = ws  	4+
    //				> ws*2 	5+
    //				< ws	3+
    // wound = str vs tou
    // declare save against armor
    // count casualties, greatest loser rolls morale
    // sweeping adlvances if no other engaged units
    // if no more close combat, allow move 6" (consolidation move)
    var attStartModels = attacker.models;
    var defStartModels = defender.models;

    var defCasualties = 0;
    var attCasualties = 0;
    console.log(ind(indent) + "Resolving Close combat, attacker is: " + attacker.name);

    indent++;
    try {
        if (attacker.ld >= defender.ld) {
            console.log(ind(indent) + attacker.name + " leads the attack with a better initiative");
            defCasualties = attack(attacker, defender);
            if(defender.models < defCasualties) {
                attacker.side.enemiesKilledCombat +=defender.models;
                defender.models = 0;
            } else {
                attacker.side.enemiesKilledCombat += defCasualties;
                defender.models -= defCasualties;
            }
            if (defender.models > 0) {
                attCasualties = attack(defender, attacker);
                if(attacker.models < attCasualties) {
                    defender.side.enemiesKilledCombat +=attacker.models;
                    attacker.models = 0;
                } else {
                    defender.side.enemiesKilledCombat += attCasualties;
                    attacker.models -= attCasualties;
                }
            }
        } else {
            console.log(ind(indent) + defender.name + " leads the attack with a better initiative");
            attCasualties = attack(defender, attacker);
            if(attacker.models < attCasualties) {
                defender.side.enemiesKilledCombat +=attacker.models;
                attacker.models = 0;
            } else {
                defender.side.enemiesKilledCombat += attCasualties;
                attacker.models -= attCasualties;
            }

            if (attacker.models > 0) {
                defCasualties = attack(attacker, defender);
                if(defender.models < defCasualties) {
                    attacker.side.enemiesKilledCombat +=defender.models;
                    defender.models = 0;
                } else {
                    attacker.side.enemiesKilledCombat += defCasualties;
                    defender.models -= defCasualties;
                }
            }
        }

        if (attacker.models <=0 || defender.models <=0 ) {
            //someone won the combat
            attacker.engaged = false;
            defender.engaged = false;
        } else {
            if (attCasualties > defCasualties) {
                //roll attacker morale
                if (resolveMorale(attStartModels,attacker)) {
                    // sweeping
                    var a = d6() + defender.ini;
                    var d = d6() + attacker.ini;
                    if (d >= a) {
                        // smack!
                        attacker.models = 0;
                        attacker.engaged = false;
                        defender.engaged = false;
                    } else {
                        attacker.engaged = false;
                        defender.engaged = false;
                        attacker.broken = true;
                        attacker.cover = 0;
                        distance += 6;
                        console.log(ind(indent) +"UNIT BROKEN! retreating... distance now " + distance);

                    }
                }
            } else if (defCasualties > attCasualties) {
                //roll defender morale
                if (resolveMorale(defStartModels,defender)) {
                    // sweeping
                    var a = d6() + attacker.ini;
                    var d = d6() + defender.ini;
                    if (a >= d) {
                        // smack!
                        attacker.side.enemiesKilled += defender.models;
                        defender.models = 0;
                        defender.engaged = false;
                        attacker.engaged = false;
                    } else {
                        attacker.engaged = false;
                        defender.engaged = false;
                        defender.broken = true;
                        defender.cover = 0;
                        distance += 6;
                        console.log(ind(indent) +"UNIT BROKEN! retreating... distance now " + distance);

                    }
                }
            }
        }
    } finally {
        indent--;
    }
}
function rollCoverSave (sv) {

	var r = d6();
	//console.log(ind(indent) +"      " + (r >=sv?"SAVE":"FAIL") + "  Cover Save D6:" + r + " against " + sv + "+ cover save");
	return (r >= sv);
}
function attack(attacker,defender) {
    var attacks = attacker.attacks;
    if (attacker.engaged == false ) {
        attacks ++;
        attacker.engaged = true;
        defender.engaged = true;
    }
    var total = attacker.models * attacker.attacks;

    var wounds = 0;
    for(var x=0;x<total;x++) {

        var roll = 4;
        if (attacker.ws > defender.ws) {
            roll = 3;
        } else if (defender.ws > (attacker.ws*2)) {
            roll = 5;
        }
        var r = d6();
        //console.log(ind(indent) +"   wound roll is " + r + " on a " + roll + "+");
        if (r >= roll) {
            wounds++;
        }
    }
    var defWounds =0;
    for(var x=0;x<wounds;x++) {
        //todo deal with multiple wound characters
        if (rollWound(attacker.str, defender.tou)) {
            defWounds ++;
        }
    }
    console.log(ind(indent) +"   " + attacker.name + " attacks " + total + "x and hits " + wounds + "x, " + defWounds + " wounds dealt against " + defender.name);
    return defWounds;

}
function ind(level) {
    switch(level) {
        case 0: return "";
        case 1: return "   ";
        case 2: return "      ";
        case 3: return "         ";
        case 4: return "            ";
        case 5: return "               ";
        case 5: return "                  ";
    }
    return "";
}