# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/28 13:10:42 by nponchon          #+#    #+#              #
#    Updated: 2025/06/03 11:54:12 by nponchon         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

prod:
	@bash ./scripts/setup.sh
	@bash ./scripts/generate_certs.sh
	@COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.prod.yml up -d --build

dev:
	@bash ./scripts/setup.sh
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up -d --build

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

.PHONY:
	up down re stop clean fclean frontend dev prod redev