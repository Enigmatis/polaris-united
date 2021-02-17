import {
    NotificationCenterAlertType,
    NotificationCenterConfig,
    NotificationCenterHandler,
    NotificationCenterMessagePayload,
} from '@enigmatis/polaris-common';
import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { CommonModel } from '..';

@EventSubscriber()
export class CommonModelSubscriber implements EntitySubscriberInterface<CommonModel> {
    // in case of changing this exported class name, change this variable value accordingly.
    public static COMMON_MODEL_SUBSCRIBER_NAME = 'CommonModelSubscriber';

    private static logger: AbstractPolarisLogger;
    private static ncConfig?: NotificationCenterConfig;
    private static ncHandler: NotificationCenterHandler;

    constructor() {
        CommonModelSubscriber.ncHandler = new NotificationCenterHandler();
    }

    afterInsert(event: InsertEvent<CommonModel>): Promise<any> | void {
        if (CommonModelSubscriber.ncConfig?.allowNotificationCenter) {
            CommonModelSubscriber.handleNewMutationEvent(
                event.metadata.tableName,
                event.entity.getId(),
                event.entity.getRealityId(),
                NotificationCenterAlertType.CREATE,
            );
        }
    }

    afterUpdate(event: UpdateEvent<CommonModel>): Promise<any> | void {
        if (CommonModelSubscriber.ncConfig?.allowNotificationCenter) {
            if (event.entity !== undefined) {
                const alertType: NotificationCenterAlertType = event.entity.getDeleted()
                    ? NotificationCenterAlertType.SOFT_DELETE
                    : NotificationCenterAlertType.UPDATE;
                CommonModelSubscriber.handleNewMutationEvent(
                    event.metadata.tableName,
                    event.entity.getId(),
                    event.entity.getRealityId(),
                    alertType,
                );
            }
        }
    }

    listenTo(): Function | string {
        return CommonModel;
    }

    private static handleNewMutationEvent(
        entityName: string,
        entityId: string,
        realityId: number,
        alertType: NotificationCenterAlertType,
    ) {
        this.logger.info(
            `Started publishing new ${alertType.toString().toLowerCase()} event to Kafka`,
        );
        CommonModelSubscriber.ncHandler
            .publishNewEventToKafka(
                entityName,
                alertType.toString(),
                NotificationCenterMessagePayload.SENDER_TYPE_MAAGAR,
                entityId,
                realityId,
            )
            .then(() => {
                this.logger.info(
                    `Finished publishing new ${alertType.toString().toLowerCase()} event to Kafka`,
                );
            })
            .catch((reason) => {
                this.logger.error(
                    `Something went wrong while publishing event to Kafka. Reason: ${reason}`,
                );
            });
    }

    /*
    this method job is to handle the delete or update queries or a soft delete when they occur.
     */
    public static handleDeleteAndUpdateEvents(
        entityName: string,
        entityId: string | string[],
        realityId: number,
        alertType: NotificationCenterAlertType,
    ) {
        if (CommonModelSubscriber.ncConfig?.allowNotificationCenter) {
            const sourceId: string =
                entityId instanceof Array
                    ? entityId.map((value: any) => value.id).join(',')
                    : entityId;
            CommonModelSubscriber.handleNewMutationEvent(
                entityName,
                sourceId,
                realityId,
                alertType,
            );
        }
    }

    public static initNotificationCenterConfigurations(
        logger: AbstractPolarisLogger,
        ncConfig?: NotificationCenterConfig,
    ) {
        CommonModelSubscriber.ncConfig = ncConfig;
        CommonModelSubscriber.logger = logger;
        if (ncConfig) {
            CommonModelSubscriber.ncHandler.initNotificationCenterConfigurations(logger, ncConfig);
        }
    }
}
