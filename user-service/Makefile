docs:
	go install github.com/swaggo/swag/cmd/swag@latest && \
	swag init --parseDependency --parseInternal 

test:
	go test ./... 

run:
	go run .
	
build:
	go test ./... -v && docker build -t user-service .