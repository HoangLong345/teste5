package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)

type Message struct {
	Sender  string `json:"sender"`
	Content string `json:"content"`
}

func main() {

	// Route mặc định để test server
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Go WebSocket server is running!"))
	})

	// Route WebSocket
	http.HandleFunc("/ws", handleConnections)

	// Xử lý message
	go handleMessages()

	// Lấy PORT từ Render
	port := os.Getenv("PORT")
	if port == "" {
		port = "10000" // fallback dùng local
	}

	fmt.Println("Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	defer ws.Close()
	clients[ws] = true

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("❌ Lỗi: %v", err)
			delete(clients, ws)
			break
		}
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("❌ Lỗi gửi tin: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
