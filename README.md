# Tiny WASI - A tiny WASI runtime written in typescript

This runtime implements the bare minimum set of functions to get most C/C++ libraries that have been compiled with the "reactor" exec model running.

The only thing it allows is writing to stdout/stderr, getting the current time and getting random numbers, which should really be enough for everyone.

## Usage

```
import { TinyWASI } from "tinywasi";

let tinywasi = new TinyWASI();

let imports = {
	<your_own_imports>,
	...tinywasi.imports
};

const { module, instance } = await WebAssembly.instantiate( <wasm_source>, imports );

tinywasi.initialize( instance );
```