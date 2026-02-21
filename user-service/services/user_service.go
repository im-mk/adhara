package services

import (
	"crypto/rsa"
	"errors"
	"strconv"

	"github.com/im-mk/adhara/user-service/models"
	"github.com/im-mk/adhara/user-service/repositories"
	"github.com/im-mk/adhara/user-service/utils"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	UserRepo    repositories.UserRepositoryInterface
	PrivateKey  *rsa.PrivateKey
	GenerateJWT utils.JWTGenerator
	TokenExpirySecond int
}

func NewUserService(userRepo repositories.UserRepositoryInterface, privateKey *rsa.PrivateKey, generateJWT utils.JWTGenerator, tokenExpirySecond int) *UserService {
	if generateJWT == nil {
		generateJWT = utils.GenerateJWT
	}

	return &UserService{UserRepo: userRepo, PrivateKey: privateKey, GenerateJWT: generateJWT, TokenExpirySecond: tokenExpirySecond}
}

func (s *UserService) Login(creds models.LoginRequest) (string, error) {
	user, err := s.UserRepo.GetUserByUsername(creds.Username)
	if err != nil {
		return "", errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(creds.Password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := s.GenerateJWT(strconv.Itoa(user.ID), user.Username, s.PrivateKey, s.TokenExpirySecond)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (s *UserService) CreateUser(req models.CreateUserRequest) error {

	exists, err := s.UserRepo.UserExists(req.Username, req.Email)
	if err != nil {
		return errors.New("failed to check for existing user")
	}

	if exists {
		return errors.New("username or email already exists")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user := models.User{
		Username: req.Username,
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	return s.UserRepo.CreateUser(user)
}

// Bootstrap creates the first user if no users exist in the system.
func (s *UserService) Bootstrap(req models.CreateUserRequest) error {

	any, err := s.UserRepo.AnyUserExists()
	if err != nil || any {
		return errors.New("an error occurred whilst performing bootstrap")
	}

	return s.CreateUser(req)
}
