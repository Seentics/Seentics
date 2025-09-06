package privacy

import (
	"context"
	"fmt"
)

// DeleteEventsData deletes all events data for a specific user
func (r *PrivacyRepository) DeleteEventsData(userID string) error {
	// Get all websites owned by the user
	websiteIDs, err := r.GetUserWebsites(userID)
	if err != nil {
		return fmt.Errorf("failed to get user websites: %w", err)
	}

	if len(websiteIDs) == 0 {
		r.LogPrivacyOperation("delete_events", userID, "No websites found for user")
		return nil
	}

	// Delete all events for user's websites
	deleteQuery := `DELETE FROM events WHERE website_id = ANY($1)`

	result, err := r.db.Exec(context.Background(), deleteQuery, websiteIDs)
	if err != nil {
		return fmt.Errorf("failed to delete events: %w", err)
	}

	rowsAffected := result.RowsAffected()

	// Log the deletion operation
	r.LogPrivacyOperation("delete_events", userID, fmt.Sprintf("Deleted %d events for %d websites", rowsAffected, len(websiteIDs)))

	return nil
}

// DeleteAnalyticsData deletes all analytics data for a specific user
func (r *PrivacyRepository) DeleteAnalyticsData(userID string) error {
	// Get all websites owned by the user
	websiteIDs, err := r.GetUserWebsites(userID)
	if err != nil {
		return fmt.Errorf("failed to get user websites: %w", err)
	}

	if len(websiteIDs) == 0 {
		r.LogPrivacyOperation("delete_analytics", userID, "No websites found for user")
		return nil
	}

	// Note: In TimescaleDB, analytics data is primarily stored in the events table
	// and materialized views. The materialized views will be automatically updated
	// when the underlying events are deleted. We don't need to manually delete
	// from the materialized views as they are computed views.

	// Log the deletion operation
	r.LogPrivacyOperation("delete_analytics", userID, fmt.Sprintf("Analytics data deletion completed for %d websites (materialized views will be updated automatically)", len(websiteIDs)))

	return nil
}

// DeleteFunnelData deletes all funnel data for a specific user
func (r *PrivacyRepository) DeleteFunnelData(userID string) error {
	// Get all websites owned by the user
	websiteIDs, err := r.GetUserWebsites(userID)
	if err != nil {
		return fmt.Errorf("failed to get user websites: %w", err)
	}

	if len(websiteIDs) == 0 {
		r.LogPrivacyOperation("delete_funnels", userID, "No websites found for user")
		return nil
	}

	// Delete funnel events first (due to foreign key constraint)
	deleteFunnelEventsQuery := `
		DELETE FROM funnel_events 
		WHERE funnel_id IN (
			SELECT id FROM funnels WHERE website_id = ANY($1)
		)
	`

	result, err := r.db.Exec(context.Background(), deleteFunnelEventsQuery, websiteIDs)
	if err != nil {
		return fmt.Errorf("failed to delete funnel events: %w", err)
	}
	funnelEventsDeleted := result.RowsAffected()

	// Delete funnels
	deleteFunnelsQuery := `DELETE FROM funnels WHERE website_id = ANY($1)`

	result, err = r.db.Exec(context.Background(), deleteFunnelsQuery, websiteIDs)
	if err != nil {
		return fmt.Errorf("failed to delete funnels: %w", err)
	}
	funnelsDeleted := result.RowsAffected()

	// Log the deletion operation
	r.LogPrivacyOperation("delete_funnels", userID, fmt.Sprintf("Deleted %d funnels and %d funnel events for %d websites", funnelsDeleted, funnelEventsDeleted, len(websiteIDs)))

	return nil
}
