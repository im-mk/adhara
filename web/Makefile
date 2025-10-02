.PHONY: test

# build and test in a container
test:
	docker build --target build -t adhara-web-build .
	docker build --target test -t adhara-web-test .
	docker run --rm adhara-web-test