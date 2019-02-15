// simple linear tweening - no easing, no acceleration
    function linearTween(t, b, c, d) {
    	return c*t/d + b;
    };
    		

// quadratic easing in - accelerating from zero velocity

    function easeInQuad(t, b, c, d) {
    	t /= d;
    	return c*t*t + b;
    };

// quadratic easing out - decelerating to zero velocity

    function easeOutQuad(t, b, c, d) {
    	t /= d;
    	return -c * t*(t-2) + b;
    };
    		

// quadratic easing in/out - acceleration until halfway, then deceleration

    function easeInOutQuad(t, b, c, d) {
    	t /= d/2;
    	if (t < 1) return c/2*t*t + b;
    	t--;
    	return -c/2 * (t*(t-2) - 1) + b;
    };

// cubic easing in - accelerating from zero velocity

    function easeInCubic(t, b, c, d) {
    	t /= d;
    	return c*t*t*t + b;
    };
    		

// cubic easing out - decelerating to zero velocity

    function easeOutCubic(t, b, c, d) {
    	t /= d;
    	t--;
    	return c*(t*t*t + 1) + b;
    };
    		

// cubic easing in/out - acceleration until halfway, then deceleration

    function easeInOutCubic(t, b, c, d) {
    	t /= d/2;
    	if (t < 1) return c/2*t*t*t + b;
    	t -= 2;
    	return c/2*(t*t*t + 2) + b;
    };
    	

// quartic easing in - accelerating from zero velocity

    function easeInQuart(t, b, c, d) {
    	t /= d;
    	return c*t*t*t*t + b;
    };
    		

// quartic easing out - decelerating to zero velocity

    function easeOutQuart(t, b, c, d) {
    	t /= d;
    	t--;
    	return -c * (t*t*t*t - 1) + b;
    };
    		



function easeInOutQuart(t, b, c, d) { // quartic easing in/out - acceleration until halfway, then deceleration
    	t /= d/2;
    	if (t < 1) return c/2*t*t*t*t + b;
    	t -= 2;
    	return -c/2 * (t*t*t*t - 2) + b;
    };

// quintic easing in - accelerating from zero velocity

    function easeInQuint(t, b, c, d) {
    	t /= d;
    	return c*t*t*t*t*t + b;
    };
    		

// quintic easing out - decelerating to zero velocity

    function easeOutQuint(t, b, c, d) {
    	t /= d;
    	t--;
    	return c*(t*t*t*t*t + 1) + b;
    };
    		

// quintic easing in/out - acceleration until halfway, then deceleration

    function easeInOutQuint(t, b, c, d) {
    	t /= d/2;
    	if (t < 1) return c/2*t*t*t*t*t + b;
    	t -= 2;
    	return c/2*(t*t*t*t*t + 2) + b;
    };
    		

// sinusoidal easing in - accelerating from zero velocity

    function easeInSine(t, b, c, d) {
    	return -c * function cos(t/d * (function PI/2)) + c + b;
    };
    		

// sinusoidal easing out - decelerating to zero velocity

    function easeOutSine(t, b, c, d) {
    	return c * function sin(t/d * (function PI/2)) + b;
    };
    		

// sinusoidal easing in/out - accelerating until halfway, then decelerating

    function easeInOutSine(t, b, c, d) {
    	return -c/2 * (function cos(function PI*t/d) - 1) + b;
    };
    		

// exponential easing in - accelerating from zero velocity

    function easeInExpo(t, b, c, d) {
    	return c * function pow( 2, 10 * (t/d - 1) ) + b;
    };
    		

// exponential easing out - decelerating to zero velocity

    function easeOutExpo(t, b, c, d) {
    	return c * ( -function pow( 2, -10 * t/d ) + 1 ) + b;
    };
    		

// exponential easing in/out - accelerating until halfway, then decelerating

    function easeInOutExpo(t, b, c, d) {
    	t /= d/2;
    	if (t < 1) return c/2 * function pow( 2, 10 * (t - 1) ) + b;
    	t--;
    	return c/2 * ( -function pow( 2, -10 * t) + 2 ) + b;
    };
    		

// circular easing in - accelerating from zero velocity

    function easeInCirc(t, b, c, d) {
    	t /= d;
    	return -c * (function sqrt(1 - t*t) - 1) + b;
    };
    		

// circular easing out - decelerating to zero velocity

    function easeOutCirc(t, b, c, d) {
    	t /= d;
    	t--;
    	return c * function sqrt(1 - t*t) + b;
    };
    		

// circular easing in/out - acceleration until halfway, then deceleration

    function easeInOutCirc(t, b, c, d) {
    	t /= d/2;
    	if (t < 1) return -c/2 * (function sqrt(1 - t*t) - 1) + b;
    	t -= 2;
    	return c/2 * (function sqrt(1 - t*t) + 1) + b;
    };