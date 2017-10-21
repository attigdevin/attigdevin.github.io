var gridSize = 64

var playing = false;
var playButton,table;
var cells = []
var activeTimer;
var stepDelay = 250

var aliveCells = {}

var schematics = {
	"reset":[],
	"p15":[-1,-4,-1,-3,-1,-2,-1,-1,-1,0,-1,1,-1,2,-1,3,0,-4,0,-2,0,-1,0,0,0,1,0,3,1,-4,1,-3,1,-2,1,-1,1,0,1,1,1,2,1,3],
	"p3":[-6,-4,-6,-3,-6,-2,-6,2,-6,3,-6,4,-4,-6,-4,-1,-4,1,-4,6,-3,-6,-3,-1,-3,1,-3,6,-2,-6,-2,-1,-2,1,-2,6,-1,-4,-1,-3,-1,-2,-1,2,-1,3,-1,4,1,-4,1,-3,1,-2,1,2,1,3,1,4,2,-6,2,-1,2,1,2,6,3,-6,3,-1,3,1,3,6,4,-6,4,-1,4,1,4,6,6,-4,6,-3,6,-2,6,2,6,3,6,4],
	"explode1":[0,-2,-1,-1,0,-1,1,-1,-1,0,1,0,0,1],
	"explode2":[-2,-2,0,-2,2,-2,-2,-1,2,-1,-2,0,2,0,-2,1,2,1,-2,2,0,2,2,2],
	"ship":[-1,-2,0,-2,1,-2,2,-2,-2,-1,2,-1,2,0,-2,1,1,1],
	"glider":[0,-1,1,0,-1,1,0,1,1,1],
	"tumbler":[-3,0,-3,1,-3,2,-2,-3,-2,-2,-2,2,-1,-3,-1,-2,-1,-1,-1,0,-1,1,1,-3,1,-2,1,-1,1,0,1,1,2,-3,2,-2,2,2,3,0,3,1,3,2],
	"gun":[-31,-15,-31,-14,-30,-15,-30,-14,-21,-15,-21,-14,-21,-13,-20,-16,-20,-12,-19,-17,-19,-11,-18,-17,-18,-11,-17,-14,-16,-16,-16,-12,-15,-15,-15,-14,-15,-13,-14,-14,-11,-17,-11,-16,-11,-15,-10,-17,-10,-16,-10,-15,-9,-18,-9,-14,-7,-19,-7,-18,-7,-14,-7,-13,3,-17,3,-16,4,-17,4,-16]
}

var lineSchematic = [] // generate line schematic
for (var i = 0; i < gridSize; i++){
	lineSchematic.push(i-Math.floor(gridSize/2))
	lineSchematic.push(0)
}
schematics["line"] = lineSchematic

var schematicTrans = Math.floor(gridSize/2) // convert schematics and center schematics independently of gridSize
for (var sName in schematics){
	var schematic = schematics[sName];
	var cellState = {}
	var x,y;
	for (var i = 0; i < schematic.length; i += 2){
		x = schematic[i]+schematicTrans;
		y = schematic[i+1]+schematicTrans;
		cellState[x+","+y] = true;
	}
	schematics[sName] = cellState
}


function loadState(newState){ // overrides current state with new state
	var toggles = [];
	var str,spl;
	for (var cell in aliveCells){
		if (!(cell in newState)){
			spl = cell.split(",");
			toggles.push([parseInt(spl[0]),parseInt(spl[1]),false]);
		}
	}
	for (var cell in newState){
		if (!(cell in aliveCells)){
			spl = cell.split(",");
			toggles.push([parseInt(spl[0]),parseInt(spl[1]),true]);
		}
	}
	updateState(toggles);
}
function loadSchematic(e){
	if (e.target.tagName.toLowerCase() == "button"){
		loadState(schematics[e.target.id])
	}
}

function updateState(toggles){ // update game state and display
	var i,cell,x,y,value;
	for (i in toggles){
		cell = toggles[i];
		x = cell[0];
		y = cell[1];
		value = cell[2];
		if (x >= 0 && y >= 0 && x < gridSize && y < gridSize){
			cells[y][x].setAttribute("class",value ? "alive" : "");
		}
		if (value){
			aliveCells[x+","+y] = true;
		} else {
			delete aliveCells[x+","+y];
		}
	}
}

function countNeighbors(x,y){ // helper for main logic
	var c = 0;
	for (var i = -1; i <= 1; i++){
		for (var j = -1; j <= 1; j++){
			if ((i != 0 ||  j != 0) && ((x+i)+","+(y+j) in aliveCells)){
				c++;
			}
		}
	}
	return c;
}

function step(){ // main logic
	var toggles = []
	var neighbors;
	var x,y,spl,str,cell,v;
	var i,j;
	var deadCells = {}
	for (cell in aliveCells){
		spl = cell.split(",")
		x = parseInt(spl[0])
		y = parseInt(spl[1])
		neighbors = countNeighbors(x,y)
		if (neighbors < 2 || neighbors > 3){
			toggles.push([x,y,false]) // kill cells with fewer than 2 neighbors or more than 3 neighbors
		}
		// check for adjacent dead cells
		for (i = -1; i <= 1; i++){
			for (j = -1; j <= 1; j++){
				str = (x+i)+","+(y+j)
				if (!(str in aliveCells)){
					deadCells[str] = true
				}
			}
		}
	}
	for (cell in deadCells){
		spl = cell.split(",")
		x = parseInt(spl[0])
		y = parseInt(spl[1])
		neighbors = countNeighbors(x,y)
		if (neighbors == 3){
			toggles.push([x,y,true]) // bring dead cells with 3 neighbors to life
		}
	}
	updateState(toggles)
}

function cellClick(e){
	if (e.target.tagName.toLowerCase() == "td"){
		if (e.target.className == "alive"){
			e.target.setAttribute("class","");
			delete aliveCells[e.target.cellName];
		} else {
			e.target.setAttribute("class","alive");
			aliveCells[e.target.cellName] = true;
		}
	}
}

function stepDelayChange(e){
	var newValue = parseFloat(e.target.value);
	document.getElementById("stepDelayLabel").textContent = newValue.toFixed(2)+"s"
	stepDelay = newValue*1000;
	if (playing){
		window.clearInterval(activeTimer)
		activeTimer = window.setInterval(step,stepDelay)
	}
}


function togglePlay(){
	playing = !playing
	playButton.setAttribute("class",playing ? "pause" : "play")
	playButton.textContent = playing ? "Pause" : "Play"
	if (playing){
		step()
		activeTimer = window.setInterval(step,stepDelay)
	} else {
		window.clearInterval(activeTimer)
	}
}

function showGridToggle(e){
	var customStyle = document.getElementById("customStyle").sheet
	if (e.target.checked){
		customStyle.insertRule("td {border:1px solid black;}")
	} else {
		customStyle.deleteRule(0)
	}
}

function start(){
	var g = document.getElementById("game")
	table = document.createElement("table")
	for (var i = 0; i < gridSize; i++){
		var r = document.createElement("tr")
		cells[i] = []
		for (var j = 0; j < gridSize; j++){
			var c = document.createElement("td")
			c.cellName = j+","+i
			r.appendChild(c)
			cells[i][j] = c
		}
		table.appendChild(r)
	}
	g.appendChild(table)
	
	table.addEventListener("mousedown",cellClick)
	
	document.getElementById("stepButton").addEventListener("click",step)
	playButton = document.getElementById("playButton")
	playButton.addEventListener("click",togglePlay)
	
	document.getElementById("stepDelay").addEventListener("change",stepDelayChange)
	document.getElementById("showGrid").addEventListener("change",showGridToggle)
	document.getElementById("schematics").addEventListener("click",loadSchematic)
}
window.addEventListener("load",start)