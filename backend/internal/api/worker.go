package api

import (
	"encoding/json"
	"net/http"
	"time"
)

// jobQueue là channel chung cho các worker
var jobQueue = make(chan int, 100) // queue size

// enableCORS cho phép truy cập từ frontend (Next.js)
// LƯU Ý: phải truyền cả w và r khi gọi
func enableCORS(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
}

func init() {
	// start vài worker
	for i := 0; i < 8; i++ {
		go worker(i)
	}
}

func worker(id int) {
	for job := range jobQueue {
		// xử lý job (giả lập)
		time.Sleep(500 * time.Millisecond)
		_ = id // dùng biến id nếu cần log
		_ = job
	}
}

// HeavyTaskHandler: nhận request, đẩy job vào queue và trả về ngay
func HeavyTaskHandler(w http.ResponseWriter, r *http.Request) {
	enableCORS(w, r)

	// Nếu là preflight CORS request -> đã được xử lý ở enableCORS (đã return)
	// push job, trả về ngay
	select {
	case jobQueue <- 1:
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "queued"})
	default:
		http.Error(w, "server busy", http.StatusTooManyRequests)
	}
}
