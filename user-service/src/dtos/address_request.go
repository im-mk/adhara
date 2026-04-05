package dtos

type AddressRequest struct {
	AddressLine1 string `json:"addressLine1" binding:"required"`
	AddressLine2 string `json:"addressLine2"`
	AddressLine3 string `json:"addressLine3"`
	AddressLine4 string `json:"addressLine4"`
	Postcode     string `json:"postcode" binding:"required"`
	Country      string `json:"country" binding:"required,len=2"`
}
