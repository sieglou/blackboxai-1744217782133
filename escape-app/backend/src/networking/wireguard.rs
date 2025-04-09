use std::net::SocketAddr;
use wireguard::Device;
use wireguard::PeerConfig;

pub struct WireGuardConfig {
    pub private_key: String,
    pub public_key: String,
    pub endpoint: SocketAddr,
    pub allowed_ips: Vec<String>,
}

pub async fn setup_tunnel(config: &WireGuardConfig) -> Result<Device, Box<dyn std::error::Error>> {
    let mut device = Device::new("wg0")?;
    
    let peer_config = PeerConfig {
        public_key: config.public_key.clone(),
        endpoint: Some(config.endpoint),
        allowed_ips: config.allowed_ips.clone(),
        ..Default::default()
    };

    device.add_peer(&peer_config)?;
    device.set_private_key(&config.private_key)?;
    device.up()?;

    Ok(device)
}

pub async fn teardown_tunnel(device: Device) -> Result<(), Box<dyn std::error::Error>> {
    device.down()?;
    Ok(())
}
