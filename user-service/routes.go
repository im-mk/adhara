package main

import (
	"crypto/rsa"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/im-mk/adhara/user-service/controllers"
	_ "github.com/im-mk/adhara/user-service/docs"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func registerRoutes(userController *controllers.UserController, appConfig AppConfig, publicKey *rsa.PublicKey) {
	router := gin.Default()
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, "healthy")
	})
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.POST("/login", userController.Login)
	router.POST("/bootstrap", userController.Bootstrap)

	auth := router.Group("/")
	auth.Use(authMiddleware(publicKey))
	{
		auth.POST("/users", userController.CreateUser)
	}
	router.Run(fmt.Sprintf("%s:%s", appConfig.Host, appConfig.Port))
}
