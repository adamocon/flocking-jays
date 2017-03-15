// Birb class

var birb_length = 10;
var birb_width = 16;
var mass = 1;
var air_resistance = 0.002;

var max_speed = 3;
var strength = 0.008;

var personal_space = 20;
var range_of_sight = 150;

function Birb(x_start, y_start){
	this.position = createVector(x_start, y_start);
	this.velocity = createVector(random(-1, 1), random(-1, 1));
	this.r = 3;

	this.sep_weight = 2.0;
	this.coh_weight = 1.0;
	this.ali_weight = 1.0;
	this.avo_weight = 1.5;

	this.run_birb = function(birbs){
		this.calc_motion(birbs);
		this.draw_birb();
	}

	this.calc_motion = function(birbs){
		// Find force and acceleration
		force = this.calc_force(birbs);
		this.acceleration = force.div(mass);

		// Update velocity and position
		this.velocity.add(this.acceleration);
		this.position.add(this.velocity);
	}

	this.calc_force = function(birbs){
		force = createVector(0, 0);

		// Calculate and weight forces
		var separating_force = this.separating_force(birbs).mult(this.sep_weight);
		var cohesive_force = this.cohesive_force(birbs).mult(this.coh_weight);
		var aligning_force = this.aligning_force(birbs).mult(this.ali_weight);
		var avoidance_force = this.avoidance_force().mult(this.avo_weight);

		// Air resistance
		v_sqd = this.velocity.magSq();
		v_direction = (this.velocity.copy()).normalize();
		resistance_force = v_direction.mult(air_resistance * v_sqd);

		// Sum forces
		force.add(separating_force);
		force.add(cohesive_force);
		force.add(aligning_force);
		force.add(avoidance_force);
		force.sub(resistance_force);

		return force
	}

	this.move_towards = function(desired_steering_vector){
		// Change velocity to be going at max speed toward target direction
		desired_steering_vector.normalize();
		desired_steering_vector.mult(max_speed);
		desired_steering_vector.sub(this.velocity);

		// But with limited change of speed
		desired_steering_vector.limit(strength);

		return desired_steering_vector
	}

	this.separating_force = function(birbs){
		var separating_force = createVector(0, 0);
		var birbs_too_close = 0;

		for (var i = 0; i < birbs.length; i++){

			// birbs[i].position this is the issue line
			// Vector is from neighbour birb to birb (note for later)
			var diff_vector = p5.Vector.sub(this.position, birbs[i].position);
			var dist = diff_vector.mag();

			// Check birb is not current birb, and is uncomfortably close
			if ((dist > 0) && (dist < personal_space)){
				birbs_too_close++;

				// Add weighted vector to steering vector
				// dist * dist = normalisation, extra dist is weighting
				separating_force.add(diff_vector.div(dist*dist*dist));
			}
		}

		// Average
		if (birbs_too_close > 0){
			separating_force.div(birbs_too_close);
		}

		// If direction is to be changed
		if (separating_force.magSq() > 0){
			separating_force = this.move_towards(separating_force);
		}

		return separating_force
	}

	this.cohesive_force = function(birbs){
		var positions = createVector(0, 0);
		var birbs_in_range = 0;

		for (var i = 0; i < birbs.length; i++){

			// Vector is from neighbour birb to birb (note for later)
			var diff_vector = p5.Vector.sub(this.position, birbs[i].position);
			var dist_sqd = diff_vector.magSq();

			// Check birb is not current birb, and is within range of sight
			if ((dist_sqd > 0) && (dist_sqd < range_of_sight*range_of_sight)){
				birbs_in_range++;

				// Add neighbour's position vector to sum
				positions.add(birbs[i].position);
			}
		}

		// Average
		if (birbs_in_range > 0){
			positions.div(birbs_in_range);
			var diff_vector = p5.Vector.sub(positions, this.position);
			cohesive_force = this.move_towards(diff_vector);
		} else {
			cohesive_force = createVector(0, 0);
		}

		return cohesive_force
	}

	this.aligning_force = function(birbs){
		var velocities = createVector(0, 0);
		var birbs_in_range = 0;

		for (var i = 0; i < birbs.length; i++){

			// Vector is from neighbour birb to birb (note for later)
			var diff_vector = p5.Vector.sub(this.position, birbs[i].position);
			var dist_sqd = diff_vector.magSq();

			// Check birb is not current birb, and is within range of sight
			if ((dist_sqd > 0) && (dist_sqd < range_of_sight*range_of_sight)){
				birbs_in_range++;

				// Add neighbour's velocity vector to sum
				velocities.add(birbs[i].velocity);
			}
		}

		// Average
		if (birbs_in_range > 0){
			velocities.div(birbs_in_range);
			aligning_force = this.move_towards(velocities);
		} else {
			aligning_force = createVector(0, 0);
		}

		return aligning_force
	}

	this.avoidance_force = function(){
		var avoidance_force = createVector(0, 0);

		left_space = this.position.x + 100;
		right_space = width - this.position.x + 100; 
		up_space = this.position.y + 100;
		down_space = height - this.position.y + 100;

		// Check if birb can see wall, add wall avoiding force if so
		if (left_space < range_of_sight){
			// avoidance_force.add(createVector(1/left_space, 0))
			avoidance_force.add(createVector(1, 0))
		}
		if (right_space < range_of_sight){
			avoidance_force.add(createVector(-1, 0))
		}
		if (up_space < range_of_sight){
			avoidance_force.add(createVector(0, 1))
		}
		if (down_space < range_of_sight){
			avoidance_force.add(createVector(0, -1))
		}

		// If direction is to be changed
		if (avoidance_force.magSq() > 0){
			avoidance_force = this.move_towards(avoidance_force);
		}

		return avoidance_force
	}


	this.draw_birb = function(){
		noStroke();
		fill(0, 180);

		// Move to position and draw triangle pointing along velocity
		push();
		translate(this.position.x, this.position.y);
		rotate(this.velocity.heading());
		// for circles
		// ellipse(0, 0, radius);
		triangle(-birb_length/2, -birb_width/2,
			     -birb_length/2, birb_width/2,
			      birb_length/2, 0);
		pop();
	}
}
