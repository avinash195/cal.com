import { IS_PRODUCTION } from "@calcom/lib/constants";

import type { TaskHandler, TaskTypes } from "../tasker";

/**
 * This is a map of all the tasks that the Tasker can handle.
 * The keys are the TaskTypes and the values are the task handlers.
 * The task handlers are imported dynamically to avoid circular dependencies.
 */
const tasks: Record<TaskTypes, () => Promise<TaskHandler>> = {
  sendEmail: () => import("./sendEmail").then((module) => module.sendEmail),
  sendWebhook: () => import("./sendWebook").then((module) => module.sendWebhook),
  triggerHostNoShowWebhook: () =>
    import("./triggerNoShow/triggerHostNoShow").then((module) => module.triggerHostNoShow),
  triggerGuestNoShowWebhook: () =>
    import("./triggerNoShow/triggerGuestNoShow").then((module) => module.triggerGuestNoShow),
  triggerFormSubmittedNoEventWebhook: () =>
    import("./triggerFormSubmittedNoEvent/triggerFormSubmittedNoEventWebhook").then(
      (module) => module.triggerFormSubmittedNoEventWebhook
    ),
  sendSms: () => Promise.resolve(() => Promise.reject(new Error("Not implemented"))),
  translateEventTypeData: () =>
    import("./translateEventTypeData").then((module) => module.translateEventTypeData),
  createCRMEvent: () => import("./crm/createCRMEvent").then((module) => module.createCRMEvent),
  delegationCredentialSelectedCalendars: () =>
    import("./delegationCredentialSelectedCalendars").then(
      (module) => module.delegationCredentialSelectedCalendars
    ),
};

export const tasksConfig: Partial<
  Record<TaskTypes, { minRetryIntervalMins?: number; maxAttempts: number } & Record<string, unknown>>
> = {
  createCRMEvent: {
    minRetryIntervalMins: IS_PRODUCTION ? 10 : 1,
    maxAttempts: 10,
  },
  delegationCredentialSelectedCalendars: {
    // Keep it low to avoid reaching per service account rate limit
    // e.g. For Google, it is 10*60 requests per minute per service account
    take: 100,
    maxAttempts: 5,
  },
};

export default tasks;
