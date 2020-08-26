make test:
	# Deploy external project network
	-- docker network create goatFish_backend
	
	# Bring the project down
	-- cd src && docker-compose -f docker-compose.test.yml down

	# Build core logic
	cd src && docker-compose -f docker-compose.test.yml up -d --build

	# Follow the progress of the test
	docker logs test -f

duke-nukem:
	- docker kill $$(docker ps -q)
	- docker rm $$(docker ps -a -q)
	- docker rmi $$(docker images -q)
	- docker volume prune