export class NotificationCenterMessagePayload {
    public static SENDER_TYPE_MAAGAR = 'maagar';

    private readonly senderType: string;
    private readonly senderName: string;
    private readonly realityId: number;
    private readonly entityName: string;
    private readonly alertType: string;
    private readonly sourceId: string;

    constructor(
        senderType: string,
        senderName: string,
        realityId: number,
        entityName: string,
        alertType: string,
        sourceId: string,
    ) {
        this.senderType = senderType;
        this.senderName = senderName;
        this.realityId = realityId;
        this.entityName = entityName;
        this.alertType = alertType;
        this.sourceId = sourceId;
    }

    public getPayloadJsonString(): string {
        const jsonObject: any = {
            sender_type: this.senderType,
            sender_name: this.senderName,
            reality_id: this.realityId,
            message: {
                entity_name: this.entityName,
                alert_type: this.alertType,
                source_id: this.sourceId,
            },
        };

        return JSON.stringify(jsonObject);
    }
}

export enum NotificationCenterAlertType {
    SOFT_DELETE = 'SOFT_DELETE',
    HARD_DELETE = 'HARD_DELETE',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
}
