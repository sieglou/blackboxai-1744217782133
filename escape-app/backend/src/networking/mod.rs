pub mod wireguard;
pub mod obfuscation;
pub mod domain_fronting;

use crate::security::encryption;
use std::net::SocketAddr;

pub struct ConnectionConfig {
    pub endpoint: SocketAddr,
    pub use_obfs: bool,
    pub fallback_p2p: bool,
    pub wireguard_config: Option<wireguard::WireGuardConfig>,
}

pub async fn establish_connection(config: &ConnectionConfig) -> Result<(), Box<dyn std::error::Error>> {
    // Primary connection attempt
    if let Some(wg_config) = &config.wireguard_config {
        match wireguard::setup_tunnel(wg_config).await {
            Ok(_) => return Ok(()),
            Err(e) => log::warn!("WireGuard failed: {}", e),
        }
    }
    
    // Obfuscation fallback
    if config.use_obfs {
        let obfs_config = obfuscation::ObfsConfig {
            cert: "default-cert".to_string(),
            iat_mode: true,
        };
        match obfuscation::create_obfs_transport(&config.endpoint, &obfs_config).await {
            Ok(_) => return Ok(()),
            Err(e) => log::warn!("Obfs4 failed: {}", e),
        }
    }

    // Domain fronting fallback
    let df_config = domain_fronting::DomainFrontingConfig {
        front_domain: "cdn.example.com".to_string(),
        target_domain: "target.example.com".to_string(),
        use_tls: true,
    };
    match domain_fronting::create_fronted_connection(&config.endpoint, &df_config).await {
        Ok(_) => return Ok(()),
        Err(e) => log::warn!("Domain fronting failed: {}", e),
    }

    // Final P2P fallback
    if config.fallback_p2p {
        let p2p_config = p2p::P2PConfig {
            listen_addr: config.endpoint,
            bootstrap_nodes: vec![
                "/ip4/1.2.3.4/tcp/1234/p2p/QmPeerId".to_string(),
                "/dns4/bootstrap.example.com/tcp/1234/p2p/QmPeerId".to_string()
            ],
        };
        match p2p::P2PNetwork::new(&p2p_config).await {
            Ok(mut network) => {
                log::info!("Using P2P fallback network");
                return network.run().await;
            }
            Err(e) => log::error!("P2P fallback failed: {}", e),
        }
    }

    Err("All connection methods failed".into())
}
