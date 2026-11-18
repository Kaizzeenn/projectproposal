// Windows offline launcher for the original Project BDAY website.
// All static assets are embedded at build time; no internet connection required.
package main

import (
    "embed"
    "fmt"
    "io/fs"
    "log"
    "net"
    "net/http"
    "os"
    "os/exec"
    "runtime"
    "time"
)

//go:embed static/*
var birthdayFiles embed.FS

func main() {
    root, err := fs.Sub(birthdayFiles, "static")
    if err != nil {
        log.Fatal("Could not load birthday website: ", err)
    }
    if _, err := fs.Stat(root, "index.html"); err != nil {
        log.Fatal("The birthday website is missing its homepage: ", err)
    }

    listener, err := net.Listen("tcp", "127.0.0.1:0")
    if err != nil {
        log.Fatal("Could not start the local birthday website: ", err)
    }
    url := "http://" + listener.Addr().String() + "/"
    files := http.FileServer(http.FS(root))
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodGet && r.Method != http.MethodHead {
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
            return
        }
        w.Header().Set("Cache-Control", "no-store")
        w.Header().Set("X-Content-Type-Options", "nosniff")
        files.ServeHTTP(w, r)
    })

    fmt.Println("===============================================")
    fmt.Println("  Marjie's Birthday Surprise — OFFLINE")
    fmt.Println("===============================================")
    fmt.Println("Everything is included: photos, videos, letter")
    fmt.Println("Open this address in your browser:", url)
    fmt.Println("No Wi-Fi or internet connection is needed.")
    fmt.Println("Keep this window open while enjoying the site.")
    fmt.Println("Close this window when finished.")
    fmt.Println()

    go func() {
        time.Sleep(350 * time.Millisecond)
        var cmd *exec.Cmd
        if runtime.GOOS == "windows" {
            cmd = exec.Command("rundll32.exe", "url.dll,FileProtocolHandler", url)
        } else if runtime.GOOS == "darwin" {
            cmd = exec.Command("open", url)
        } else {
            cmd = exec.Command("xdg-open", url)
        }
        if err := cmd.Start(); err != nil {
            fmt.Fprintln(os.Stderr, "Browser could not open automatically; enter the URL above.")
        }
    }()

    server := &http.Server{
        Handler:           handler,
        ReadHeaderTimeout: 10 * time.Second,
        IdleTimeout:       90 * time.Second,
    }
    if err := server.Serve(listener); err != nil && err != http.ErrServerClosed {
        log.Fatal("Offline website server stopped: ", err)
    }
}
