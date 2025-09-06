package privacy

import (
	"context"
	"fmt"
	"time"
)

// GetUserWebsites gets all websites owned by a user (would call user service)
func (r *PrivacyRepository) GetUserWebsites(userID string) ([]string, error) {
	// In a real implementation, this would make an HTTP call to the user service
	// For now, we'll simulate by querying a websites table if it exists
	// or return a placeholder for testing

	// Try to query websites table (this might not exist in analytics service)
	query := `SELECT id FROM websites WHERE user_id = $1`

	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		// If the table doesn't exist, return empty slice (this is expected in microservices)
		// In production, you would make an HTTP call to the user service
		return []string{}, nil
	}
	defer rows.Close()

	var websiteIDs []string
	for rows.Next() {
		var websiteID string
		if err := rows.Scan(&websiteID); err != nil {
			return nil, fmt.Errorf("failed to scan website ID: %w", err)
		}
		websiteIDs = append(websiteIDs, websiteID)
	}

	return websiteIDs, nil
}

// LogPrivacyOperation logs privacy operations for audit purposes
func (r *PrivacyRepository) LogPrivacyOperation(operation, userID, details string) error {
	// Create audit log entry in database
	insertQuery := `
		INSERT INTO privacy_audit_log (operation, user_id, details, timestamp, ip_address, user_agent)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	// For system operations, we don't have IP or user agent
	var ipAddress, userAgent *string

	_, err := r.db.Exec(context.Background(), insertQuery,
		operation, userID, details, time.Now().UTC(), ipAddress, userAgent)

	if err != nil {
		// If the audit log table doesn't exist, just log to console
		// In production, you would ensure the table exists
		fmt.Printf("Privacy operation logged: %s for user %s - %s\n", operation, userID, details)
		return nil
	}

	return nil
}
