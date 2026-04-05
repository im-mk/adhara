package main

import (
	"log"

	"github.com/im-mk/user-service/src/controllers"
	_ "github.com/im-mk/user-service/src/docs"
	"github.com/im-mk/user-service/src/repositories"
	"github.com/im-mk/user-service/src/services"
	"github.com/im-mk/user-service/src/utils"
)

// @title						user-service
// @version					1.0
// @description				service to manage users
// @contact.name				im-mk
// @contact.url				http://github.com/im-mk
// @host						localhost:8040
// @BasePath					/
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
func main() {

	appConfig := utils.GetConfig()

	privateAuthKey, err := utils.LoadPrivateKey(appConfig.Auth.PrivateKeyPath)
	if err != nil {
		log.Fatalf("failed to load private key: %v", err)
	}

	publicAuthKey, err := utils.LoadPublicKey(appConfig.Auth.PublicKeyPath)
	if err != nil {
		log.Fatalf("failed to load public key: %v", err)
	}

	db := utils.InitDB(appConfig.DB)
	userRepo := repositories.NewUserRepository(db)
	addressRepo := repositories.NewAddressRepository(db)
	customerRepo := repositories.NewCustomerRepository(db)
	refreshTokenRepo := repositories.NewRefreshTokenRepository(db)

	tokenProv := &services.DefaultTokenProvider{
		PrivateKey: privateAuthKey,
		AuthConfig: appConfig.Auth,
	}

	authService := services.NewAuthService(userRepo, refreshTokenRepo, tokenProv, appConfig.Auth)
	userService := services.NewUserService(userRepo)
	customerService := services.NewCustomerService(customerRepo, addressRepo)

	userController := controllers.NewUserController(userService)
	customerController := controllers.NewCustomerController(customerService)
	jwksContrller := controllers.NewJwksController(publicAuthKey)
	authController := controllers.NewAuthController(authService)

	registerRoutes(userController, customerController, authController, jwksContrller, appConfig.App, appConfig.Auth, publicAuthKey)
}
