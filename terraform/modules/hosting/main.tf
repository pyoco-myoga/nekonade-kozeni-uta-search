terraform {
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  site_id  = var.site_id
}

# resource "google_firebase_hosting_channel" "default" {
#   provider   = google-beta
#   site_id    = google_firebase_hosting_site.default
#   channel_id = "dev"
# }

