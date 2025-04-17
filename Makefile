# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/02/28 13:10:42 by nponchon          #+#    #+#              #
#    Updated: 2025/04/02 14:44:32 by nponchon         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

up:
	COMPOSE_BAKE=true docker compose --env-file ./containers/.env -f ./containers/docker-compose.yml up -d --build

down:
	docker compose -f ./containers/docker-compose.yml down --remove-orphans

re:
	$(MAKE) stop
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

certs:
	docker exec -it nginx certbot --nginx -d mrlouf.studio -d www.mrlouf.studio
