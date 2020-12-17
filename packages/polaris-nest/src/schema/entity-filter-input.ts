import { Field, InputType } from '@nestjs/graphql';
import { DateRangeFilterInput } from './date-range-filter-input';

@InputType()
export class EntityFilter {
    @Field({ nullable: true })
    creationTime: DateRangeFilterInput;
    @Field({ nullable: true })
    lastUpdateTime: DateRangeFilterInput;
}
