/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @format
 */
define(['N/ui/serverWidget', 'N/query'], (serverWidget, query) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = ({ response }) => {
        const fileMeta = query
            .runSuiteQL({
                query: `
                    SELECT file.url, file.isonline, file.id
                    FROM file
                    WHERE file.id = 2491`,
            })
            .asMappedResults()[0];

        const availableWithoutLogin = fileMeta.isonline === 'T';
        const fileId = fileMeta.id;
        const fileUrl = fileMeta.url;

        const form = serverWidget.createForm({
            title: 'Testing File Stuff',
        });

        const greetingField = form.addField({
            id: 'ami_fileinfo',
            label: 'Content',
            type: serverWidget.FieldType.INLINEHTML,
        });
        greetingField.defaultValue = `
            <p>File available without login: ${availableWithoutLogin}</p>
            <p>File ID: ${fileId}</p>
            <p>Download Link: <a href="${fileUrl}">${fileUrl}</a>
        `;

        response.writePage({
            pageObject: form,
        });
    };

    return { onRequest };
});
