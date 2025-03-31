FROM golang:1.24-alpine

RUN apk add --no-cache sqlite sqlite-dev

WORKDIR /usr/src/app

COPY . .
COPY tools/init_db.sh /init_db.sh

RUN chmod +x /init_db.sh

ENV PATH="/usr/local/go/bin:${PATH}"

# Download dependencies
RUN go mod download

# Build the application
RUN go build -o main .

# Command to run the application
CMD ["/init_db.sh"]