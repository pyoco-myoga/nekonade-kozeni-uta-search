
variable "billing_account" {
  description = "Google Cloud Billing Account ID"
  type        = string
}

variable "project_name" {
  type = string
}

variable "project_id" {
  type = string
}

variable "hosting_release_site_id" {
  type = string
}

variable "hosting_staging_site_id" {
  type = string
}

variable "algolia_app_id" {
  type = string
}

variable "algolia_api_key" {
  type = string
}

variable "algolia_index_name" {
  type = string
}

variable "algolia_searchable_attributes" {
  type = list(string)
}

variable "algolia_attributes_to_retrieve" {
  type = list(string)
}

variable "algolia_attributes_for_faceting" {
  type = list(string)
}

variable "algolia_custom_ranking" {
  type = list(string)
}

variable "supabase_access_token" {
  type = string
}

variable "supabase_organization_id" {
  type = string
}

variable "supabase_database_password" {
  type = string
}

variable "supabase_region" {
  type = string
}

variable "supabase_auth_google_client_id" {
  type = string
}

variable "supabase_auth_google_secret" {
  type = string
}

variable "supabase_auth_twitter_client_id" {
  type = string
}

variable "supabase_auth_twitter_secret" {
  type = string
}

variable "youtube_api_key_name" {
  type = string
}
