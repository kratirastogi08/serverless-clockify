module.exports.test = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Test',
          input: event,
        },
        null,
        2
  
  
        ),
    };
  };