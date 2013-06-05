// Copyright (c) 2012 Johannes Zellner webmaster@nebulon.de - All Rights Reserved
// Elements

"use strict";

if (!Quick) {
    var Quick = {};
}

/*
 **************************************************
 * Predefined basic elements
 **************************************************
 */
Quick.Item = function (id, parent, typeHint) {
    var elem = new Quick.Element(id, parent, typeHint ? typeHint : "item");

    elem.addProperty("className", "");
    elem.addProperty("width", 100);
    elem.addProperty("height", 100);
    elem.addProperty("top", 0);
    elem.addProperty("left", 0);

    elem.addProperty("childrenWidth", function () {
        var left = 0;
        var right = 0;
        var kids = this.children();
        for (var i in kids) {
            if (kids.hasOwnProperty(i)) {
                var c = kids[i];
                if (c.left < left) {
                    left = c.left;
                }
                if ((c.left + c.width) > right) {
                    right = c.left + c.width;
                }
            }
        }

        return (right - left);
    });
    elem.addProperty("childrenHeight", function () {
        var top = 0;
        var bottom = 0;
        var kids = this.children();
        for (var i in kids) {
            if (kids.hasOwnProperty(i)) {
                var c = kids[i];
                if (c.top < top) {
                    top = c.top;
                }
                if ((c.top + c.height) > bottom) {
                    bottom = c.top + c.height;
                }
            }
        }

        return (bottom - top);
    });


    return elem;
};

Quick.InputItem = function (id, parent) {
    var elem = new Quick.Item(id, parent, "InputItem");

    // default to fill parent
    elem.addProperty("width", function () { return this.parent ? this.parent.width : 100; });
    elem.addProperty("height", function () { return this.parent ? this.parent.height : 100; });

    elem.addProperty("mouseAbsX", 0);
    elem.addProperty("mouseAbsY", 0);
    elem.addProperty("mouseRelX", 0);
    elem.addProperty("mouseRelY", 0);
    elem.addProperty("mouseRelStartX", 0);
    elem.addProperty("mouseRelStartY", 0);
    elem.addProperty("mousePressed", false);
    elem.addProperty("containsMouse", false);

    // scrolling
    elem.addProperty("scrollTop", 0);
    elem.addProperty("scrollLeft", 0);
    elem.addProperty("srollWidth", 0);
    elem.addProperty("scrollHeight", 0);

    return elem;
};

// FIXME global leak
var tmpTextElement;
Quick.Text = function (id, parent) {
    var elem = new Quick.Item(id, parent);

    elem.addProperty("mouseEnabled", false);
    elem.addProperty("textWidth", 0);
    elem.addProperty("textHeight", 0);
    elem.addProperty("fontSize", "");
    elem.addProperty("fontFamily", "");
    elem.addProperty("text", "");
    elem.addProperty("-text", function () { return this.text; });
    elem.addProperty("width", function() { return this.textWidth; });
    elem.addProperty("height", function() { return this.textHeight; });

    // all this below for calculating the text width
    if (!tmpTextElement) {
        tmpTextElement = window.document.createElement("div");
        tmpTextElement.style.position = "absolute";
        tmpTextElement.style.visibility = "hidden";
        tmpTextElement.style.width = "auto";
        tmpTextElement.style.height = "auto";
        tmpTextElement.style.left = -10000;
        document.body.appendChild(tmpTextElement);
    }

    function relayout() {
        var tmpProperty = elem.text;
        var width = 0;
        var height = 0;

        tmpTextElement.style.fontSize = elem.fontSize;
        tmpTextElement.style.fontFamily = elem.fontFamily;

        if (tmpTextElement.innerHTML === tmpProperty) {
            width = (tmpTextElement.clientWidth + 1);
            height = (tmpTextElement.clientHeight + 1);
        } else if (tmpProperty !== "") {
            tmpTextElement.innerHTML = tmpProperty;
            width = (tmpTextElement.clientWidth + 1);
            height = (tmpTextElement.clientHeight + 1);
        }

        elem.textWidth = width;
        elem.textHeight = height;
    }

    elem.addChanged("text", relayout);

    return elem;
};

Quick.Window = function (id, parent) {
    var elem = new Quick.Element(id, parent);
    elem.addProperty("innerWidth", window.innerWidth);
    elem.addProperty("innerHeight", window.innerHeight);

    elem.addEventHandler("load", function () {
        var that = this;
        window.addEventListener("resize", function (event) {
            that.innerWidth = event.srcElement.innerWidth;
            that.innerHeight = event.srcElement.innerHeight;
        });
    });

    return elem;
};

Quick.Rectangle = function (id, parent) {
    var elem = new Quick.Item(id, parent);

    elem.addProperty("backgroundColor", "white");
    elem.addProperty("borderColor", "black");
    elem.addProperty("borderStyle", "solid");
    elem.addProperty("borderWidth", 1);
    elem.addProperty("borderRadius", 0);

    return elem;
};

Quick.BackgroundImage = function (id, parent) {
    var elem = new Quick.Item(id, parent);

    elem.addProperty("src", "");
    elem.addProperty("backgroundImage", function () {
        if (!this.src) {
            return "";
        }

        if (this.src.indexOf("url('") === 0) {
            return this.src;
        }

        return "url('" + this.src + "')";
    });
    elem.addProperty("backgroundPosition", "center");
    elem.addProperty("backgroundRepeat", "no-repeat");

    return elem;
};

Quick.Image = function (id, parent) {
    var elem = new Quick.Item(id, parent, "image");

    elem.addProperty("src", "");
    elem.addProperty("-image-src", function () {
        return this.src;
    });

    return elem;
};

Quick.Input = function (id, parent) {
    var elem = new Quick.Item(id, parent, "input");

    elem.addProperty("-webkit-user-select", "auto");
    elem.addProperty("userSelect", "auto");
    elem.addProperty("text", function() {
        return this.element.value;
    });
    elem.addProperty("placeholder", "");

    return elem;
};
