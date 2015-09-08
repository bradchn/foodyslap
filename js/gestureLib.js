var GestureLib = {};
GestureLib.lastNonGrab = new Date().getTime();
GestureLib.thumbsUpCallback = null;

GestureLib.fastCount = 0;
GestureLib.FRAMES_FOR_SLAP = 7;
GestureLib.SPEED_THRESHOLD = 900;
GestureLib.speedHistory = new Array(GestureLib.FRAMES_FOR_SLAP);
for (var i = 0; i < GestureLib.FRAMES_FOR_SLAP; i++) {
	GestureLib.speedHistory[i] = 0;
}
GestureLib.dirHistory = new Array(GestureLib.FRAMES_FOR_SLAP);
for (var i = 0; i < GestureLib.FRAMES_FOR_SLAP; i++) {
	GestureLib.dirHistory[i] = 0;
}
GestureLib.rotatoryIndex = 0;

GestureLib.lastSlap = 0;
GestureLib.MILLIS_BETWEEN_SLAPS = 300;

GestureLib.slapCallback = null;

GestureLib.lastCircle = 0;
GestureLib.NUM_OF_CIRCLES = 3;
GestureLib.circleCallback = null;
GestureLib.CIRCLE_TIME_THRESHOLD = 1500;

Leap.loop({enableGestures: true}, function(frame) {

  var handDetected = false;

  frame.hands.forEach(function(hand, index) {
    if (index == 0) {
    	now = new Date().getTime();
    	handDetected = true;

    	// Thumbs up loop
    	var grabPow = hand.grabStrength.toPrecision(2);

    	if (grabPow != 1.0) GestureLib.lastNonGrab = now;
    	else if (now - GestureLib.lastNonGrab > 1500) {
    		if (GestureLib.thumbsUpCallback != null)
                GestureLib.thumbsUpCallback();
    		GestureLib.lastNonGrab = now;
    	}


    	// Slap loop
    	var palmSpeed = Math.sqrt(Math.pow(hand.palmVelocity[0], 2) +
    						 	  Math.pow(hand.palmVelocity[1]/3, 2) +
    						 	  Math.pow(hand.palmVelocity[2]/3, 2));

    	// Keeping speed history
    	GestureLib.speedHistory[GestureLib.rotatoryIndex] = palmSpeed;
    	if (hand.palmVelocity[0] > 0) {
    		GestureLib.dirHistory[GestureLib.rotatoryIndex] = 1;
    	} else {
    		GestureLib.dirHistory[GestureLib.rotatoryIndex] = -1
    	}
    	GestureLib.rotatoryIndex = (GestureLib.rotatoryIndex + 1) % GestureLib.FRAMES_FOR_SLAP;

    	// Calculating average speed
    	var avgSpeed = 0;
    	for (var i = 0; i < GestureLib.FRAMES_FOR_SLAP; i++) {
    		
    		if (GestureLib.speedHistory[i] == 0) {
    			GestureLib.avgSpeed = 0;
    			break;
    		}

    		avgSpeed += GestureLib.speedHistory[i] / GestureLib.FRAMES_FOR_SLAP;
    	}


    	if (avgSpeed > GestureLib.SPEED_THRESHOLD) {	

    		var avgDir = 0
	    	for (var i = 0; i < GestureLib.FRAMES_FOR_SLAP; i++) {
	    		avgDir += GestureLib.dirHistory[i];
	    	}

	    	var isRightDir = (avgDir > 0);

	    	if (now - GestureLib.lastSlap > GestureLib.MILLIS_BETWEEN_SLAPS) {
				if (GestureLib.slapCallback != null) GestureLib.slapCallback(isRightDir);

				GestureLib.lastSlap = now;
			}
    		
    		for (var i = 0; i < GestureLib.FRAMES_FOR_SLAP; i++)
    			GestureLib.speedHistory[i] = 0;
    	}

    }
  });

  if (handDetected == false) {
  	// Keeping speed history
	GestureLib.speedHistory[GestureLib.rotatoryIndex] = 0;
	GestureLib.dirHistory[GestureLib.rotatoryIndex] = 0;
	GestureLib.rotatoryIndex = (GestureLib.rotatoryIndex + 1) % GestureLib.FRAMES_FOR_SLAP;
  }



  frame.gestures.forEach(function(gesture){
        var pointableIds = gesture.pointableIds;
    
        pointableIds.filter(function(pointableId){
            var pointable = frame.pointable(pointableId);
            if (pointable.tool == false) {
                if (pointable.type == 1) return true;
            };

            return false;
        }).forEach(function(){
            if (    gesture.type == "circle" && 
                    gesture.progress > GestureLib.NUM_OF_CIRCLES &&
                    now - GestureLib.lastCircle > GestureLib.CIRCLE_TIME_THRESHOLD) {
                if (GestureLib.circleCallback != null) GestureLib.circleCallback();
                GestureLib.lastCircle = now;
            }
        });
  });
});

Leap.loopController.setBackground(true);