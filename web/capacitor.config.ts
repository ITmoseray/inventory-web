import { CapacitorConfig } from '@capacitor/cli';

// The local IP of the development machine for the emulator to reach Next.js
// In production, this should be your actual HTTPS URL.
const IP = '192.168.0.219'; // Use your Network IP since 10.0.2.2 loopback is failing
const URL = `http://${IP}:3000`;

const config: CapacitorConfig = {
  appId: 'com.protech.inventory',
  appName: 'ProTech POS',
  webDir: 'public', // Using public folder as a placeholder for the remote server config
  server: {
    url: URL,
    cleartext: true
  }
};

export default config;
