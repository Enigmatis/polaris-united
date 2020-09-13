import { ExpressContext } from "@enigmatis/polaris-core";
import { TestContext } from "../server/context/test-context";
import * as customContextFields from "../server/constants/custom-context-fields.json";
import { TestClassInContext } from "../server/context/test-class-in-context";

export const customContext = (context: ExpressContext): Partial<TestContext> => {
  const { req, connection } = context;
  const headers = req ? req.headers : connection?.context;

  return {
    customField: customContextFields.customField,
    instanceInContext: new TestClassInContext(
      customContextFields.instanceInContext.someProperty,
    ),
    requestHeaders: {
      customHeader: headers['custom-header'],
    },
  };
};