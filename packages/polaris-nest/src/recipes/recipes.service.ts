import { Inject, Injectable, Scope } from "@nestjs/common";
import { NewRecipeInput } from "./dto/new-recipe.input";
import { RecipesArgs } from "./dto/recipes.args";
import { Recipe } from "./recipe.entity";
import { InjectConnection, InjectRepository } from "../lib/common";
import {
  PolarisConnection,
  PolarisRepository,
} from "@enigmatis/polaris-typeorm";
import { CONTEXT } from "@nestjs/graphql";
import { PolarisGraphQLContext } from "@enigmatis/polaris-core";

@Injectable({ scope: Scope.REQUEST })
export class RecipesService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: PolarisRepository<Recipe>,
    @InjectConnection()
    private readonly connection: PolarisConnection,
    @Inject(CONTEXT) private readonly ctx: PolarisGraphQLContext
  ) {}

  async create(data: NewRecipeInput): Promise<Recipe[] | Recipe> {
    const recipe = new Recipe();
    recipe.title = data.title;
    recipe.description = data.description;
    return this.recipeRepository.save(this.ctx, recipe);
  }

  async findOneById(id: string): Promise<Recipe> {
    return this.recipeRepository.findOne(this.ctx, id);
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    const c = await this.connection.getRepository(Recipe).find(this.ctx);
    return this.recipeRepository.find(this.ctx);
  }

  async remove(id: string): Promise<void> {
    await this.recipeRepository.delete(this.ctx, id);
  }
}
