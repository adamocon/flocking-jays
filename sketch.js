// Main script

var start_num_birbs = 1;
var max_num_birbs = 200;
var birb_adding;

birbs = [];

// add predator functionality next

function setup(){
	createCanvas(windowWidth, windowHeight);

	// Create birbs
	for (var i = 0; i < start_num_birbs; i++){
		start_x = random(50, width - 50);
		start_y = random(50, height - 50);
		birbs[i] = new Birb(start_x, start_y);
	}
}

function draw(){
	background(240);

	// Display information
	if (birbs.length < max_num_birbs){
		textStyle(ITALIC);
		textAlign(CENTER);
		fill(0, 180);
		textSize(24);
		text("click or hold to add jays", width/2, height*18/20);
	}

	if (birbs.length == 1){
		label = " jay";
	} else {
		label = " jays";
	}

	textAlign(LEFT);
	textSize(18);
	text(birbs.length.toString().concat(label), width/50, height/20);

	// Run and draw birbs
	for (var i = 0; i < birbs.length; i++){
		birbs[i].run_birb(birbs);
	}
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}

function add_birb_at_mouse(){
	if (birbs.length < max_num_birbs){
		birbs[birbs.length] = new Birb(mouseX, mouseY);	
	}
}

function mousePressed() {
	add_birb_at_mouse();
	birb_adding = setInterval(add_birb_at_mouse, 100);
}

function mouseReleased() {
	clearInterval(birb_adding);
}