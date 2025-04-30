# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/28 13:10:42 by nponchon          #+#    #+#              #
#    Updated: 2025/04/30 11:30:24 by nponchon         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

dev:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.dev.yml up -d --build

prod:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml -f ./containers/docker-compose.prod.yml up -d --build

up:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml up -d --build

down:
	docker compose -f ./containers/docker-compose.yml down --remove-orphans

re:
	$(MAKE) stop
	$(MAKE) clean
	$(MAKE) up

backend:
	$(MAKE) stop
	docker volume rm containers_public
	$(MAKE) clean
	$(MAKE) up

stop:	# stops ALL containers running on the host, not just the ones in the compose file
	docker stop $$(docker ps -aq) && docker rm $$(docker ps -aq)

clean:
	docker compose -f ./containers/docker-compose.yml down --remove-orphans
	docker system prune -f --volumes

fclean:
	@read -p "Are you sure? This will take down the whole network and you will lose the database. [y/N]: " confirm && [ "$$confirm" = "y" ] || exit 1
	$(MAKE) down
	docker compose -f ./containers/docker-compose.yml down --remove-orphans --rmi all --volumes
	docker volume prune -f
	docker network prune -f
	docker image prune -a -f

.PHONY:
	up down re stop clean fclean backend dev prod