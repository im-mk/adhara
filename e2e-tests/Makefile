.PHONY: install smoke journeys all
install:
	cd e2e-tests && npm install && npm run install:browsers

smoke:
	cd e2e-tests && npm run test:smoke

journeys:
	cd e2e-tests && npm run test:journeys

all:
	cd e2e-tests && npm run test:e2e