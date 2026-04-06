package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

const requestIDHeader = "X-Request-Id"

func RequestLoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := strings.TrimSpace(c.GetHeader(requestIDHeader))
		if requestID == "" {
			requestID = generateRequestID()
			c.Request.Header.Set(requestIDHeader, requestID)
		}

		c.Writer.Header().Set(requestIDHeader, requestID)
		startedAt := time.Now()

		c.Next()

		if strings.EqualFold(c.Request.URL.Path, "/health") {
			return
		}

		elapsed := time.Since(startedAt)
		log.Printf("request_id=%s method=%s path=%s status=%d duration_ms=%.1f", requestID, c.Request.Method, c.FullPath(), c.Writer.Status(), float64(elapsed.Microseconds())/1000)
	}
}

func generateRequestID() string {
	buf := make([]byte, 16)
	if _, err := rand.Read(buf); err != nil {
		return time.Now().Format("20060102150405.000000000")
	}

	return hex.EncodeToString(buf)
}
