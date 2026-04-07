package repositories

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
)

// TxInterface defines the transaction interface that can be mocked for testing
type TxInterface interface {
	QueryRowx(query string, args ...interface{}) *sqlx.Row
	QueryRow(query string, args ...interface{}) *sql.Row
	Exec(query string, args ...interface{}) (sql.Result, error)
	Rollback() error
	Commit() error
}

// Ensure *sqlx.Tx implements TxInterface
var _ TxInterface = (*sqlx.Tx)(nil)
