
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

variable "hosting_site_id" {
  type = string
}

variable "data_connect_service_id" {
  type = string
}

variable "data_connect_service_location" {
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

variable "google_identitiy_platform_tenant_name" {
  type    = string
  default = "identity-tenant"
}

variable "authentication_config" {
  type        = map(map(string))
  description = "key: idp_id, value: {client_id, secret}"
}

variable "cloud_storage_name" {
  type = string
}

variable "cloud_storage_location" {
  type = string
}

variable "cloud_storage_class" {
  type = string
}
