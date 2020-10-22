//==============================mathStuff.js===================================//
// Contains simple functions to help with the maze traversal algorithm contain in cs-sketch.js

// Author: William Timani
// Contact: willtimani@gmail.com

// calculate the heurisitc solution from inputted path cell
function calcHeuristic(x, y){
    return (Math.abs(35 - x) + Math.abs(27 - y));
}

// given a direction, return the opposite direction 
function oppositeDirection(dir){

    if(dir == 0) return 2;
    if(dir == 1) return 3;
    if(dir == 2) return 0;
    if(dir == 3) return 1; 
 
}

// given a change in x and change in y, return the direction
function getDir(dx,dy){

    if(dx == 1) return 1;
    if(dx == -1) return 3;
    if(dy == 1) return 2;
    if(dy == -1) return 0;

}