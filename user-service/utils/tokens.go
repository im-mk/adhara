package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/im-mk/adhara/user-service/models"
)

type JWTGenerator func(userId string, username string, jwtKey []byte) (string, error)

func GenerateJWT(userID string, username string, jwtKey []byte) (string, error) {

	claims := models.Claims{
		UserID:   userID,
		Username: username,
		Scope:    "orders.read orders.write",
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    "https://auth.adhara.internal",
			Audience:  []string{"orders-api"},
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}
