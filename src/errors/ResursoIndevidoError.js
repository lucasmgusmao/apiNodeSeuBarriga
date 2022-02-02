var ResursoIndevidoError = function ResursoIndevidoError(message = 'Este recurso nao pertence ao usuario'){
   this.name = 'ResursoIndevidoError';
   this.message = message;
}

module.exports = ResursoIndevidoError;