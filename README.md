# sails-hook-sextant

Sextant is a hook that whitelists particular routes in your Sails app based on your deployment configuration.  It provides infrastructural freedom for big apps, while allowing you to continue to keep all of your source code in a single repo.  This keeps your production deployments simple, flexible, and conventionally attractive.

### Use Case

It's easy to keep your Sails.js backend in a single code base, even as you customize your deployment infrastructure:  you just deploy the _same application code_ on different servers!  You can still set up different clusters of servers, each of which handles specific groups of routes (either via deployment on different subdomains, or special rules at the load balancer), but this way, you don't have to touch your code or worry about maintaining any additional repos.

You can do all of that _right now_-- Sextant just provides an extra layer of insurance by allowing you to restrict access to all but those routes you've explicitly enabled on a cluster-by-cluster basis.  This is useful for enacting finer-grained control over the infrastructure where your Sails app is deployed, without forcing you to bust the code apart into smaller, separate Sails apps.

> By the way, there's nothing wrong w/ breaking apart your app into smaller chunks, but it involves significant T&M overhead, introduces needless code changes, and can be hard to keep track of (especially when your team is still small, or if you're forgetful like me).


### Installation &nbsp; [![NPM version](https://badge.fury.io/js/sails-hook-sextant.svg)](http://badge.fury.io/js/sails-hook-sextant)

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

Right off the bat, this does a whole lot of nothing.  But if you add a new configuration file (`sextant.js`) to your project's `config/` directory and configure a whitelist for the `marketingWebsite` cluster, then your new rules will be enforced the next time you lift your app.


### Configuring Whitelists

You can configure one whitelist for each logical cluster, using any route address syntax supported by Sails.

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


If **ANY** of the whitelisted route addresses match an incoming request, it will be allowed through; otherwise your app will respond with a `421: Misdirected Request` error.  Finally, note that if you don't specify a `cluster` config at all, incoming requests will not be restricted by this hook at all.

Check out the [implementation of this hook](./index.js) for more details about this hook's behavior.



### Support

<h5>
<a href="http://sailsjs.org"><img alt="Sails.js logo" src="http://balderdashy.github.io/sails/images/logo.png" title="Sails.js"/></a>
</h5>  &nbsp;  [![Gitter](https://badges.gitter.im/Join Chat.svg)](https://gitter.im/balderdashy/sails?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



### License

MIT &copy; 2016 Mike McNeil

