#!/bin/bash

# Build script for Table 1837 WASM core

set -e

echo "Building Table 1837 WASM core..."

# Install wasm-pack if not present
if ! command -v wasm-pack &> /dev/null; then
    echo "Installing wasm-pack..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# Build the WASM module
wasm-pack build --target web --out-dir ../frontend/src/wasm

# Optimize WASM size
if command -v wasm-opt &> /dev/null; then
    echo "Optimizing WASM size..."
    wasm-opt -Oz --enable-simd \
        ../frontend/src/wasm/table1837_core_bg.wasm \
        -o ../frontend/src/wasm/table1837_core_bg.wasm
fi

echo "WASM build complete!"