import type { HttpResponse, RokuMessages } from './RokuDeploy';
import type * as requestType from 'request';
export declare class InvalidDeviceResponseCodeError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class UnauthorizedDeviceResponseError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class EcpNetworkAccessModeDisabledError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class UnparsableDeviceResponseError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class FailedDeviceResponseError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class UnknownDeviceResponseError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class DeviceUnreachableError extends Error {
    results?: any;
    constructor(message: string, results?: any);
}
export declare class CompileError extends Error {
    results: any;
    rokuMessages: RokuMessages;
    constructor(message: string, results: any, rokuMessages: RokuMessages);
}
export declare class ConvertError extends Error {
    constructor(message: string);
}
export declare class MissingRequiredOptionError extends Error {
    constructor(message: string);
}
export declare class UnsupportedFirmwareVersionError extends Error {
    constructor(message: string);
}
/**
 * This error is thrown when a Roku device refuses to accept connections because it requires the user to check for updates (even if no updates are actually available).
 */
export declare class UpdateCheckRequiredError extends Error {
    response: HttpResponse;
    requestOptions: requestType.OptionsWithUrl;
    cause?: Error;
    static MESSAGE: string;
    constructor(response: HttpResponse, requestOptions: requestType.OptionsWithUrl, cause?: Error);
}
export declare function isUpdateCheckRequiredError(e: any): e is UpdateCheckRequiredError;
/**
 * This error is thrown when a Roku device ends the connection unexpectedly, causing an 'ECONNRESET' error. Typically this happens when the device needs to check for updates (even if no updates are available), but it can also happen for other reasons.
 */
export declare class ConnectionResetError extends Error {
    static MESSAGE: string;
    constructor(error: Error, requestOptions: requestType.OptionsWithUrl);
    cause?: Error;
}
export declare function isConnectionResetError(e: any): e is ConnectionResetError;
