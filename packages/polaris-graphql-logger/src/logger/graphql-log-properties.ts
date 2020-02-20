import { PolarisLogProperties } from '@enigmatis/polaris-logs';

export type GraphQLLogProperties = Omit<PolarisLogProperties, 'response' | 'upn' | 'ip' | 'host'>;
