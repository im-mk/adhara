package repositories

import (
	"strings"

	"github.com/im-mk/user-service/src/entities"
	"github.com/jmoiron/sqlx"
)

type AddressRepositoryInterface interface {
	InsertAddress(tx TxInterface, customerID int, addressType string, address entities.Address) (*entities.Address, error)
	UpdateAddress(customerID int, addressType string, address entities.Address) (*entities.Address, error)
	BeginTx() (TxInterface, error)
}

type AddressRepository struct {
	DB *sqlx.DB
}

func NewAddressRepository(db *sqlx.DB) *AddressRepository {
	return &AddressRepository{DB: db}
}

func (r *AddressRepository) InsertAddress(tx TxInterface, customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	createdAddress := &entities.Address{}
	if err := tx.QueryRowx(
		`INSERT INTO addresses (address_line1, address_line2, address_line3, address_line4, postcode, country)
		 VALUES ($1, $2, $3, $4, $5, $6)
		 RETURNING id, address_line1, address_line2, address_line3, address_line4, postcode, country`,
		address.AddressLine1,
		address.AddressLine2,
		address.AddressLine3,
		address.AddressLine4,
		address.Postcode,
		strings.ToUpper(address.Country),
	).StructScan(createdAddress); err != nil {
		return nil, err
	}

	if _, err := tx.Exec(
		`INSERT INTO customer_addresses (customer_id, address_id, address_type) VALUES ($1, $2, $3)`,
		customerID,
		createdAddress.ID,
		normalizeAddressTypeForStorage(addressType),
	); err != nil {
		return nil, err
	}

	return createdAddress, nil
}

func (r *AddressRepository) UpdateAddress(customerID int, addressType string, address entities.Address) (*entities.Address, error) {
	updatedAddress := &entities.Address{}
	err := r.DB.Get(updatedAddress, `
		UPDATE addresses
		SET address_line1 = $1,
		    address_line2 = $2,
		    address_line3 = $3,
		    address_line4 = $4,
		    postcode = $5,
		    country = $6
		WHERE id = (
			SELECT ca.address_id
			FROM customer_addresses ca
			WHERE ca.customer_id = $7 AND LOWER(ca.address_type) = LOWER($8)
		)
		RETURNING id, address_line1, address_line2, address_line3, address_line4, postcode, country
	`, address.AddressLine1, address.AddressLine2, address.AddressLine3, address.AddressLine4, address.Postcode, strings.ToUpper(address.Country), customerID, addressType)
	if err != nil {
		return nil, err
	}
	return updatedAddress, nil
}

func (r *AddressRepository) BeginTx() (TxInterface, error) {
	return r.DB.Beginx()
}

func normalizeAddressTypeForStorage(addressType string) string {
	switch strings.ToLower(strings.TrimSpace(addressType)) {
	case "billing":
		return "Billing"
	case "shipping":
		return "Shipping"
	default:
		return addressType
	}
}
