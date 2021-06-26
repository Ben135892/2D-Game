function toRadians(x) {
    return x / 180 * Math.PI;
}

function roundTo2DP(x) {
    return Math.round(x * 100) / 100;
}

// converts polar angle to angle measured clockwise from y axis
function convertAngle(angle) {
    if (angle < 0) 
    angle += 2 * Math.PI;
    angle = 2 * Math.PI - angle;
    angle += Math.PI / 2;
    if (angle >= 2 * Math.PI)
        angle -= 2 * Math.PI;
    return angle;
}