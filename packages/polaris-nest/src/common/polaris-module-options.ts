import { ModuleMetadata } from "@nestjs/common/interfaces";
import { PolarisServerOptions } from "@enigmatis/polaris-core";

export interface PolarisModuleAsyncOptions
  extends Pick<ModuleMetadata, "imports" | "providers"> {
  useFactory: (
    ...args: any[]
  ) => Promise<PolarisServerOptions> | PolarisServerOptions;
  inject?: any[];
}
