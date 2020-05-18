import { TestClassInContext } from "./test-class-in-context";
import {
  PolarisRequestHeaders,
  PolarisGraphQLContext,
} from "@enigmatis/polaris-core";

interface TestRequestHeaders extends PolarisRequestHeaders {
  customHeader?: string | string[];
}

export interface TestContext extends PolarisGraphQLContext {
  customField: number;
  requestHeaders: TestRequestHeaders;
  instanceInContext: TestClassInContext;
}
