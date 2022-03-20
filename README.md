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


## Implemented system calls

Currently TinyWASI implements the following system calls:


### `fd_fdstat_get`

Implemented for the proper function of `stat` and `isatty` which are needed for
printing to stdout/stderr to work correctly.


### `fd_write`

Implemented for writing to stdout and stderr.
Writing to any other file descriptor returns `ERRNO_BADF`.

All writes to stdout (fd 1) are logged to the console using `console.log`.  
All writes to stderr (fd 2) are logged to the console using `console.error`.  


### `clock_res_get` and `clock_time_get`

Implemented to make functions like `time()` work.
Right now only the realtime clock (id 0) is supported.


### `random_get`

Implemented to make C++ `std::random_device` work.


## Unimplemented system calls

All other system calls are unimplemented and return `ERRNO_NOSYS` while printing
an error message to the console.


## Dependencies

None.

### Dev-Dependencies

* typescript - for compiling the typescript source files to javascript
* @types/node - typescript definitions for node's API

Optionally:

* prettier - for code formatting using the included .prettierrc