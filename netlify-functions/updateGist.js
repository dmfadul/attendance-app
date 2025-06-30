const fetch = require('node-fetch');

exports.handler = async function (event, context) {
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
      body: JSON.stringify({ error: result })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, filename })
  };
};
