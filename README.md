# Tiny WASI - A tiny WASI runtime written in typescript

This runtime implements the bare minimum set of functions to get most C/C++
libraries that have been compiled with the "reactor" exec model running.

The only thing it allows is writing to stdout/stderr, getting the current time
and getting random numbers, which should really be enough for everyone.

## Example

```ts
import { TinyWASI } from "tinywasi";

let tinywasi = new TinyWASI();

let imports = {
	<your_own_imports>,
	...tinywasi.imports
};

const { module, instance } = await WebAssembly.instantiate( <wasm_source>, imports );

tinywasi.initialize( instance );
```

## API

### `new TinyWASI( trace?: boolean )`

Instantiates a new TinyWASI runtime.

#### Parameters

* `trace`: boolean, optional. Wether or not to print all system calls to the
console for debugging.

### `initialize( instance: WebAssembly.Instance )`

Initializes the runtime and WASM instance. Call this before making any
other calls.

#### Parameters

* `instance`: WebAssembly instance to connect to and initialize.

### `imports: array`

Array containing the functions to be imported by the WebAssembly module.  
Pass this directly to `WebAssembly.instantiate` or add it to your own imports.
