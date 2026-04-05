package main

import (
	"crypto/rsa"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/im-mk/user-service/src/controllers"
	_ "github.com/im-mk/user-service/src/docs"
	"github.com/im-mk/user-service/src/middleware"
	"github.com/im-mk/user-service/src/models"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func registerRoutes(userController *controllers.UserController, customerController *controllers.CustomerController, authController *controllers.AuthController, jwksController *controllers.JwksController, appConfig models.AppConfig, authCfg models.AuthConfig, publicKey *rsa.PublicKey) {
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{appConfig.CorsURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, "healthy")
	})

	router.GET("/.well-known/jwks.json", jwksController.JwksHandler)
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	router.POST("/login", authController.Login)
	router.POST("/refresh", authController.Refresh)
	router.POST("/bootstrap", userController.Bootstrap)

	auth := router.Group("/")
	auth.Use(middleware.AuthMiddleware(publicKey, authCfg))
	{
		auth.POST("/users", userController.CreateUser)
		auth.GET("/users/:id", userController.GetUser)
		auth.POST("/customers", customerController.CreateCustomer)
		auth.POST("/Customers", customerController.CreateCustomer)
		auth.GET("/customers", customerController.GetCustomers)
		auth.GET("/Customers", customerController.GetCustomers)
		auth.GET("/customers/:id", customerController.GetCustomer)
		auth.GET("/Customers/:id", customerController.GetCustomer)
		auth.PUT("/customers/:id", customerController.UpdateCustomer)
		auth.PUT("/Customers/:id", customerController.UpdateCustomer)
		auth.DELETE("/customers/:id", customerController.DeleteCustomer)
		auth.DELETE("/Customers/:id", customerController.DeleteCustomer)
		auth.POST("/customers/:id/addresses", customerController.AddAddress)
		auth.POST("/Customers/:id/addresses", customerController.AddAddress)
		auth.PUT("/customers/:id/addresses/:addressType", customerController.UpdateAddress)
		auth.PUT("/Customers/:id/addresses/:addressType", customerController.UpdateAddress)
	}
	router.Run(fmt.Sprintf("%s:%s", appConfig.Host, appConfig.Port))
}
