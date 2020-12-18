const fetch = require('node-fetch');
const jwt = require('atlassian-jwt')
const moment = require('moment');



const generateJiraJwtFor = (method = 'GET', url, appKey, secret) => {
    const now = moment().utc();
    const req = jwt.fromMethodAndUrl(method, url);

    const tokenData = {
        "iss": appKey,
        "iat": now.unix(),                    // The time the token is generated
        "exp": now.add(1, 'minutes').unix(),  // Token expiry time (recommend 3 minutes after issuing)
        "qsh": jwt.createQueryStringHash(req) // [Query String Hash](https://developer.atlassian.com/cloud/jira/platform/understanding-jwt/#a-name-qsh-a-creating-a-query-string-hash)
    };

    const token = jwt.encode(tokenData, secret);
    return token
}



const getUserPermissionGroupes = async (accountId, baseUrl, appKey, sharedSecret) => {
        console.log('Fetching users groups')
        const url = `${baseUrl}/rest/api/3/user/groups?accountId=${accountId}`
        const jiraAppToken = generateJiraJwtFor('GET', url, appKey, sharedSecret)
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `JWT ${jiraAppToken}`,
                'Accept': 'application/json'
            }
        })

        const body = await response.json();
        const groups = body.map( node => node.name)
        console.log(`user ${accountId} is member in  groups: ${groups}`)
        return groups


}

module.exports = {
    getUserPermissionGroupes 
}