import { Injectable } from "@nestjs/common";
import { PolarisServerOptions } from "@enigmatis/polaris-core";

@Injectable()
export class PolarisServerOptionsService {
  private readonly polarisServerOptions: PolarisServerOptions;

  constructor() {
    this.polarisServerOptions = {
      typeDefs: [], // BY ANNOTATION
      resolvers: [], // BY ANNOTATION
      port: 8080, //DEFAULT IN SEED
    };
  }

  getPolarisServerOptions(): PolarisServerOptions {
    return this.polarisServerOptions;
  }
}
