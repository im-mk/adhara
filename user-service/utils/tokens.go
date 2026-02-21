package utils

import (
	"crypto/rsa"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTGenerator func(userId string, username string, privateKey *rsa.PrivateKey, tokenExpirySeconds int) (string, error)

func GenerateJWT(userID string, username string, privateKey *rsa.PrivateKey, tokenExpirySeconds int) (string, error) {

	claims := jwt.MapClaims{
		"sub":      userID,
		"username": username,
		// "scope":    "orders.read orders.write",
		"iss": "http://localhost:8070",
		"aud": []string{"orders-api"},
		"exp": time.Now().Add(time.Duration(tokenExpirySeconds) * time.Second).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = "auth-key-v1"

	return token.SignedString(privateKey)
}
