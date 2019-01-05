const mockMonitoringTraceData = {
    "data": {
      "applicationRuntime": "node",
      "type": "Trace",
      "applicationTags": {},
      "id": "58b067f0-5ecb-456a-9b2f-0967932ee0fa",
      "agentVersion": "2.0.7",
      "dataModelVersion": "2.0",
      "applicationId": "65640fd5f4d64308bd42cb20de000aa0",
      "applicationDomainName": "API",
      "applicationClassName": "AWS-Lambda",
      "applicationName": "hello-thundra",
      "applicationVersion": "$LATEST",
      "applicationStage": "",
      "applicationRuntimeVersion": "v6.10.3",
      "startTimestamp": 1545662574327,
      "rootSpanId": "0e7bd29a-fee6-452b-8763-5d101dbbcac1",
      "tags": {
        "aws.region": "us-west-2"
      },
      "finishTimestamp": 1545662574486,
      "duration": 159
    },
    "type": "Trace",
    "apiKey": "ce6c2a01-e973-48c1-b021-facc2f9da86f",
    "dataModelVersion": "2.0"
};

const mockCloudWatchEventData = {
    "messageType": "DATA_MESSAGE",
    "owner": "008782893804",
    "logGroup": "/aws/lambda/hello-thundra",
    "logStream": "2018/12/24/[$LATEST]65640fd5f4d64308bd42cb20de000aa0",
    "subscriptionFilters": [
        "hello-thundra-trigger"
    ],
    "logEvents": [
        {
            "id": "34469427235647417088381844575370907261633794412448579584",
            "timestamp": 1545662574447,
            "message": JSON.stringify(mockMonitoringTraceData)
        },
    ]    
};

module.exports = {
    mockCloudWatchEventData,
    mockMonitoringTraceData
}
