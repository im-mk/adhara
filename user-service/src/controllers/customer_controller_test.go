package controllers

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"

	"github.com/im-mk/user-service/src/dtos"
	"github.com/im-mk/user-service/src/entities"
	"github.com/im-mk/user-service/src/repositories"
	"github.com/im-mk/user-service/src/services"
)

type fakeCustomerRepo struct {
	insertCustomer               func(repositories.TxInterface, entities.Customer) (*entities.Customer, error)
	getCustomerByID              func(int) (*entities.Customer, error)
	getCustomerWithAddressesByID func(int) (*entities.Customer, error)
	getAllCustomers              func() ([]entities.Customer, error)
	customerExists               func(int) (bool, error)
	updateCustomer               func(int, string, string) (*entities.Customer, error)
	deleteCustomer               func(int) error
}

func (r *fakeCustomerRepo) InsertCustomer(tx repositories.TxInterface, customer entities.Customer) (*entities.Customer, error) {
	return r.insertCustomer(tx, customer)
}

func (r *fakeCustomerRepo) GetCustomerByID(customerID int) (*entities.Customer, error) {
	return r.getCustomerByID(customerID)
}

func (r *fakeCustomerRepo) GetCustomerWithAddressesByID(customerID int) (*entities.Customer, error) {
	return r.getCustomerWithAddressesByID(customerID)
}

func (r *fakeCustomerRepo) GetAllCustomers() ([]entities.Customer, error) {
	return r.getAllCustomers()
}

func (r *fakeCustomerRepo) CustomerExists(customerID int) (bool, error) {
	return r.customerExists(customerID)
}

func (r *fakeCustomerRepo) UpdateCustomer(customerID int, firstName string, lastName string) (*entities.Customer, error) {
	return r.updateCustomer(customerID, firstName, lastName)
}

func (r *fakeCustomerRepo) DeleteCustomer(customerID int) error {
	return r.deleteCustomer(customerID)
}

type fakeAddressRepo struct {
	insertAddress func(repositories.TxInterface, int, string, entities.Address) (*entities.Address, error)
	updateAddress func(int, string, entities.Address) (*entities.Address, error)
	beginTx       func() (repositories.TxInterface, error)
}

func (r *fakeAddressRepo) InsertAddress(tx repositories.TxInterface, customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	return r.insertAddress(tx, customerID, addressType, address)
}

func (r *fakeAddressRepo) UpdateAddress(customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	return r.updateAddress(customerID, addressType, address)
}

func (r *fakeAddressRepo) BeginTx() (repositories.TxInterface, error) {
	return r.beginTx()
}

// fakeTx is a simple implementation of TxInterface for testing
type fakeTx struct{}

func (tx *fakeTx) Rollback() error { return nil }
func (tx *fakeTx) Commit() error   { return nil }
func (tx *fakeTx) QueryRowx(query string, args ...interface{}) *sqlx.Row {
	return nil
}
func (tx *fakeTx) QueryRow(query string, args ...interface{}) *sql.Row {
	return nil
}
func (tx *fakeTx) Exec(query string, args ...interface{}) (sql.Result, error) {
	return &fakeResult{}, nil
}

// fakeResult implements sql.Result
type fakeResult struct{}

func (r *fakeResult) LastInsertId() (int64, error) { return 1, nil }
func (r *fakeResult) RowsAffected() (int64, error) { return 1, nil }

func TestCreateCustomerHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)

	fakeTx := &fakeTx{}

	repo := &fakeCustomerRepo{
		insertCustomer: func(_ repositories.TxInterface, customer entities.Customer) (*entities.Customer, error) {
			customer.ID = 1
			return &customer, nil
		},
		getCustomerByID:              func(int) (*entities.Customer, error) { return nil, nil },
		getCustomerWithAddressesByID: func(int) (*entities.Customer, error) { return nil, nil },
		getAllCustomers:              func() ([]entities.Customer, error) { return nil, nil },
		customerExists:               func(int) (bool, error) { return true, nil },
	}
	addressRepo := &fakeAddressRepo{
		insertAddress: func(repositories.TxInterface, int, string, entities.Address) (*entities.Address, error) {
			return &entities.Address{ID: 1}, nil
		},
		updateAddress: func(int, string, entities.Address) (*entities.Address, error) { return nil, nil },
		beginTx:       func() (repositories.TxInterface, error) { return fakeTx, nil },
	}

	controller := NewCustomerController(services.NewCustomerService(repo, addressRepo))
	r := gin.New()
	r.POST("/customers", controller.CreateCustomer)

	body := dtos.CreateCustomerRequest{
		FirstName:       "Alice",
		LastName:        "Smith",
		BillingAddress:  dtos.AddressRequest{AddressLine1: "1 Billing Street", Postcode: "B1", Country: "GB"},
		ShippingAddress: dtos.AddressRequest{AddressLine1: "2 Shipping Street", Postcode: "S1", Country: "GB"},
	}
	payload, err := json.Marshal(body)
	assert.NoError(t, err)

	req := httptest.NewRequest(http.MethodPost, "/customers", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)
	var got entities.Customer
	err = json.Unmarshal(w.Body.Bytes(), &got)
	assert.NoError(t, err)
	assert.Equal(t, 1, got.ID)
	assert.Equal(t, "Alice", got.FirstName)
}

func TestUpdateCustomerAddressHandlerRejectsInvalidType(t *testing.T) {
	gin.SetMode(gin.TestMode)

	repo := &fakeCustomerRepo{
		insertCustomer: func(_ repositories.TxInterface, customer entities.Customer) (*entities.Customer, error) {
			return nil, nil
		},
		getCustomerByID:              func(int) (*entities.Customer, error) { return nil, nil },
		getCustomerWithAddressesByID: func(int) (*entities.Customer, error) { return nil, nil },
		getAllCustomers:              func() ([]entities.Customer, error) { return nil, nil },
		customerExists:               func(int) (bool, error) { return true, nil },
	}
	addressRepo := &fakeAddressRepo{
		insertAddress: func(repositories.TxInterface, int, string, entities.Address) (*entities.Address, error) {
			return nil, nil
		},
		updateAddress: func(int, string, entities.Address) (*entities.Address, error) { return nil, nil },
		beginTx:       func() (repositories.TxInterface, error) { return &fakeTx{}, nil },
	}

	controller := NewCustomerController(services.NewCustomerService(repo, addressRepo))
	r := gin.New()
	r.PUT("/customers/:id/addresses/:addressType", controller.UpdateAddress)

	body := dtos.AddressRequest{AddressLine1: "1 Line", Postcode: "P1", Country: "GB"}
	payload, err := json.Marshal(body)
	assert.NoError(t, err)

	req := httptest.NewRequest(http.MethodPut, "/customers/1/addresses/office", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
