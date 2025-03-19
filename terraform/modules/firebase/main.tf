terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_project" "default" {
  provider        = google-beta
  name            = var.project_name
  project_id      = var.project_id
  billing_account = var.billing_account
  labels = {
    "firebase" = "enabled"
  }
}

resource "google_project_service" "default" {
  provider           = google-beta
  project            = google_project.default.project_id
  for_each           = var.project_services
  service            = each.key
  disable_on_destroy = true
}

resource "google_firebase_project" "default" {
  provider   = google-beta
  project    = google_project.default.project_id
  depends_on = [google_project_service.default]
}


