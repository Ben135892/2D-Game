// converts degrees to radians
function toRadians(x) {
    return x / 180 * Math.PI;
}

function roundTo2DP(x) {
    return Math.round(x * 100) / 100;
}

// converts angle (positive or negative) measured from positive x axis in an anticlockwise direction in radians,
// to a (positive) angle measured clockwise from the positive y axis in radians.
function convertAngle(angle) {
    if (angle < 0) 
    angle += 2 * Math.PI;
    angle = 2 * Math.PI - angle;
    angle += Math.PI / 2;
    if (angle >= 2 * Math.PI)
        angle -= 2 * Math.PI;
    return angle;
}