#!/usr/bin/env node

var urbanairship = new (require(process.cwd() + '/'))({
	applicationKey : 'urbanairship_application_key',
	applicationSecret : 'urbanairship_application_secret',
	applicationMasterSecret : 'urbanairship_application_master_secret'
});

urbanairship.register({
  alias : 'alias',
  tags : ['foo', 'bar'],
  device_token : 'device_token_string'
});

urbanairship.deregister({
  device_token : 'device_token_string'
});

urbanairship.push({
  device_tokens : [
  'device_token_string'
  ],
  apids : ['registration_id_string'],
  alert : (new Date).toISOString()
});

urbanairship.push({
  device_tokens : [
  'device_token_string'
  ],
  alert : (new Date).toISOString()
});

urbanairship.push({
  apids : ['registration_id_string'],
  alert : (new Date).toISOString()
});

urbanairship.push({
  aliases : ['alias'],
  alert : (new Date).toISOString()
});

urbanairship.push({
  tags : ['foo'],
  alert : (new Date).toISOString()
});

urbanairship.broadcast({
  alert : (new Date).toISOString()
});
