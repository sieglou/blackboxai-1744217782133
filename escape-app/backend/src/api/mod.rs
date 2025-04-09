use axum::{
    routing::{get, post},
    Router,
    extract::State,
    response::Json,
    http::StatusCode
};
use crate::security;
use serde::{Serialize, Deserialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::fs;
use std::path::Path;
use crate::security::CryptoVault;

#[derive(Clone)]
pub async fn secure_wipe(state: &AppState) -> Result<(), String> {
    // Wipe cryptographic material
    state.crypto_vault.lock().await.wipe();
    
    // Wipe configuration files
    let config_path = Path::new("escape-config");
    if config_path.exists() {
        fs::remove_dir_all(config_path)
            .map_err(|e| format!("Failed to wipe config: {}", e))?;
    }
    
    // Wipe temporary files
    let temp_path = Path::new("escape-temp");
    if temp_path.exists() {
        fs::remove_dir_all(temp_path)
            .map_err(|e| format!("Failed to wipe temp files: {}", e))?;
    }
    
    Ok(())
}

pub struct AppState {
    pub connection_status: Arc<Mutex<String>>,
    pub auth_codes: Arc<Mutex<Vec<String>>>,
    pub crypto_vault: Arc<Mutex<CryptoVault>>,
}

#[derive(Serialize, Deserialize)]
pub struct AuthRequest {
    pub code: String,
}

#[derive(Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
}

pub async fn run_api_server(state: AppState) -> Result<(), Box<dyn std::error::Error>> {
    let app = Router::new()
        .route("/api/status", get(get_status))
        .route("/api/auth", post(handle_auth))
        .route("/api/wipe", post(handle_wipe))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000").await?;
    axum::serve(listener, app).await?;
    Ok(())
}

async fn get_status(State(state): State<AppState>) -> Json<String> {
    let status = state.connection_status.lock().await;
    Json(status.clone())
}

async fn handle_auth(
    State(state): State<AppState>,
    Json(payload): Json<AuthRequest>
) -> StatusCode {
    let mut codes = state.auth_codes.lock().await;
    if codes.contains(&payload.code) {
        StatusCode::OK
    } else {
        StatusCode::UNAUTHORIZED
    }
}

async fn handle_wipe(
    State(state): State<AppState>,
) -> Result<Json<AuthResponse>, StatusCode> {
    // First verify biometric authentication
    match security::biometric::authenticate() {
        Ok(_) => {
            // Securely wipe all sensitive data
            state.crypto_vault.lock().await.wipe();
            log::warn!("Emergency wipe executed");
            Ok(Json(AuthResponse { success: true }))
        },
        Err(_) => Ok(Json(AuthResponse { success: false })),
    }
}
