import * as SecureStore from "expo-secure-store";

const defaultOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export const secureStorage = {
  async getItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<string | null> {
    return SecureStore.getItemAsync(key, { ...defaultOptions, ...options });
  },

  async setItem(key: string, value: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
    await SecureStore.setItemAsync(key, value, { ...defaultOptions, ...options });
  },

  async removeItem(key: string, options?: SecureStore.SecureStoreOptions): Promise<void> {
    await SecureStore.deleteItemAsync(key, { ...defaultOptions, ...options });
  },

  async getJSON<T>(key: string, options?: SecureStore.SecureStoreOptions): Promise<T | null> {
    const raw = await this.getItem(key, options);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      await this.removeItem(key, options);
      return null;
    }
  },

  async setJSON<T>(key: string, value: T, options?: SecureStore.SecureStoreOptions): Promise<void> {
    await this.setItem(key, JSON.stringify(value), options);
  },
};
