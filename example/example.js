import { TinyWASI } from './../dist/TinyWASI.js';
import fs from 'fs';

// Load the compiled wasm file.
let data = fs.readFileSync('./example.wasm');
var source = new Uint8Array(data);

// Instantiate the TinyWASI runtime with tracing enabled.
// This logs all the system calls the WASM module makes to the console.
let tinywasi = new TinyWASI(true);

// Set up our imports object consisting of out own functions
// and the TinyWASI imports object.
let imports = {
    js: {
        getValue: () => {
            return 7;
        },
    },
    ...tinywasi.imports,
};

// Instantiate the wasm module from the source.
const { instance } = await WebAssembly.instantiate(source, imports);

// Initialize the TinyWASI runtime.
tinywasi.initialize(instance);

// Call the exported multiply function and log the result.
console.log(`2 * 3 is ${instance.exports.multiply(2, 3)}`);

// Create a string and allocate memory for it in the WASM module by calling
// the exported getString function to allocate space and get the location
// of the buffer in memory.
const utf8EncodedString = new TextEncoder('utf-8').encode('TinyWASI!');
const stringData = new Uint8Array(
    instance.exports.memory.buffer,
    instance.exports.getString(utf8EncodedString.length),
    utf8EncodedString.length,
);

// Copy the encoded string into the buffer inside the WASM module.
stringData.set(utf8EncodedString);

// Call the printString function to log the string to the console.
instance.exports.printString();

// Call the printTime function. Should log the current UNIX time to the console.
instance.exports.printTime();

// Call the printJSValue function. This will call the getValue function
// specified in the imports and log the result to the console.
instance.exports.printJSValue();

// Call the printError function. This will print an error to the console.
instance.exports.printError();
