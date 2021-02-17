import { AbstractPolarisLogger } from '@enigmatis/polaris-logs';
import { NotificationCenterConfig } from './notification-center-config';
import { NotificationCenterMessagePayload } from './notification-center-message-payload';
import * as kafka from 'kafkajs';

export class NotificationCenterHandler {
    private ncConfig: NotificationCenterConfig;
    private logger: AbstractPolarisLogger;
    private kafkaClient: kafka.Kafka;
    private availableTopics: string[];

    public initNotificationCenterConfigurations(
        logger: AbstractPolarisLogger,
        ncConfig: NotificationCenterConfig,
    ) {
        this.ncConfig = ncConfig;
        this.logger = logger;
        this.kafkaClient = ncConfig.kafkaClient;
    }

    public publishNewEventToKafka(
        entityName: string,
        alertType: string,
        senderType: string,
        sourceId: string,
        realityId: number,
    ) {
        return this.fillExistingTopics()
            .then(() => {
                const topicName = `${this.ncConfig.topicPrefix}.${this.ncConfig.topicName}.${entityName}`;
                const messagePayload = new NotificationCenterMessagePayload(
                    senderType,
                    topicName,
                    realityId,
                    entityName,
                    alertType,
                    sourceId,
                );
                const messagePayloadString = messagePayload.getPayloadJsonString();
                if (!this.isTopicExists(topicName)) {
                    return this.createTopic(topicName)
                        .then(() => {
                            return this.sendEventToKafka(topicName, messagePayloadString);
                        })
                        .catch((reason) => {
                            this.logger.error(
                                `Failed to disconnect from kafka admin. Reason: ${reason}`,
                            );
                        });
                }
                return this.sendEventToKafka(topicName, messagePayloadString);
            })
            .catch((reason) => {
                this.logger.error(`Failed to disconnect from kafka admin. Reason: ${reason}`);
            });
    }

    private createTopic(topicName: string) {
        const topics: kafka.ITopicConfig[] = [
            {
                topic: topicName,
                numPartitions: this.ncConfig.topicsAmountOfPartition,
                replicationFactor: this.ncConfig.topicsReplicationFactor,
            },
        ];
        const kafkaAdmin = this.kafkaClient.admin();
        return kafkaAdmin
            .connect()
            .then(() => {
                return kafkaAdmin
                    .createTopics({
                        topics,
                    })
                    .then(() => {
                        return this.fillExistingTopics();
                    })
                    .catch((reason) => {
                        this.logger.error(`Failed to create new topic. Reason: ${reason}`);
                    });
            })
            .catch((reason) => {
                this.logger.error(`Failed to connect to kafka admin. Reason: ${reason}`);
            });
    }

    private sendEventToKafka(topicName: string, messagePayload: string) {
        const kafkaProducer = this.ncConfig.partitionerSelector
            ? this.kafkaClient.producer({ createPartitioner: this.ncConfig.partitionerSelector })
            : this.kafkaClient.producer();
        return kafkaProducer.connect().then(() => {
            kafkaProducer
                .send({
                    topic: topicName,
                    messages: [{ value: messagePayload }],
                })
                .then(() => {
                    return kafkaProducer.disconnect();
                })
                .catch((reason) => {
                    this.logger.error(`Failed to send new message to Kafka. Reason: ${reason}`);
                });
        });
    }

    private fillExistingTopics() {
        const kafkaAdmin = this.kafkaClient.admin();
        return kafkaAdmin
            .connect()
            .then(() => {
                return kafkaAdmin
                    .listTopics()
                    .then((topics) => {
                        this.availableTopics = topics;
                        return kafkaAdmin.disconnect();
                    })
                    .catch((reason) => {
                        this.logger.error(`Failed to list topics. Reason: ${reason}`);
                    });
            })
            .catch((reason) => {
                this.logger.error(`Failed to connect to kafka admin. Reason: ${reason}`);
            });
    }

    private isTopicExists(topicName: string) {
        return this.availableTopics.includes(topicName);
    }
}
