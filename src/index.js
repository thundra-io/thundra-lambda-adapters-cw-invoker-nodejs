module.exports = function init(opt) {
    // Constants
    const THUNDRA_DEBUG_ENABLED = 'thundra_agent_lambda_debug_enable';
    const THUNDRA_LAMBDA_ADAPTERS_CW_FUNCTION_NAME = 'thundra_agent_lambda_adapters_cw_function_name';

    // Libs
    const AWS = require('aws-sdk');
    const zlib = require('zlib');

    AWS.config.update({ region: process.env['AWS_REGION'] });
    const lambda = new AWS.Lambda();

    // Options
    const options = opt ? opt : {};
    options.adapterFunctionName = coalesce(process.env[THUNDRA_LAMBDA_ADAPTERS_CW_FUNCTION_NAME], options.adapterFunctionName);
    options.debugEnabled = coalesce(process.env[THUNDRA_DEBUG_ENABLED] === 'true', false);

    if (!options.adapterFunctionName) {
        throw new Error('Could not find CloudWatch adapter function name in either environment variable or programmatic config.');
    }

    function invoke(event, callback) {
        const data = {
            monitoringDataLogs: []
        };

        if (!isAWSCloudWatchEvent(event)) {
            debug('Event should be in AWS CloudWatch Log event format: ', event);
            return returnWithMessage(callback, 'Event should be in AWS CloudWatch Log event format.');
        }

        let parsedLogData;

        try {
            const log = decompress(event.awslogs.data);
            parsedLogData = JSON.parse(log);
            data.monitoringDataLogs = getThundraMonitoringData(parsedLogData);
        } catch (error) {
            return returnWithMessage(callback, 'Invalid json log. Skipping log.');
        }

        if (data.monitoringDataLogs.length === 0) {
            return returnWithMessage('No thundra data found in the CloudWatch logs');
        } else {
            const params = {
                FunctionName: options.adapterFunctionName,
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify(data)
            };

            if (callback && typeof callback === 'function') {
                lambda.invoke(params, function (err, data) {
                    callback(err, data);
                    return;
                });
            } else {
                return lambda.invoke(params).promise();
            }
        }
    }

    function isAWSCloudWatchEvent(event) {
        if (event && event.awslogs && event.awslogs.data) {
            return true;
        }
    }

    function decompress(awsLogs) {
        const buffer = Buffer.from(awsLogs, 'base64');
        return zlib.gunzipSync(buffer).toString('utf-8');
    }

    function getThundraMonitoringData(parsedLogData) {
        const monitoringDataLogs = [];
        if (parsedLogData &&
            parsedLogData.logEvents &&
            Array.isArray(parsedLogData.logEvents)) {

            for (const logEvent of parsedLogData.logEvents) {
                try {
                    let parsedMonitoringData = JSON.parse(logEvent.message);

                    if (parsedMonitoringData.apiKey &&
                        parsedMonitoringData.dataModelVersion &&
                        (parsedMonitoringData.type === 'Invocation' ||
                            parsedMonitoringData.type === 'Trace' ||
                            parsedMonitoringData.type === 'Span' ||
                            parsedMonitoringData.type === 'Metric' ||
                            parsedMonitoringData.type === 'Log' ||
                            parsedMonitoringData.type === 'Composite')) {

                        monitoringDataLogs.push(parsedMonitoringData);
                    }
                } catch (error) {
                    debug(error);
                }
            }
        }
        return monitoringDataLogs;
    }

    function debug() {
        if (options.debugEnabled) {
            console.debug(arguments);
        }
    }

    // https://github.com/koajs/koala
    function coalesce() {
        var len = arguments.length;
        var arg;
        for (var i = 0; i < len; i++) {
            arg = arguments[i];
            if (hasValue(arg)) {
                return arg;
            }
        }
        return arg;
    }

    function hasValue(val) {
        return val != null && val === val;
    }

    function returnWithMessage(callback, message) {
        if (callback && typeof callback === 'function') {
            return callback(null, message);
        } else {
            return new Promise((resolve) => {
                return resolve(message);
            });
        }
    }

    return {
        invoke,
        options
    }
}
