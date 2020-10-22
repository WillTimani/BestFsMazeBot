CPSC 481-05
Project #1 BestFs
Team WIL
William Timani

Introduction:
This is a javascript program, with html, LISP and P5 incorporation. The purpose of this program is to demonstrate a bot that navigates a maze via the BestFs algorithm. The starting position of the bot is the top left cell of the top left loop. The goal is the bottom right cell of the bottom right loop. 

As the bot proceeds through the maze, it uses the heuristic value (based on the manhattan distance to the end cell) to determine which cell to navigate to. When encountered with a tie, the bot will proceed to a cell on the same row first. The program keeps track of cells that the bot has discovered, but not visited. If one of these cells has a lower heuristic value than the next cell the bot wants to traverse to, it will backtrack to the previous cell. 

Contents:  
assets  
pix  
cs-sketch.js  
GridMaze.jpg  
index-js-p5-jathp-5.html  
Jathp.js  
mathStuff.js  
p5.js  
pathCell.js  
README.txt  

External Requirements:
This program was tested using a local python3 server on linux and Google Chrome. There is a high chance that the program will not run as intended on any browser without establishing a local server to be able to load the GridMaze.jpg file. 

Setup and Installation:
Setting up a local server may be required to run the program as intended. In testing this was done with the linux terminal command: 

python3 -m http.server 1234

Then navigating to localhost:1234 in the Google Chrome or Mozilla Firefox browser and clicking on the html file. There may be other ways to successfully run the program, however this has not been investigated at this time.  

If this setup is not followed, the maze may not be properly loaded which will cause the bot to not function as intended. 

Sample Invocation:
The program is started and the bot will start travesing the maze from the top left corner. The bot will continue to run its pathing algorithm until it has reached the bottom left corner. The step count will also change as the bot takes each step through the maze. 

Features:
- Bot that is displayed as a yellow dot and moves left, right, up and down one cell at a time  
- Wall detection that prevents the bot from moving through maze walls   
- Junction detection and decisions based on a heuristic function  
- Backtracking to a previously discovered cell if it has a lower heuristic value than the next cell in the bots path  
- Best path from the start to the bot/end displayed as orange dots  
- Previously visited cells displayed as white dots  
- Previously discovered, but not traversed to cells displayed as blue dots  
- Target cell for backtracking displayed as a green dot  
- Step count that increments after each bot takes a step (forward or back)   

Bugs:
- No currently known bugs 

Third Party Material:
All files contained in this project (other than mathStuff.js and pathCell.js) originated from Charles Siska. index-js-p5-jathp-5.html and cs-sketch.js have been modified heavily from the originally provided files. All other files were purely provided by Charles.   

Screenshots showing the progression of the bot as time progresses:

![Breadbot1](https://github.com/WillTimani/BreadbotsAdventure/blob/main/Images/Breadbot1.png)
![Breadbot2](https://github.com/WillTimani/BreadbotsAdventure/blob/main/Images/Breadbot2.png)
![Breadbot3](https://github.com/WillTimani/BreadbotsAdventure/blob/main/Images/Breadbot3.png)
![Breadbot4](https://github.com/WillTimani/BreadbotsAdventure/blob/main/Images/Breadbot4.png)
![FinishMaze](https://github.com/WillTimani/BreadbotsAdventure/blob/main/Images/FinishMaze.png)

