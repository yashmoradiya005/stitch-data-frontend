import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.stitchdesk.app",
  appName: "StitchDesk",
  webDir: "out",
  server: {
    // Use https scheme on Android so cookies behave same as iOS
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
