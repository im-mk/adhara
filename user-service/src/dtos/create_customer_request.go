package dtos

type CreateCustomerRequest struct {
	FirstName       string         `json:"firstName" binding:"required"`
	LastName        string         `json:"lastName" binding:"required"`
	BillingAddress  AddressRequest `json:"billingAddress" binding:"required"`
	ShippingAddress AddressRequest `json:"shippingAddress" binding:"required"`
}
