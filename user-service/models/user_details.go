package models

type UserDetails struct {
	ID         int    `json:"id" gorm:"primaryKey"`
	Username   string `json:"username" gorm:"unique"`
	Email      string `json:"email" gorm:"unique"`
	FirstName  string `json:"first_name,omitempty"`
	MiddleName string `json:"middle_name,omitempty"`
	LastName   string `json:"last_name,omitempty"`
	IsActive   bool   `json:"is_active"`
	IsVerified bool   `json:"is_verified"`
}
