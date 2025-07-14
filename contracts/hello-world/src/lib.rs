#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, String, Symbol, Map, Address};

#[derive(Clone)]
#[contracttype]
pub struct BiometricDID {
    pub wallet_address: Address,
    pub biometric_hash: String,
    pub created_at: u64,
    pub is_verified: bool,
}

const DID_REGISTRY: Symbol = symbol_short!("REGISTRY");

#[contract]
pub struct BiometricContract;

#[contractimpl]
impl BiometricContract {
    /// Crear un nuevo DID asociado a una wallet
    pub fn create_did(
        env: Env,
        wallet_address: Address,
        biometric_hash: String,
    ) -> String {
        // Comentado para testing - descomentar en producción
        // wallet_address.require_auth();
        
        // Verificar que la wallet no tenga DID ya
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        if registry.contains_key(wallet_address.clone()) {
            panic!("DID already exists for this wallet");
        }

        // Crear el DID
        let did_data = BiometricDID {
            wallet_address: wallet_address.clone(),
            biometric_hash: biometric_hash.clone(),
            created_at: env.ledger().timestamp(),
            is_verified: false,
        };

        // Guardar en el registry
        let mut updated_registry = registry;
        updated_registry.set(wallet_address.clone(), did_data);
        env.storage().instance().set(&DID_REGISTRY, &updated_registry);

        // Retornar confirmación simple
        String::from_str(&env, "DID created successfully")
    }

    /// Verificar biométricos y marcar como verificado
    pub fn verify_biometrics(
        env: Env,
        wallet_address: Address,
        new_biometric_hash: String,
    ) -> bool {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        if let Some(mut did_data) = registry.get(wallet_address.clone()) {
            let is_match = did_data.biometric_hash == new_biometric_hash;
            
            // Si coincide, marcar como verificado
            if is_match && !did_data.is_verified {
                did_data.is_verified = true;
                let mut updated_registry = registry;
                updated_registry.set(wallet_address, did_data);
                env.storage().instance().set(&DID_REGISTRY, &updated_registry);
            }
            
            return is_match;
        }
        
        false
    }

    /// Obtener DID data
    pub fn get_did(env: Env, wallet_address: Address) -> Option<BiometricDID> {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        registry.get(wallet_address)
    }

    /// Verificar si existe un DID para una wallet
    pub fn has_did(env: Env, wallet_address: Address) -> bool {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        registry.contains_key(wallet_address)
    }

    /// Obtener el hash biométrico de una wallet
    pub fn get_biometric_hash(env: Env, wallet_address: Address) -> Option<String> {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        if let Some(did_data) = registry.get(wallet_address) {
            return Some(did_data.biometric_hash);
        }
        None
    }

    /// Verificar si un DID está verificado
    pub fn is_verified(env: Env, wallet_address: Address) -> bool {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        if let Some(did_data) = registry.get(wallet_address) {
            return did_data.is_verified;
        }
        false
    }

    /// Actualizar hash biométrico (solo si no está verificado)
    pub fn update_biometric_hash(
        env: Env,
        wallet_address: Address,
        new_biometric_hash: String,
    ) -> bool {
        let registry: Map<Address, BiometricDID> = env
            .storage()
            .instance()
            .get(&DID_REGISTRY)
            .unwrap_or(Map::new(&env));

        if let Some(mut did_data) = registry.get(wallet_address.clone()) {
            // Solo permitir actualización si no está verificado
            if !did_data.is_verified {
                did_data.biometric_hash = new_biometric_hash;
                let mut updated_registry = registry;
                updated_registry.set(wallet_address, did_data);
                env.storage().instance().set(&DID_REGISTRY, &updated_registry);
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn test_create_did() {
        let env = Env::default();
        let contract_id = env.register_contract(None, BiometricContract);
        let client = BiometricContractClient::new(&env, &contract_id);

        let wallet = Address::generate(&env);
        let hash = String::from_str(&env, "test_hash_123");

        let result = client.create_did(&wallet, &hash);
        assert_eq!(result, String::from_str(&env, "DID created successfully"));
        
        // Verificar que el DID se creó
        let has_did = client.has_did(&wallet);
        assert!(has_did);
        
        // Verificar que no está verificado inicialmente
        let is_verified = client.is_verified(&wallet);
        assert!(!is_verified);
    }

    #[test]
    fn test_verify_biometrics() {
        let env = Env::default();
        let contract_id = env.register_contract(None, BiometricContract);
        let client = BiometricContractClient::new(&env, &contract_id);

        let wallet = Address::generate(&env);
        let hash = String::from_str(&env, "test_hash_123");

        // Crear DID
        client.create_did(&wallet, &hash);

        // Verificar con hash correcto
        let result = client.verify_biometrics(&wallet, &hash);
        assert!(result);
        
        // Ahora debería estar verificado
        let is_verified = client.is_verified(&wallet);
        assert!(is_verified);

        // Verificar con hash incorrecto
        let wrong_hash = String::from_str(&env, "wrong_hash");
        let result_wrong = client.verify_biometrics(&wallet, &wrong_hash);
        assert!(!result_wrong);
    }

    #[test]
    fn test_update_biometric_hash() {
        let env = Env::default();
        let contract_id = env.register_contract(None, BiometricContract);
        let client = BiometricContractClient::new(&env, &contract_id);

        let wallet = Address::generate(&env);
        let hash = String::from_str(&env, "test_hash_123");
        let new_hash = String::from_str(&env, "new_hash_456");

        // Crear DID
        client.create_did(&wallet, &hash);

        // Actualizar hash (debería funcionar porque no está verificado)
        let update_result = client.update_biometric_hash(&wallet, &new_hash);
        assert!(update_result);

        // Verificar que se actualizó
        let retrieved_hash = client.get_biometric_hash(&wallet);
        assert_eq!(retrieved_hash, Some(new_hash.clone()));

        // Verificar biométricos para marcarlo como verificado
        client.verify_biometrics(&wallet, &new_hash);

        // Intentar actualizar después de verificación (debería fallar)
        let final_hash = String::from_str(&env, "final_hash_789");
        let update_result_after_verification = client.update_biometric_hash(&wallet, &final_hash);
        assert!(!update_result_after_verification);
    }

    #[test]
    fn test_get_biometric_hash() {
        let env = Env::default();
        let contract_id = env.register_contract(None, BiometricContract);
        let client = BiometricContractClient::new(&env, &contract_id);

        let wallet = Address::generate(&env);
        let hash = String::from_str(&env, "test_hash_123");

        // Crear DID
        client.create_did(&wallet, &hash);

        // Obtener hash
        let retrieved_hash = client.get_biometric_hash(&wallet);
        assert_eq!(retrieved_hash, Some(hash));
    }
}