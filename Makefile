.PHONY: start build test validate python-test docker-up docker-down integration-up

start:
	node dist/server.js

build:
	npm run build

test:
	node --test tests/node/*.test.js

validate:
	node scripts/validate-project.mjs

python-test:
	pytest -m "not browser"

docker-up:
	docker compose up --build app

docker-down:
	docker compose down -v

integration-up:
	docker compose --profile integration up --build
