WASI_SYSROOT = /usr/share/wasi-sysroot
CC = clang++
CXX = clang++

TARGET_ARCH = \
--target=wasm32-unknown-wasi \
--sysroot=$(WASI_SYSROOT) \
-mexec-model=reactor

CFLAGS = \
-Wall \
-Wno-unused-command-line-argument \
-Werror \
-Ofast \
-flto \
-fno-exceptions \
-ffunction-sections \
-fdata-sections

CXXFLAGS = \
$(CFLAGS) \
-fno-exceptions

LDFLAGS = \
-Wl,--strip-all \
-Wl,--lto-O3

LDLIBS =


example.wasm: example.o
	$(LINK.o) $^ $(LDLIBS) -o $@

example.o: example.cpp


.PHONY: clean
clean:
	$(RM) example.wasm example.o