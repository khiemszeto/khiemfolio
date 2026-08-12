.PHONY: docker-build
docker-build:
	docker build -t client-react-nginx-unprevil .

.PHONY: docker-push
docker-push:
	docker tag client-react-nginx-unprevil dockerkhiem/khiemfolio-image:v1
	docker push dockerkhiem/khiemfolio-image:v1

.PHONY: docker-run
docker-run:
	docker network create my-network

	docker run -d \
		--network my-network \
		--name client-react-nginx-unprevil \
		-p 80:8080 \
		--restart unless-stopped \
		client-react-nginx-unprevil

.PHONY: docker-stop
docker-stop:
	docker stop client-react-nginx-unprevil

.PHONY: docker-rm
docker-rm:
	docker container rm client-react-nginx-unprevil
	docker network rm my-network

define DOCKER_COMPOSE_NOTE

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

❯ NOTE:

This command runs the example app with a bunch
of individual docker run commands. This is much
easier to manage with docker-compose (see 
docker-compose.yml and compose make targets above)

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

endef
export DOCKER_COMPOSE_NOTE