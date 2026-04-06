package controllers

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/im-mk/user-service/src/dtos"
	"github.com/im-mk/user-service/src/services"
)

type CustomerController struct {
	CustomerService *services.CustomerService
}

func NewCustomerController(customerService *services.CustomerService) *CustomerController {
	return &CustomerController{CustomerService: customerService}
}

// @Summary     Create a new customer
// @Description Create a new customer with billing and shipping addresses
// @Tags        customers
// @Accept      json
// @Produce     json
// @Param       customer body      dtos.CreateCustomerRequest true "Create Customer Request"
// @Success     201      {object}  entities.Customer
// @Failure     400      {object}  gin.H
// @Failure     500      {object}  gin.H
// @Router      /customers [post]
func (ctrl *CustomerController) CreateCustomer(c *gin.Context) {
	var req dtos.CreateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := ctrl.CustomerService.CreateCustomer(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, customer)
}

// @Summary     Return all customers
// @Description Return all customers with their addresses when available
// @Tags        customers
// @Produce     json
// @Success     200  {array}   entities.Customer
// @Failure     500  {object}  gin.H
// @Router      /customers [get]
func (ctrl *CustomerController) GetCustomers(c *gin.Context) {
	pageValue := strings.TrimSpace(c.Query("page"))
	pageSizeValue := strings.TrimSpace(c.Query("pageSize"))
	nameFilter := strings.TrimSpace(c.Query("name"))
	postcodeFilter := strings.TrimSpace(c.Query("postcode"))

	if (pageValue == "") != (pageSizeValue == "") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "page and pageSize must be provided together"})
		return
	}

	if pageValue != "" && pageSizeValue != "" {
		page, err := strconv.Atoi(pageValue)
		if err != nil || page <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "page must be a positive integer"})
			return
		}

		pageSize, err := strconv.Atoi(pageSizeValue)
		if err != nil || pageSize <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "pageSize must be a positive integer"})
			return
		}

		customers, totalCount, err := ctrl.CustomerService.GetCustomersPage(page, pageSize, nameFilter, postcodeFilter)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.Header("X-Total-Count", strconv.Itoa(totalCount))
		c.Header("X-Page", strconv.Itoa(page))
		c.Header("X-Page-Size", strconv.Itoa(pageSize))
		c.JSON(http.StatusOK, customers)
		return
	}

	customers, err := ctrl.CustomerService.GetAllCustomers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, customers)
}

// @Summary     Return customer details
// @Description Return customer details with the given ID
// @Tags        customers
// @Produce     json
// @Param       id   path      int  true  "Customer ID"
// @Success     200  {object}  entities.Customer
// @Failure     400  {object}  gin.H
// @Failure     404  {object}  gin.H
// @Failure     500  {object}  gin.H
// @Router      /customers/{id} [get]
func (ctrl *CustomerController) GetCustomer(c *gin.Context) {
	customerID, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	customer, err := ctrl.CustomerService.GetCustomer(customerID)
	if err != nil {
		if errors.Is(err, services.ErrCustomerNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// @Summary     Add a customer address
// @Description Add a new address for a customer for the given address type
// @Tags        customers
// @Accept      json
// @Produce     json
// @Param       id       path      int                                 true  "Customer ID"
// @Param       address  body      dtos.CreateCustomerAddressRequest  true  "Create Customer Address Request"
// @Success     201      {object}  entities.Address
// @Failure     400      {object}  gin.H
// @Failure     404      {object}  gin.H
// @Failure     409      {object}  gin.H
// @Failure     500      {object}  gin.H
// @Router      /customers/{id}/addresses [post]
func (ctrl *CustomerController) AddAddress(c *gin.Context) {
	customerID, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var req dtos.CreateCustomerAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address, err := ctrl.CustomerService.AddAddress(customerID, req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCustomerNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, services.ErrInvalidAddressType):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case strings.Contains(strings.ToLower(err.Error()), "already exists"):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusCreated, address)
}

// @Summary     Update a customer address
// @Description Update the customer address for the given address type
// @Tags        customers
// @Accept      json
// @Produce     json
// @Param       id           path      int                   true  "Customer ID"
// @Param       addressType  path      string                true  "Address Type"
// @Param       address      body      dtos.AddressRequest true  "Address Request"
// @Success     200          {object}  entities.Address
// @Failure     400          {object}  gin.H
// @Failure     404          {object}  gin.H
// @Failure     500          {object}  gin.H
// @Router      /customers/{id}/addresses/{addressType} [put]
func (ctrl *CustomerController) UpdateAddress(c *gin.Context) {
	customerID, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var req dtos.AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address, err := ctrl.CustomerService.UpdateAddress(customerID, c.Param("addressType"), req)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrCustomerNotFound), errors.Is(err, services.ErrAddressNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, services.ErrInvalidAddressType):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, address)
}

// @Summary     Update customer details
// @Description Update the first and last name of a customer
// @Tags        customers
// @Accept      json
// @Produce     json
// @Param       id       path      int                       true  "Customer ID"
// @Param       customer body      dtos.UpdateCustomerRequest true  "Update Customer Request"
// @Success     200      {object}  entities.Customer
// @Failure     400      {object}  gin.H
// @Failure     404      {object}  gin.H
// @Failure     500      {object}  gin.H
// @Router      /customers/{id} [put]
func (ctrl *CustomerController) UpdateCustomer(c *gin.Context) {
	customerID, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	var req dtos.UpdateCustomerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	customer, err := ctrl.CustomerService.UpdateCustomer(customerID, req)
	if err != nil {
		if errors.Is(err, services.ErrCustomerNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, customer)
}

// @Summary     Delete a customer
// @Description Delete a customer and all associated data
// @Tags        customers
// @Produce     json
// @Param       id   path      int  true  "Customer ID"
// @Success     204
// @Failure     400  {object}  gin.H
// @Failure     404  {object}  gin.H
// @Failure     500  {object}  gin.H
// @Router      /customers/{id} [delete]
func (ctrl *CustomerController) DeleteCustomer(c *gin.Context) {
	customerID, ok := parseIDParam(c, "id")
	if !ok {
		return
	}

	err := ctrl.CustomerService.DeleteCustomer(customerID)
	if err != nil {
		if errors.Is(err, services.ErrCustomerNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

func parseIDParam(c *gin.Context, name string) (int, bool) {
	parsedID, err := strconv.Atoi(c.Param(name))
	if err != nil || parsedID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return 0, false
	}
	return parsedID, true
}
