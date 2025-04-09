use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce
};
use chacha20poly1305::XChaCha20Poly1305;
use rand::rngs::OsRng;
use std::sync::Arc;
use tokio::sync::Mutex;
use zeroize::Zeroizing;

pub mod biometric;

#[derive(Clone)]
pub struct CryptoVault {
    aes_key: Arc<Mutex<Zeroizing<[u8; 32]>>>,
    chacha_key: Arc<Mutex<Zeroizing<[u8; 32]>>>,
}

impl CryptoVault {
    pub fn new() -> Self {
        let mut aes_key = [0u8; 32];
        let mut chacha_key = [0u8; 32];
        OsRng.fill_bytes(&mut aes_key);
        OsRng.fill_bytes(&mut chacha_key);

        Self {
            aes_key: Arc::new(Mutex::new(Zeroizing::new(aes_key))),
            chacha_key: Arc::new(Mutex::new(Zeroizing::new(chacha_key))),
        }
    }

    pub async fn encrypt_aes(&self, data: &[u8]) -> Result<Vec<u8>, String> {
        let key = self.aes_key.lock().await;
        let cipher = Aes256Gcm::new_from_slice(&*key)
            .map_err(|e| format!("AES key error: {}", e))?;
        
        let nonce = Nonce::from_slice(&[0u8; 12]);
        cipher.encrypt(nonce, data)
            .map_err(|e| format!("AES encryption failed: {}", e))
    }

    pub async fn encrypt_chacha(&self, data: &[u8]) -> Result<Vec<u8>, String> {
        let key = self.chacha_key.lock().await;
        let cipher = XChaCha20Poly1305::new_from_slice(&*key)
            .map_err(|e| format!("ChaCha key error: {}", e))?;
        
        let nonce = Nonce::from_slice(&[0u8; 24]);
        cipher.encrypt(nonce, data)
            .map_err(|e| format!("ChaCha encryption failed: {}", e))
    }

    pub async fn wipe_keys(&mut self) {
        // Securely zeroize keys
        let mut aes_key = self.aes_key.lock().await;
        let mut chacha_key = self.chacha_key.lock().await;
        
        aes_key.zeroize();
        chacha_key.zeroize();
        
        // Generate new random keys
        let mut new_aes = [0u8; 32];
        let mut new_chacha = [0u8; 32];
        OsRng.fill_bytes(&mut new_aes);
        OsRng.fill_bytes(&mut new_chacha);
        
        *aes_key = Zeroizing::new(new_aes);
        *chacha_key = Zeroizing::new(new_chacha);
        
        log::info!("All cryptographic keys have been securely wiped and regenerated");
    }
}

pub fn generate_one_time_code() -> String {
    use rand::Rng;
    let mut rng = OsRng;
    format!("{:06}", rng.gen_range(0..1_000_000))
}
