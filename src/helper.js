// Copyright (c) 2012 Johannes Zellner webmaster@nebulon.de - All Rights Reserved

"use strict";

/*
 **************************************************
 * QuickJS Helper
 **************************************************
 */

// ensure namespace
if (!Quick) {
    var Quick = {};
}

Quick.debug = false;
Quick.verbose = false;

Quick.run = function () {
    var canvas = document.createElement('canvas');
    canvas.id = "QuickCanvas";
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "absolute";
    canvas.style.backgroundColor = "white";

    document.body.style.margin = 0;
    document.body.style.padding = 0;

    var x,y;

    canvas.addEventListener('mousemove', function(evt) {
        var rect = canvas.getBoundingClientRect();
        x = evt.clientX - rect.left;
        y = evt.clientY - rect.top;

        var context = canvas.getContext('2d');
        context.clearRect(0, 0, 400, 20);
        context.font = '12pt Calibri';
        context.fillStyle = 'black';
        context.fillText('Mouse position: ' + x + ',' + y, 10, 1);
    }, false);

    canvas.addEventListener('mousedown', function(evt) {
        Quick.Engine.handleMouseDown(x, y);
    }, false);

    canvas.addEventListener('mouseup', function(evt) {
        Quick.Engine.handleMouseUp(x, y);
    }, false);

    document.body.appendChild(canvas);

    Quick.useQueryFlags();
    Quick.compileScriptTags();
    Quick.Engine.start();
};

Quick.useQueryFlags = function() {
    // TODO improve detection
    Quick.verbose = (window.location.href.indexOf("verbose") >= 0);
    Quick.debug = (window.location.href.indexOf("debug") >= 0);
};

Quick.compileScriptTagElement = function(script) {
    var tokens = Quick.Tokenizer.parse(script.text);
    var moduleName = script.attributes.module && script.attributes.module.textContent;
    Quick.Compiler.compileAndRender(tokens, { module: moduleName }, function (error, result) {
        if (error) {
            console.error("QuickJS compile error: " + error.line + ": " + error.message);
            console.error(" -- " + error.context);
        } else {
            try {
                if (Quick.verbose || Quick.debug) {
                    console.log("----------------------");
                    console.log(result);
                    console.log("----------------------");
                    console.log("eval...");
                    var o = new Date();
                    eval(result);
                    var n = new Date();
                    console.log("done, eval took time: ", (n - o), "ms");
                } else {
                    eval(result);
                }
            } catch (e) {
                console.error("QuickJS error in generated JavaScript: ", e);
            }
        }
    });
};

Quick.compileScriptTags = function(scriptType) {
    var type = scriptType ? scriptType : "text/jml";

    for (var i = 0; i < window.document.scripts.length; ++i) {
        var script = window.document.scripts[i];
        if (script.type === type) {
            Quick.compileScriptTagElement(script);
        }
    }
};
