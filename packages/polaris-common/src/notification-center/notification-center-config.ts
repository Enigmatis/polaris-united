import * as kafka from 'kafkajs';
export interface NotificationCenterConfig {
    allowNotificationCenter: boolean;
    topicName: string;
    kafkaClient: kafka.Kafka;
    topicPrefix?: string;
    topicsAmountOfPartition?: number;
    partitionerSelector?: kafka.ICustomPartitioner;
    topicsReplicationFactor?: number;
}
