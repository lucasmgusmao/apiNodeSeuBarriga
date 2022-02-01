var ValidationError = function ValidationError(message){
   this.name = 'ValidationError';
   this.message = message;
}

module.exports = ValidationError;