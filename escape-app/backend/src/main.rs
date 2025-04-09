use std::error::Error;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use std::sync::Arc;
use tokio::sync::Mutex;

mod networking;
mod security;
mod p2p;
mod api;

use security::CryptoVault;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init();
    log::info!("Escape! backend starting...");

    // Initialize security
    let crypto_vault = CryptoVault::new();

    // Shared application state
    let app_state = api::AppState {
        connection_status: Arc::new(Mutex::new("disconnected".to_string())),
        auth_codes: Arc::new(Mutex::new(vec![])),
        crypto_vault: Arc::new(Mutex::new(crypto_vault)),
    };

    // Initialize P2P network
    let p2p_config = p2p::P2PConfig {
        listen_addr: SocketAddr::new(IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)), 0),
        bootstrap_nodes: vec![],
    };
    let mut p2p_network = p2p::P2PNetwork::new(&p2p_config).await?;

    // Start API server
    let api_state = app_state.clone();
    tokio::spawn(async move {
        if let Err(e) = api::run_api_server(api_state).await {
            log::error!("API server error: {}", e);
        }
    });

    // Start P2P network in background
    tokio::spawn(async move {
        if let Err(e) = p2p_network.run().await {
            log::error!("P2P network error: {}", e);
        }
    });

    // Main application loop
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
    }
}
