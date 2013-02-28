var cache = {}

module.exports = function(req,res,next) {
  var send = res.send
    , self = this;

  if (cache[req.url]) {
    var c      = cache[req.url]
      , body   = c.b
      , status = c.s;

    return res.send(status, body)
  }

  res.send = function(status,body) {
    if (!body) { body = status; status = 200 } // only 1 argument
    if (isNaN(status)) { var t=status; status=body; body=t } // swap status and body

    send.call(this, status, body)

    if (res.getHeader('Cache-Control')) {
      var max_age = res.getHeader('Cache-Control').match(/max-age=(\d+)/)
        , ttl     = max_age && parseInt(max_age[1]) * 1000 //ms

      if (!ttl) { /* abort */ return }

      // cache response
      cache[req.url] = { b:body, s:status }

      // expire response after TTL
      setTimeout(function() {
        delete cache[req.url]
      },ttl)
    }

  }
  return next()
}
