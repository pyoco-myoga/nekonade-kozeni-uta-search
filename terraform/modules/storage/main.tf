
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_storage_bucket" "default" {
  provider                    = google-beta
  name                        = var.name
  location                    = var.location
  force_destroy               = true
  storage_class               = var.storage_class
  uniform_bucket_level_access = true
}

resource "google_firebase_storage_bucket" "default" {
  provider  = google-beta
  project   = var.project_id
  bucket_id = google_storage_bucket.default.id
}

