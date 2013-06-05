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
Quick.RendererCanvas = function () {
};

Quick.RendererCanvas.prototype.createElement = function (typeHint, object) {
};

Quick.RendererCanvas.prototype.addElement = function (element, parent) {
};

Quick.RendererCanvas.prototype.removeElement = function (element, parent) {
};

Quick.RendererCanvas.prototype.addElements = function (elements, parent) {
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
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    function drawElement(myElem) {
        var parent = myElem.parent;
        var left = myElem.left;
        var top = myElem.top;

        while (parent) {
            left += parent.left;
            top += parent.top;
            parent = parent.parent;
        }

        if (myElem._properties['text']) {
            ctx.font = 'bold ' + myElem.fontSize + 'px sans-serif';
            ctx.fillStyle = myElem.textColor;
            ctx.textBaseline = 'top';
            ctx.fillText(myElem.text, left, top);
        } else {
            ctx.fillStyle = myElem.backgroundColor;
            ctx.fillRect(left,
                         top,
                         myElem.width,
                         myElem.height);

            console.log("Rectangle: ",
                        left,
                        top,
                        myElem.width,
                        myElem.height);
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
