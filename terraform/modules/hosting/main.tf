terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_firebase_hosting_site" "release" {
  provider = google-beta
  site_id  = var.release_site_id
}

resource "google_firebase_hosting_site" "staging" {
  provider = google-beta
  site_id  = var.staging_site_id
}

# resource "google_firebase_hosting_channel" "default" {
#   provider   = google-beta
#   site_id    = google_firebase_hosting_site.default
#   channel_id = "dev"
# }

