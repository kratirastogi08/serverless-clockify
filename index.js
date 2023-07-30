module.exports.healthCheck = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Health Check',
        input: event,
      },
      null,
      2


      ),
  };
};
