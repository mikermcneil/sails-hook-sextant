# sails-hook-sextant

Sextant is a hook that whitelists particular routes in your Sails app based on your deployment configuration.  Designed to enable more flexible (/playful & conventionally attractive?) production deployments.

It's easy to keep your Sails.js backend in a single code base, even as you customize your deployment infrastructure:  you just deploy the same app on different servers!  This way, you can set up different clusters of servers, each of which handles specific groups of routes (either via deployment on different subdomains, or special rules at the load balancer)
Sextant provides an extra layer of insurance by allowing you to prevent routes other than those you explicitly enable on a cluster-by-cluster basis.

This is useful for enacting finer-grained control over the infrastructure where your Sails app is deployed, without forcing you to bust the code apart into smaller, separate Sails apps. There's nothing wrong w/ doing that, but it involves significant overhead that can be hard to keep track of when your team is still small (or if you're forgetful like me).


## Installation &nbsp; [![NPM version](https://badge.fury.io/js/sails-hook-sextant.svg)](http://badge.fury.io/js/sails-hook-sextant)

```sh
npm install sails-hook-sextant --save --save-exact
```


### Usage

After installing this hook in your app, you can customize `sails.config.sextant.cluster`-- a string which identifies which cluster this process is deployed in
(i.e. and therefore presumably currently running from).  To do so:

```bash
# e.g.
sails_sextant__cluster='marketingWebsite' sails lift
```


Right off the bat, this does a whole lot of nothing.  But if you add a `config/sextant.js` file to your project with a set of whitelists (one for each cluster), then those rules will be enforced.

For example:

```javascript
// config/sextant.js
module.exports.sextant = {
  
  whitelists: {
  
    marketingWebsite:  [
      'GET /',
      'GET /about',
      'GET /team',
      'GET /contact',
      'POST /contact',

      // Allow static files
      'GET /images/*',
      'GET /styles/*',
      'GET /js/*',
      'GET /*.*',
    ],
    
    hybridWebApp: [
      '/logout',
      'GET /login',
      'GET /signup',
      'GET /logout',
      'GET /password/recover',
      'GET /cart',
      'GET /products',
      'POST /cart',
      'POST /checkout',
      'POST /password/recover',

      // Allow static files
      'GET /images/*',
      'GET /styles/*',
      'GET /js/*',
      'GET /*.*',
    ],
    
    pureSocketAPI: [
      'GET /chat',
      'POST /chat'
    ]
    
  }
  
};
```


See the [implementation of this hook](./index.js) for more info.



### About Sails.js

<h5>
<a href="http://sailsjs.org"><img alt="Sails.js logo" src="http://balderdashy.github.io/sails/images/logo.png" title="Sails.js"/></a>
</h5>

### [Website](http://sailsjs.org/)  &nbsp; [Getting Started](http://sailsjs.org/get-started) &nbsp;  [Docs](http://sailsjs.org/documentation) &nbsp;  [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/balderdashy/sails?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


### License

MIT &copy; 2016 Mike McNeil

