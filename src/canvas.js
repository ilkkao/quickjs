// Copyright (c) 2013 Ilkka Oksanen iao@iki.fi - All Rights Reserved
// Canvas renderer

"use strict";

if (!Quick) {
    var Quick = {};
}

/*
 **************************************************
 * Canvas renderer
 **************************************************
 */

var elementList = [];

//Fix, global
function getPosition(elem) {
    var parent = elem.parent
    var coord = { x: elem.left, y: elem.top };

    while (parent) {
        coord.x += isNaN(parent.left) ? 0 : parent.left;
        coord.y += isNaN(parent.top) ? 0 : parent.top;
        parent = parent.parent;
    }

    return coord;
};

Quick.RendererCanvas = function () {
};

Quick.RendererCanvas.prototype.createElement = function (typeHint, object) {
    elementList.push(object);
};

Quick.RendererCanvas.prototype.addElement = function (element, parent) {
};

Quick.RendererCanvas.prototype.removeElement = function (element, parent) {
};

Quick.RendererCanvas.prototype.addElements = function (elements, parent) {
};

Quick.RendererCanvas.prototype.handleMouseUp = function (x, y) {
    //TODO
};

Quick.RendererCanvas.prototype.handleMouseDown = function (x, y) {
    for (var i = 0; i < elementList.length; i++) {
        var elem = elementList[i];
        var coord = getPosition(elem);

        if (x >= coord.x && x <= coord.x + elem.width && y >= coord.y &&
            y <= coord.y + elem.height) {
            elem.emit('activated');
            console.log(elem);
        }
    }
};

Quick.RendererCanvas.prototype.renderElement = function (element) {
    if (!element._dirtyProperties) {
        return;
    }

    var root = element;

    // better way to get hold of root object?
    while (root.parent) {
        root = root.parent;
    }

    var ctx  = document.getElementById("QuickCanvas").getContext("2d");

    // tough luck, we need to repaint everything
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    function drawElement(myElem) {
        var coord = getPosition(elem);

        if (myElem._properties['text']) {
            ctx.font = 'bold ' + myElem.fontSize + 'px sans-serif';
            ctx.fillStyle = myElem.textColor;
            ctx.textBaseline = 'top';
            ctx.fillText(myElem.text, coord.x, coord.y);
        } else if (myElem._properties['-image-src']) {
            var img = new Image();
            img.onload = function() {
                var imgHeigth = myElem.heigth ? myElem.height : myElem.width;
                ctx.drawImage(img, coord.x, coord.y, myElem.width, imgHeigth);
                console.log("Image: ", coord.x, coord.y, myElem.width, imgHeigth);
            };
            img.src = myElem['-image-src'];
        } else {
            ctx.fillStyle = myElem.backgroundColor;
            ctx.fillRect(coord.x,
                         coord.y,
                         myElem.width,
                         myElem.height);

            console.log("Rectangle: ", coord.x, coord.y, myElem.width, myElem.height);
          }
    };

    var queue = [];
    queue.push(root);

    console.log('BEGIN');

    // iterate, breadth-first
    while (queue.length > 0)
    {
        var elem = queue.shift();
        drawElement(elem);
        for(var i in elem._children) {
            queue.push(elem._children[i]);
        }
    }

    console.log('END');

    element._dirtyProperties = {};
};
