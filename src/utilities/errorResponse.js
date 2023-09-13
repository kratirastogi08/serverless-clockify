 class ErrorResponse {
    constructor(
      message = 'Something went wrong',
      statusCode = 500,
      data={}      
    ) {
      const body = JSON.stringify({ message,data });
      this.statusCode = statusCode;
      this.body = body;
      this.headers = {
        'Content-Type': 'application/json',
      };
    }
  }

module.exports= {
    ErrorResponse
  }