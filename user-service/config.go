package main

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type DBConfig struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
}

type AppConfig struct {
	Host string
	Port string
}

type AuthConfig struct {
	PrivateKeyPath     string
	PublicKeyPath      string
	TokenExpirySeconds int
}

type ApplicationConfig struct {
	App  AppConfig
	DB   DBConfig
	Auth AuthConfig
}

func GetConfig() ApplicationConfig {

	appConfig := ApplicationConfig{}
	viper.AddConfigPath(".")
	viper.SetConfigType("json")
	viper.SetConfigName("config")
	viper.AutomaticEnv()

	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	err := viper.ReadInConfig()

	if err != nil {
		log.Printf("Error while reading config file %s", err)
	}

	configErr := viper.Unmarshal(&appConfig)
	if configErr != nil {
		log.Printf("Invalid configuration %s", configErr)
	}

	if appConfig.Auth.TokenExpirySeconds == 0 {
		log.Printf("using default time of 600 seconds")
		appConfig.Auth.TokenExpirySeconds = 600
	}

	return appConfig
}
