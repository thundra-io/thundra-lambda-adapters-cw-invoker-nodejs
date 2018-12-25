var mocks = require('./mocks');
var zlib = require('zlib');
var AWS = require('aws-sdk-mock');

describe('Invoker with adapterFunctionName config option', () => {
    var lambdaSpy = jest.fn();
    AWS.mock('Lambda', 'invoke', lambdaSpy);

    const functionName = 'thundra-lambda-adapters-cw';
    const invoker = require('../src/index')({
        adapterFunctionName: functionName
    });

    const data = zlib.gzipSync(Buffer.from(JSON.stringify(mocks.mockCloudWatchEventData))).toString('base64');

    const mockEvent = {
        awslogs: {
            data
        }
    };

    invoker.invoke(mockEvent);

    test('should call adapterFunctionName with expected parameters', () => {
        const expectedParams = {
            FunctionName: functionName,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({
                monitoringDataLogs: [mocks.mockMonitoringTraceData]
            })
        };

        expect(lambdaSpy).toBeCalledWith(expectedParams, expect.any(Function));
    });
});

describe('Invoker with invalid cloudwatch event', () => {
    const functionName = 'thundra-lambda-adapters-cw';
    const invoker = require('../src/index')({
        adapterFunctionName: functionName
    });

    test('should resolve with message wrong cloud watch event format', async () => {
        const invalidMockEvent = {};
        const result = await invoker.invoke(invalidMockEvent);
        expect(result).toBe('Event should be in AWS CloudWatch Log event format.');
    });
});

describe('Invoker with valid cloudwatch event but not thundra data', () => {
    const functionName = 'thundra-lambda-adapters-cw';
    const invoker = require('../src/index')({
        adapterFunctionName: functionName
    });

    test('should resolve with message invalid json log', async () => {
        const invalidMockEvent = {
            awslogs: {
                data: 'hello-world'
            }
        };
        const result = await invoker.invoke(invalidMockEvent);
        expect(result).toBe('Invalid json log. Skipping log.');
    });
});

describe('Invoker with valid env variables', () => {
    process.env['thundra_agent_lambda_debug_enable'] = true;
    process.env['thundra_agent_lambda_adapters_cw_function_name'] = 'thundra-lambda-adapters-cw';
    const invoker = require('../src/index')();

    test('should take options from env variables', async () => {
        expect(invoker.options.adapterFunctionName).toBe('thundra-lambda-adapters-cw');
        expect(invoker.options.debugEnabled).toBe(true);
    });
});

describe('Invoker no config options', () => {
    delete process.env.thundra_agent_lambda_debug_enable;
    delete process.env.thundra_agent_lambda_adapters_cw_function_name;

    test('should throw exception for required adapterFunctionName', () => {
        expect(() => {
            require('../src/index')();
        }).toThrow(new Error('Could not find CloudWatch adapter function name in either environment variable or programmatic config.'));
    });
});
