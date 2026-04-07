package entities

type Customer struct {
	ID              int      `json:"id,omitempty" db:"id"`
	FirstName       string   `json:"firstName" db:"first_name"`
	LastName        string   `json:"lastName" db:"last_name"`
	BillingAddress  *Address `json:"billingAddress,omitempty"`
	ShippingAddress *Address `json:"shippingAddress,omitempty"`
}
