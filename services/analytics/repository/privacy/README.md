# Privacy Package Structure

The privacy functionality has been organized into a dedicated `privacy` package with multiple focused files for better maintainability and organization.

## File Structure

### `privacy_repository.go`
- **Purpose**: Main repository struct definition and constructor
- **Contents**: 
  - `PrivacyRepository` struct definition
  - `NewPrivacyRepository()` constructor function
  - Documentation explaining the file organization

### `privacy_export.go`
- **Purpose**: Data export functionality for GDPR compliance
- **Contents**:
  - `ExportEventsData()` - Export all events data for a user
  - `ExportAnalyticsData()` - Export comprehensive analytics metrics
  - `ExportFunnelData()` - Export funnel definitions and conversion data

### `privacy_deletion.go`
- **Purpose**: Data deletion functionality for GDPR "Right to be Forgotten"
- **Contents**:
  - `DeleteEventsData()` - Delete all events for user's websites
  - `DeleteAnalyticsData()` - Handle analytics data deletion
  - `DeleteFunnelData()` - Delete funnels and funnel events

### `privacy_anonymization.go`
- **Purpose**: Data anonymization while preserving analytics value
- **Contents**:
  - `AnonymizeEventsData()` - Anonymize IP addresses, user agents, IDs
  - `AnonymizeAnalyticsData()` - Refresh materialized views after anonymization
  - `AnonymizeOldIPs()` - Automated IP anonymization for old data

### `privacy_retention.go`
- **Purpose**: Data retention policies and automated cleanup
- **Contents**:
  - `CleanupOldEvents()` - Remove events older than 2 years
  - `CleanupOldAnalytics()` - Clean up inactive funnels older than 1 year

### `privacy_utils.go`
- **Purpose**: Utility functions and audit logging
- **Contents**:
  - `GetUserWebsites()` - Get websites owned by a user
  - `LogPrivacyOperation()` - Comprehensive audit logging

## Benefits of This Structure

1. **Separation of Concerns**: Each file handles a specific aspect of privacy operations
2. **Maintainability**: Easier to locate and modify specific functionality
3. **Readability**: Smaller, focused files are easier to understand
4. **Testing**: Individual files can be tested in isolation
5. **Collaboration**: Multiple developers can work on different aspects simultaneously

## Usage

All methods are accessible through the `PrivacyRepository` struct. Import the privacy package:

```go
import "analytics-app/repository/privacy"

// Create repository instance
privacyRepo := privacy.NewPrivacyRepository(db)

// Export data
events, err := privacyRepo.ExportEventsData(userID)

// Delete data
err = privacyRepo.DeleteEventsData(userID)

// Anonymize data
err = privacyRepo.AnonymizeEventsData(userID)

// Cleanup old data
err = privacyRepo.CleanupOldEvents()
```

## GDPR Compliance Features

- **Right to Access**: Complete data export in structured formats
- **Right to Deletion**: Secure data deletion across all services
- **Right to Rectification**: Data correction request system
- **Data Minimization**: Automated data retention policies
- **Audit Logging**: Complete audit trail for compliance tracking
- **Data Anonymization**: PII removal while preserving analytics value

## Database Operations

All operations use real SQL queries with:
- Proper error handling and logging
- Transaction safety where needed
- Efficient database queries with indexing
- Comprehensive audit logging
- TimescaleDB integration for time-series data
