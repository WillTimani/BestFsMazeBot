// Local server host command: python3 -m http.server 1234
// Website: http://localhost:1234/

// Author: William Timani
// Contact: willtimani@gmail.com
// cs-sketch.js; Handles maze traversal algorithm and data structures


// Make global g_canvas JS 'object': a key-value 'dictionary'.
var g_canvas; // JS Global var, w canvas size info.
var g_frame_cnt; // Setup a P5 display-frame counter, to do anim
var g_frame_mod; // Update ever 'mod' frames.
var g_stop; // Go by default.
var g_cnv;   // To hold a P5 canvas.
var g_button; // btn
var g_button2; // btn
var img;

var reachedEnd; // tells draw_update to stop when the bot has reached the end
var backtrack; // indicates whether the bot is backtracking or moving forward
var followMom; // indicates whether the bot should backtrack following the mom or the child
var enterJunctionDirection; // keeps track of the direction that the bot entered the junction at

var closedList = [];
var open = [];
var bestPath = [];
var backtrackJunctionStack = [];

var currentPathCell;
var openDirectionCell;

var stepsTaken;

var g_l4job = { id:1 }; // Put Lisp stuff for JS-to-access in ob; id to make ob.

function setup() // P5 Setup Fcn
{
    console.log( "Beg P5 setup =====");
    console.log( "@: log says hello from P5 setup()." );
    g_canvas = { cell_size:20, wid:37, hgt:29 };
    g_frame_cnt = 0; // Setup a P5 display-frame counter, to do anim
    g_frame_mod = 24; // Update ever 'mod' frames.
    g_stop = 0; // Go by default.

    reachedEnd = false;
    backtrack = false;
    followMom = true; 
    currentPathCell = new pathCell(1,1, null, calcHeuristic(1, 1)); // start bot at 1, 1
    stepsTaken = 0;

    let sz = g_canvas.cell_size;
    let width = sz * g_canvas.wid;  // Our 'canvas' uses cells of given size, not 1x1.
    let height = sz * g_canvas.hgt;
    g_cnv = createCanvas( width, height );  // Make a P5 canvas.
    console.log( "@: createCanvas()." );

    img = loadImage('GridMaze.jpg');
 
    background(img);

    console.log( "End P5 setup =====");
}

var g_bot = { dir:1, x:1, y:1, color:256 }; // Dir is 0..7 clock, w 0 up.
var g_box = { t:1, hgt:47, l:1, wid:63 }; // Box in which bot can move.
var g_direction = {dirX:1, dirY:0}; // current direction of the bot Uo = 0 Right = 1 Down = 2 Left = 3 

function csjs_get_pixel_color_sum( rx, ry )
{
    let acolors = get( rx, ry ); // Get pixel color [RGBA] array.
    let sum = acolors[ 0 ] + acolors[ 1 ] + acolors[ 2 ]; // Sum RGB.
    return sum;
}

// insert an openCell onto the open list in order from lowest heuristic to highest
function insertInSortedOrder(oC){

    for(var i = 0; i < open.length; i++){
        if(open[i].heuristic > oC.heuristic){
            open.splice( i, 0, oC);
            return;
        }
    }

    open.push(oC);

    return;
}

// check if the cooridnates contain a pathCell on the closed list
function isOnClosed(x, y){

    for(var i = 0; i < closedList.length; i++){
        if(closedList[i].xCoor == x && closedList[i].yCoor == y) return true;
    }

    return false;
}

// check if the coorinates contain an openCell on the open list
function isOnOpen(x, y){

    for(var i = 0; i < open.length; i++){
        if(open[i].xCoor == x && open[i].yCoor == y){
            return true;
        }
    }

    return false;    
}

// push a junction decision onto the junction stacks of all current openCells
function pushJunctionDecision(dir, JID){

    for(var i = 0; i < open.length; i++){
        if(!open[i].justAdded){
            open[i].junctionStack.splice(0, 0, new junctionObj(dir, JID));
        } else {
            open[i].justAdded = false;
        }
    }
}

// check if the current cell at coordinates x and y is a junction and push new openCells onto the open list
// if there are multiple directions to proceed, choose direction with lowest heuristic 
function check_Junction(x, y){

    var bestH = 1000; //initialize heuristic at max of 1000 (higher than will ever be for this maze)
    openDirectionCell = new openCell(0,0,null, 10000); //initialize an openCell to compare to other directions
    var numDirections = 0; // initialize the number of directions to 0 

    if(!check_up(x, y)){
        numDirections++;
        if(calcHeuristic(x, y - 1) <= bestH && !isOnClosed(x, y - 1) && !isOnOpen(x, y -1)){

            g_direction.dirY = -1;
            g_direction.dirX = 0;
            g_bot.dir = 0;

            bestH = calcHeuristic(x, y - 1);
            openDirectionCell = new openCell(g_bot.x, g_bot.y - 1, currentPathCell, bestH);
            currentPathCell.addChild(openDirectionCell, 0);

        }  else if(!isOnClosed(x, y - 1) && !isOnOpen(x, y - 1)){

            var temp = new openCell(g_bot.x -1, g_bot.y, currentPathCell, calcHeuristic(x, y - 1));
            insertInSortedOrder(temp);
            currentPathCell.addChild(temp, 0);

        }
    }
    if(!check_down(x, y)){
        numDirections++;
        if(calcHeuristic(x, y + 1) <= bestH && !isOnClosed(x, y + 1) && !isOnOpen(x, y + 1)){

            g_direction.dirY = 1;
            g_direction.dirX = 0;
            g_bot.dir = 2;

            bestH = calcHeuristic(x, y + 1);

            if(openDirectionCell.xCoor != 0) insertInSortedOrder(openDirectionCell);

            openDirectionCell = new openCell(g_bot.x, g_bot.y + 1, currentPathCell, bestH);
            currentPathCell.addChild(openDirectionCell, g_bot.dir);

        }  else if(!isOnClosed(x, y + 1) && !isOnOpen(x, y + 1)){

            var temp = new openCell(g_bot.x -1, g_bot.y, currentPathCell, calcHeuristic(x, y + 1))
            insertInSortedOrder(temp);
            currentPathCell.addChild(temp, 2);

        }
    }
    if(!check_right(x, y)){
        numDirections++;
        if(calcHeuristic(x + 1, y) <= bestH && !isOnClosed(x + 1, y) && !isOnOpen(x + 1, y)){

            g_direction.dirY = 0;
            g_direction.dirX = 1;
            g_bot.dir = 1;

            bestH = calcHeuristic(x + 1, y);

            if(openDirectionCell.xCoor != 0) insertInSortedOrder(openDirectionCell);

            openDirectionCell = new openCell(g_bot.x + 1, g_bot.y, currentPathCell, bestH);
            currentPathCell.addChild(openDirectionCell, g_bot.dir);

        }  else if(!isOnClosed(x + 1, y) && !isOnOpen(x + 1, y)){

            var temp = new openCell(g_bot.x -1, g_bot.y, currentPathCell, calcHeuristic(x + 1, y));
            insertInSortedOrder(tmep);
            currentPathCell.addChild(temp, 1);

        }
    }
    if(!check_left(x, y)){
        numDirections++;
        if(calcHeuristic(x - 1, y) <= bestH && !isOnClosed(x - 1, y) && !isOnOpen(x - 1, y)){

            g_direction.dirY = 0;
            g_direction.dirX = -1;
            g_bot.dir = 3;
            
            bestH = calcHeuristic(x - 1, y);

            if(openDirectionCell.xCoor != 0) insertInSortedOrder(openDirectionCell);

            openDirectionCell = new openCell(g_bot.x - 1, g_bot.y, currentPathCell, bestH);
            currentPathCell.addChild(openDirectionCell, g_bot.dir);

        } else if(!isOnClosed(x - 1, y) && !isOnOpen(x - 1, y)){
            var temp = new openCell(g_bot.x -1, g_bot.y, currentPathCell, calcHeuristic(x - 1, y))
            insertInSortedOrder(temp);
            currentPathCell.addChild(temp, 3);

        }
    }

    // if the number of directions > 2, currentPathCell must be junctiom
    if(numDirections > 2){
        pushJunctionDecision(oppositeDirection(enterJunctionDirection), currentPathCell.junctionID); // push direction choice to open list
    }

    return bestH; // return best heuristic of all junction choices to be compared with best openCell later on

}

function moveForward(x, y){

    let sz = g_canvas.cell_size; // initialize cell size
    enterJunctionDirection = g_bot.dir; // hold bot direction for later

    // push the currentPathCell onto closed and bestPath lists
    if(closedList.length < 500 && !backtrack){
        var temp = currentPathCell;
        currentPathCell = new pathCell(g_bot.x, g_bot.y, temp, calcHeuristic(g_bot.x, g_bot.y));
        closedList.push(currentPathCell);
        bestPath.push(currentPathCell);
    }

    console.log("Current X: " + currentPathCell.xCoor + " Current Y: " + currentPathCell.yCoor);

    // check for walls, then junctions
    // when a wall is detected, turn right, repeat 4 times to ensure an open path is chosen
    for(var i = 0; i < 4; i++){

        if(g_bot.dir == 0){

            if(check_up(x, y)){
                g_direction.dirY = 0;
                g_direction.dirX = 1;
                g_bot.dir = 1;
            } else{

                if(open.length > 0){
                    if(check_Junction(x, y) > open[0].heuristic) backtrack = true;
                } else {
                    check_Junction(x,y);
                }
                break;
            }        

        } else if(g_bot.dir == 1){

            if(check_right(x, y)){
                g_direction.dirY = 1;
                g_direction.dirX = 0;
                g_bot.dir = 2;
            } else{
    
                if(open.length > 0){
                    if(check_Junction(x, y) > open[0].heuristic) backtrack = true;
                } else {
                    check_Junction(x,y);
                }
                break;
            }

        } else if(g_bot.dir == 2){

            if(check_down(x, y)){
                g_direction.dirY = 0;
                g_direction.dirX = -1;
                g_bot.dir = 3;
            } else{
    
                if(open.length > 0){
                    if(check_Junction(x, y) > open[0].heuristic) backtrack = true;
                } else {
                    check_Junction(x,y);
                }
                break;
            }

        } else if(g_bot.dir == 3){

            if(check_left(x, y)){
                g_direction.dirY = -1;
                g_direction.dirX = 0;
                g_bot.dir = 0;
            } else{

                if(open.length > 0){
                    if(check_Junction(x, y) > open[0].heuristic) backtrack = true;
                } else {
                    check_Junction(x,y);
                }
                break;
            }
        }
    }

    // add the currentPathCell as a child to its momCell
    currentPathCell.momCell.children[enterJunctionDirection] = currentPathCell; 

    if(backtrack){

        var temp = currentPathCell;
        g_direction.dirX = currentPathCell.momCell.xCoor - g_bot.x;
        g_direction.dirY = currentPathCell.momCell.yCoor - g_bot.y; 
        currentPathCell = currentPathCell.momCell; 

        // copy junction stack for backtrack processing
        backtrackJunctionStack = open[0].junctionStack;

        // initialize to follow mom when backtracking
        followMom = true;

        // log all the junction steps to follow when backtracking
        for(var i = 0;  i < backtrackJunctionStack.length; i++){
            console.log("Junction Step " + i + ": " + backtrackJunctionStack[i].dir + " JID: " + backtrackJunctionStack[i].JID);
        }

        // insert the previosly chosen next pathCell to the open list 
        if(openDirectionCell.heuristic < 500){
            openDirectionCell.justAdded = false;
            insertInSortedOrder(openDirectionCell);
        }

        // remove cell from bestPath list
        bestPath.splice(bestPath.length - 1, 1);
    }

}

function goBack(){

    console.log("Current X: " + g_bot.x + " Current Y: " + g_bot.y);
    console.log("Target X: " + open[0].momCell.xCoor + " Target Y: " + open[0].momCell.yCoor);

    var childDirection = 0; // initialize the direction of child to backtrack to
    var junctionDecision; // initialize direction choice of current junction 
    var prevDirection = getDir(g_direction.dirX, g_direction.dirY); // get the previous direction from change in x and y
    var junctionChosen = false; // initialize whether a junction decision has been made this iteration 

    // if current cell is a junction 
    if(currentPathCell.numChildren > 1){

        // pop the junction decision off the copied junction stack
        junctionDecision = backtrackJunctionStack.shift();
        if(junctionDecision != null){
            junctionDecision = junctionDecision.dir;
        } 

        // update the stack to remove or add the junction decision
        for(var i = 1; i < open.length; i++){
            open[i].updateStack(junctionDecision, oppositeDirection(prevDirection), currentPathCell.junctionID);
        }

        // determine if the decision leads to a child or a mom cell 
        if(currentPathCell.children[junctionDecision] == null || currentPathCell.children[junctionDecision].compareMom(currentPathCell.momCell.xCoor,currentPathCell.momCell.yCoor)){
            followMom = true;
        } else {
            followMom = false; 
            junctionChosen = true;
        }

    }

    // if target cell's momCell matches current bot position, end backtrack
    if(open[0].momCell.xCoor == g_bot.x && open[0].momCell.yCoor == g_bot.y){

        backtrack = false; 

        g_direction.dirX = open[0].xCoor - g_bot.x;
        g_direction.dirY = open[0].yCoor - g_bot.y;

        // remove top cell from open list 
        open.shift();

        // update new bot direction
        if(g_direction.dirX == 1){
            g_bot.dir = 1;
        } else if (g_direction.dirX == -1) {
            g_bot.dir = 3;
        } else if (g_direction.dirY == 1){
            g_bot.dir = 2;
        } else if (g_direction.dirY == -1){
            g_bot.dir = 0;
        }

        return;
    }

    // get next cell to backtrack to based on followMom or follow child 
    if(followMom){
        g_direction.dirX = currentPathCell.momCell.xCoor - g_bot.x;
        g_direction.dirY = currentPathCell.momCell.yCoor - g_bot.y; 
        currentPathCell = currentPathCell.momCell; 
        bestPath.splice(bestPath.length - 1, 1);
    } else{
        
        // if junction direction was chosen, update based on the junctionDecision
        if(junctionChosen){
            g_direction.dirX = currentPathCell.children[junctionDecision].xCoor - g_bot.x;
            g_direction.dirY = currentPathCell.children[junctionDecision].yCoor - g_bot.y; 
            currentPathCell = currentPathCell.children[junctionDecision]; 
        } else {
            // if junction direction not chosen, find the child of current cell to backtrack to
            while(currentPathCell.children[childDirection] == null && childDirection < 4){
                childDirection++;
            }
            if(childDirection >= 4){
                g_direction.dirX = currentPathCell.momCell.xCoor - g_bot.x;
                g_direction.dirY = currentPathCell.momCell.yCoor - g_bot.y; 
                currentPathCell = currentPathCell.momCell; 
                followMom = true;
            } else {
                g_direction.dirX = currentPathCell.children[childDirection].xCoor - g_bot.x;
                g_direction.dirY = currentPathCell.children[childDirection].yCoor - g_bot.y; 
                currentPathCell = currentPathCell.children[childDirection]; 
            }
        }

        bestPath.push(currentPathCell);
    }    
}

// functions to check if there is a wall(black colored cell)
function check_up(x, y){

    let sz = g_canvas.cell_size;
    var color = csjs_get_pixel_color_sum(x * sz + 10, y * sz - sz + 10);

    if(color < 50) return true;

    return false;

}

function check_down(x, y){

    let sz = g_canvas.cell_size;
    var color = csjs_get_pixel_color_sum(x * sz + 10, y * sz + sz + 10);

    if(color < 50) return true;

    return false;

}

function check_right(x, y){

    let sz = g_canvas.cell_size;
    var color = csjs_get_pixel_color_sum(x * sz + sz + 10, y * sz + 10);

    if(color < 50) return true;

    return false;

}

function check_left(x, y){

    let sz = g_canvas.cell_size;
    var color = csjs_get_pixel_color_sum(x * sz - sz + 10, y * sz + 10);

    if(color < 50) return true;

    return false;

}

var g_path = {pathX:0, pathY:0}; // current pathCell to draw
var g_open = {openX:0, openY:0}; // current openCell to draw
var g_target = {targetX:0, targetY:0}; // current target cell to draw
var g_bestPath = {x:0, y:0}; // current bestPath cell to draw

function draw_update()  // Update the display.
{

    stepsTaken++;
    document.getElementById("steps").innerHTML = stepsTaken;

    console.log("Currently Backtracking: " + backtrack);

    if(!backtrack){
        moveForward(g_bot.x, g_bot.y);
    } else {
        goBack();
    }
    background(img);

    // draw closed list as white dots
    for(var i = 0; i < closedList.length; i++){

        g_path.pathX = closedList[i].xCoor;
        g_path.pathY = closedList[i].yCoor;

        g_l4job.draw_path_cell();

    }

    // draw open list as blue dots
    for(var i = 0; i < open.length; i++){

        g_open.openX = open[i].xCoor;
        g_open.openY = open[i].yCoor;

        g_l4job.draw_open_cell();

    }

    // draw target cell as green dot
    if(open.length > 0){

        g_target.targetX = open[0].xCoor;
        g_target.targetY = open[0].yCoor;

        g_l4job.draw_target_cell();

    }

    // draw best path as orange dots 
    for(var i = 0; i < bestPath.length; i++){

        g_bestPath.x = bestPath[i].xCoor;
        g_bestPath.y = bestPath[i].yCoor;

        g_l4job.draw_bestPath_cell();

    }

    console.log( "Call g_l4job.draw_fn" );
    g_l4job.draw_fn( );

    // if heuristic value is 0, bot has reached the goal and will stop 
    if(calcHeuristic(g_bot.x, g_bot.y) == 0) reachedEnd = true;

}

function draw()  // P5 Frame Re-draw Fcn, Called for Every Frame.
{
    ++g_frame_cnt;
    if (0 == g_frame_cnt % g_frame_mod && !reachedEnd)
    {
        console.log( "g_frame_cnt = " + g_frame_cnt );
        if (!g_stop) draw_update();
    }
}

function keyPressed( )
{
    console.log( "@: keyPressed " );
    g_stop = ! g_stop;
    if (g_stop) { noLoop(); } else {loop();}
}