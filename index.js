module.exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed absolute successfully in dev-1 dev-2',
        input: event,
      },
      null,
      2
    ),
  };
};
