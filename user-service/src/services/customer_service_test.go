package services

import (
	"database/sql"
	"testing"

	"github.com/im-mk/user-service/src/dtos"
	"github.com/im-mk/user-service/src/entities"
	"github.com/im-mk/user-service/src/repositories"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockTx is a mock implementation of repositories.TxInterface for testing
type MockTx struct {
	mock.Mock
}

func (m *MockTx) Rollback() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockTx) Commit() error {
	args := m.Called()
	return args.Error(0)
}

func (m *MockTx) QueryRowx(query string, args ...interface{}) *sqlx.Row {
	callArgs := m.Called(query, args)
	if callArgs.Get(0) == nil {
		return nil
	}
	return callArgs.Get(0).(*sqlx.Row)
}

func (m *MockTx) QueryRow(query string, args ...interface{}) *sql.Row {
	callArgs := m.Called(query, args)
	if callArgs.Get(0) == nil {
		return nil
	}
	return callArgs.Get(0).(*sql.Row)
}

func (m *MockTx) Exec(query string, args ...interface{}) (sql.Result, error) {
	callArgs := m.Called(query, args)
	if callArgs.Get(0) == nil {
		return nil, callArgs.Error(1)
	}
	return callArgs.Get(0).(sql.Result), callArgs.Error(1)
}

// Ensure MockTx implements TxInterface
var _ repositories.TxInterface = (*MockTx)(nil)

func TestCustomerService_CreateCustomer(t *testing.T) {
	mockRepo := new(MockCustomerRepository)
	mockAddressRepo := new(MockAddressRepository)
	service := NewCustomerService(mockRepo, mockAddressRepo)

	req := dtos.CreateCustomerRequest{
		FirstName: "  Alice ",
		LastName:  " Smith ",
		BillingAddress: dtos.AddressRequest{
			AddressLine1: "1 Billing Street",
			Postcode:     "B1 1AA",
			Country:      "gb",
		},
		ShippingAddress: dtos.AddressRequest{
			AddressLine1: "2 Shipping Street",
			Postcode:     "S1 1AA",
			Country:      "gb",
		},
	}

	mockTx := new(MockTx)
	mockTx.On("Rollback").Return(nil)
	mockTx.On("Commit").Return(nil)

	mockAddressRepo.On("BeginTx").Return(mockTx, nil).Once()
	mockRepo.On("InsertCustomer",
		mockTx,
		mock.MatchedBy(func(customer entities.Customer) bool {
			return customer.FirstName == "Alice" && customer.LastName == "Smith"
		}),
	).Return(&entities.Customer{ID: 10, FirstName: "Alice", LastName: "Smith"}, nil).Once()
	mockAddressRepo.On("InsertAddress",
		mockTx,
		10,
		"billing",
		mock.MatchedBy(func(address entities.Address) bool {
			return address.AddressLine1 == "1 Billing Street" && address.Country == "GB"
		}),
	).Return(&entities.Address{ID: 1, AddressLine1: "1 Billing Street"}, nil).Once()
	mockAddressRepo.On("InsertAddress",
		mockTx,
		10,
		"shipping",
		mock.MatchedBy(func(address entities.Address) bool {
			return address.AddressLine1 == "2 Shipping Street" && address.Country == "GB"
		}),
	).Return(&entities.Address{ID: 2, AddressLine1: "2 Shipping Street"}, nil).Once()

	created, err := service.CreateCustomer(req)

	assert.NoError(t, err)
	assert.Equal(t, 10, created.ID)
	mockRepo.AssertExpectations(t)
	mockAddressRepo.AssertExpectations(t)
}

func TestCustomerService_UpdateAddressRejectsInvalidType(t *testing.T) {
	mockRepo := new(MockCustomerRepository)
	mockAddressRepo := new(MockAddressRepository)
	service := NewCustomerService(mockRepo, mockAddressRepo)

	_, err := service.UpdateAddress(1, "office", dtos.AddressRequest{
		AddressLine1: "Line 1",
		Postcode:     "AA11AA",
		Country:      "GB",
	})

	assert.ErrorIs(t, err, ErrInvalidAddressType)
	mockRepo.AssertNotCalled(t, "CustomerExists", mock.Anything)
}
