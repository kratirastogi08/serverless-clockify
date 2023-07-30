module.exports.test = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'Tell me how do you do I am awesomne You are so beautiful',
          input: event,
        },
        null,
        2
  
  
        ),
    };
  };