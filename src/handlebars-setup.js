import handlebars from 'handlebars';

// Override the _checkProperty method of SafeString prototype
handlebars.SafeString.prototype._checkProperty = () => true;

// Export the modified handlebars instance
export default handlebars;
