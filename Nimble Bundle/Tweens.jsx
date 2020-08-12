function tweenQuadOut(t, b, c, d) { //QUADRATIC EASE OUT

    t = t / d;
    value = -1 * c * t * (t - 2) + b;
    return value;
}

function tweenLinear(t, b, c, d) { //LINEAR EASE
    value = c * t / d + b;
    return value;
}

function easeInOutCubic(t, b, c, d) { // cubic easing in/out - acceleration until halfway, then deceleration 
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t + b;
    t -= 2;
    return c / 2 * (t * t * t + 2) + b;
}

function easeInQuad(t, b, c, d) { // quadratic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t + b;
}

function easeOutQuad(t, b, c, d) { // quadratic easing out - decelerating to zero velocity
    t /= d;
    return -c * t * (t - 2) + b;
}

function easeInOutQuad(t, b, c, d) { // quadratic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}

function easeInQuart(t, b, c, d) { // quartic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t * t * t + b;
}

function easeOutQuart(t, b, c, d) { // quartic easing out - decelerating to zero velocity
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
}

function easeInOutQuart(t, b, c, d) { // quartic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t * t * t + b;
    t -= 2;
    return -c / 2 * (t * t * t * t - 2) + b;
}

function easeInCubic(t, b, c, d) { // cubic easing in - accelerating from zero velocity
    t /= d;
    return c * t * t * t + b;
}

function easeOutCubic(t, b, c, d) { // cubic easing out - decelerating to zero velocity
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
}

function tweenCubicInOut(t, b, c, d) { //QUARTIC EASE IN/OUT - accel halfway, decel other half
    t = t / (d / 2);
    if (t < 1) {
        value = c / 2 * t * t * t * t + b;
    } else {
        t = t - 2;
        value = -c / 2 * (t * t * t * t - 2) + b;
    }
    return value;
}

function easeInOutQuad(t, b, c, d) { // quadratic easing in/out - acceleration until halfway, then deceleration
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
}