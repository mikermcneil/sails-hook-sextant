/**
 * Module dependencies
 */

var pathToRegexp = require('path-to-regexp');




/**
 * Sextant (`sails-hook-sextant`)
 * A hook that whitelists routes in your Sails app based on its configuration.
 *
 * @param  {SailsApp} sails
 * @return {Dictionary}       [hook definition]
 */
module.exports = function sextant(sails) {
  return {


    defaults: {

      sextant: {
        // By default, leave `cluster` as `undefined`.  This indicates that no whitelist will be applied.
        cluster: undefined,

        whitelists: {}
      }

    },


    // Validate configuration (note that this is _after_ applying defaults)
    configure: function (){
      if ( !_.isPlainObject(sails.config.sextant) ) {
        throw new Error('Invalid config: `sails.config.sextant` should be a dictionary.');
      }
      if ( !_.isPlainObject(sails.config.sextant.whitelists) ) {
        throw new Error('Invalid config: `sails.config.sextant.whitelists` should be a dictionary.');
      }

      // Only validate `cluster` and the specific whitelist configured for it if it is defined.
      if ( !_.isUndefined(sails.config.sextant.cluster) ) {
        if ( !_.isString(sails.config.sextant.cluster) ) {
          throw new Error('Invalid config: If specified, `sails.config.sextant.cluster` should be a string.');
        }
        var relevantWhitelist = sails.config.sextant.whitelists[sails.config.sextant.cluster];
        if ( _.isUndefined(relevantWhitelist) ) {
          throw new Error('No whitelist configured for `'+sails.config.sextant.cluster+'` cluster (the configured `sails.config.sextant.cluster` must match a key in `sails.config.sextant.whitelists`.');
        }
        else if ( !_.isArray(relevantWhitelist) ) {
          throw new Error('Invalid whitelist configured for `'+sails.config.sextant.cluster+'` cluster (each whitelist in `sails.config.sextant.whitelists` should be an array of route address strings; e.g. `[\'GET /foo\']`).');
        }
      }
    },//</configure()>


    routes: {
      before: {
        '/*': function (req, res, next){
          // If no `cluster` config was provided, we charge onward without a moment's thought.
          if ( _.isUndefined(sails.config.sextant.cluster)  ) { return next(); }

          // Otherwise, we must check the URL path and HTTP method of the incoming request
          // against the whitelist for the currently configured cluster.

          // Look up whitelist.
          var whitelist = sails.config.sextant.whitelists[sails.config.sextant.cluster];

          // Now validate the incoming request against each route address in the whitelist.
          // As long as one of them matches, we're good!
          var isAllowedByWhitelist = (function _getIsAllowedByWhitelist() {

            return _.any(whitelist, function (routeAddrStr){
              var VERB_PREFIX_RX = /^(all|get|post|put|delete|trace|options|connect|patch|head)\s+/i;
              var routeAddrMethod = (_.last(routeAddrStr.match(VERB_PREFIX_RX) || []) || '').toLowerCase();
              var urlPattern = (routeAddrMethod) ? routeAddrStr.replace(VERB_PREFIX_RX,'') : routeAddrStr;

              // -- If route address does not specify a method, or `all` was specified,
              // -- then don't bother checking the method (we'll allow any method)
              if ( routeAddrMethod && routeAddrMethod !== 'all' ) {
                // If a normal method was specified then check it against
                // the actual HTTP method from the request.  If it doesn't match,
                // go ahead and consider this a failure (return false).  Any remaining
                // route addresses will still be checked.
                if ( req.method.toLowerCase() !== routeAddrMethod ) { return false; }
              }

              // Now check the path:
              var doesReqPathMatch = !!(req.path.match(pathToRegexp(urlPattern)));
              return doesReqPathMatch;
            });//</_.any()>

          })();//</_getIsAllowedByWhitelist()>

          // If allowed by whitelist, continue onwards (and return early).
          if ( isAllowedByWhitelist ) { return next(); }

          // Otherwise, we'll respond with an error.
          else {
            // For our status code here, we use "421: Misdirected Request",
            // since this request's failure to match against our whitelist has
            // to do with the "authority" part of the URI (the subdomain).
            //
            // See section 9.1.2 in RFC7540 for more information:
            //  • https://tools.ietf.org/html/rfc7540#page-66
            sails.log.info('[sextant] Incoming request to `%s %s` was rejected because it is not permitted by the whitelist for this server\'s configured cluster (`%s`).',req.method, req.url, sails.config.sextant.cluster);
            return res.send(421);
          }

        }//</routes.before['/*']>
      }//</routes.before>
    }//</routes>

  };
};
