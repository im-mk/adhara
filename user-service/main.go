package main

import (
	"log"
	"os"

	"github.com/im-mk/adhara/user-service/controllers"
	_ "github.com/im-mk/adhara/user-service/docs"
	"github.com/im-mk/adhara/user-service/repositories"
	"github.com/im-mk/adhara/user-service/services"
	"github.com/im-mk/adhara/user-service/utils"
)

// @title						user-service
// @version					1.0
// @description				service to manage users
// @contact.name				im-mk
// @contact.url				http://github.com/im-mk
// @host						localhost:8070
// @BasePath					/
// @securityDefinitions.apikey	ApiKeyAuth
// @in							header
// @name						Authorization
func main() {

	appConfig := GetConfig()

	log.Println(appConfig.Auth.PrivateKeyPath)
	wd, err := os.Getwd()
	if err != nil {
		log.Println("error getting working directory:", err)
	} else {
		log.Println("current working directory:", wd)
	}

	privateAuthKey, err := utils.LoadPrivateKey(appConfig.Auth.PrivateKeyPath)
	if err != nil {
		log.Println(err)
	}

	publicAuthKey, err := utils.LoadPublicKey(appConfig.Auth.PublicKeyPath)
	if err != nil {
		log.Println(err)
	}

	db := initDB(appConfig.DB)
	userRepo := repositories.NewUserRepository(db)

	userService := services.NewUserService(userRepo, privateAuthKey, utils.GenerateJWT, appConfig.Auth.TokenExpirySeconds)
	userController := controllers.NewUserController(userService)

	registerRoutes(userController, appConfig.App, publicAuthKey)
}
