package tests

import (
	"analytics-app/models"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestFunnelSteps(t *testing.T) {
	steps := models.FunnelSteps{
		{
			ID:   "step-1",
			Name: "Landing Page",
			Type: "page",
			Condition: models.FunnelCondition{
				Page: stringPtr("/landing"),
			},
			Order: 1,
		},
		{
			ID:   "step-2",
			Name: "Product Page",
			Type: "page", 
			Condition: models.FunnelCondition{
				Page: stringPtr("/product/*"),
			},
			Order: 2,
		},
		{
			ID:   "step-3",
			Name: "Add to Cart",
			Type: "event",
			Condition: models.FunnelCondition{
				Event: stringPtr("add_to_cart"),
			},
			Order: 3,
		},
	}

	// Test JSON marshaling
	value, err := steps.Value()
	require.NoError(t, err)
	assert.NotNil(t, value)

	// Test JSON unmarshaling
	var newSteps models.FunnelSteps
	err = newSteps.Scan(value)
	require.NoError(t, err)
	assert.Equal(t, steps, newSteps)
	assert.Len(t, newSteps, 3)
	assert.Equal(t, "Landing Page", newSteps[0].Name)
	assert.Equal(t, "page", newSteps[0].Type)
	assert.Equal(t, "/landing", *newSteps[0].Condition.Page)
}

func TestFunnelEvent(t *testing.T) {
	funnelID := uuid.New()
	
	event := models.FunnelEvent{
		FunnelID:       funnelID,
		WebsiteID:      "test-site",
		VisitorID:      "visitor-123",
		SessionID:      "session-456",
		CurrentStep:    2,
		CompletedSteps: []int{1, 2},
		StartedAt:      timePtr(time.Now().Add(-5 * time.Minute)),
		LastActivity:   timePtr(time.Now()),
		Converted:      false,
		Properties: models.Properties{
			"step_name": "Product Page",
			"product_id": "product-123",
		},
	}

	assert.Equal(t, funnelID, event.FunnelID)
	assert.Equal(t, 2, event.CurrentStep)
	assert.Len(t, event.CompletedSteps, 2)
	assert.False(t, event.Converted)
	assert.NotNil(t, event.StartedAt)
	assert.NotNil(t, event.LastActivity)
}

func TestFunnelAnalytics(t *testing.T) {
	analytics := models.FunnelAnalytics{
		FunnelID:         uuid.New(),
		WebsiteID:        "test-site", 
		Date:             "2025-01-01",
		TotalStarts:      1000,
		TotalConversions: 150,
		ConversionRate:   15.0,
		AvgValue:         float64Ptr(25.50),
		TotalValue:       float64Ptr(3825.0),
		DropOffRate:      85.0,
		AbandonmentRate:  75.0,
	}

	assert.Equal(t, 1000, analytics.TotalStarts)
	assert.Equal(t, 150, analytics.TotalConversions)
	assert.Equal(t, 15.0, analytics.ConversionRate)
	assert.NotNil(t, analytics.AvgValue)
	assert.Equal(t, 25.50, *analytics.AvgValue)
}

func TestCreateFunnelRequest(t *testing.T) {
	req := models.CreateFunnelRequest{
		Name:        "E-commerce Funnel",
		Description: stringPtr("Track user journey from landing to purchase"),
		Steps: models.FunnelSteps{
			{
				ID:   "landing",
				Name: "Landing Page",
				Type: "page",
				Condition: models.FunnelCondition{
					Page: stringPtr("/"),
				},
				Order: 1,
			},
			{
				ID:   "signup",
				Name: "Sign Up",
				Type: "custom",
				Condition: models.FunnelCondition{
					Custom: stringPtr("user_signup"),
				},
				Order: 2,
			},
		},
		IsActive: true,
	}

	assert.Equal(t, "E-commerce Funnel", req.Name)
	assert.NotNil(t, req.Description)
	assert.True(t, req.IsActive)
	assert.Len(t, req.Steps, 2)
	assert.Equal(t, "Landing Page", req.Steps[0].Name)
	assert.Equal(t, "page", req.Steps[0].Type)
}

func TestIntSlice(t *testing.T) {
	slice := models.IntSlice{1, 2, 3, 4, 5}

	// Test JSON marshaling
	value, err := slice.Value()
	require.NoError(t, err)
	assert.NotNil(t, value)

	// Test JSON unmarshaling
	var newSlice models.IntSlice
	err = newSlice.Scan(value)
	require.NoError(t, err)
	assert.Equal(t, slice, newSlice)
	assert.Len(t, newSlice, 5)
	assert.Equal(t, 1, newSlice[0])
	assert.Equal(t, 5, newSlice[4])
}

// Helper functions for tests
func timePtr(t time.Time) *time.Time {
	return &t
}