
NODE_VER := $(shell node nodever)

# Command line paths
ESLINT    = ./node_modules/eslint/bin/eslint.js

# default job
test: ;

build: clean eslint ;

clean: ;

eslint:
	# check code style
ifneq ($(NODE_VER),0.12)
	@ $(ESLINT) -c ./.eslintrc.yml lib
endif

.PHONY: test build clean eslint
