package entities

type Address struct {
	ID           int    `json:"id,omitempty" db:"id"`
	AddressLine1 string `json:"addressLine1" db:"address_line1"`
	AddressLine2 string `json:"addressLine2,omitempty" db:"address_line2"`
	AddressLine3 string `json:"addressLine3,omitempty" db:"address_line3"`
	AddressLine4 string `json:"addressLine4,omitempty" db:"address_line4"`
	Postcode     string `json:"postcode" db:"postcode"`
	Country      string `json:"country" db:"country"`
}
