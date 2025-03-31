FROM golang:1.24

WORKDIR /usr/src/app

COPY . .

ENV PATH="/usr/local/go/bin:${PATH}"

# Download dependencies
RUN go mod download

# Build the application
RUN go build -o main .

# Command to run the application
CMD ["./main"]