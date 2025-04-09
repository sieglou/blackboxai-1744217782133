use std::error::Error;
use std::fmt;

#[derive(Debug)]
pub enum BiometricError {
    UnsupportedPlatform,
    AuthenticationFailed,
    HardwareError,
}

impl fmt::Display for BiometricError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            BiometricError::UnsupportedPlatform => write!(f, "Biometric authentication not supported on this platform"),
            BiometricError::AuthenticationFailed => write!(f, "Biometric authentication failed"),
            BiometricError::HardwareError => write!(f, "Biometric hardware error"),
        }
    }
}

impl Error for BiometricError {}

#[cfg(target_os = "windows")]
pub fn authenticate() -> Result<(), BiometricError> {
    // Windows Hello implementation
    use windows::Security::Credentials::UI::*;
    
    let result = UserConsentVerifier::CheckAvailabilityAsync()?.get()?;
    if result != UserConsentVerifierAvailability::Available {
        return Err(BiometricError::UnsupportedPlatform);
    }

    let auth_result = UserConsentVerifier::RequestVerificationAsync("Unlock Escape!")?.get()?;
    match auth_result {
        UserConsentVerificationResult::Verified => Ok(()),
        _ => Err(BiometricError::AuthenticationFailed),
    }
}

#[cfg(target_os = "macos")]
pub fn authenticate() -> Result<(), BiometricError> {
    // macOS Touch ID implementation
    use security_framework::authorization::*;
    
    let flags = AuthorizationFlags::EXTEND_RIGHTS | 
                AuthorizationFlags::INTERACTION_ALLOWED |
                AuthorizationFlags::PREAUTHORIZE;
    
    let mut auth = Authorization::default()?;
    auth.set_flags(flags)?;
    
    auth.rights_from_auth_db("system.login.console")?;
    Ok(())
}

#[cfg(target_os = "linux")]
pub fn authenticate() -> Result<(), BiometricError> {
    // Linux PAM implementation
    Err(BiometricError::UnsupportedPlatform)
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
pub fn authenticate() -> Result<(), BiometricError> {
    Err(BiometricError::UnsupportedPlatform)
}
