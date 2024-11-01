/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([], () => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = ({ response }) => {
        response.addHeader({
            name: 'Content-Type',
            value: 'text/plain',
        });
        response.write('Hello, World!');
    };

    return { onRequest };
});
