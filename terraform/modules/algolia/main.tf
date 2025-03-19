terraform {
  required_providers {
    algolia = {
      source  = "k-yomo/algolia"
      version = ">= 0.1.0, < 1.0.0"
    }
  }
}

resource "algolia_index" "default" {
  provider            = algolia
  name                = var.index_name
  deletion_protection = true
  attributes_config {
    searchable_attributes = var.searchable_attributes
  }
}
