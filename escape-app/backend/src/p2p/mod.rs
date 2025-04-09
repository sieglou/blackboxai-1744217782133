use std::net::SocketAddr;
use libp2p::{
    identity,
    swarm::{Swarm, SwarmEvent},
    PeerId,
};

pub struct P2PConfig {
    pub listen_addr: SocketAddr,
    pub bootstrap_nodes: Vec<String>,
}

pub struct P2PNetwork {
    swarm: Swarm<libp2p::ping::Behaviour>,
}

impl P2PNetwork {
    pub async fn new(config: &P2PConfig) -> Result<Self, Box<dyn std::error::Error>> {
        let local_key = identity::Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());
        
        let transport = libp2p::development_transport(local_key).await?;
        let behaviour = libp2p::ping::Behaviour::default();
        let mut swarm = Swarm::new(transport, behaviour, local_peer_id);

        swarm.listen_on(config.listen_addr)?;
        
        Ok(Self { swarm })
    }

    pub async fn run(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        loop {
            match self.swarm.select_next_some().await {
                SwarmEvent::NewListenAddr { address, .. } => {
                    log::info!("Listening on {}", address);
                }
                SwarmEvent::Behaviour(event) => {
                    log::debug!("P2P Event: {:?}", event);
                }
                _ => {}
            }
        }
    }
}
