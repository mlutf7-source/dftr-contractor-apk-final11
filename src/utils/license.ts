import { Device } from '@capacitor/device';

const LICENSE_KEY = 'dftr-license-state';
const FALLBACK_DEVICE_KEY = 'dftr-device-code';

export type LicenseState = {
  deviceCode: string;
    activated: boolean;
      activatedAt?: string;
        customerName?: string;
        };

        const cleanCode = (value: string) =>
          value
              .replace(/[^a-zA-Z0-9]/g, '')
                  .toUpperCase();

                  const formatDeviceCode = (value: string) => {
                    const clean = cleanCode(value).slice(0, 24);

                      return clean
                          .match(/.{1,4}/g)
                              ?.join('-') || clean;
                              };

                              const createFallbackCode = () => {
                                const existing =
                                    localStorage.getItem(FALLBACK_DEVICE_KEY);

                                      if (existing) {
                                          return existing;
                                            }

                                              const random =
                                                  crypto.randomUUID?.() ||
                                                      `${Date.now()}-${Math.random()}`;

                                                        const code =
                                                            formatDeviceCode(`DFTR-${random}`);

                                                              localStorage.setItem(
                                                                  FALLBACK_DEVICE_KEY,
                                                                      code
                                                                        );

                                                                          return code;
                                                                          };

                                                                          export async function getDeviceCode() {
                                                                            try {
                                                                                const info = await Device.getId();

                                                                                    if (info.identifier) {
                                                                                          return formatDeviceCode(
                                                                                                  `DFTR-${info.identifier}`
                                                                                                        );
                                                                                                            }

                                                                                                                return createFallbackCode();
                                                                                                                  } catch {
                                                                                                                      return createFallbackCode();
                                                                                                                        }
                                                                                                                        }

                                                                                                                        export async function getLicenseState():
                                                                                                                          Promise<LicenseState> {
                                                                                                                            const deviceCode =
                                                                                                                                await getDeviceCode();

                                                                                                                                  const saved =
                                                                                                                                      localStorage.getItem(LICENSE_KEY);

                                                                                                                                        if (!saved) {
                                                                                                                                            return {
                                                                                                                                                  deviceCode,
                                                                                                                                                        activated: false,
                                                                                                                                                            };
                                                                                                                                                              }

                                                                                                                                                                try {
                                                                                                                                                                    const parsed =
                                                                                                                                                                          JSON.parse(saved) as LicenseState;

                                                                                                                                                                              return {
                                                                                                                                                                                    ...parsed,
                                                                                                                                                                                          deviceCode,
                                                                                                                                                                                              };
                                                                                                                                                                                                } catch {
                                                                                                                                                                                                    return {
                                                                                                                                                                                                          deviceCode,
                                                                                                                                                                                                                activated: false,
                                                                                                                                                                                                                    };
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                      }

                                                                                                                                                                                                                      export async function saveActivatedLicense(
                                                                                                                                                                                                                        customerName = ''
                                                                                                                                                                                                                        ) {
                                                                                                                                                                                                                          const deviceCode =
                                                                                                                                                                                                                              await getDeviceCode();

                                                                                                                                                                                                                                const state: LicenseState = {
                                                                                                                                                                                                                                    deviceCode,
                                                                                                                                                                                                                                        activated: true,
                                                                                                                                                                                                                                            activatedAt: new Date().toISOString(),
                                                                                                                                                                                                                                                customerName,
                                                                                                                                                                                                                                                  };

                                                                                                                                                                                                                                                    localStorage.setItem(
                                                                                                                                                                                                                                                        LICENSE_KEY,
                                                                                                                                                                                                                                                            JSON.stringify(state)
                                                                                                                                                                                                                                                              );

                                                                                                                                                                                                                                                                return state;
                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                export function clearLicense() {
                                                                                                                                                                                                                                                                  localStorage.removeItem(LICENSE_KEY);
                                                                                                                                                                                                                                                                  }

                                                                                                                                                                                                                                                                  export function isFeatureAllowed(
                                                                                                                                                                                                                                                                    activated: boolean,
                                                                                                                                                                                                                                                                      feature: string
                                                                                                                                                                                                                                                                      ) {
                                                                                                                                                                                                                                                                        if (activated) {
                                                                                                                                                                                                                                                                            return true;
                                                                                                                                                                                                                                                                              }

                                                                                                                                                                                                                                                                                const allowedInTrial = [
                                                                                                                                                                                                                                                                                    'view_home',
                                                                                                                                                                                                                                                                                        'view_project',
                                                                                                                                                                                                                                                                                            'create_one_project',
                                                                                                                                                                                                                                                                                              ];

                                                                                                                                                                                                                                                                                                return allowedInTrial.includes(feature);
                                                                                                                                                                                                                                                                                                }