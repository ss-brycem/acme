/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], (serverWidget) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = ({ response }) => {
        const form = serverWidget.createForm({
            title: 'Hello World',
        });

        const greetingField = form.addField({
            id: 'ami_helloworld_greeting',
            label: 'Greeting',
            type: serverWidget.FieldType.TEXT,
        });
        greetingField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE,
        });
        greetingField.defaultValue = 'Hello, Solution Source!';

        response.writePage({
            pageObject: form,
        });
    };

    return { onRequest };
});
