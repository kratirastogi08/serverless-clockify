module.exports.healthCheck = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Howdi modi You are so beautiful Yor are so ugly dev dev-6',
        input: event,
      },
      null,
      2


      ),
  };
};
