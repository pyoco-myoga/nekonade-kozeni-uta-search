
terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_firebase_data_connect_service" "default" {
  project    = var.project_id
  service_id = var.service_id
  location   = var.location
}
