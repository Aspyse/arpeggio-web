const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// CREATING KEYS
//const outerRadius = 100;
//const innerRadius = 50;
const OUTER_PADDING = 0;
const MINI_RADIUS = 40;
const LEGENDS_SHIFT_Y = -5;
const POPOUTS_SHIFT_Y = 0;

const IS_SWAP_RINGS = false;
const LEFT_START = 4;
const RIGHT_START = 3;
const IS_FLIP_LEFT = true;
const IS_FLIP_RIGHT = true;
const LEFT_OFFSET = (3-8*LEFT_START)/40*2*Math.PI;
const RIGHT_OFFSET = (1+8*RIGHT_START)/40*2*Math.PI;

let outerRadius = Math.min(canvas.width/2, canvas.height)/2 - OUTER_PADDING;
let innerRadius = outerRadius/2;
let textRadius = (outerRadius + innerRadius)/2;
let popoutRadius = textRadius;
let cheatsheetOffset = outerRadius*2;

let centerY = canvas.height-outerRadius;

const N_LEFT = 5;
const N_RIGHT = 5;

const baseTable = [
  ['',   'L', 'E', ' ',  'S',  'T'],
  ['F',  'Y', 'D', 'M',  'O',  'R'],
  ['J',  'Z', 'A', 'B',  'U',  'Q'],
  ['HA', 'V', 'X', 'C',  'H',  '' ],
  ['P',  'AR','AT','TH', 'G',  'ER'],
  ['W',  'EN','AN','I',  'N',  'K'],
];

let keyTable = baseTable;

// Transform key table
if (IS_SWAP_RINGS)
    keyTable = keyTable[0].map((_, colIndex) => keyTable.map(row => row[colIndex]));
if (IS_FLIP_LEFT) {
    const body = keyTable.slice(1).reverse();
    keyTable = [keyTable[0], ...body];
}
if (IS_FLIP_RIGHT) {
    keyTable = keyTable.map(row => {
        const body = row.slice(1).reverse();
        return [row[0], ...body];
    });
}


function makeButton(centerX, centerY, startAngle, endAngle) {
    let path = new Path2D();

    const startX = centerX + outerRadius*Math.cos(startAngle);
    const startY = centerY + outerRadius*Math.sin(startAngle);
    path.moveTo(startX, startY);

    path.arc(centerX, centerY, outerRadius, startAngle, endAngle);

    const endX = centerX + innerRadius*Math.cos(endAngle);
    const endY = centerY + innerRadius*Math.sin(endAngle);
    path.lineTo(endX, endY);

    path.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);

    path.closePath()

    return path;
}

const leftKeys = [];
const rightKeys = [];
const leftLegends = [];
const rightLegends = [];
const leftPopouts = [];
const rightPopouts = [];
for (let i = 0; i < N_LEFT; i++)
    leftPopouts[i] = []
for (let i = 0; i < N_RIGHT; i++)
    rightPopouts[i] = []
function buildKeys() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    outerRadius = Math.min(canvas.width/2, canvas.height)/2 - OUTER_PADDING;
    innerRadius = outerRadius/2;
    textRadius = (outerRadius + innerRadius)/2;
    popoutRadius = textRadius;
    cheatsheetOffset = outerRadius*2;
    centerY = canvas.height-outerRadius;

    const leftCenterX = canvas.width/4;
    const leftCentralAngle = 2*Math.PI/N_LEFT;
    const rightCenterX = canvas.width*3/4;
    const rightCentralAngle = 2*Math.PI/N_RIGHT;

    for (let i = 0; i < N_LEFT; i++) {
        const startAngle = leftCentralAngle*i - LEFT_OFFSET;
        const endAngle = startAngle + leftCentralAngle;

        leftKeys[i] = makeButton(leftCenterX, centerY, startAngle, endAngle);

        const midAngle = (startAngle + endAngle)/2;
        const legendX = leftCenterX + textRadius*Math.cos(midAngle);
        const legendY = centerY + textRadius*Math.sin(midAngle) - LEGENDS_SHIFT_Y;
        leftLegends[i] = { x: legendX, y: legendY };

        const popoutCenterX = leftCenterX + popoutRadius*Math.cos(midAngle);
        const popoutCenterY = centerY + popoutRadius*Math.sin(midAngle) + POPOUTS_SHIFT_Y;
        for (let j = 0; j < N_RIGHT; j++) {
            const popoutAngle = rightCentralAngle*j - RIGHT_OFFSET + rightCentralAngle/2;
            const popoutX = popoutCenterX + MINI_RADIUS*Math.cos(popoutAngle);
            const popoutY = popoutCenterY + MINI_RADIUS*Math.sin(popoutAngle);
            leftPopouts[i][j] = { x: popoutX, y: popoutY };
        }
    }

    for (let i = 0; i < N_RIGHT; i++) {
        const startAngle = rightCentralAngle*i - RIGHT_OFFSET;
        const endAngle = startAngle + rightCentralAngle;

        rightKeys[i] = makeButton(rightCenterX, centerY, startAngle, endAngle);

        const midAngle = (startAngle + endAngle)/2;
        const legendX = rightCenterX + textRadius*Math.cos(midAngle);
        const legendY = centerY + textRadius*Math.sin(midAngle) - LEGENDS_SHIFT_Y;
        rightLegends[i] = { x: legendX, y: legendY };

        const popoutCenterX = rightCenterX + popoutRadius*Math.cos(midAngle);
        const popoutCenterY = centerY + popoutRadius*Math.sin(midAngle) + POPOUTS_SHIFT_Y;
        for (let j = 0; j < N_LEFT; j++) {
            const popoutAngle = leftCentralAngle*j - LEFT_OFFSET + leftCentralAngle/2;
            const popoutX = popoutCenterX + MINI_RADIUS*Math.cos(popoutAngle);
            const popoutY = popoutCenterY + MINI_RADIUS*Math.sin(popoutAngle);
            rightPopouts[i][j] = { x: popoutX, y: popoutY };
        }
    }
}

buildKeys();
window.addEventListener('resize', buildKeys);

// MANAGING POINTERS
let leftPressed = 0;
let rightPressed = 0;
let pointers = new Map();

canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointers.set(e.pointerId, { x: x, y: y });
    press([...pointers.values()]);
    //bufferInput(keyTable[leftPressed][rightPressed])
});
canvas.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) // Review
        return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    pointers.set(e.pointerId, { x: x, y: y });
    release([...pointers.values()]);
    press([...pointers.values()]);
});
canvas.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);
    release([...pointers.values()]);
});
canvas.addEventListener('pointercancel', e => {
    pointers.delete(e.pointerId);
    release([...pointers.values()]);
});

function press(points) {
    const oldLeftPressed = leftPressed;
    const oldRightPressed = rightPressed;
    for (let i = 0; i < leftKeys.length; i++) {
        const key = leftKeys[i];
        for (const point of points) {
            if (ctx.isPointInPath(key, point.x, point.y)) {
                leftPressed = i + 1;
                break;
            }
        }
        if (leftPressed == i + 1)
            break;
    }
    for (let i = 0; i < rightKeys.length; i++) {
        const key = rightKeys[i];
        for (const point of points) {
            if (ctx.isPointInPath(key, point.x, point.y)) {
                rightPressed = i + 1;
                break;
            }
        }
        if (rightPressed == i + 1)
            break;
    }
    if (oldLeftPressed != leftPressed || oldRightPressed != rightPressed)
        bufferInput(keyTable[leftPressed][rightPressed])
    //console.log(keyTable[leftPressed][rightPressed]);
}

function release(points) {
    if (leftPressed != 0) {
        const key = leftKeys[leftPressed - 1];

        let isStillPressed = false;
        for (const point of points) {
            if (ctx.isPointInPath(key, point.x, point.y)) {
                isStillPressed = true;
                break;
            }
        }

        if (!isStillPressed)
            leftPressed = 0;
    }

    if (rightPressed != 0) {
        const key = rightKeys[rightPressed - 1];

        isStillPressed = false;
        for (const point of points) {
            if (ctx.isPointInPath(key, point.x, point.y)) {
                isStillPressed = true;
                break;
            }
        }

        if (!isStillPressed)
            rightPressed = 0;
    }

}

// RENDERING
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.fillStyle = 'black';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    leftKeys.forEach((key, i) => {
        if (leftPressed - 1 == i) {
            ctx.fillStyle = "#333333";
            ctx.fill(key);
        }
        else {
            ctx.strokeStyle = "white";
            ctx.stroke(key);
        }
    });

    rightKeys.forEach((key, i) => {
        if (rightPressed - 1 == i) {
            ctx.fillStyle = "#333333";
            ctx.fill(key);
        }
        else {
            ctx.strokeStyle = "white";
            ctx.stroke(key);
        }
    });

    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "36px Arial";

    leftLegends.forEach((legend, i) => {
        ctx.fillText(keyTable[i + 1][rightPressed], legend.x, legend.y);
    });
    rightLegends.forEach((legend, i) => {
        ctx.fillText(keyTable[leftPressed][i + 1], legend.x, legend.y);
    });

    ctx.font = "italic 18px Arial";

    for (let i = 0; i < N_LEFT; i++) {
        leftPopouts[i].forEach((popout, j) => {
            ctx.fillText(keyTable[i + 1][j + 1], popout.x, popout.y);
        });
    }
    for (let i = 0; i < N_RIGHT; i++) {
        rightPopouts[i].forEach((popout, j) => {
            ctx.fillText(keyTable[j + 1][i + 1], popout.x, popout.y);
        });
    }

    // Cheatsheet
    ctx.strokeStyle = "gray";
    ctx.save();
    ctx.translate(0, -cheatsheetOffset);
    ctx.translate(canvas.width/2, canvas.height);
    ctx.scale(0.9, 0.9);
    ctx.translate(-canvas.width/2, -(canvas.height));
    leftKeys.forEach(key => {
        ctx.stroke(key);
    });

    rightKeys.forEach(key => {
        ctx.stroke(key);
    });

    ctx.fillStyle = "gray";
    ctx.textAlign = "center";
    ctx.font = "28px Arial";

    leftLegends.forEach((legend, i) => {
        ctx.fillText(keyTable[i + 1][0], legend.x, legend.y);
    });
    rightLegends.forEach((legend, i) => {
        ctx.fillText(keyTable[0][i + 1], legend.x, legend.y);
    });

    ctx.font = "italic 18px Arial";

    for (let i = 0; i < N_LEFT; i++) {
        leftPopouts[i].forEach((popout, j) => {
            ctx.fillText(keyTable[i + 1][j + 1], popout.x, popout.y);
        });
    }
    for (let i = 0; i < N_RIGHT; i++) {
        rightPopouts[i].forEach((popout, j) => {
            ctx.fillText(keyTable[j + 1][i + 1], popout.x, popout.y);
        });
    }
    ctx.restore();

    requestAnimationFrame(draw);
}

draw();