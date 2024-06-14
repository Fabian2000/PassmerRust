#!/bin/bash

# Check if an environment parameter is provided
if [ -z "$1" ]; then
    echo "Please specify 'dev' or 'build' as the environment parameter."
    exit 1
fi

# Set the environment variable
Environment=$1

# Execute the appropriate commands based on the environment
if [ "$Environment" == "dev" ]; then
    cp -r -f src-tauri/src/languages/* ./target/debug/
    npx tauri dev
elif [ "$Environment" == "build" ]; then
    cp -r -f src-tauri/src/languages/* ./target/release/
    npx tauri build
else
    echo "Invalid parameter. Please specify 'dev' or 'build'."
    exit 1
fi