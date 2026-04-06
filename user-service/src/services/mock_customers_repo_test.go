package services

import (
	"github.com/stretchr/testify/mock"

	"github.com/im-mk/user-service/src/entities"
	"github.com/im-mk/user-service/src/repositories"
)

type MockCustomerRepository struct {
	mock.Mock
}

func (m *MockCustomerRepository) InsertCustomer(tx repositories.TxInterface, customer entities.Customer) (*entities.Customer, error) {
	args := m.Called(tx, customer)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) GetCustomerByID(customerID int) (*entities.Customer, error) {
	args := m.Called(customerID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) GetCustomerWithAddressesByID(customerID int) (*entities.Customer, error) {
	args := m.Called(customerID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) GetAllCustomers() ([]entities.Customer, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) GetCustomersPage(page int, pageSize int, nameFilter string, postcodeFilter string) ([]entities.Customer, error) {
	args := m.Called(page, pageSize, nameFilter, postcodeFilter)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) CountCustomers(nameFilter string, postcodeFilter string) (int, error) {
	args := m.Called(nameFilter, postcodeFilter)
	return args.Int(0), args.Error(1)
}

func (m *MockCustomerRepository) CustomerExists(customerID int) (bool, error) {
	args := m.Called(customerID)
	return args.Bool(0), args.Error(1)
}

func (m *MockCustomerRepository) UpdateCustomer(customerID int, firstName string, lastName string) (*entities.Customer, error) {
	args := m.Called(customerID, firstName, lastName)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Customer), args.Error(1)
}

func (m *MockCustomerRepository) DeleteCustomer(customerID int) error {
	args := m.Called(customerID)
	return args.Error(0)
}

type MockAddressRepository struct {
	mock.Mock
}

func (m *MockAddressRepository) InsertAddress(tx repositories.TxInterface, customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	args := m.Called(tx, customerID, addressType, address)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Address), args.Error(1)
}

func (m *MockAddressRepository) UpdateAddress(customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	args := m.Called(customerID, addressType, address)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*entities.Address), args.Error(1)
}

func (m *MockAddressRepository) BeginTx() (repositories.TxInterface, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(repositories.TxInterface), args.Error(1)
}
