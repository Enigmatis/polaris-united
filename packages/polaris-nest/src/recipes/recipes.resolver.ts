import {
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from "@nestjs/common";
import {
  Args,
  GqlExecutionContext,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from "@nestjs/graphql";
import { PubSub } from "apollo-server-express";
import { NewRecipeInput } from "./dto/new-recipe.input";
import { RecipesArgs } from "./dto/recipes.args";
import { RecipeModel } from "./models/recipe.model";
import { RecipesService } from "./recipes.service";
import { Recipe } from "./recipe.entity";

const pubSub = new PubSub();

@Resolver((of) => RecipeModel)
export class RecipesResolver {
  constructor(private readonly recipesService: RecipesService) {}

  @Query((returns) => RecipeModel)
  async recipe(@Args("id") id: string): Promise<Recipe> {
    const recipe = await this.recipesService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query((returns) => [RecipeModel])
  recipes(@Args() recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return this.recipesService.findAll(recipesArgs);
  }

  @Mutation((returns) => RecipeModel)
  async addRecipe(
    @Args("newRecipeData") newRecipeData: NewRecipeInput
  ): Promise<Recipe[] | Recipe> {
    const recipe = await this.recipesService.create(newRecipeData);
    pubSub.publish("recipeAdded", { recipeAdded: recipe });
    return recipe;
  }

  @Mutation((returns) => Boolean)
  async removeRecipe(@Args("id") id: string) {
    return this.recipesService.remove(id);
  }

  @Subscription((returns) => RecipeModel)
  recipeAdded() {
    return pubSub.asyncIterator("recipeAdded");
  }
}
