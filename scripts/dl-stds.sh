#!/bin/bash

FILES=("array.sesan" "io.sesan" "lib.sesan" "string.sesan" "util.sesan")

STD_PATH="./@std"

if [ ! -d $STD_PATH ]; then
    if [ ! -d STD_PATH ]; then
        mkdir $STD_PATH
    fi

    START_TIME=$SECONDS

    echo "Downloading standard library... ($STD_PATH)"

    for file in ${FILES[@]}; do
        curl -o $STD_PATH/$file https://raw.githubusercontent.com/tsukiroku/sesan/main/%40std/$file >/dev/null 2>&1
        echo "Downloading $file"
    done

    echo "Done ($((SECONDS - START_TIME))s) / ${#FILES[@]} Files.\n"
else
    echo "Directory $STD_PATH is already exists"
fi
