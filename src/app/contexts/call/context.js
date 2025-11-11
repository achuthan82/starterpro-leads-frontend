import { createSafeContext } from "utils/createSafeContext";

export const [CallContext, useCallContext] = createSafeContext(
    "useCallContext must be used within CallProvider"
);

