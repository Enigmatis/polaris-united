import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { DataInitializationService } from "../services/data-initialization.service";

@Resolver((of) => Boolean)
export class DataInitializationResolver {
  constructor(private readonly dataInit: DataInitializationService) {}
  @Mutation((returns) => Boolean)
  async initData(): Promise<boolean> {
    await this.dataInit.init();
    return true;
  }
}
