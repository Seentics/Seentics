package utils

// RequestData holds extracted domain and siteId information
type RequestData struct {
	Domain string `json:"domain"`
	SiteID string `json:"siteId"`
	Source string `json:"source"` // "query", "body", "header", "origin", "referer"
}
