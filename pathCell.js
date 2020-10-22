//=============================pathCell.js============================//
// This file contains pathCell classes and all other classes assoiciated with it

// Author: William Timani
// Contact: willtimani@gmail.com

class junctionObj {
	constructor(dir, JID){
		this.dir = dir; // direction
		this.JID = JID; // junctionID
	}
}

class pathCell {

	static junctionIDGen = 0; // shared across all pathCells

	// x coordinate
	// y coordinate
	// mom cell
	// heuristic value
	constructor(x, y, m, h){
		this.xCoor = x;
		this.yCoor = y;
		this.explored = true;
		this.momCell = m;
		this.heuristic = h;
		this.children = []; // list to keep track of children
		this.numChildren = 0;
		this.junctionID; 

	}

	static increaseJIDGen(){
		this.junctionIDGen++;
	}

	static returnJIDGen(){
		return this.junctionIDGen;
	}

	addChild(pC, dir){

		this.children[dir] = pC;
		this.numChildren++;
		if(this.numChildren == 2){
			this.junctionID = pathCell.returnJIDGen();
			pathCell.increaseJIDGen();
			console.log("Generating New JunctionID: " + pathCell.returnJIDGen());
		}
	}

	getDirectionFromMom(){
		var dx = this.xCoor - this.momCell.xCoor;
		var dy = this.momCell.yCoor - this.yCoor; 

		if(dx == 1) return 1;
		if(dx == -1) return 3;
		if(dy == 1) return 2;
		if(dy == -1)return 0;
	}

	compareMom(x, y){
		if(this.xCoor == x && this.yCoor == y) return true;
		return false;
	}

}

class openCell extends pathCell {
	// x coordinate
	// y coordinate
	// mom cell
	// heuristic value 
	constructor(x, y, m, h){
		super(x,y,m,h);
		this.junctionStack = []; // junctionStack that will contain junctionObjects 
		this.justAdded = true;
		this.stackEmpty = false; 
	}

	// if direction and JID on the top of the junctionStack match, pop off the top element 
	// else push on the new direction if the JID on top of the stack does not match
	updateStack(cDir, pDir, JID){
		if(this.junctionStack.length > 0){
			if(this.junctionStack[0].JID == JID){
				if(cDir == this.junctionStack[0].dir){
					this.junctionStack.shift();
				} 
			} else {
				this.junctionStack.splice(0,0,new junctionObj(pDir, JID));	
			}
		} else {
			if(this.momCell.junctionID != JID){
				this.junctionStack.splice(0,0,new junctionObj(pDir, JID));
			}
		}

	}

}