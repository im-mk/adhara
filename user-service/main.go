package main

import (
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
	db := initDB(appConfig.DB)
	userRepo := repositories.NewUserRepository(db)
	userService := services.NewUserService(userRepo, []byte(appConfig.JWTKey), utils.GenerateJWT)
	userController := controllers.NewUserController(userService)

	registerRoutes(userController, appConfig.App, []byte(appConfig.JWTKey))
}
