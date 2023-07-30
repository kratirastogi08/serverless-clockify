module.exports.healthCheck = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Health Check dev-3',
        input: event,
      },
      null,
      2


      ),
  };
};
