var math = require('../utils/math')
var util = require('util');
var widget = require('../core/widget');

/** 
	@class tilt      
	Mobile and Mac/Chrome-compatible tilt sensor. May not work on all devices! <br> **Notes:** Clicking on this widget toggles it inactive or active. <br>
	We recommend not calling .init() on this object after the original initialization, because it will add additional redundant tilt listeners to your document.
	```html
	<canvas nx="tilt"></canvas>
	```
	<canvas nx="tilt" style="margin-left:25px"></canvas>
*/

var tilt = module.exports = function (target) {
	this.defaultSize = { width: 50, height: 50 };
	widget.call(this, target);
	
	this.tiltLR;
	this.tiltFB;
	this.z;
	/** @property {boolean} active Whether or not the tilt widget is on (animating and transmitting data). */
	this.active = true;

	/** @property {object}  val  Object containing the core interactive aspects of the widget, which are also its data output. Has the following properties: 
		| &nbsp; | data
		| --- | ---
		| *x* | X-axis rotation if supported (-1 to 1)
		| *y* | Y-axis rotation if supported (-1 to 1)
		| *z* | Z-axis rotation if supported (-1 to 1 or possibly 0 to 360 depending on device)
	*/
	this.val = {
		x: 0,
		y: 0,
		z: 0
	}

	/** @property {string}  text   Text shown on tilt object
	*/
	
	this.text = "TILT";
	this.init();
}
util.inherits(tilt, widget);

tilt.prototype.deviceOrientationHandler = function() {
	
	this.val = {
		x: math.prune(this.tiltLR/90,3),
		y: math.prune(this.tiltFB/90,3),
		z: math.prune(this.z,3)
	}

	if (this.active) {
		this.transmit(this.val);
	}
	
}

tilt.prototype.init = function() {
	var self = this;
	this.draw();
	
	if (window.DeviceOrientationEvent) {
	  window.addEventListener('deviceorientation', function(eventData) {
	    self.tiltLR = eventData.gamma;
			self.tiltFB = eventData.beta;
			self.z = eventData.alpha
	    self.deviceOrientationHandler();
	    self.draw();
	  }, false);
	} else if (window.OrientationEvent) {
	  window.addEventListener('MozOrientation', function(eventData) {
	    self.tiltLR = eventData.x * 90;
	    // y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
	    // We also need to invert the value so tilting the device towards us (forward) 
	    // results in a positive value. 
	    self.tiltFB = eventData.y * -90;
	    self.z = eventData.z;
	    self.deviceOrientationHandler();
	    self.draw();
	  }, false);
	} else {
	  console.log("Not supported on your device or browser.")
	}
	
}

tilt.prototype.draw = function() {
	
	this.erase();
	with (this.context) {
		strokeStyle = this.colors.border;
		fillStyle = this.colors.fill;
		lineWidth = this.lineWidth;
	    fillRect(0,0,this.width,this.height);
	    strokeStyle = this.colors.border;
	    strokeRect(0,0,this.width,this.height); 

		save(); 
		translate(this.width/2,this.height/2)
		rotate(-this.val.x*Math.PI/2);
		translate(-this.width/2,-this.height/2)
	    globalAlpha = 0.4;

	    if (this.active) {
	    	fillStyle = this.colors.accent;
	    } else {
	    	fillStyle = this.colors.border;
	    }

		fillRect(-this.width,this.height*(this.val.y/2)+this.height/2,this.width*3,this.height*2)
		font = "bold "+this.height/5+"px gill sans";
		textAlign = "center";
		fillText(this.text, this.width/2, this.height*(this.val.y/2)+this.height/2+this.height/15);
		globalAlpha = 1;


		 
		// and restore the co-ordinate system to its default
		// top left origin with no rotation
		restore();
	}
	this.drawLabel();
}

tilt.prototype.click = function() {
	this.active = !this.active;
}