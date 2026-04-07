package dtos

type CreateCustomerAddressRequest struct {
	AddressType string `json:"addressType" binding:"required"`
	AddressRequest
}
