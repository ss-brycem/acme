/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @format
 */
define(['N/ui/serverWidget', 'N/query', 'N/file', 'N/https'], (
    serverWidget,
    query,
    file,
    https,
) => {
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
        const fileId = parseInt(fileMeta.id);
        const fileUrl = fileMeta.url;

        const file_ = file.load({ id: fileId });
        file_.isOnline = false;
        file_.save();

        const fileResponse = https.get({
            url: 'https://td2961289.app.netsuite.com' + fileUrl,
        });

        const form = serverWidget.createForm({
            title: 'Testing File Stuff',
        });

        const greetingField = form.addField({
            id: 'ami_fileinfo',
            label: 'Content',
            type: serverWidget.FieldType.INLINEHTML,
        });
        greetingField.defaultValue = `
            <p>File previously available without login: ${availableWithoutLogin}</p>
            <p>File ID: ${fileId}</p>
            <p>Download Link: <a href="${fileUrl}">${fileUrl}</a>
            <pre>${JSON.stringify(fileResponse, null, 4)}</pre>
        `;
        response.writePage({
            pageObject: form,
        });
    };

    return { onRequest };
});
