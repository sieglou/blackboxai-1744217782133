use reqwest::Client;
use std::net::SocketAddr;

pub struct DomainFrontingConfig {
    pub front_domain: String,
    pub target_domain: String,
    pub use_tls: bool,
}

pub async fn create_fronted_connection(
    endpoint: &SocketAddr,
    config: &DomainFrontingConfig,
) -> Result<Client, Box<dyn std::error::Error>> {
    let client = Client::builder()
        .danger_accept_invalid_certs(true) // For testing only
        .build()?;

    Ok(client)
}
