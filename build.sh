#!/bin/sh

OUT="quick.js"
OUT_MINIFIED="quick.min.js"
INPUT="tokenizer compiler canvas animation helper engine"
MINIFIER=""
MINIFIER_OPTIONS=""
MODULES_FOLDER="./modules/"
QUICKJS=$PWD/bin/quickjs
QUICKJS_OPTIONS="-s"
SOURCE_MODE=false

echo ""

if [ "$1" = "--source" ]; then
    SOURCE_MODE=true
elif command -v uglifyjs >/dev/null 2>&1; then
    MINIFIER=uglifyjs
else
    echo "WARN: UglifyJS not found. Skipping minification."
fi

echo " -> Removing old $OUT file..."
rm -f $OUT $OUT_MINIFIED

#### batching all quickjs files into one
if $SOURCE_MODE ; then
    echo "Create $OUT as a dynamic loader file."
    cp src/loader.js $OUT
    echo "Done."
    echo ""
else
    echo "Create batched $OUT file."

    for file in $INPUT; do
        echo " -> Adding $file ..."
        cat src/$file.js >> $OUT
    done

    echo "Done."
    echo ""

    #### minify combined file
    if [ -n "$MINIFIER" ]; then
        echo "Minify $OUT to $OUT_MINIFIED."
        $MINIFIER $MINIFIER_OPTIONS $OUT -o $OUT_MINIFIED
        echo "Done."
        echo ""
    fi
fi

#### Generating modules
echo "Generate JavaScript files for modules in $MODULES_FOLDER."
for file in `find $MODULES_FOLDER -name "*.jml"`; do
    echo " -> Process $file..."
    echo "  -> Generate JavaScript from JML..."
    $QUICKJS $QUICKJS_OPTIONS $file $file.js
    if [ -n "$MINIFIER" ]; then
        echo "  -> Minify $file.js to $file.min.js"
        $MINIFIER $MINIFIER_OPTIONS $file.js -o $file.min.js
    fi
done

echo "Done."
echo ""
