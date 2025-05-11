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
  deletion_protection = false
  attributes_config {
    searchable_attributes   = var.searchable_attributes
    attributes_to_retrieve  = var.attributes_to_retrieve
    attributes_for_faceting = var.attributes_for_faceting
  }
  ranking_config {
    custom_ranking = var.custom_ranking
    ranking = [
      "typo",
      "geo",
      "words",
      "filters",
      "proximity",
      "attribute",
      "exact",
      "custom",
    ]
  }
}
