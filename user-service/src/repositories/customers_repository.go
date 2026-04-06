package repositories

import (
	"database/sql"
	"strings"

	"github.com/im-mk/user-service/src/entities"
	"github.com/jmoiron/sqlx"
)

type CustomerRepositoryInterface interface {
	InsertCustomer(tx TxInterface, customer entities.Customer) (*entities.Customer, error)
	GetCustomerByID(customerID int) (*entities.Customer, error)
	GetCustomerWithAddressesByID(customerID int) (*entities.Customer, error)
	GetAllCustomers() ([]entities.Customer, error)
	GetCustomersPage(page int, pageSize int, nameFilter string, postcodeFilter string) ([]entities.Customer, error)
	CountCustomers(nameFilter string, postcodeFilter string) (int, error)
	CustomerExists(customerID int) (bool, error)
	UpdateCustomer(customerID int, firstName string, lastName string) (*entities.Customer, error)
	DeleteCustomer(customerID int) error
}

type CustomerRepository struct {
	DB *sqlx.DB
}

type customerAddressRow struct {
	CustomerID   int            `db:"customer_id"`
	FirstName    string         `db:"first_name"`
	LastName     string         `db:"last_name"`
	AddressType  sql.NullString `db:"address_type"`
	AddressID    sql.NullInt64  `db:"address_id"`
	AddressLine1 sql.NullString `db:"address_line1"`
	AddressLine2 sql.NullString `db:"address_line2"`
	AddressLine3 sql.NullString `db:"address_line3"`
	AddressLine4 sql.NullString `db:"address_line4"`
	Postcode     sql.NullString `db:"postcode"`
	Country      sql.NullString `db:"country"`
}

func NewCustomerRepository(db *sqlx.DB) *CustomerRepository {
	return &CustomerRepository{DB: db}
}

func (r *CustomerRepository) InsertCustomer(tx TxInterface, customer entities.Customer) (*entities.Customer, error) {
	if err := tx.QueryRowx(
		`INSERT INTO customers (first_name, last_name) VALUES ($1, $2) RETURNING id`,
		customer.FirstName,
		customer.LastName,
	).Scan(&customer.ID); err != nil {
		return nil, err
	}
	return &customer, nil
}

func (r *CustomerRepository) GetCustomerByID(customerID int) (*entities.Customer, error) {
	customer := &entities.Customer{}
	err := r.DB.Get(customer, `
		SELECT id, first_name, last_name
		FROM customers
		WHERE id = $1
	`, customerID)
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func (r *CustomerRepository) GetCustomerWithAddressesByID(customerID int) (*entities.Customer, error) {
	rows, err := r.fetchCustomerRows(customerID)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, sql.ErrNoRows
	}

	customer := mapRowsToCustomer(rows)
	return &customer, nil
}

func (r *CustomerRepository) GetAllCustomers() ([]entities.Customer, error) {
	rows := []customerAddressRow{}
	err := r.DB.Select(&rows, `
		SELECT c.id AS customer_id,
		       c.first_name,
		       c.last_name,
		       ca.address_type,
		       a.id AS address_id,
		       a.address_line1,
		       a.address_line2,
		       a.address_line3,
		       a.address_line4,
		       a.postcode,
		       a.country
		FROM customers c
		LEFT JOIN customer_addresses ca ON ca.customer_id = c.id
		LEFT JOIN addresses a ON a.id = ca.address_id
		ORDER BY c.id, ca.id
	`)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []entities.Customer{}, nil
	}

	customersByID := map[int]*entities.Customer{}
	orderedIDs := []int{}
	for _, row := range rows {
		customer, exists := customersByID[row.CustomerID]
		if !exists {
			customer = &entities.Customer{ID: row.CustomerID, FirstName: row.FirstName, LastName: row.LastName}
			customersByID[row.CustomerID] = customer
			orderedIDs = append(orderedIDs, row.CustomerID)
		}
		applyAddressRow(customer, row)
	}

	customers := make([]entities.Customer, 0, len(orderedIDs))
	for _, customerID := range orderedIDs {
		customers = append(customers, *customersByID[customerID])
	}
	return customers, nil
}

func (r *CustomerRepository) GetCustomersPage(page int, pageSize int, nameFilter string, postcodeFilter string) ([]entities.Customer, error) {
	offset := (page - 1) * pageSize
	rows := []customerAddressRow{}
	err := r.DB.Select(&rows, `
		WITH filtered_customers AS (
			SELECT c.id, c.first_name, c.last_name
			FROM customers c
			WHERE ($1 = '' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $1 || '%')
			  AND ($2 = '' OR EXISTS (
				SELECT 1
				FROM customer_addresses ca2
				INNER JOIN addresses a2 ON a2.id = ca2.address_id
				WHERE ca2.customer_id = c.id
				  AND a2.postcode ILIKE '%' || $2 || '%'
			  ))
		),
		paged_customers AS (
			SELECT c.id, c.first_name, c.last_name
			FROM filtered_customers c
			ORDER BY c.id
			LIMIT $3 OFFSET $4
		)
		SELECT c.id AS customer_id,
		       c.first_name,
		       c.last_name,
		       ca.address_type,
		       a.id AS address_id,
		       a.address_line1,
		       a.address_line2,
		       a.address_line3,
		       a.address_line4,
		       a.postcode,
		       a.country
		FROM paged_customers c
		LEFT JOIN customer_addresses ca ON ca.customer_id = c.id
		LEFT JOIN addresses a ON a.id = ca.address_id
		ORDER BY c.id, ca.id
	`, nameFilter, postcodeFilter, pageSize, offset)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []entities.Customer{}, nil
	}

	customersByID := map[int]*entities.Customer{}
	orderedIDs := []int{}
	for _, row := range rows {
		customer, exists := customersByID[row.CustomerID]
		if !exists {
			customer = &entities.Customer{ID: row.CustomerID, FirstName: row.FirstName, LastName: row.LastName}
			customersByID[row.CustomerID] = customer
			orderedIDs = append(orderedIDs, row.CustomerID)
		}
		applyAddressRow(customer, row)
	}

	customers := make([]entities.Customer, 0, len(orderedIDs))
	for _, customerID := range orderedIDs {
		customers = append(customers, *customersByID[customerID])
	}
	return customers, nil
}

func (r *CustomerRepository) CountCustomers(nameFilter string, postcodeFilter string) (int, error) {
	var count int
	err := r.DB.Get(&count, `
		SELECT COUNT(1)
		FROM customers c
		WHERE ($1 = '' OR (c.first_name || ' ' || c.last_name) ILIKE '%' || $1 || '%')
		  AND ($2 = '' OR EXISTS (
			SELECT 1
			FROM customer_addresses ca
			INNER JOIN addresses a ON a.id = ca.address_id
			WHERE ca.customer_id = c.id
			  AND a.postcode ILIKE '%' || $2 || '%'
		  ))
	`, nameFilter, postcodeFilter)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *CustomerRepository) CustomerExists(customerID int) (bool, error) {
	var exists bool
	err := r.DB.Get(&exists, `SELECT EXISTS (SELECT 1 FROM customers WHERE id = $1)`, customerID)
	return exists, err
}

func (r *CustomerRepository) UpdateCustomer(customerID int, firstName string, lastName string) (*entities.Customer, error) {
	customer := &entities.Customer{}
	err := r.DB.Get(customer, `
		UPDATE customers
		SET first_name = $1, last_name = $2
		WHERE id = $3
		RETURNING id, first_name, last_name
	`, firstName, lastName, customerID)
	if err != nil {
		return nil, err
	}
	return customer, nil
}

func (r *CustomerRepository) DeleteCustomer(customerID int) error {
	tx, err := r.DB.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var exists bool
	err = tx.Get(&exists, `SELECT EXISTS (SELECT 1 FROM customers WHERE id = $1)`, customerID)
	if err != nil {
		return err
	}
	if !exists {
		return sql.ErrNoRows
	}

	_, err = tx.Exec(`
		WITH deleted_links AS (
			DELETE FROM customer_addresses
			WHERE customer_id = $1
			RETURNING address_id
		)
		DELETE FROM addresses a
		USING deleted_links dl
		WHERE a.id = dl.address_id
	`, customerID)
	if err != nil {
		return err
	}

	_, err = tx.Exec(`DELETE FROM customers WHERE id = $1`, customerID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *CustomerRepository) fetchCustomerRows(customerID int) ([]customerAddressRow, error) {
	rows := []customerAddressRow{}
	err := r.DB.Select(&rows, `
		SELECT c.id AS customer_id,
		       c.first_name,
		       c.last_name,
		       ca.address_type,
		       a.id AS address_id,
		       a.address_line1,
		       a.address_line2,
		       a.address_line3,
		       a.address_line4,
		       a.postcode,
		       a.country
		FROM customers c
		LEFT JOIN customer_addresses ca ON ca.customer_id = c.id
		LEFT JOIN addresses a ON a.id = ca.address_id
		WHERE c.id = $1
		ORDER BY ca.id
	`, customerID)
	return rows, err
}

func mapRowsToCustomer(rows []customerAddressRow) entities.Customer {
	customer := entities.Customer{
		ID:        rows[0].CustomerID,
		FirstName: rows[0].FirstName,
		LastName:  rows[0].LastName,
	}
	for _, row := range rows {
		applyAddressRow(&customer, row)
	}
	return customer
}

func applyAddressRow(customer *entities.Customer, row customerAddressRow) {
	if !row.AddressID.Valid || !row.AddressType.Valid {
		return
	}

	address := &entities.Address{
		ID:           int(row.AddressID.Int64),
		AddressLine1: row.AddressLine1.String,
		AddressLine2: row.AddressLine2.String,
		AddressLine3: row.AddressLine3.String,
		AddressLine4: row.AddressLine4.String,
		Postcode:     row.Postcode.String,
		Country:      row.Country.String,
	}

	switch strings.ToLower(row.AddressType.String) {
	case "billing":
		customer.BillingAddress = address
	case "shipping":
		customer.ShippingAddress = address
	}
}
