use obfs4::ObfsTransport;
use std::net::SocketAddr;

pub struct ObfsConfig {
    pub cert: String,
    pub iat_mode: bool,
}

pub async fn create_obfs_transport(
    endpoint: &SocketAddr,
    config: &ObfsConfig,
) -> Result<ObfsTransport, Box<dyn std::error::Error>> {
    let transport = ObfsTransport::new(
        endpoint.to_string(),
        config.cert.clone(),
        config.iat_mode,
    )?;

    Ok(transport)
}
