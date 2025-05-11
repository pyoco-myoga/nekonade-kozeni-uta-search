variable "project_id" {
  type = string
}

variable "project_name" {
  type = string
}

variable "billing_account" {
  type = string
}

variable "project_services" {
  type = set(string)
}

variable "youtube_api_key_name" {
  type = string
}
