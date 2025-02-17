# Use the Confluent Kafka Connect base image
FROM confluentinc/cp-kafka-connect:latest

# Install the Elasticsearch Sink Connector
RUN confluent-hub install --no-prompt confluentinc/kafka-connect-elasticsearch:latest

# Expose the Kafka Connect port
EXPOSE 8083
