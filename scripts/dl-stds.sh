#!/bin/bash

FILES=("array.tiny" "io.tiny" "lib.tiny" "string.tiny" "util.tiny")

STD_PATH="./@std"

if [ ! -d $STD_PATH ]; then
    if [ ! -d STD_PATH ]; then
        mkdir $STD_PATH
    fi

    START_TIME=$SECONDS

    echo "Downloading standard library... ($STD_PATH)"

    for file in ${FILES[@]}; do
        curl -o $STD_PATH/$file https://raw.githubusercontent.com/sesan-lang/sesan/main/%40std/$file >/dev/null 2>&1
        echo "Downloading $file"
    done

    echo "Done ($((SECONDS - START_TIME))s) / ${#FILES[@]} Files.\n"
else
    echo "Directory $STD_PATH is already exists"
fi
