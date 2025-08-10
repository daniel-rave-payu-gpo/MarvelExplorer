#!/bin/sh -e

echo "Cleaning dist dir..."
rm -rf dist
echo "Transpiling code..."
tsc -p tsconfig.json
echo "Copying swagger..."
cp src/swagger/marvel-api.yaml dist/openapi.yaml