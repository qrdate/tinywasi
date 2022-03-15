#include <string>
#include <iostream>

// These are some handy macros to import and export function from JavaScript.
#define WASM_EXPORT(name) __attribute__((export_name(#name)))
#define WASM_IMPORT(module, name) __attribute__((import_module(#module), import_name(#name)))


/* This is an example for a simple function that gets called from JavaScript
// and returns a value. Since the parameters are all numbers they can be passed
// directly. For an example with strings see the next example.
*/
int WASM_EXPORT(multiply) multiply(int a, int b)
{
	return a * b;
}


/* This is an example of a function that takes a string parameter.
// Since complex data types can't be passed directly there is a function that
// allocates a buffer and returns a pointer to it so it can be filled from
// JavaScript before calling the actual function.
*/
std::string string;

const char *WASM_EXPORT(getString) getString(size_t length)
{
	string.resize(length);
	return string.data();
}

void WASM_EXPORT(printString) printString(void)
{
	std::cout << "The string is: " << string << std::endl;
}


/* A function showing off making a syscall to the WASI runtime
// to get the current time and then print it to stdout, which gets redirected
// to console.log by the runtime.
*/
void WASM_EXPORT(printTime) printTime()
{
	int now = time(NULL);

	std::cout << "The UNIX time is: " << now << std::endl;
}


/* This function makes a call to an imported JavaSCript function and
// prints the return value.
*/
extern int WASM_IMPORT(js, getValue) getJSValue(void);

void WASM_EXPORT(printJSValue) printJSValue()
{
	int value = getJSValue();

	std::cout << "The value is: " << value << std::endl;
}


/* This function prints a message to stderr, which should show up as error
// in the javascript console.
*/
void WASM_EXPORT(printError) printError()
{
	std::cerr << "Look at this error!";
}