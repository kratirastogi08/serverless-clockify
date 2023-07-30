module.exports.test = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Test dev-3',
          input: event,
        },
        null,
        2
  
  
        ),
    };
  };