

output "release_site_url" {
  value = google_firebase_hosting_site.release.default_url
}
output "staging_site_url" {
  value = google_firebase_hosting_site.staging.default_url
}

