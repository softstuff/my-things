
const auditLogger = async (tenantId, message, statusCode, error, req) => {
    const timestamp = new Date()
    const auditRef = fs.firestore.doc(`tenants/${tenantId}/logs/${timestamp.getTime()}`)

    const log = await auditRef.set({
        message,
        statusCode,
        error: JSON.stringify(error),
        headers: req.headers,
        body: req.body,
        timestamp: timestamp
    })
    fs.logger.debug(`Added audit log id ${auditRef.id}: ${message}`)
}

module.exports = {
    auditLogger
}