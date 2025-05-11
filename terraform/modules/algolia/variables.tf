
variable "index_name" {
  type = string
}

variable "searchable_attributes" {
  type = list(string)
}

variable "attributes_to_retrieve" {
  type = list(string)
}

variable "attributes_for_faceting" {
  type = list(string)
}

variable "custom_ranking" {
  type = list(string)
}
