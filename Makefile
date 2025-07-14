# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: mcatalan@student.42barcelona.com <mcata    +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/28 13:10:42 by nponchon          #+#    #+#              #
#    Updated: 2025/07/13 19:28:29 by mcatalan@st      ###   ########.fr        #
#                                                                              #
# **************************************************************************** #


prod:
	@bash ./scripts/setup_prod.sh
	@bash ./scripts/generate_certs.sh
	@COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.prod.yml up -d --build

dev:
	@bash ./scripts/setup_dev.sh
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up -d --build
#	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up --build

# tunnel:
# 	@if ! command -v cloudflared >/dev/null 2>&1; then \
# 		echo "cloudflared not found. Downloading..."; \
# 		ARCH=$$(uname -m); \
# 		if [ "$$ARCH" = "x86_64" ]; then \
# 			URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"; \
# 		elif [ "$$ARCH" = "aarch64" ]; then \
# 			URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"; \
# 		else \
# 			echo "Unsupported architecture: $$ARCH"; exit 1; \
# 		fi; \
# 		curl -L "$$URL" -o ./cloudflared && chmod +x ./cloudflared; \
# 		export PATH="$$PWD:$$PATH"; \
# 		alias cloudflared="$$PWD/cloudflared"; \
# 		echo "cloudflared installed locally."; \
# 	fi
# 	./cloudflared tunnel --url http://localhost:1080 --http-host-header localhost

tunnel:
	@if ! command -v cloudflared >/dev/null 2>&1; then \
		echo "cloudflared not found. Downloading..."; \
		ARCH=$$(uname -m); \
		OS=$$(uname -s | tr '[:upper:]' '[:lower:]'); \
		if [ "$$OS" = "linux" ]; then \
			if [ "$$ARCH" = "x86_64" ]; then \
				URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"; \
			elif [ "$$ARCH" = "aarch64" ]; then \
				URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"; \
			else \
				echo "Unsupported architecture: $$ARCH"; exit 1; \
			fi; \
			curl -L "$$URL" -o ./cloudflared; \
			chmod +x ./cloudflared; \
		elif [ "$$OS" = "darwin" ]; then \
			if [ "$$ARCH" = "x86_64" ]; then \
				URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-amd64.tgz"; \
			elif [ "$$ARCH" = "arm64" ]; then \
				URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-darwin-arm64.tgz"; \
			else \
				echo "Unsupported architecture: $$ARCH"; exit 1; \
			fi; \
			curl -L "$$URL" -o ./cloudflared.tgz; \
			tar -xvzf ./cloudflared.tgz; \
			chmod +x ./cloudflared; \
			rm ./cloudflared.tgz; \
		else \
			echo "Unsupported OS: $$OS"; exit 1; \
		fi; \
		echo "cloudflared installed locally."; \
	fi
	./cloudflared tunnel --url http://localhost:1080 --http-host-header localhost

re:
	$(MAKE) stop
	$(MAKE) clean
	$(MAKE) prod

redev:
	$(MAKE) stop
	$(MAKE) clean
	$(MAKE) dev

frontend:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml build frontend
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up -d frontend
#	$(MAKE) stop
#	docker volume rm containers_public
#	$(MAKE) clean
#	$(MAKE) dev

back:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml stop backend
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml rm -f backend
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml build backend
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up -d backend

stop:	# stops ALL containers running on the host, not just the ones in the compose file
	docker stop $$(docker ps -aq) && docker rm $$(docker ps -aq)

clean:
	docker compose -f ./containers/docker-compose.yml down --remove-orphans
	docker system prune -f --volumes
	@rm -f containers/.env
	@rm -rf containers/nginx/ssl

fclean:
	@read -p "Are you sure? This will take down the whole network and you will lose the database. [y/N]: " confirm && [ "$$confirm" = "y" ] || exit 1
	$(MAKE) stop
	docker compose -f ./containers/docker-compose.yml down --remove-orphans --rmi all --volumes
	docker volume prune -f
	docker network prune -f
	docker image prune -a -f

nuke:
	make stop
	docker rm -f $(docker ps -aq)
	docker rmi -f $(docker images -aq)
	docker volume rm $(docker volume ls -q)
	docker network rm $(docker network ls | grep -v "bridge\|host\|none" | awk '{print $1}')
	docker builder prune -af
	docker system prune -af --volumes

.PHONY:
	up down re stop clean fclean frontend dev prod redev back nuke tunnel
