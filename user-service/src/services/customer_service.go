package services

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/im-mk/user-service/src/dtos"
	"github.com/im-mk/user-service/src/entities"
	"github.com/im-mk/user-service/src/repositories"
)

var (
	ErrCustomerNotFound   = errors.New("customer not found")
	ErrAddressNotFound    = errors.New("address not found")
	ErrInvalidAddressType = errors.New("invalid address type")
)

type CustomerService struct {
	CustomerRepo repositories.CustomerRepositoryInterface
	AddressRepo  repositories.AddressRepositoryInterface
}

func NewCustomerService(customerRepo repositories.CustomerRepositoryInterface, addressRepo repositories.AddressRepositoryInterface) *CustomerService {
	return &CustomerService{CustomerRepo: customerRepo, AddressRepo: addressRepo}
}

func (s *CustomerService) CreateCustomer(req dtos.CreateCustomerRequest) (*entities.Customer, error) {
	customer := entities.Customer{
		FirstName: strings.TrimSpace(req.FirstName),
		LastName:  strings.TrimSpace(req.LastName),
	}

	billingAddress := mapAddressRequest(req.BillingAddress)
	shippingAddress := mapAddressRequest(req.ShippingAddress)

	tx, err := s.AddressRepo.BeginTx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	createdCustomer, err := s.CustomerRepo.InsertCustomer(tx, customer)
	if err != nil {
		return nil, err
	}

	createdBilling, err := s.AddressRepo.InsertAddress(tx, createdCustomer.ID, "billing", billingAddress)
	if err != nil {
		return nil, err
	}

	createdShipping, err := s.AddressRepo.InsertAddress(tx, createdCustomer.ID, "shipping", shippingAddress)
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	createdCustomer.BillingAddress = createdBilling
	createdCustomer.ShippingAddress = createdShipping
	return createdCustomer, nil
}

func (s *CustomerService) GetCustomer(customerID int) (*entities.Customer, error) {
	customer, err := s.CustomerRepo.GetCustomerWithAddressesByID(customerID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrCustomerNotFound
		}
		return nil, err
	}
	return customer, nil
}

func (s *CustomerService) GetAllCustomers() ([]entities.Customer, error) {
	return s.CustomerRepo.GetAllCustomers()
}

func (s *CustomerService) GetCustomersPage(page int, pageSize int) ([]entities.Customer, int, error) {
	customers, err := s.CustomerRepo.GetCustomersPage(page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	totalCount, err := s.CustomerRepo.CountCustomers()
	if err != nil {
		return nil, 0, err
	}

	return customers, totalCount, nil
}

func (s *CustomerService) AddAddress(customerID int, req dtos.CreateCustomerAddressRequest) (*entities.Address, error) {
	addressType, err := normalizeAddressType(req.AddressType)
	if err != nil {
		return nil, err
	}

	exists, err := s.CustomerRepo.CustomerExists(customerID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrCustomerNotFound
	}

	tx, err := s.AddressRepo.BeginTx()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	address, err := s.AddressRepo.InsertAddress(tx, customerID, addressType, mapAddressRequest(req.AddressRequest))
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}
	return address, nil
}
func (s *CustomerService) UpdateAddress(customerID int, addressType string, req dtos.AddressRequest) (*entities.Address, error) {
	normalizedType, err := normalizeAddressType(addressType)
	if err != nil {
		return nil, err
	}

	exists, err := s.CustomerRepo.CustomerExists(customerID)
	if err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrCustomerNotFound
	}

	address, err := s.AddressRepo.UpdateAddress(customerID, normalizedType, mapAddressRequest(req))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrAddressNotFound
		}
		return nil, err
	}
	return address, nil
}

func (s *CustomerService) UpdateCustomer(customerID int, req dtos.UpdateCustomerRequest) (*entities.Customer, error) {
	firstName := strings.TrimSpace(req.FirstName)
	lastName := strings.TrimSpace(req.LastName)

	if firstName == "" || lastName == "" {
		return nil, errors.New("first name and last name are required")
	}

	customer, err := s.CustomerRepo.UpdateCustomer(customerID, firstName, lastName)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrCustomerNotFound
		}
		return nil, err
	}
	return customer, nil
}

func (s *CustomerService) DeleteCustomer(customerID int) error {
	err := s.CustomerRepo.DeleteCustomer(customerID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrCustomerNotFound
		}
		return err
	}
	return nil
}

func mapAddressRequest(req dtos.AddressRequest) entities.Address {
	return entities.Address{
		AddressLine1: strings.TrimSpace(req.AddressLine1),
		AddressLine2: strings.TrimSpace(req.AddressLine2),
		AddressLine3: strings.TrimSpace(req.AddressLine3),
		AddressLine4: strings.TrimSpace(req.AddressLine4),
		Postcode:     strings.TrimSpace(req.Postcode),
		Country:      strings.ToUpper(strings.TrimSpace(req.Country)),
	}
}

func normalizeAddressType(addressType string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(addressType)) {
	case "billing":
		return "billing", nil
	case "shipping":
		return "shipping", nil
	default:
		return "", ErrInvalidAddressType
	}
}
