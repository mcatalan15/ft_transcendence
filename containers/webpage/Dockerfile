FROM golang:1.24-alpine

RUN apk add --no-cache sqlite sqlite-dev

WORKDIR /usr/src/app

COPY . .

RUN chmod +x tools/init_db.sh

ENV PATH="/usr/local/go/bin:${PATH}"

RUN go mod download

RUN go build -o main .

CMD ["tools/init_db.sh"]