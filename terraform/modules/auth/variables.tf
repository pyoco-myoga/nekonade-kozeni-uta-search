
variable "project_id" {
  type = string
}

variable "tenant_name" {
  type = string
}

variable "config" {
  type        = map(map(string))
  description = "key: idp_id, value: {client_id, secret}"
}
