import { Module } from '@nestjs/common';
import { DateScalar } from '../common/scalars/date.scalar';
import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Recipe} from "./recipe.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Recipe])],
  providers: [RecipesResolver, RecipesService, DateScalar],
})
export class RecipesModule {}
