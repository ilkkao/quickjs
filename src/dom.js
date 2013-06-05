// Copyright (c) 2012 Johannes Zellner webmaster@nebulon.de - All Rights Reserved
// DOM renderer

"use strict";

if (!Quick) {
    var Quick = {};
}

/*
 **************************************************
 * DOM renderer
 **************************************************
 */
Quick.RendererDOM = function () {
    this.currentMouseElement = undefined;
};

Quick.RendererDOM.prototype.createElement = function (typeHint, object) {
    var elem;
    var that = this;

    if (typeHint === 'input') {
        elem = document.createElement('input');
    } else if (typeHint === 'image') {
        elem = document.createElement('img');
    } else {
        elem = document.createElement('div');
    }

    elem.style.position = 'absolute';
    elem.style.left = '0px';
    elem.style.top = '0px';

    // set id attribute
    if (object.id) {
        elem.id = object.id;
    }

    function handleTouchStartEvents(event) {
        that.currentMouseElement = this;
        that.currentScrollElementTopStart = that.currentScrollElement.scrollTop;
        that.currentScrollElementLeftStart = that.currentScrollElement.scrollLeft;
        object.mousePressed = true;
        object.emit('mousedown');
    }

    function handleTouchEndEvents(event) {
        object.mousePressed = false;
        object.mouseRelStartX = 0;
        object.mouseRelStartY = 0;
        object.emit('mouseup');
        if (that.currentMouseElement === this) {
            object.emit('activated');
        }
        that.currentMouseElement = undefined;
    }

    function handleTouchMoveEvents(event) {
        object.mouseAbsX = event.clientX || event.targetTouches[0].clientX;
        object.mouseAbsY = event.clientY || event.targetTouches[0].clientY;
        object.mouseRelX = event.layerX || event.targetTouches[0].layerX;
        object.mouseRelY = event.layerY || event.targetTouches[0].layerY;
        object.emit('mousemove');
    }

    function handleMouseDownEvents(event) {
        if (!event.used) {
            that.currentMouseElement = this;
            event.used = true;
        }
        object.mousePressed = true;
        object.mouseRelStartX = event.layerX;
        object.mouseRelStartY = event.layerY;
        object.emit('mousedown');
    }

    function handleMouseUpEvents(event) {
        object.mousePressed = false;
        object.mouseRelStartX = 0;
        object.mouseRelStartY = 0;
        object.emit('mouseup');

        if (that.currentMouseElement === this) {
            object.emit('activated');
        }
        that.currentMouseElement = undefined;
    }

    function handleMouseMoveEvents(event) {
        object.mouseAbsX = event.clientX;
        object.mouseAbsY = event.clientY;
        object.mouseRelX = event.layerX;
        object.mouseRelY = event.layerY;
        object.emit('mousemove');
    }

    function handleMouseOverEvents(event) {
        object.containsMouse = true;
        object.emit('mouseover');
    }

    function handleMouseOutEvents(event) {
        object.containsMouse = false;
        object.emit('mouseout');
    }

    function handleScrollEvents(event) {
        if (that.currentScrollElement !== object) {
            that.currentScrollElement = object;
            that.currentScrollElementTopStart = event.target.scrollTop;
            that.currentScrollElementLeftStart = event.target.scrollLeft;
        }

        if (Math.abs(that.currentScrollElementTopStart - event.target.scrollTop) > 20 || Math.abs(that.currentScrollElementLeftStart - event.target.scrollLeft) > 20 ) {
            that.currentMouseElement = undefined;
        }

        object.scrollTop = event.target.scrollTop;
        object.scrollLeft = event.target.scrollLeft;
        object.srollWidth = event.target.scrollWidth;
        object.scrollHeight = event.target.scrollHeight;
    }

    elem.addEventListener("scroll", handleScrollEvents, false);

    if (typeHint === "InputItem") {
        if ('ontouchstart' in document.documentElement) {
            if (window.navigator.msPointerEnabled) {
                elem.addEventListener("MSPointerDown", handleTouchStartEvents, false);
                elem.addEventListener("MSPointerMove", handleTouchMoveEvents, false);
                elem.addEventListener("MSPointerUp", handleTouchEndEvents, false);
            } else {
                elem.addEventListener("touchstart", handleTouchStartEvents, false);
                elem.addEventListener("touchmove", handleTouchMoveEvents, false);
                elem.addEventListener("touchend", handleTouchEndEvents, false);
            }
        } else {
            elem.addEventListener("mousedown", handleMouseDownEvents, false);
            elem.addEventListener("mouseup", handleMouseUpEvents, false);
            elem.addEventListener("mousemove", handleMouseMoveEvents, false);
            elem.addEventListener("mouseover", handleMouseOverEvents, false);
            elem.addEventListener("mouseout", handleMouseOutEvents, false);
        }
    }

    return elem;
};

Quick.RendererDOM.prototype.addElement = function (element, parent) {
    // in case we have no visual element, just return
    if (!element.element) {
        return;
    }

    if (parent && parent.element) {
        parent.element.appendChild(element.element);
    } else {
        document.body.appendChild(element.element);
    }
};

Quick.RendererDOM.prototype.removeElement = function (element, parent) {
    // in case we have no visual element, just return
    if (!element.element) {
        return;
    }

    if (parent && parent.element) {
        parent.element.removeChild(element.element);
    } else {
        document.body.removeChild(element.element);
    }
};

Quick.RendererDOM.prototype.addElements = function (elements, parent) {
    var fragment = document.createDocumentFragment();

    for (var i = 0; i < elements.length; ++i) {
        if (!elements[i].element) {
            continue;
        }

        fragment.appendChild(elements[i].element);
    }

    if (parent && parent.element) {
        parent.element.appendChild(fragment);
    } else {
        document.body.appendChild(fragment);
    }
};

Quick.RendererDOM.prototype.renderElement = function (element) {
    // console.log("renderElement: " + element.id + " properties: " + Object.keys(element.properties).length);
    var name;

    // in case we have no visual element, just return
    if (!element.element) {
        return;
    }

    for (name in element._dirtyProperties) {
        if (name === 'scale' ||  name === 'top' || name === 'left' || name === 'rotate') {
            var s = element.scale ? element.scale : 1;
            var y = element.top ? element.top : 0;
            var x = element.left ? element.left : 0;
            var r = element.rotate ? element.rotate : 0;

            var transform = "scale(" + s + ") rotate(" + r + "deg) translate(" + x + "px, " + y + "px)";
            var origin = (x + element.width/2) + " " + (y + element.height/2);

            element.element.style['-webkit-transform'] = transform;
            element.element.style['transform'] = transform;
            element.element.style['-webkit-transform-origin'] = origin;
            element.element.style['transform-origin'] = origin;

            delete element._dirtyProperties.scale;
            delete element._dirtyProperties.rotate;
            delete element._dirtyProperties.top;
            delete element._dirtyProperties.left;
        } else if (name === 'className' && element[name] !== '') {
            element.element.className = element[name];
        } else if (name === '-text') {
            element.element.innerHTML = element[name];
        } else if (name === '-image-src') {
            element.element.src = element[name];
        } else if (name === 'placeholder') {
            element.element.placeholder = element[name];
        } else {
            element.element.style[name] = element[name];
        }
    }
    element._dirtyProperties = {};
};
