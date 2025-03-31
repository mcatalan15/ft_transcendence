package main

import (
    "log"
    "net/http"
)

func main() {
    // Serve static files from the "content" directory
    fs := http.FileServer(http.Dir("./content"))
    http.Handle("/static/", http.StripPrefix("/static", fs))

    // Serve static.html as the home page at the root URL
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        http.ServeFile(w, r, "./content/static.html")
    })

    log.Println("Listening on :8080...")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        log.Fatal(err)
    }
}
