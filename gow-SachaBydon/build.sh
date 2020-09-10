#!/usr/bin/env bash

mkdir ./dist/src
mkdir ./dist/src/fonts
mkdir ./dist/src/style

cp ./index.html ./dist/

cp -r ./src/fonts ./dist/src
cp -r ./src/img ./dist/src
cp -r ./src/obj ./dist/src
cp -r ./src/sounds ./dist/src

cp ./src/style/main.css ./dist/src/style/main.css
cp ./src/style/main.css.map ./dist/src/style/main.css.map

cp ./src/js/pep.min.js ./dist
