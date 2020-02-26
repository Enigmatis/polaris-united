import { PolarisLogProperties } from '@enigmatis/polaris-logs';

export type GraphQLLogProperties = Omit<PolarisLogProperties, 'upn' | 'ip' | 'host' | 'reality'>;
