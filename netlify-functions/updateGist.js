const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*', // Or use 'https://dmfadul.github.io' for better security
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Handle preflight request (OPTIONS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: 'OK'
    };
  }

  try {
    const { eventCode, sessionCode, data } = JSON.parse(event.body);

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GIST_ID = process.env.GIST_ID;

    const filename = `${eventCode}-${sessionCode}.json`;

    const payload = {
      files: {
        [filename]: {
          content: JSON.stringify(data, null, 2)
        }
      }
    };

    const response = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `token ${GITHUB_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers, // ✅ include headers in error response
        body: JSON.stringify({ error: result })
      };
    }

    return {
      statusCode: 200,
      headers, // ✅ include headers in success response
      body: JSON.stringify({ success: true, filename })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers, // ✅ include headers in exception
      body: JSON.stringify({ error: err.message })
    };
  }
};
