package services

import (
	"crypto/rsa"
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"

	"github.com/im-mk/adhara/user-service/models"
)

type MockUserRepository struct {
	mock.Mock
}

func (m *MockUserRepository) GetUserByUsername(username string) (*models.User, error) {
	args := m.Called(username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) UserExists(username, email string) (bool, error) {
	args := m.Called(username, email)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserRepository) CreateUser(user models.User) error {
	args := m.Called(user)
	return args.Error(0)
}

func (m *MockUserRepository) AnyUserExists() (bool, error) {
	args := m.Called()
	return args.Bool(0), args.Error(1)
}

func TestUserService_Login(t *testing.T) {

	mockGenerateJWT := func(userId string, username string, key *rsa.PrivateKey, tokenExpirySeconds int) (string, error) {
		return "mockToken", nil
	}

	t.Run("successful login", func(t *testing.T) {
		mockRepo := new(MockUserRepository)

		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		password := "password123"
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

		mockUser := &models.User{
			ID:       1,
			Username: "testuser",
			Password: string(hashedPassword),
		}

		mockRepo.On("GetUserByUsername", "testuser").Return(mockUser, nil).Once()

		token, err := userService.Login(models.LoginRequest{
			Username: "testuser",
			Password: password,
		})

		assert.NoError(t, err)
		assert.Equal(t, "mockToken", token)
		mockRepo.AssertExpectations(t)
	})

	t.Run("invalid credentials - wrong password", func(t *testing.T) {
		mockRepo := new(MockUserRepository)
		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		password := "password123"
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

		mockUser := &models.User{
			ID:       1,
			Username: "testuser",
			Password: string(hashedPassword),
		}

		mockRepo.On("GetUserByUsername", "testuser").Return(mockUser, nil).Once()

		token, err := userService.Login(models.LoginRequest{
			Username: "testuser",
			Password: "wrongpassword",
		})

		assert.Error(t, err)
		assert.Equal(t, "", token)
		assert.EqualError(t, err, "invalid credentials")
		mockRepo.AssertExpectations(t)
	})

	t.Run("user not found", func(t *testing.T) {
		mockRepo := new(MockUserRepository)
		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		mockRepo.On("GetUserByUsername", "unknownuser").Return(nil, errors.New("user not found")).Once()

		token, err := userService.Login(models.LoginRequest{
			Username: "unknownuser",
			Password: "password123",
		})

		assert.Error(t, err)
		assert.Equal(t, "", token)
		assert.EqualError(t, err, "invalid credentials")
		mockRepo.AssertExpectations(t)
	})
}

func TestUserService_CreateUser(t *testing.T) {

	mockGenerateJWT := func(userId string, username string, key *rsa.PrivateKey, tokenExpirySeconds int) (string, error) {
		return "mockToken", nil
	}

	t.Run("successful user creation", func(t *testing.T) {
		mockRepo := new(MockUserRepository)
		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		req := models.CreateUserRequest{
			Username: "newuser",
			Email:    "newuser@example.com",
			Password: "password123",
		}

		mockRepo.On("UserExists", req.Username, req.Email).Return(false, nil).Once()
		mockRepo.On("CreateUser", mock.Anything).Return(nil).Once()

		err := userService.CreateUser(req)

		assert.NoError(t, err)
		mockRepo.AssertExpectations(t)
	})

	t.Run("user already exists", func(t *testing.T) {
		mockRepo := new(MockUserRepository)
		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		req := models.CreateUserRequest{
			Username: "existinguser",
			Email:    "existinguser@example.com",
			Password: "password123",
		}

		mockRepo.On("UserExists", req.Username, req.Email).Return(true, nil).Once()

		err := userService.CreateUser(req)

		assert.Error(t, err)
		assert.EqualError(t, err, "username or email already exists")
		mockRepo.AssertExpectations(t)
	})

	t.Run("error checking user existence", func(t *testing.T) {
		mockRepo := new(MockUserRepository)
		userService := NewUserService(mockRepo, nil, mockGenerateJWT, 10)

		req := models.CreateUserRequest{
			Username: "newuser",
			Email:    "newuser@example.com",
			Password: "password123",
		}

		mockRepo.On("UserExists", req.Username, req.Email).Return(false, errors.New("db error")).Once()

		err := userService.CreateUser(req)

		assert.Error(t, err)
		assert.EqualError(t, err, "failed to check for existing user")
		mockRepo.AssertExpectations(t)
	})
}
